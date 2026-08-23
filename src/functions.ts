import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import Swal from "sweetalert2";
import type { AlertProps, CVData } from "@/types";

// Set worker una sola vez al importar el modulo
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const IMPROVE_ENDPOINT = "https://dndback.vercel.app/extras/improveField";

// ══════════════════════════════════════════════════════════════════
// AI helpers
// ══════════════════════════════════════════════════════════════════

export async function chatCompletion(
  prompt: string,
  type: "field" | "cv"
): Promise<string | CVData> {
  const response = await fetch(IMPROVE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, type }),
  });
  if (!response.ok) {
    throw new Error(`IA respondió con ${response.status}`);
  }
  return (await response.json()) as string | CVData;
}

// ══════════════════════════════════════════════════════════════════
// PDF extract (pdfjs-dist v5)
// ══════════════════════════════════════════════════════════════════

interface PdfTextItem {
  str: string;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
    .promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as PdfTextItem[];
    text += items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

// ══════════════════════════════════════════════════════════════════
// SweetAlert wrapper (tema dark)
// ══════════════════════════════════════════════════════════════════

const SwalDark = Swal.mixin({
  background: "#1a1f2b",
  color: "#e6edf3",
  confirmButtonColor: "#4aa3ff",
  cancelButtonColor: "#374052",
  buttonsStyling: true,
});

export function RenderAlert(props: AlertProps): Promise<unknown> {
  return SwalDark.fire({
    icon: props.icon,
    title: props.title,
    text: props.text,
    timer: props.timer ?? 2000,
    timerProgressBar: true,
    showConfirmButton: !props.timer,
  });
}
