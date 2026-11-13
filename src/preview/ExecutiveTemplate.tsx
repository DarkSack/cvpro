import type { TemplateProps } from "@/types";
import { Lines } from "./Lines";
import {
  fmtMonth,
  formatRange,
  hasCertifications,
  hasEducation,
  hasExperience,
  hasLanguages,
  hasProjects,
  hasSkills,
  labels,
  levelLabel,
} from "./shared";

/**
 * Executive template — para roles senior / director.
 * Diseño sobrio con acento oscuro, tipografía serif y jerarquía marcada.
 */
export default function ExecutiveTemplate({ data }: TemplateProps) {
  const t = labels(data.lang);
  return (
    <div className="mx-auto max-w-4xl bg-white p-10" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <header className="mb-8 border-b-4 border-slate-800 pb-6">
        <h1 className="mb-1 text-4xl font-bold uppercase tracking-wide text-slate-900">{data.fullName || t.name}</h1>
        {data.title && <p className="mb-3 text-lg text-slate-700">{data.title}</p>}
        {/* Sin mayúsculas forzadas: un correo en mayúsculas se lee mal y se copia mal. */}
        <p className="text-xs tracking-wide text-slate-600">
          {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(" · ")}
        </p>
      </header>

      {data.summary && (
        <Section title={t.summary}>
          <Lines text={data.summary} className="space-y-1 leading-relaxed text-slate-800" />
        </Section>
      )}

      {hasSkills(data) && (
        <Section title={t.skills}>
          <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-sm text-slate-800">
            {data.skills.filter(Boolean).map((s, i) => (
              <div key={i} className="border-l-2 border-slate-700 pl-3">
                {s}
              </div>
            ))}
          </div>
        </Section>
      )}

      {hasExperience(data) && (
        <Section title={t.experience}>
          {data.experience.map((exp, i) => (
            <article key={i} className="mb-6 last:mb-0">
              <header className="mb-1 flex items-baseline justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{exp.position}</h3>
                  <p className="text-sm italic text-slate-700">
                    {[exp.company, exp.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 text-sm uppercase tracking-wider text-slate-600">
                  {formatRange(exp.startDate, exp.endDate, exp.current, data.lang)}
                </span>
              </header>
              <Lines
                text={exp.description}
                bullet="▸"
                className="mt-2 space-y-1 text-sm leading-relaxed text-slate-800"
                lineClassName="pl-4 -indent-4"
              />
            </article>
          ))}
        </Section>
      )}

      {hasEducation(data) && (
        <Section title={t.education}>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3 flex items-baseline justify-between gap-4 last:mb-0">
              <div>
                <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                <p className="text-sm italic text-slate-700">
                  {[edu.institution, edu.location].filter(Boolean).join(" · ")}
                </p>
                {edu.gpa && (
                  <p className="text-sm text-slate-600">
                    {t.gpa}: {edu.gpa}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm uppercase tracking-wider text-slate-600">
                {formatRange(edu.startDate, edu.endDate, false, data.lang)}
              </span>
            </div>
          ))}
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title={t.certifications}>
          {data.certifications
            .filter((c) => c.name)
            .map((c, i) => (
              <div key={i} className="mb-2 flex items-start justify-between gap-4 text-sm">
                <div>
                  <strong className="text-slate-900">{c.name}</strong>
                  {c.issuer && <span className="text-slate-700"> · {c.issuer}</span>}
                </div>
                <span className="shrink-0 text-slate-600">{fmtMonth(c.date, data.lang)}</span>
              </div>
            ))}
        </Section>
      )}

      {hasProjects(data) && (
        <Section title={t.projects}>
          {data.projects
            .filter((p) => p.name)
            .map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-baseline justify-between gap-4">
                  <strong className="text-slate-900">{p.name}</strong>
                  {p.date && <span className="shrink-0 text-sm text-slate-600">{fmtMonth(p.date, data.lang)}</span>}
                </div>
                {p.technologies && <p className="text-sm italic text-slate-700">{p.technologies}</p>}
                <Lines text={p.description} className="text-sm text-slate-800" />
              </div>
            ))}
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title={t.languages}>
          <p className="text-sm text-slate-800">
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language} — ${levelLabel(l.level, data.lang)}`)
              .join(" · ")}
          </p>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-800">{title}</h2>
      {children}
    </section>
  );
}
