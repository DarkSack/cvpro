import type { TemplateProps } from "@/types";
import {
  formatRange,
  hasCertifications,
  hasEducation,
  hasExperience,
  hasLanguages,
  hasProjects,
  hasSkills,
} from "./shared";

/**
 * ATS-optimized template.
 *
 * Diseñado para pasar Applicant Tracking Systems:
 * - Sin foto, sin iconos, sin gráficos
 * - Una sola columna (los ATS multi-columna se pierden)
 * - Fuentes system-safe (Arial fallback → sans-serif)
 * - Encabezados de sección en MAYÚSCULAS estándar (SUMMARY, EXPERIENCE, ...)
 * - Bullets con caracter "•" plano
 * - Sin tablas ni divs con display flex complejo dentro de contenido
 * - Todo texto seleccionable (importante para que el parser extraiga)
 * - Colores solo negro y gris (mejor OCR/parseo)
 */
export default function AtsTemplate({ data }: TemplateProps) {
  return (
    <div
      className="mx-auto max-w-3xl bg-white p-10 text-[13px] leading-relaxed text-black"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* Cabecera plana */}
      <header className="mb-6">
        <h1 className="mb-1 text-2xl font-bold uppercase">
          {data.fullName || "Nombre Completo"}
        </h1>
        {data.title && (
          <p className="mb-2 text-base text-gray-800">{data.title}</p>
        )}
        <p className="text-xs text-gray-700">
          {[
            data.email,
            data.phone,
            data.location,
            data.linkedin,
            data.github,
            data.portfolio,
          ]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </header>

      {data.summary && (
        <Section title="RESUMEN PROFESIONAL / PROFESSIONAL SUMMARY">
          <p>{data.summary}</p>
        </Section>
      )}

      {hasExperience(data) && (
        <Section title="EXPERIENCIA LABORAL / PROFESSIONAL EXPERIENCE">
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <p className="font-bold">{exp.position}</p>
              <p className="text-gray-800">
                {[exp.company, exp.location].filter(Boolean).join(" | ")}
              </p>
              <p className="mb-2 text-xs text-gray-700">
                {formatRange(exp.startDate, exp.endDate, exp.current)}
              </p>
              {exp.description && (
                <div>
                  {exp.description.split("\n").map((line, j) => (
                    <p key={j} className="pl-4">
                      • {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasEducation(data) && (
        <Section title="EDUCACIÓN / EDUCATION">
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="font-bold">{edu.degree}</p>
              <p className="text-gray-800">
                {[edu.institution, edu.location].filter(Boolean).join(" | ")}
              </p>
              <p className="text-xs text-gray-700">
                {formatRange(edu.startDate, edu.endDate, false)}
              </p>
              {edu.gpa && <p className="text-xs text-gray-700">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title="HABILIDADES / SKILLS">
          <p>{data.skills.filter(Boolean).join(", ")}</p>
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title="IDIOMAS / LANGUAGES">
          <p>
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language} - ${l.level}`)
              .join(", ")}
          </p>
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title="CERTIFICACIONES / CERTIFICATIONS">
          {data.certifications
            .filter((c) => c.name)
            .map((c, i) => (
              <p key={i}>
                {c.name}
                {c.issuer && `, ${c.issuer}`}
                {c.date && ` (${c.date})`}
              </p>
            ))}
        </Section>
      )}

      {hasProjects(data) && (
        <Section title="PROYECTOS / PROJECTS">
          {data.projects
            .filter((p) => p.name)
            .map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <p className="font-bold">
                  {p.name}
                  {p.date && ` (${p.date})`}
                </p>
                {p.technologies && (
                  <p className="text-xs text-gray-700">
                    Tecnologías: {p.technologies}
                  </p>
                )}
                {p.description && <p>{p.description}</p>}
              </div>
            ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 border-b border-black pb-1 text-sm font-bold uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  );
}
