import type { CVData } from "@/types";

/** Formatea un rango de fechas AAAA-MM legiblemente. */
export function formatRange(start: string, end: string, current: boolean): string {
  const from = fmtMonth(start);
  const to = current ? "Presente" : fmtMonth(end);
  if (!from && !to) return "";
  if (!from) return to;
  if (!to) return from;
  return `${from} — ${to}`;
}

export function fmtMonth(v: string): string {
  if (!v || !/^\d{4}-\d{2}$/.test(v)) return v || "";
  const [y, m] = v.split("-");
  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const idx = parseInt(m, 10) - 1;
  return `${months[idx] ?? m} ${y}`;
}

/** Filtra ítems con al menos un campo poblado. */
export function filterEmpty<T>(items: T[], has: (item: T) => boolean): T[] {
  return items.filter(has);
}

/** True si al menos hay experiencia poblada. */
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
