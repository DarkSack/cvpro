import type { CVData, CVLang, LanguageLevel } from "@/types";

const MONTHS: Record<CVLang, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** "2022-03" → "mar 2022" / "Mar 2022". Cualquier otro texto se deja igual. */
export function fmtMonth(v: string, lang: CVLang): string {
  const m = /^(\d{4})-(\d{2})$/.exec(v);
  if (!m) return v || "";
  return `${MONTHS[lang][parseInt(m[2], 10) - 1] ?? m[2]} ${m[1]}`;
}

/** Rango de fechas legible; un puesto actual termina en Presente/Present. */
export function formatRange(start: string, end: string, current: boolean, lang: CVLang): string {
  const from = fmtMonth(start, lang);
  const to = current ? labels(lang).present : fmtMonth(end, lang);
  return [from, to].filter(Boolean).join(" — ");
}

const LEVELS_EN: Record<LanguageLevel, string> = {
  Básico: "Basic",
  Intermedio: "Intermediate",
  Avanzado: "Advanced",
  Nativo: "Native",
};

export function levelLabel(level: LanguageLevel, lang: CVLang): string {
  return lang === "en" ? LEVELS_EN[level] : level;
}

/** Una descripción en renglones: cada salto de línea es una idea. */
export function lines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

const LABELS = {
  es: {
    summary: "Resumen profesional",
    experience: "Experiencia",
    education: "Educación",
    skills: "Habilidades",
    languages: "Idiomas",
    certifications: "Certificaciones",
    projects: "Proyectos",
    technologies: "Tecnologías",
    present: "Presente",
    gpa: "Promedio",
    name: "Tu nombre",
    title: "Tu título profesional",
    photoOf: "Foto de",
  },
  en: {
    summary: "Professional summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    certifications: "Certifications",
    projects: "Projects",
    technologies: "Technologies",
    present: "Present",
    gpa: "GPA",
    name: "Your name",
    title: "Your professional title",
    photoOf: "Photo of",
  },
} satisfies Record<CVLang, Record<string, string>>;

export type Labels = (typeof LABELS)["es"];

export function labels(lang: CVLang): Labels {
  return LABELS[lang];
}

// ── Qué secciones tienen contenido ───────────────────────────────

export function hasExperience(d: CVData): boolean {
  return d.experience.some((e) => e.position || e.company);
}

export function hasEducation(d: CVData): boolean {
  return d.education.some((e) => e.degree || e.institution);
}

export function hasProjects(d: CVData): boolean {
  return d.projects.some((p) => p.name);
}

export function hasCertifications(d: CVData): boolean {
  return d.certifications.some((c) => c.name);
}

export function hasLanguages(d: CVData): boolean {
  return d.languages.some((l) => l.language);
}

export function hasSkills(d: CVData): boolean {
  return d.skills.some((s) => s && s.trim());
}
