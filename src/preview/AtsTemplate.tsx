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
 * ATS-optimized template.
 *
 * Diseñado para pasar Applicant Tracking Systems:
 * - Sin foto, sin iconos, sin gráficos
 * - Una sola columna (los ATS multi-columna se pierden)
 * - Fuentes system-safe (Arial fallback → sans-serif)
 * - Encabezados de sección estándar en MAYÚSCULAS, en un solo idioma
 * - Bullets con caracter "•" plano
 * - Todo texto seleccionable (importante para que el parser extraiga)
 * - Colores solo negro y gris (mejor OCR/parseo)
 */
export default function AtsTemplate({ data }: TemplateProps) {
  const t = labels(data.lang);
  return (
    <div
      className="mx-auto max-w-3xl bg-white p-10 text-[13px] leading-relaxed text-black"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <header className="mb-6">
        <h1 className="mb-1 text-2xl font-bold uppercase">{data.fullName || t.name}</h1>
        {data.title && <p className="mb-2 text-base text-gray-800">{data.title}</p>}
        <p className="text-xs text-gray-700">
          {[data.email, data.phone, data.location, data.linkedin, data.github, data.portfolio]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </header>

      {data.summary && (
        <Section title={t.summary}>
          <Lines text={data.summary} />
        </Section>
      )}

      {hasExperience(data) && (
        <Section title={t.experience}>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <p className="font-bold">{exp.position}</p>
              <p className="text-gray-800">{[exp.company, exp.location].filter(Boolean).join(" | ")}</p>
              <p className="mb-2 text-xs text-gray-700">
                {formatRange(exp.startDate, exp.endDate, exp.current, data.lang)}
              </p>
              <Lines text={exp.description} bullet="•" lineClassName="pl-4" />
            </div>
          ))}
        </Section>
      )}

      {hasEducation(data) && (
        <Section title={t.education}>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="font-bold">{edu.degree}</p>
              <p className="text-gray-800">{[edu.institution, edu.location].filter(Boolean).join(" | ")}</p>
              <p className="text-xs text-gray-700">{formatRange(edu.startDate, edu.endDate, false, data.lang)}</p>
              {edu.gpa && (
                <p className="text-xs text-gray-700">
                  {t.gpa}: {edu.gpa}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title={t.skills}>
          <p>{data.skills.filter(Boolean).join(", ")}</p>
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title={t.languages}>
          <p>
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language} - ${levelLabel(l.level, data.lang)}`)
              .join(", ")}
          </p>
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title={t.certifications}>
          {data.certifications
            .filter((c) => c.name)
            .map((c, i) => (
              <p key={i}>
                {c.name}
                {c.issuer && `, ${c.issuer}`}
                {c.date && ` (${fmtMonth(c.date, data.lang)})`}
              </p>
            ))}
        </Section>
      )}

      {hasProjects(data) && (
        <Section title={t.projects}>
          {data.projects
            .filter((p) => p.name)
            .map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <p className="font-bold">
                  {p.name}
                  {p.date && ` (${fmtMonth(p.date, data.lang)})`}
                </p>
                {p.technologies && (
                  <p className="text-xs text-gray-700">
                    {t.technologies}: {p.technologies}
                  </p>
                )}
                <Lines text={p.description} />
              </div>
            ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 border-b border-black pb-1 text-sm font-bold uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}
