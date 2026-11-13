import type { CVLang } from "@/types";

// Función serverless del propio repo (api/improveField.ts).
const IMPROVE_ENDPOINT = "/api/improveField";

// ══════════════════════════════════════════════════════════════════
// AI helpers
// ══════════════════════════════════════════════════════════════════

/** "field" devuelve texto; "cv" y "translate" devuelven un objeto sin validar. */
export async function chatCompletion(
  prompt: string,
  type: "field" | "cv" | "translate",
  to?: CVLang
): Promise<unknown> {
  const response = await fetch(IMPROVE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, type, to }),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (body as { error?: string } | null)?.error;
    throw new Error(message || `La IA respondió con ${response.status}`);
  }
  return body;
}

// ══════════════════════════════════════════════════════════════════
// PDF extract (pdfjs-dist v5)
// ══════════════════════════════════════════════════════════════════

interface PdfTextItem {
  str: string;
}

// pdfjs pesa ~400 KB: se descarga solo cuando alguien sube un PDF.
export async function extractTextFromPdf(file: File): Promise<string> {
  const [pdfjsLib, { default: worker }] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker?url"),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;

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
// Foto
// ══════════════════════════════════════════════════════════════════

/** Reduce la foto a 400 px por lado como máximo, en JPEG: una foto de
 *  teléfono pasa de varios MB a ~40 KB y cabe en el guardado local. */
export async function resizePhoto(file: File, max = 400): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

// ══════════════════════════════════════════════════════════════════
// Archivo JSON del CV
// ══════════════════════════════════════════════════════════════════

export function downloadFile(name: string, text: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}
