import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCV, saveCV } from "../src/storage.ts";
import type { CVData } from "../src/types.ts";

/** Almacén en memoria; `limit` imita la cuota de localStorage. */
function fakeStorage(limit = Infinity) {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (v.length > limit) throw new DOMException("quota", "QuotaExceededError");
      map.set(k, v);
    },
    raw: map,
  };
}

const CV: CVData = {
  lang: "es",
  photo: "data:image/png;base64,AAAA",
  fullName: "Ana Ruiz",
  title: "Analista",
  email: "ana@example.com",
  phone: "+52 33 1234 5678",
  location: "Guadalajara",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "Analista con 5 años.",
  experience: [
    {
      position: "Analista",
      company: "Acme",
      location: "GDL",
      startDate: "2020-01",
      endDate: "",
      current: true,
      description: "Reportes.",
    },
  ],
  education: [],
  skills: ["Excel", "SQL"],
  languages: [{ language: "Inglés", level: "Avanzado" }],
  certifications: [],
  projects: [],
};

test("un CV guardado vuelve igual al cargarlo", () => {
  const storage = fakeStorage();

  saveCV(CV, storage);

  assert.deepEqual(loadCV(storage), CV);
});

test("sin nada guardado devuelve null", () => {
  assert.equal(loadCV(fakeStorage()), null);
});

test("si lo guardado está corrupto devuelve null en vez de romper", () => {
  const storage = fakeStorage();
  storage.raw.set("cvpro:cv", "{esto no es json");

  assert.equal(loadCV(storage), null);
});

test("si la foto no cabe guarda el resto del CV sin foto", () => {
  const big = { ...CV, photo: "data:image/png;base64," + "A".repeat(5000) };
  const storage = fakeStorage(2000);

  saveCV(big, storage);

  assert.deepEqual(loadCV(storage), { ...CV, photo: "" });
});

test("datos guardados con forma rara se cargan con valores seguros", () => {
  const storage = fakeStorage();
  storage.raw.set(
    "cvpro:cv",
    JSON.stringify({
      fullName: "Ana",
      skills: "Excel",
      experience: [{ position: "Analista", startDate: "enero 2020" }],
      languages: [{ language: "Inglés", level: "C1" }],
    })
  );

  const cv = loadCV(storage);

  assert.equal(cv?.fullName, "Ana");
  assert.equal(cv?.email, "");
  assert.deepEqual(cv?.skills, []);
  assert.deepEqual(cv?.experience, [
    {
      position: "Analista",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ]);
  assert.deepEqual(cv?.languages, [{ language: "Inglés", level: "Básico" }]);
});