# CVpro — Arma tu CV con IA y guárdalo en PDF

Herramienta web gratuita de la familia [Sackito](https://sackito.online). Te lleva **un paso a la vez** por tu currículum (datos, resumen, experiencia, educación, habilidades, idiomas, certificaciones y proyectos) con la **hoja A4 viva al lado**: lo que escribes aparece en la hoja al momento, con la sección que estás llenando marcada. Una IA (Groq) pule tus textos, llena el formulario desde un CV en PDF y traduce el CV entre español e inglés. Al terminar lo guardas como PDF con texto real.

> Demo: pendiente de despliegue en Vercel (ver «Despliegue»).

---

## Qué hace

1. **Pasos + hoja viva.** En escritorio, el formulario del paso va a la izquierda y la hoja a la derecha. En el teléfono, el paso ocupa la pantalla y «Ver hoja» la abre completa.
2. **Guardado local.** Todo se guarda solo en tu navegador (`localStorage`). «Más → Descargar copia (.json)» lo exporta para pasarlo a otro equipo, y «Abrir copia» lo recupera.
3. **Mejorar con IA.** Reescribe un resumen o una descripción en lenguaje profesional, sin inventar datos.
4. **Llenar desde un PDF.** `pdfjs-dist` saca el texto y la IA lo reparte en los campos. No lee escaneos.
5. **Idioma del CV.** ES / EN cambia los títulos y las fechas de la hoja; «Traducir» pasa tus textos al idioma elegido con IA, y se puede deshacer.
6. **7 plantillas**, incluida una optimizada para ATS.
7. **Guardar como PDF.** Usa la impresión del navegador: el PDF lleva **texto real** (seleccionable y legible para un ATS). Antes revisa lo mínimo (nombre y un contacto) y marca los errores junto a cada campo.

---

## Bajo el capó

- **Frontend:** React 19 + Vite 5 + TypeScript, Tailwind 3, iconos Lucide.
- **Diseño:** mundo Sackito (tokens de sackito.online, Archivo condensada, Geist y Geist Mono autoalojadas). Modo claro y oscuro según el sistema. Ver `PRODUCT.md` y `DESIGN.md`.
- **Accesibilidad:** objetivo WCAG 2.2 AA. Etiquetas ligadas a cada campo, errores con `aria-describedby`, diálogo nativo `<dialog>`, avisos con `aria-live`, foco al título de cada paso, respeto a «reducir movimiento».
- **IA:** función serverless `api/improveField.ts` (Vercel) que llama a Groq (`openai/gpt-oss-120b`). La clave vive solo en el servidor. Límite de uso: 5 peticiones por minuto y 30 al día por IP, 300 al día en total.
- **PDF (export):** CSS de impresión (`@media print` en `src/index.css`). Sin librerías.
- **PDF (import):** `pdfjs-dist`, que se descarga solo cuando subes un PDF.
- **Validación:** `zod`.

---

## Setup local

```bash
git clone https://github.com/DarkSack/cvpro.git
cd cvpro
npm install
npm run dev            # http://localhost:5173
npm test
npm run typecheck
npm run lint
npm run build
```

### Variables de entorno

Crea `.env.local` (no se sube a git) a partir de `.env.example`:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

- En local, `npm run dev` sirve `/api/improveField` con esa clave (plugin en `vite.config.ts`).
- Sin clave, el formulario, las plantillas y el PDF funcionan igual; solo la IA responde con error.

---

## Despliegue

1. Importa el repositorio en Vercel (framework: Vite).
2. En *Settings → Environment Variables* define `GROQ_API_KEY`.
3. Despliega. La carpeta `api/` se publica sola como función serverless.

---

## Estructura

```
cvpro/
├── api/
│   └── improveField.ts    # Función serverless: mejora, extracción de CV y traducción
├── src/
│   ├── CvGenerator.tsx    # Pantalla: cabecera, pasos, hoja viva, impresión
│   ├── steps.tsx          # Los 8 pasos y sus formularios
│   ├── ui.tsx             # Campo, botones, aviso y diálogo de confirmación
│   ├── functions.ts       # Llamada a la IA, lectura de PDF, foto, descarga
│   ├── storage.ts         # Guardado en el navegador
│   ├── validation.ts      # Esquemas zod y errores por campo
│   ├── types.ts
│   └── preview/           # Las 7 plantillas
├── tests/                 # node --test
└── index.html
```

---

Hecho por **Sack** · [sackito.online](https://sackito.online)
