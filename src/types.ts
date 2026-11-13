// ══════════════════════════════════════════════════════════════════
// CV data model
// ══════════════════════════════════════════════════════════════════

export type LanguageLevel = "Básico" | "Intermedio" | "Avanzado" | "Nativo";

/** Idioma en que se imprime el CV (títulos, fechas, niveles). */
export type CVLang = "es" | "en";

export interface CVExperience {
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CVEducation {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface CVLanguage {
  language: string;
  level: LanguageLevel;
}

export interface CVCertification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface CVProject {
  name: string;
  description: string;
  technologies: string;
  url: string;
  date: string;
}

export interface CVData {
  lang: CVLang;
  photo: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  experience: CVExperience[];
  education: CVEducation[];
  skills: string[];
  languages: CVLanguage[];
  certifications: CVCertification[];
  projects: CVProject[];
}

// ── Templates ────────────────────────────────────────────────────

export type TemplateId =
  | "modern"
  | "classic"
  | "creative"
  | "minimal"
  | "harvard"
  | "ats"
  | "executive";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  atsOptimized: boolean;
}

export interface TemplateProps {
  data: CVData;
}

// ── Steps (wizard) ───────────────────────────────────────────────

export type StepId =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certifications"
  | "projects";
