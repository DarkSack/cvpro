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

export default function ClassicTemplate({ data }: TemplateProps) {
  const t = labels(data.lang);
  return (
    <div className="mx-auto max-w-4xl rounded-lg border-2 border-gray-300 bg-gray-50 p-10 font-serif">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold uppercase tracking-widest text-gray-900">
          {data.fullName || t.name}
        </h1>
        {data.title && <p className="mb-4 text-lg italic text-gray-700">{data.title}</p>}
        <p className="text-sm text-gray-700">
          {[data.email, data.phone, data.location].filter(Boolean).join(" · ")}
        </p>
      </header>

      {data.summary && (
        <Section title={t.summary}>
          <Lines text={data.summary} className="space-y-1 leading-relaxed text-gray-800" />
        </Section>
      )}

      {hasExperience(data) && (
        <Section title={t.experience}>
          {data.experience.map((exp, i) => (
            <article key={i} className="mb-5 last:mb-0">
              <header className="mb-1 flex items-baseline justify-between gap-4">
                <div>
                  <strong className="text-gray-900">{exp.position}</strong>
                  {exp.company && (
                    <>
                      {" — "}
                      <em className="text-gray-700">{exp.company}</em>
                    </>
                  )}
                </div>
                <span className="shrink-0 text-sm text-gray-600">
                  {formatRange(exp.startDate, exp.endDate, exp.current, data.lang)}
                </span>
              </header>
              {exp.location && <p className="mb-1 text-sm italic text-gray-600">{exp.location}</p>}
              <Lines text={exp.description} className="space-y-0.5 text-sm leading-relaxed text-gray-800" />
            </article>
          ))}
        </Section>
      )}

      {hasEducation(data) && (
        <Section title={t.education}>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <strong className="text-gray-900">{edu.degree}</strong>
                  {edu.institution && (
                    <>
                      {" — "}
                      <em className="text-gray-700">{edu.institution}</em>
                    </>
                  )}
                </div>
                <span className="shrink-0 text-sm text-gray-600">
                  {formatRange(edu.startDate, edu.endDate, false, data.lang)}
                </span>
              </div>
              {edu.gpa && (
                <p className="text-sm italic text-gray-600">
                  {t.gpa}: {edu.gpa}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title={t.skills}>
          <p className="text-gray-800">{data.skills.filter(Boolean).join(" · ")}</p>
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title={t.languages}>
          <p className="text-gray-800">
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language} (${levelLabel(l.level, data.lang)})`)
              .join(" · ")}
          </p>
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title={t.certifications}>
          {data.certifications
            .filter((c) => c.name)
            .map((c, i) => (
              <div key={i} className="mb-1">
                <strong>{c.name}</strong>
                {c.issuer && `, ${c.issuer}`}
                {c.date && ` · ${fmtMonth(c.date, data.lang)}`}
              </div>
            ))}
        </Section>
      )}

      {hasProjects(data) && (
        <Section title={t.projects}>
          {data.projects
            .filter((p) => p.name)
            .map((p, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-baseline justify-between gap-4">
                  <strong>{p.name}</strong>
                  {p.date && <span className="shrink-0 text-sm text-gray-600">{fmtMonth(p.date, data.lang)}</span>}
                </div>
                <Lines text={p.description} className="text-sm text-gray-800" />
                {p.technologies && (
                  <p className="text-sm italic text-gray-600">
                    {t.technologies}: {p.technologies}
                  </p>
                )}
              </div>
            ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 border-b border-gray-400 pb-1 text-lg font-bold uppercase tracking-wider text-gray-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
