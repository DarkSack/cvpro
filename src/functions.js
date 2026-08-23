import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import Swal from "sweetalert2";

// Asignar el worker una sola vez, al importar el módulo
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const IMPROVE_ENDPOINT = "https://dndback.vercel.app/extras/improveField";

/**
 * Envía un prompt al endpoint de IA (dndback) y devuelve la respuesta parseada.
 * @param {string} prompt
 * @param {"field"|"cv"} type
 */
export async function chatCompletion(prompt, type) {
  const response = await fetch(IMPROVE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, type }),
  });
  if (!response.ok) {
    throw new Error(`IA respondió con ${response.status}`);
  }
  return await response.json();
}

/**
 * Extrae el texto de un archivo PDF en el navegador (pdfjs-dist v5).
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
    .promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

// ── SweetAlert con tema dark, consistente con otros proyectos Sack ──
const SwalDark = Swal.mixin({
  background: "#1a1f2b",
  color: "#e6edf3",
  confirmButtonColor: "#4aa3ff",
  cancelButtonColor: "#374052",
  buttonsStyling: true,
});

/**
 * Muestra un SweetAlert dark-themed.
 * @param {{icon?: string, title?: string, text?: string, timer?: number}} props
 */
export function RenderAlert(props) {
  return SwalDark.fire({
    icon: props.icon,
    title: props.title,
    text: props.text,
    timer: props.timer ?? 2000,
    timerProgressBar: true,
    showConfirmButton: !props.timer,
  });
}
