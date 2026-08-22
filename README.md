# 📄 cvpro

Generador de **currículums profesionales** con IA. Sube tu información, deja que el modelo la refine y expórtala como **PDF listo para enviar** — todo desde el navegador.

Construido con **React 19 + Vite + TailwindCSS**, con integración a **Groq** para la generación de texto y **@react-pdf/renderer** + **jsPDF** para la exportación.

---

## ✨ Características

- 🤖 **Redacción asistida por IA** (Groq SDK) — genera descripciones profesionales a partir de bullets.
- 📄 **Exportación a PDF** con `@react-pdf/renderer`, `jsPDF` y `html2canvas`.
- 🔍 **Vista previa** en vivo con `pdfjs-dist`.
- 🎨 Diseño moderno con **TailwindCSS** e iconos **Lucide**.
- 🍬 Notificaciones con **SweetAlert2**.
- ⚡ Base ultrarrápida con **Vite 5** y HMR.

---

## 🛠️ Stack

- **Frontend:** React 19 · Vite 5
- **Estilos:** TailwindCSS 3 · PostCSS · Autoprefixer
- **IA:** groq-sdk
- **PDF:** @react-pdf/renderer · jsPDF · html2canvas · pdfjs-dist
- **UI:** lucide-react · sweetalert2
- **Calidad:** ESLint · Prettier · prettier-plugin-tailwindcss

---

## 🚀 Comandos

```bash
# Instalar
npm install

# Desarrollo
npm run dev            # http://localhost:5173

# Build
npm run build

# Previsualizar el build
npm run preview

# Lint / formato
npm run lint
npm run format
```

---

## 🔐 Variables de entorno

Crea un archivo `.env` con tu API key de Groq:

```env
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

> ⚠️ La clave se expone al bundle del navegador. Para producción se recomienda mover las llamadas a un backend/serverless proxy.

---

## 📁 Estructura

```
cvpro/
├── src/
│   ├── App.jsx
│   ├── CvGenerator.jsx   # Componente principal
│   ├── functions.js      # Helpers (llamadas a Groq, formateo, PDF)
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🤝 Contribuir

PRs y sugerencias son bienvenidos. Abre un issue si detectas un bug o quieres proponer una feature.

---

Hecho con ❤️ por **Sack**.
