# cvpro — Arma tu CV con IA y exórtalo en PDF

Herramienta web que te lleva **paso a paso** por la construcción de un currículum: datos personales → experiencia → educación → habilidades → idiomas → certificaciones. Escribe redacciones "a lo bruto" y **una IA (Groq) las pule** al lenguaje profesional que espera un reclutador; además puedes **subir un CV en PDF existente** y cvpro extrae su texto para que arranques desde ahí. Al terminar, elige plantilla y descarga tu CV en PDF listo para enviar.

---

## Qué hace, en orden

1. **Formulario en pasos** — vas rellenando `Información personal`, `Resumen`, `Experiencia`, `Educación`, `Habilidades`, `Idiomas`, `Certificaciones`.
2. **Refinado con IA** — el botón ✨ pasa tu texto por **Groq** y te devuelve la versión mejorada (mismo contenido, mejor prosa). Útil sobre todo en `Resumen profesional` y `Descripción del puesto`.
3. **Importar CV existente** — subes un PDF, `pdfjs-dist` lo lee, extrae el texto plano y lo cargamos en los campos correspondientes para que solo edites.
4. **Vista previa** en vivo con la plantilla seleccionada.
5. **Descargar PDF** — renderiza con **`@react-pdf/renderer`** + `jsPDF` + `html2canvas` y baja el archivo.

---

## Bajo el capó

- **Frontend:** React 19 + Vite 5.
- **UI:** TailwindCSS 3 + iconos **Lucide**; notificaciones con **SweetAlert2**.
- **IA:** `groq-sdk` — llamadas de chat completion desde el navegador.
- **PDF (export):** `@react-pdf/renderer` (documento estructurado) + `jsPDF` + `html2canvas` (snapshot HTML).
- **PDF (import):** `pdfjs-dist` para extraer texto de PDFs subidos por el usuario.
- **Calidad:** ESLint + Prettier con `prettier-plugin-tailwindcss`.

---

## Setup local

```bash
git clone https://github.com/DarkSack/cvpro.git
cd cvpro
npm install
npm run dev            # http://localhost:5173
npm run build
npm run preview
npm run lint
npm run format
```

### Variables de entorno

```env
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

> ⚠️ La clave se expone al bundle del navegador (limitación de Vite en modo cliente). Para producción mueve la llamada a Groq a un proxy serverless.

---

## Estructura

```
cvpro/
├── src/
│   ├── App.jsx
│   ├── CvGenerator.jsx    # Wizard: form multi-step + preview + export
│   ├── functions.js       # chatCompletion (Groq), extractTextFromPdf, RenderAlert
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
└── tailwind.config.js
```

---

Hecho con ❤️ por **Sack**.
