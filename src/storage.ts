import { parseCV } from "./validation.ts";
import type { CVData } from "./types.ts";

type Store = Pick<Storage, "getItem" | "setItem">;

const KEY = "cvpro:cv";

// Todo va en try: localStorage puede no existir o estar bloqueado
// (modo privado, cuota llena) y el formulario debe seguir funcionando.

export function loadCV(storage?: Store): CVData | null {
  try {
    const raw = (storage ?? localStorage).getItem(KEY);
    return raw ? parseCV(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveCV(data: CVData, storage?: Store): void {
  try {
    const store = storage ?? localStorage;
    try {
      store.setItem(KEY, JSON.stringify(data));
    } catch {
      // La foto es lo único grande: si no cabe, al menos se guarda el texto.
      store.setItem(KEY, JSON.stringify({ ...data, photo: "" }));
    }
  } catch {
    // sin almacenamiento: el CV vive solo en esta pestaña
  }
}
