import { z } from "zod";
import type { CVData } from "@/types";

// ══════════════════════════════════════════════════════════════════
// Schemas
// ══════════════════════════════════════════════════════════════════

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => !v || /^https?:\/\/.+/i.test(v), {
    message: "Debe ser una URL válida (http:// o https://)",
  });

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: "Email inválido",
  });

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => !v || /^[+()\d\s-]{6,}$/.test(v), {
    message: "Teléfono inválido",
  });

const monthDate = z
  .string()
  .refine((v) => !v || /^\d{4}-\d{2}$/.test(v), {
    message: "Fecha inválida (formato AAAA-MM)",
  });

export const CVDataSchema = z.object({
  photo: z.string(),
  fullName: z.string().trim().min(2, "El nombre completo es obligatorio"),
  title: z.string(),
  email: optionalEmail,
  phone: optionalPhone,
  location: z.string(),
  linkedin: optionalUrl,
  github: optionalUrl,
  portfolio: optionalUrl,
  summary: z.string(),
  experience: z
    .array(
      z.object({
        position: z.string(),
        company: z.string(),
        location: z.string(),
        startDate: monthDate,
        endDate: monthDate,
        current: z.boolean(),
        description: z.string(),
      })
    )
    .refine(
      (arr) => arr.every((e) => e.current || !e.startDate || !e.endDate || e.startDate <= e.endDate),
      { message: "La fecha de inicio no puede ser posterior a la de fin" }
    ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      location: z.string(),
      startDate: monthDate,
      endDate: monthDate,
      gpa: z.string(),
    })
  ),
  skills: z.array(z.string()),
  languages: z.array(
    z.object({
      language: z.string(),
      level: z.enum(["Básico", "Intermedio", "Avanzado", "Nativo"]),
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: monthDate,
      url: optionalUrl,
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.string(),
      url: optionalUrl,
      date: monthDate,
    })
  ),
});

// ══════════════════════════════════════════════════════════════════
// API
// ══════════════════════════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Valida un CV completo. Devuelve la lista de errores (vacía si todo OK). */
export function validateCV(data: CVData): ValidationResult {
  const result = CVDataSchema.safeParse(data);
  if (result.success) return { valid: true, errors: [] };
  const errors = result.error.issues.map((iss) => {
    const path = iss.path.join(".");
    return path ? `${path}: ${iss.message}` : iss.message;
  });
  return { valid: false, errors };
}

/** Valida solo lo mínimo requerido para descargar el PDF. */
export function validateForDownload(data: CVData): ValidationResult {
  const errors: string[] = [];
  if (!data.fullName.trim()) errors.push("Falta el nombre completo.");
  if (!data.email.trim() && !data.phone.trim())
    errors.push("Al menos email o teléfono deben estar completos.");
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push("El email no es válido.");
  return { valid: errors.length === 0, errors };
}
