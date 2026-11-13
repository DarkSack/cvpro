import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "node:fs";
import { getCACertificates, setDefaultCACertificates } from "node:tls";
import { fileURLToPath, URL } from "node:url";
import { parseEnv } from "node:util";

// En producción Vercel sirve api/*.ts. En `npm run dev` lo hace este plugin,
// con GROQ_API_KEY leída de .env.local.
function devApi(): Plugin {
  return {
    name: "dev-api",
    configureServer(server) {
      // Los antivirus y proxys que inspeccionan TLS firman con un CA que solo
      // está en el almacén del sistema; sin esto, fetch a Groq falla ahí.
      setDefaultCACertificates([
        ...getCACertificates("default"),
        ...getCACertificates("system"),
      ]);
      // Se lee el archivo directo y no con loadEnv: loadEnv da prioridad a
      // process.env, así que una clave ya cargada no se actualizaría al editarla.
      const envFile = new URL("./.env.local", import.meta.url);
      if (existsSync(envFile)) Object.assign(process.env, parseEnv(readFileSync(envFile, "utf8")));
      server.middlewares.use("/api/improveField", async (req, res, next) => {
        if (req.method !== "POST") return next();
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk);
          const { POST } = await server.ssrLoadModule("/api/improveField.ts");
          const out: Response = await POST(
            new Request("http://localhost/api/improveField", {
              method: "POST",
              body: Buffer.concat(chunks),
            })
          );
          res.statusCode = out.status;
          res.setHeader("Content-Type", "application/json");
          res.end(await out.text());
        } catch (err) {
          server.config.logger.error(String(err));
          res.statusCode = 500;
          res.end('{"error":"Fallo interno del servidor de desarrollo."}');
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
