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

export default function HarvardTemplate({ data }: TemplateProps) {
  const t = labels(data.lang);
  return (
    <div className="mx-auto max-w-4xl border-l-4 border-l-red-700 bg-white p-10 font-serif">
      <header className="mb-8 border-b-2 border-red-700 pb-6 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">{data.fullName || t.name}</h1>
        {data.title && <p className="mb-4 text-xl text-gray-700">{data.title}</p>}
        <p className="text-sm text-gray-700">
          {[data.email, data.phone, data.location].filter(Boolean).join(" · ")}
        </p>
        {/* La dirección completa, no solo "LinkedIn": un ATS solo lee el texto. */}
        {(data.linkedin || data.github || data.portfolio) && (
          <p className="mt-2 text-sm text-blue-800">
            {[data.linkedin, data.github, data.portfolio].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      {data.summary && (
        <Section title={t.summary}>
          <Lines text={data.summary} className="space-y-1 leading-relaxed text-gray-800" />
        </Section>
      )}

      {hasEducation(data) && (
        <Section title={t.education}>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{edu.institution}</h3>
                  <p className="italic text-gray-700">{edu.degree}</p>
                </div>
                <div className="shrink-0 text-right text-sm text-gray-600">
                  <div>{formatRange(edu.startDate, edu.endDate, false, data.lang)}</div>
                  {edu.location && <div>{edu.location}</div>}
                </div>
              </div>
              {edu.gpa && (
                <p className="text-sm text-gray-700">
                  {t.gpa}: {edu.gpa}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasExperience(data) && (
        <Section title={t.experience}>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="mb-1 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{exp.position}</h3>
                  <p className="italic text-gray-700">{exp.company}</p>
                </div>
                <div className="shrink-0 text-right text-sm text-gray-600">
                  <div>{formatRange(exp.startDate, exp.endDate, exp.current, data.lang)}</div>
                  {exp.location && <div>{exp.location}</div>}
                </div>
              </div>
              <Lines
                text={exp.description}
                bullet="•"
                className="ml-4 text-sm leading-relaxed text-gray-800"
                lineClassName="mb-1"
              />
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
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold">{p.name}</h3>
                  <span className="shrink-0 text-sm text-gray-600">{fmtMonth(p.date, data.lang)}</span>
                </div>
                {p.technologies && (
                  <p className="text-sm italic text-gray-600">
                    {t.technologies}: {p.technologies}
                  </p>
                )}
                <Lines text={p.description} className="ml-4 text-sm text-gray-800" />
              </div>
            ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title={t.skills}>
          <p className="text-gray-800">{data.skills.filter(Boolean).join(" • ")}</p>
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title={t.languages}>
          <p className="text-gray-800">
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language} (${levelLabel(l.level, data.lang)})`)
              .join(" • ")}
          </p>
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title={t.certifications}>
          {data.certifications
            .filter((c) => c.name)
            .map((c, i) => (
              <div key={i} className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm italic text-gray-700">{c.issuer}</p>
                </div>
                <span className="shrink-0 text-sm text-gray-600">{fmtMonth(c.date, data.lang)}</span>
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
      <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-bold uppercase text-red-700">{title}</h2>
      {children}
    </section>
  );
}
