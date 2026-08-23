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

export default function MinimalTemplate({ data }: TemplateProps) {
  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-12">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="mb-1 text-2xl font-light tracking-wide text-gray-900">
          {data.fullName || "Tu Nombre"}
        </h1>
        <p className="mb-4 text-sm uppercase tracking-widest text-gray-500">
          {data.title || "Título profesional"}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.github && <span>{data.github}</span>}
        </div>
      </header>

      {data.summary && (
        <Section title="Perfil">
          <p className="text-sm leading-relaxed text-gray-700">
            {data.summary}
          </p>
        </Section>
      )}

      {hasExperience(data) && (
        <Section title="Experiencia">
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="mb-1 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {exp.position}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {[exp.company, exp.location].filter(Boolean).join(" · ")}
              </p>
              {exp.description && (
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasEducation(data) && (
        <Section title="Educación">
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {edu.degree}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatRange(edu.startDate, edu.endDate, false)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{edu.institution}</p>
            </div>
          ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title="Habilidades">
          <p className="text-sm text-gray-700">
            {data.skills.filter(Boolean).join(" · ")}
          </p>
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title="Idiomas">
          <p className="text-sm text-gray-700">
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language} (${l.level})`)
              .join(" · ")}
          </p>
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title="Certificaciones">
          {data.certifications
            .filter((c) => c.name)
            .map((c, i) => (
              <div key={i} className="mb-1 text-sm text-gray-700">
                <strong>{c.name}</strong>
                {c.issuer && ` · ${c.issuer}`}
                {c.date && ` · ${c.date}`}
              </div>
            ))}
        </Section>
      )}

      {hasProjects(data) && (
        <Section title="Proyectos">
          {data.projects
            .filter((p) => p.name)
            .map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {p.name}
                  </h3>
                  <span className="text-xs text-gray-500">{p.date}</span>
                </div>
                {p.technologies && (
                  <p className="text-xs text-gray-500">{p.technologies}</p>
                )}
                {p.description && (
                  <p className="text-sm text-gray-700">{p.description}</p>
                )}
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
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
        {title}
      </h2>
      {children}
    </section>
  );
}
