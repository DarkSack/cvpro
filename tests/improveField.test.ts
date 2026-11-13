import { test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../api/improveField.ts";

const realFetch = globalThis.fetch;
let groqCalls: { url: string; init: RequestInit }[] = [];

/** Sustituye a Groq: responde con `content` como texto del asistente. */
function fakeGroq(content: string, status = 200) {
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    groqCalls.push({ url: String(url), init: init ?? {} });
    return Response.json(
      {
        id: "chatcmpl-1",
        object: "chat.completion",
        created: 1,
        model: "llama-3.3-70b-versatile",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      },
      { status }
    );
  }) as typeof fetch;
}

// Cada petición llega de una IP nueva salvo que la prueba fije una:
// así el límite por IP no mezcla unas pruebas con otras.
let ipCount = 0;
function post(body: unknown, ip = `10.0.${++ipCount >> 8}.${ipCount & 255}`) {
  return POST(
    new Request("http://localhost/api/improveField", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

const OK = { prompt: "hola", type: "field" };
const MINUTE = 60_000;
const DAY = 86_400_000;
// Medianoche UTC exacta: inicio de un minuto y de un día.
const START = DAY * 20_834;

beforeEach(() => {
  groqCalls = [];
  process.env.GROQ_API_KEY = "gsk_prueba";
  fakeGroq("no debería usarse");
  mock.timers.enable({ apis: ["Date"], now: START });
});

afterEach(() => {
  globalThis.fetch = realFetch;
  mock.timers.reset();
});

// ── Límite de peticiones ─────────────────────────────────────────

test("la sexta petición de una IP en el mismo minuto recibe 429 y no llega a Groq", async () => {
  for (let i = 0; i < 5; i++) assert.equal((await post(OK, "1.1.1.1")).status, 200);

  const res = await post(OK, "1.1.1.1");

  assert.equal(res.status, 429);
  assert.equal(res.headers.get("Retry-After"), "60");
  assert.equal(groqCalls.length, 5);
});

test("el límite de una IP no afecta a otra", async () => {
  for (let i = 0; i < 6; i++) await post(OK, "2.2.2.2");

  const res = await post(OK, "3.3.3.3");

  assert.equal(res.status, 200);
});

test("pasado el minuto la misma IP puede volver a pedir", async () => {
  for (let i = 0; i < 6; i++) await post(OK, "4.4.4.4");
  mock.timers.tick(MINUTE);

  const res = await post(OK, "4.4.4.4");

  assert.equal(res.status, 200);
});

test("una IP no pasa de 30 peticiones al día aunque las espacie", async () => {
  for (let i = 0; i < 30; i++) {
    assert.equal((await post(OK, "5.5.5.5")).status, 200);
    mock.timers.tick(MINUTE);
  }

  const res = await post(OK, "5.5.5.5");

  assert.equal(res.status, 429);
  assert.equal(groqCalls.length, 30);
});

test("al día siguiente la IP recupera su cupo", async () => {
  for (let i = 0; i < 31; i++) {
    await post(OK, "6.6.6.6");
    mock.timers.tick(MINUTE);
  }
  mock.timers.tick(DAY);

  const res = await post(OK, "6.6.6.6");

  assert.equal(res.status, 200);
});

test("entre todas las IP no se pasan de 300 peticiones al día", async () => {
  mock.timers.tick(DAY * 5); // un día en el que ninguna otra prueba pide nada
  for (let i = 0; i < 300; i++) assert.equal((await post(OK)).status, 200);

  const res = await post(OK);

  assert.equal(res.status, 429);
  assert.equal(groqCalls.length, 300);
});

test("una petición inválida no gasta cupo", async () => {
  for (let i = 0; i < 10; i++) await post({ prompt: "", type: "field" }, "7.7.7.7");

  const res = await post(OK, "7.7.7.7");

  assert.equal(res.status, 200);
});

// ── Límite compartido (Upstash / Vercel KV) ──────────────────────

/** Envuelve el fetch falso: las llamadas a Redis responden `counts` por ventana. */
function fakeRedis(counts: number[] | "falla") {
  const groq = globalThis.fetch;
  const calls: unknown[][] = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    if (!String(url).startsWith("https://redis.test")) return groq(url, init);
    if (counts === "falla") throw new Error("sin red");
    const commands = JSON.parse(String(init?.body)) as unknown[][];
    calls.push(...commands);
    return Response.json(
      commands.map((c, i) => ({ result: c[0] === "INCR" ? counts[i / 2] : 1 }))
    );
  }) as typeof fetch;
  return calls;
}

test("con Redis configurado, el conteo compartido decide el 429", async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "tok";
  try {
    const calls = fakeRedis([10, 3, 6]); // global, día de la IP, minuto de la IP

    const res = await post(OK);

    assert.equal(res.status, 429);
    assert.equal(res.headers.get("Retry-After"), "60");
    assert.equal(groqCalls.length, 0);
    assert.equal(calls.filter((c) => c[0] === "INCR").length, 3);
  } finally {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  }
});

test("también acepta las variables de Vercel KV", async () => {
  process.env.KV_REST_API_URL = "https://redis.test";
  process.env.KV_REST_API_TOKEN = "tok";
  try {
    fakeRedis([301, 1, 1]);

    const res = await post(OK);

    assert.equal(res.status, 429);
    assert.equal(res.headers.get("Retry-After"), "3600");
  } finally {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  }
});

test("si Redis no responde, sigue con el límite en memoria", async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "tok";
  try {
    fakeRedis("falla");

    const res = await post(OK);

    assert.equal(res.status, 200);
  } finally {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  }
});

// ── Petición y respuesta ─────────────────────────────────────────

test("devuelve el texto mejorado y manda el texto del usuario a Groq con la clave del servidor", async () => {
  fakeGroq("Atendí clientes por teléfono y resolví sus quejas.");

  const res = await post({ prompt: "atendi clientes x telefono", type: "field" });

  assert.equal(res.status, 200);
  assert.equal(await res.json(), "Atendí clientes por teléfono y resolví sus quejas.");
  assert.equal(groqCalls.length, 1);
  assert.equal(groqCalls[0].url, "https://api.groq.com/openai/v1/chat/completions");
  const headers = new Headers(groqCalls[0].init.headers);
  assert.equal(headers.get("Authorization"), "Bearer gsk_prueba");
  const sent = JSON.parse(String(groqCalls[0].init.body));
  assert.equal(sent.messages.at(-1).role, "user");
  assert.equal(sent.messages.at(-1).content, "atendi clientes x telefono");
});

test("quita los espacios que el modelo deja al final de cada línea", async () => {
  fakeGroq("Atendí llamadas.  \nEntrené al personal nuevo. ");

  const res = await post(OK);

  assert.equal(await res.json(), "Atendí llamadas.\nEntrené al personal nuevo.");
});

test("para un CV devuelve el objeto que Groq entrega como JSON", async () => {
  fakeGroq('{"fullName":"Ana Ruiz","skills":["Excel"]}');

  const res = await post({ prompt: "Ana Ruiz. Excel.", type: "cv" });

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { fullName: "Ana Ruiz", skills: ["Excel"] });
  const sent = JSON.parse(String(groqCalls[0].init.body));
  assert.deepEqual(sent.response_format, { type: "json_object" });
});

test("si Groq no devuelve JSON para un CV responde 502", async () => {
  fakeGroq("Lo siento, no puedo.");

  const res = await post({ prompt: "Ana Ruiz", type: "cv" });

  assert.equal(res.status, 502);
});

test("si Groq falla responde 502", async () => {
  fakeGroq("", 429);

  const res = await post({ prompt: "hola", type: "field" });

  assert.equal(res.status, 502);
});

test("rechaza un tipo desconocido sin llamar a Groq", async () => {
  const res = await post({ prompt: "hola", type: "otro" });

  assert.equal(res.status, 400);
  assert.equal(groqCalls.length, 0);
});

test("rechaza un texto vacío sin llamar a Groq", async () => {
  const res = await post({ prompt: "   ", type: "field" });

  assert.equal(res.status, 400);
  assert.equal(groqCalls.length, 0);
});

test("rechaza un cuerpo que no es JSON", async () => {
  const res = await post("esto no es json");

  assert.equal(res.status, 400);
  assert.equal(groqCalls.length, 0);
});

test("rechaza un campo de más de 4000 caracteres sin llamar a Groq", async () => {
  const res = await post({ prompt: "a".repeat(4001), type: "field" });

  assert.equal(res.status, 413);
  assert.equal(groqCalls.length, 0);
});

test("acepta un CV largo que un campo no aceptaría", async () => {
  fakeGroq("{}");

  const res = await post({ prompt: "a".repeat(4001), type: "cv" });

  assert.equal(res.status, 200);
});

// ── Traducción ───────────────────────────────────────────────────

test("traduce un CV al inglés y devuelve el objeto que entrega Groq", async () => {
  fakeGroq('{"title":"Analyst","summary":"Analyst with 5 years."}');

  const res = await post({
    prompt: '{"title":"Analista","summary":"Analista con 5 años."}',
    type: "translate",
    to: "en",
  });

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { title: "Analyst", summary: "Analyst with 5 years." });
  const sent = JSON.parse(String(groqCalls[0].init.body));
  assert.deepEqual(sent.response_format, { type: "json_object" });
  assert.match(sent.messages[0].content, /into English/);
  assert.match(sent.messages.at(-1).content, /^Target language: English/);
});

test("rechaza una traducción a un idioma que no es es ni en", async () => {
  const res = await post({ prompt: "{}", type: "translate", to: "fr" });

  assert.equal(res.status, 400);
  assert.equal(groqCalls.length, 0);
});

test("sin clave configurada responde 500 y no llama a Groq", async () => {
  delete process.env.GROQ_API_KEY;

  const res = await post({ prompt: "hola", type: "field" });

  assert.equal(res.status, 500);
  assert.equal(groqCalls.length, 0);
});
