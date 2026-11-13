// STEPS reúne cada paso con su formulario; Fast Refresh recarga el archivo entero.
/* eslint-disable react-refresh/only-export-components */
import type { ComponentType } from "react";
import { FileText, ImagePlus, Loader2, Trash2, User } from "lucide-react";
import {
  hasCertifications,
  hasEducation,
  hasExperience,
  hasLanguages,
  hasProjects,
  hasSkills,
  type Labels,
} from "@/preview/shared";
import { AddButton, Entry, Field, ImproveButton, TextField } from "@/ui";
import type { CVData, LanguageLevel, StepId } from "@/types";

// ══════════════════════════════════════════════════════════════════
// Contexto que cada paso recibe del editor
// ══════════════════════════════════════════════════════════════════

export type ListKey = "experience" | "education" | "languages" | "certifications" | "projects";
export type Item<K extends ListKey> = CVData[K][number];

export interface StepCtx {
  data: CVData;
  errors: Record<string, string>;
  set: <K extends keyof CVData>(key: K, value: CVData[K]) => void;
  patch: <K extends ListKey>(key: K, index: number, p: Partial<Item<K>>) => void;
  add: (key: ListKey | "skills") => void;
  remove: (key: ListKey | "skills", index: number) => void;
  /** Reescribe `text` con IA y entrega el resultado a `apply`. */
  improve: (text: string, apply: (v: string) => void) => void;
  busy: boolean;
  importPdf: (file: File) => void;
  pdfBusy: boolean;
  setPhoto: (file: File) => void;
}

export const EMPTY_ITEM: { [K in ListKey]: Item<K> } & { skills: string } = {
  experience: {
    position: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  },
  education: { degree: "", institution: "", location: "", startDate: "", endDate: "", gpa: "" },
  languages: { language: "", level: "Básico" },
  certifications: { name: "", issuer: "", date: "", url: "" },
  projects: { name: "", description: "", technologies: "", url: "", date: "" },
  skills: "",
};

const LANG_LEVELS: LanguageLevel[] = ["Básico", "Intermedio", "Avanzado", "Nativo"];

// ══════════════════════════════════════════════════════════════════
// Pasos
// ══════════════════════════════════════════════════════════════════

export interface Step {
  id: StepId;
  label: string;
  title: string;
  hint: string;
  /** Título de la sección en la hoja; null = el encabezado con el nombre. */
  section: keyof Labels | null;
  /** Claves de error (o prefijos) que pertenecen a este paso. */
  fields: string[];
  done: (d: CVData) => boolean;
  Form: ComponentType<{ ctx: StepCtx }>;
}

export const STEPS: Step[] = [
  {
    id: "personal",
    label: "Datos",
    title: "Datos personales",
    hint: "Lo necesario para que te contacten. ¿Ya tienes un CV en PDF? Súbelo y llenamos el formulario por ti.",
    section: null,
    fields: ["fullName", "title", "email", "phone", "location", "linkedin", "github", "portfolio"],
    done: (d) => !!d.fullName.trim(),
    Form: StepPersonal,
  },
  {
    id: "summary",
    label: "Resumen",
    title: "Resumen",
    hint: "Tres o cuatro líneas: qué haces, cuánto tiempo llevas y en qué destacas.",
    section: "summary",
    fields: ["summary"],
    done: (d) => !!d.summary.trim(),
    Form: StepSummary,
  },
  {
    id: "experience",
    label: "Experiencia",
    title: "Experiencia",
    hint: "Del puesto más reciente al más antiguo. Un logro por renglón se lee mejor que un párrafo.",
    section: "experience",
    fields: ["experience"],
    done: hasExperience,
    Form: StepExperience,
  },
  {
    id: "education",
    label: "Educación",
    title: "Educación",
    hint: "Carrera, bachillerato o cursos largos. El promedio es opcional.",
    section: "education",
    fields: ["education"],
    done: hasEducation,
    Form: StepEducation,
  },
  {
    id: "skills",
    label: "Habilidades",
    title: "Habilidades",
    hint: "Una por casilla: herramientas, lenguajes o métodos que dominas.",
    section: "skills",
    fields: ["skills"],
    done: hasSkills,
    Form: StepSkills,
  },
  {
    id: "languages",
    label: "Idiomas",
    title: "Idiomas",
    hint: "Incluye tu lengua materna.",
    section: "languages",
    fields: ["languages"],
    done: hasLanguages,
    Form: StepLanguages,
  },
  {
    id: "certifications",
    label: "Certificaciones",
    title: "Certificaciones",
    hint: "Opcional. Si tienes enlace de verificación, ponlo.",
    section: "certifications",
    fields: ["certifications"],
    done: hasCertifications,
    Form: StepCertifications,
  },
  {
    id: "projects",
    label: "Proyectos",
    title: "Proyectos",
    hint: "Opcional. Lo que construiste, con qué y dónde se puede ver.",
    section: "projects",
    fields: ["projects"],
    done: hasProjects,
    Form: StepProjects,
  },
];

/** ¿Hay algún error en los campos de este paso? */
export function stepHasError(step: Step, errors: Record<string, string>): boolean {
  return Object.keys(errors).some((k) =>
    step.fields.some((f) => k === f || k.startsWith(`${f}.`))
  );
}

// ── Datos personales ─────────────────────────────────────────────

function StepPersonal({ ctx }: { ctx: StepCtx }) {
  const { data, set, errors } = ctx;
  return (
    <div className="space-y-8">
      <label
        className={`group flex cursor-pointer flex-col gap-3 border border-dashed border-line-strong p-5 transition-colors hover:border-accent has-[:focus-visible]:border-accent has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-accent sm:flex-row sm:items-center ${
          ctx.pdfBusy ? "pointer-events-none opacity-70" : ""
        }`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-line-strong text-accent-ink">
          {ctx.pdfBusy ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <FileText className="h-5 w-5" aria-hidden />
          )}
        </span>
        <span className="flex-1">
          <span className="block font-medium">
            {ctx.pdfBusy ? "Leyendo tu CV…" : "Llenar desde un CV en PDF"}
          </span>
          <span className="block text-sm text-muted">
            La IA lee el PDF y completa los pasos. Revisa todo antes de guardar.
          </span>
        </span>
        <span className="bracket pointer-events-none self-start sm:self-auto" aria-hidden>
          Elegir PDF
        </span>
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          disabled={ctx.pdfBusy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) ctx.importPdf(file);
          }}
        />
      </label>

      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-line-strong bg-raised">
          {data.photo ? (
            <img src={data.photo} alt="Tu foto" className="h-full w-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-muted" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="bracket">
            <ImagePlus className="h-4 w-4" aria-hidden />
            {data.photo ? "Cambiar foto" : "Subir foto"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) ctx.setPhoto(file);
              }}
            />
          </label>
          {data.photo && (
            <button type="button" onClick={() => set("photo", "")} className="bracket bracket-quiet">
              <Trash2 className="h-4 w-4" aria-hidden />
              Quitar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
        <TextField
          label="Nombre completo"
          value={data.fullName}
          onChange={(v) => set("fullName", v)}
          error={errors.fullName}
          autoComplete="name"
          placeholder="Nombre y apellidos"
        />
        <TextField
          label="Título profesional"
          value={data.title}
          onChange={(v) => set("title", v)}
          autoComplete="organization-title"
          placeholder="Desarrolladora full stack"
        />
        <TextField
          label="Email"
          type="email"
          value={data.email}
          onChange={(v) => set("email", v)}
          error={errors.email}
          autoComplete="email"
          placeholder="ana@correo.com"
        />
        <TextField
          label="Teléfono"
          type="tel"
          value={data.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
          autoComplete="tel"
          placeholder="+52 33 1234 5678"
        />
        <TextField
          label="Ciudad"
          value={data.location}
          onChange={(v) => set("location", v)}
          autoComplete="address-level2"
          placeholder="Guadalajara, México"
          className="md:col-span-2"
        />
        <TextField
          label="LinkedIn"
          type="url"
          value={data.linkedin}
          onChange={(v) => set("linkedin", v)}
          error={errors.linkedin}
          placeholder="https://linkedin.com/in/ana"
        />
        <TextField
          label="GitHub"
          type="url"
          value={data.github}
          onChange={(v) => set("github", v)}
          error={errors.github}
          placeholder="https://github.com/ana"
        />
        <TextField
          label="Portafolio"
          type="url"
          value={data.portfolio}
          onChange={(v) => set("portfolio", v)}
          error={errors.portfolio}
          placeholder="https://ana.dev"
          className="md:col-span-2"
        />
      </div>
    </div>
  );
}

// ── Resumen ──────────────────────────────────────────────────────

function StepSummary({ ctx }: { ctx: StepCtx }) {
  const { data, set } = ctx;
  return (
    <Field
      label="Tu resumen"
      action={
        <ImproveButton busy={ctx.busy} onClick={() => ctx.improve(data.summary, (v) => set("summary", v))} />
      }
    >
      {(p) => (
        <textarea
          {...p}
          value={data.summary}
          onChange={(e) => set("summary", e.target.value)}
          rows={7}
          className="field"
          placeholder="Analista de datos con 5 años en retail. Automatizo reportes en SQL y Power BI…"
        />
      )}
    </Field>
  );
}

// ── Experiencia ──────────────────────────────────────────────────

function StepExperience({ ctx }: { ctx: StepCtx }) {
  const { data, errors, patch } = ctx;
  return (
    <div className="space-y-8">
      {data.experience.map((exp, i) => {
        const up = (p: Partial<Item<"experience">>) => patch("experience", i, p);
        return (
          <Entry
            key={i}
            title={`Puesto ${i + 1}`}
            onRemove={data.experience.length > 1 ? () => ctx.remove("experience", i) : undefined}
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
              <TextField label="Puesto" value={exp.position} onChange={(v) => up({ position: v })} />
              <TextField label="Empresa" value={exp.company} onChange={(v) => up({ company: v })} />
              <TextField
                label="Ciudad"
                value={exp.location}
                onChange={(v) => up({ location: v })}
                className="md:col-span-2"
              />
              <TextField
                label="Inicio"
                type="month"
                value={exp.startDate}
                onChange={(v) => up({ startDate: v })}
                error={errors[`experience.${i}.startDate`]}
              />
              {exp.current ? (
                <div className="flex items-end">
                  <p className="meta pb-3">Hasta hoy</p>
                </div>
              ) : (
                <TextField
                  label="Fin"
                  type="month"
                  value={exp.endDate}
                  onChange={(v) => up({ endDate: v })}
                  error={errors[`experience.${i}.endDate`]}
                />
              )}
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => up({ current: e.target.checked, endDate: "" })}
                  className="h-5 w-5 accent-[var(--accent)]"
                />
                Trabajo aquí actualmente
              </label>
            </div>
            <Field
              label="Qué hiciste y qué lograste"
              hint="Una idea por renglón."
              action={
                <ImproveButton
                  busy={ctx.busy}
                  onClick={() => ctx.improve(exp.description, (v) => up({ description: v }))}
                />
              }
            >
              {(p) => (
                <textarea
                  {...p}
                  value={exp.description}
                  onChange={(e) => up({ description: e.target.value })}
                  rows={5}
                  className="field"
                  placeholder={"Atendí 60 llamadas diarias con 95 % de satisfacción.\nCapacité a 8 agentes nuevos."}
                />
              )}
            </Field>
          </Entry>
        );
      })}
      <AddButton onClick={() => ctx.add("experience")} label="Agregar puesto" />
    </div>
  );
}

// ── Educación ────────────────────────────────────────────────────

function StepEducation({ ctx }: { ctx: StepCtx }) {
  const { data, errors, patch } = ctx;
  return (
    <div className="space-y-8">
      {data.education.map((edu, i) => {
        const up = (p: Partial<Item<"education">>) => patch("education", i, p);
        return (
          <Entry
            key={i}
            title={`Estudio ${i + 1}`}
            onRemove={data.education.length > 1 ? () => ctx.remove("education", i) : undefined}
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
              <TextField label="Título o carrera" value={edu.degree} onChange={(v) => up({ degree: v })} />
              <TextField label="Institución" value={edu.institution} onChange={(v) => up({ institution: v })} />
              <TextField label="Ciudad" value={edu.location} onChange={(v) => up({ location: v })} />
              <TextField
                label="Promedio"
                value={edu.gpa}
                onChange={(v) => up({ gpa: v })}
                placeholder="9.2 / 10"
              />
              <TextField
                label="Inicio"
                type="month"
                value={edu.startDate}
                onChange={(v) => up({ startDate: v })}
                error={errors[`education.${i}.startDate`]}
              />
              <TextField
                label="Fin"
                type="month"
                value={edu.endDate}
                onChange={(v) => up({ endDate: v })}
                error={errors[`education.${i}.endDate`]}
              />
            </div>
          </Entry>
        );
      })}
      <AddButton onClick={() => ctx.add("education")} label="Agregar estudio" />
    </div>
  );
}

// ── Habilidades ──────────────────────────────────────────────────

function StepSkills({ ctx }: { ctx: StepCtx }) {
  const { data, set } = ctx;
  return (
    <div className="space-y-3">
      {data.skills.map((skill, i) => (
        <div key={i} className="flex items-end gap-2">
          <TextField
            label={`Habilidad ${i + 1}`}
            value={skill}
            onChange={(v) => set("skills", data.skills.map((s, j) => (j === i ? v : s)))}
            placeholder="SQL, atención al cliente, Figma…"
            className="flex-1"
          />
          {data.skills.length > 1 && (
            <button
              type="button"
              onClick={() => ctx.remove("skills", i)}
              className="bracket bracket-quiet !px-3"
              aria-label={`Quitar habilidad ${i + 1}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      ))}
      <div className="pt-3">
        <AddButton onClick={() => ctx.add("skills")} label="Agregar habilidad" />
      </div>
    </div>
  );
}

// ── Idiomas ──────────────────────────────────────────────────────

function StepLanguages({ ctx }: { ctx: StepCtx }) {
  const { data, patch } = ctx;
  return (
    <div className="space-y-8">
      {data.languages.map((l, i) => (
        <Entry
          key={i}
          title={`Idioma ${i + 1}`}
          onRemove={data.languages.length > 1 ? () => ctx.remove("languages", i) : undefined}
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
            <TextField
              label="Idioma"
              value={l.language}
              onChange={(v) => patch("languages", i, { language: v })}
              placeholder="Inglés"
            />
            <Field label="Nivel">
              {(p) => (
                <select
                  {...p}
                  value={l.level}
                  onChange={(e) => patch("languages", i, { level: e.target.value as LanguageLevel })}
                  className="field"
                >
                  {LANG_LEVELS.map((lv) => (
                    <option key={lv}>{lv}</option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        </Entry>
      ))}
      <AddButton onClick={() => ctx.add("languages")} label="Agregar idioma" />
    </div>
  );
}

// ── Certificaciones ──────────────────────────────────────────────

function StepCertifications({ ctx }: { ctx: StepCtx }) {
  const { data, errors, patch } = ctx;
  return (
    <div className="space-y-8">
      {data.certifications.map((c, i) => {
        const up = (p: Partial<Item<"certifications">>) => patch("certifications", i, p);
        return (
          <Entry
            key={i}
            title={`Certificación ${i + 1}`}
            onRemove={
              data.certifications.length > 1 ? () => ctx.remove("certifications", i) : undefined
            }
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
              <TextField
                label="Nombre"
                value={c.name}
                onChange={(v) => up({ name: v })}
                placeholder="AWS Cloud Practitioner"
              />
              <TextField
                label="Quién la emite"
                value={c.issuer}
                onChange={(v) => up({ issuer: v })}
                placeholder="Amazon Web Services"
              />
              <TextField label="Fecha" type="month" value={c.date} onChange={(v) => up({ date: v })} />
              <TextField
                label="Enlace de verificación"
                type="url"
                value={c.url}
                onChange={(v) => up({ url: v })}
                error={errors[`certifications.${i}.url`]}
                placeholder="https://…"
              />
            </div>
          </Entry>
        );
      })}
      <AddButton onClick={() => ctx.add("certifications")} label="Agregar certificación" />
    </div>
  );
}

// ── Proyectos ────────────────────────────────────────────────────

function StepProjects({ ctx }: { ctx: StepCtx }) {
  const { data, errors, patch } = ctx;
  return (
    <div className="space-y-8">
      {data.projects.map((p, i) => {
        const up = (q: Partial<Item<"projects">>) => patch("projects", i, q);
        return (
          <Entry
            key={i}
            title={`Proyecto ${i + 1}`}
            onRemove={data.projects.length > 1 ? () => ctx.remove("projects", i) : undefined}
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
              <TextField label="Nombre" value={p.name} onChange={(v) => up({ name: v })} />
              <TextField label="Fecha" type="month" value={p.date} onChange={(v) => up({ date: v })} />
              <TextField
                label="Tecnologías"
                value={p.technologies}
                onChange={(v) => up({ technologies: v })}
                placeholder="React, Node.js, PostgreSQL"
                className="md:col-span-2"
              />
              <TextField
                label="Enlace"
                type="url"
                value={p.url}
                onChange={(v) => up({ url: v })}
                error={errors[`projects.${i}.url`]}
                placeholder="https://…"
                className="md:col-span-2"
              />
            </div>
            <Field
              label="De qué trata y qué hiciste"
              action={
                <ImproveButton
                  busy={ctx.busy}
                  onClick={() => ctx.improve(p.description, (v) => up({ description: v }))}
                />
              }
            >
              {(f) => (
                <textarea
                  {...f}
                  value={p.description}
                  onChange={(e) => up({ description: e.target.value })}
                  rows={4}
                  className="field"
                />
              )}
            </Field>
          </Entry>
        );
      })}
      <AddButton onClick={() => ctx.add("projects")} label="Agregar proyecto" />
    </div>
  );
}
