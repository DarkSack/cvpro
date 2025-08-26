import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import Swal from "sweetalert2";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function chatCompletion(prompt, type) {
  const apiUrl =
    import.meta.env.ENV === "development"
      ? import.meta.env.VITE_LOCAL_API
      : import.meta.env.VITE_API_URL;
      console.log(apiUrl);
      
  const response = await fetch(`${apiUrl}/extras/inproveField`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    credentials: "same-origin",
    body: JSON.stringify({
      prompt,
      type,
    }),
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
}
let workerSet = false;

/**
 * Extrae el texto de un archivo PDF en el navegador
 * @param {File} file - Archivo PDF (desde input type="file")
 * @returns {Promise<string>} - Texto plano del PDF
 */
export async function extractTextFromPdf(file) {
  if (!workerSet) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    workerSet = true;
  }
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker; // aquí

        const typedarray = new Uint8Array(reader.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + "\n";
        }

        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function RenderAlert(props) {
  return Swal.fire({
    icon: props.icon,
    title: props.title,
    timer: 2000,
  });
}
export { chatCompletion };
