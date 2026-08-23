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

export default function ClassicTemplate({ data }: TemplateProps) {
  return (
    <div className="mx-auto max-w-4xl rounded-lg border-2 border-gray-300 bg-gray-50 p-10 font-serif">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold uppercase tracking-widest text-gray-900">
          {data.fullName || "Tu Nombre"}
        </h1>
        {data.title && (
          <p className="mb-4 text-lg italic text-gray-700">{data.title}</p>
        )}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-700">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
        </div>
      </header>

      {data.summary && (
        <Section title="Perfil">
          <p className="text-justify leading-relaxed text-gray-800">
            {data.summary}
          </p>
        </Section>
      )}

      {hasExperience(data) && (
        <Section title="Experiencia">
          {data.experience.map((exp, i) => (
            <article key={i} className="mb-5 last:mb-0">
              <header className="mb-1 flex items-baseline justify-between">
                <div>
                  <strong className="text-gray-900">{exp.position}</strong>
                  {exp.company && (
                    <>
                      {" — "}
                      <em className="text-gray-700">{exp.company}</em>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {formatRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </header>
              {exp.location && (
                <p className="mb-1 text-sm italic text-gray-600">
                  {exp.location}
                </p>
              )}
              {exp.description && (
                <p className="text-sm leading-relaxed text-gray-800">
                  {exp.description}
                </p>
              )}
            </article>
          ))}
        </Section>
      )}

      {hasEducation(data) && (
        <Section title="Educación">
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex items-baseline justify-between">
                <div>
                  <strong className="text-gray-900">{edu.degree}</strong>
                  {edu.institution && (
                    <>
                      {" — "}
                      <em className="text-gray-700">{edu.institution}</em>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {formatRange(edu.startDate, edu.endDate, false)}
                </span>
              </div>
              {edu.gpa && (
                <p className="text-sm italic text-gray-600">GPA: {edu.gpa}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title="Habilidades">
          <p className="text-gray-800">{data.skills.filter(Boolean).join(" · ")}</p>
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title="Idiomas">
          <p className="text-gray-800">
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
              <div key={i} className="mb-1">
                <strong>{c.name}</strong>
                {c.issuer && `, ${c.issuer}`}
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
              <div key={i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <strong>{p.name}</strong>
                  {p.date && <span className="text-sm text-gray-600">{p.date}</span>}
                </div>
                {p.description && <p className="text-sm text-gray-800">{p.description}</p>}
                {p.technologies && (
                  <p className="text-sm italic text-gray-600">
                    Tecnologías: {p.technologies}
                  </p>
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
    <section className="mb-6">
      <h2 className="mb-2 border-b border-gray-400 pb-1 text-lg font-bold uppercase tracking-wider text-gray-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
