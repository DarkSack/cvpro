import { z } from "zod";
import type { CVData } from "@/types";

// ══════════════════════════════════════════════════════════════════
// Schemas
// ══════════════════════════════════════════════════════════════════

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => !v || /^https?:\/\/.+/i.test(v), {
    message: "Debe empezar con https://",
  });

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: "Revisa el email: debe verse como ana@correo.com",
  });

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => !v || /^[+()\d\s-]{6,}$/.test(v), {
    message: "Usa solo números, espacios y + ( ) -",
  });

const monthDate = z
  .string()
  .refine((v) => !v || /^\d{4}-\d{2}$/.test(v), {
    message: "Escribe mes y año, por ejemplo 2024-03",
  });

export const CVDataSchema = z.object({
  lang: z.enum(["es", "en"]),
  photo: z.string(),
  fullName: z.string(),
  title: z.string(),
  email: optionalEmail,
  phone: optionalPhone,
  location: z.string(),
  linkedin: optionalUrl,
  github: optionalUrl,
  portfolio: optionalUrl,
  summary: z.string(),
  experience: z.array(
    z
      .object({
        position: z.string(),
        company: z.string(),
        location: z.string(),
        startDate: monthDate,
        endDate: monthDate,
        current: z.boolean(),
        description: z.string(),
      })
      .refine((e) => e.current || !e.startDate || !e.endDate || e.startDate <= e.endDate, {
        message: "Termina antes de empezar: revisa las fechas",
        path: ["endDate"],
      })
  ),
  education: z.array(
    z
      .object({
        degree: z.string(),
        institution: z.string(),
        location: z.string(),
        startDate: monthDate,
        endDate: monthDate,
        gpa: z.string(),
      })
      .refine((e) => !e.startDate || !e.endDate || e.startDate <= e.endDate, {
        message: "Termina antes de empezar: revisa las fechas",
        path: ["endDate"],
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

// ── Forma sin reglas ─────────────────────────────────────────────
// Para datos que no escribió el formulario (lo guardado en el navegador,
// la respuesta de la IA): cada campo que falte o venga mal cae a un valor
// seguro, así las plantillas nunca reciben algo que no pueden pintar.

const text = z.string().catch("");
const month = z
  .string()
  .regex(/^\d{4}-\d{2}$/)
  .catch("");

const CVShapeSchema = z.object({
  lang: z.enum(["es", "en"]).catch("es"),
  photo: text,
  fullName: text,
  title: text,
  email: text,
  phone: text,
  location: text,
  linkedin: text,
  github: text,
  portfolio: text,
  summary: text,
  experience: z
    .array(
      z.object({
        position: text,
        company: text,
        location: text,
        startDate: month,
        endDate: month,
        current: z.boolean().catch(false),
        description: text,
      })
    )
    .catch([]),
  education: z
    .array(
      z.object({
        degree: text,
        institution: text,
        location: text,
        startDate: month,
        endDate: month,
        gpa: text,
      })
    )
    .catch([]),
  skills: z.array(z.string()).catch([]),
  languages: z
    .array(
      z.object({
        language: text,
        level: z.enum(["Básico", "Intermedio", "Avanzado", "Nativo"]).catch("Básico"),
      })
    )
    .catch([]),
  certifications: z
    .array(z.object({ name: text, issuer: text, date: month, url: text }))
    .catch([]),
  projects: z
    .array(
      z.object({ name: text, description: text, technologies: text, url: text, date: month })
    )
    .catch([]),
});

/** Convierte datos de origen dudoso en un CV completo; null si no es un objeto. */
export function parseCV(value: unknown): CVData | null {
  const result = CVShapeSchema.safeParse(value);
  return result.success ? result.data : null;
}

// ══════════════════════════════════════════════════════════════════
// API
// ══════════════════════════════════════════════════════════════════

/** Error de cada campo por su ruta ("email", "experience.0.endDate").
 *  Mientras se edita solo cuenta el formato; `forDownload` exige además
 *  lo mínimo para guardar el PDF. */
export function fieldErrors(data: CVData, forDownload = false): Record<string, string> {
  const errors: Record<string, string> = {};
  const result = CVDataSchema.safeParse(data);
  if (!result.success)
    for (const issue of result.error.issues) errors[issue.path.join(".")] ??= issue.message;
  if (forDownload) {
    if (!data.fullName.trim()) errors.fullName = "Escribe tu nombre completo";
    if (!data.email.trim() && !data.phone.trim())
      errors.email ??= "Pon al menos un email o un teléfono";
  }
  return errors;
}