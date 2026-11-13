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

export default function MinimalTemplate({ data }: TemplateProps) {
  const t = labels(data.lang);
  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-12">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="mb-1 text-2xl font-light tracking-wide text-gray-900">{data.fullName || t.name}</h1>
        <p className="mb-4 text-sm uppercase tracking-widest text-gray-600">{data.title || t.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.github && <span>{data.github}</span>}
        </div>
      </header>

      {data.summary && (
        <Section title={t.summary}>
          <Lines text={data.summary} className="space-y-1 text-sm leading-relaxed text-gray-700" />
        </Section>
      )}

      {hasExperience(data) && (
        <Section title={t.experience}>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="mb-1 flex items-baseline justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-900">{exp.position}</h3>
                <span className="shrink-0 text-xs text-gray-600">
                  {formatRange(exp.startDate, exp.endDate, exp.current, data.lang)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{[exp.company, exp.location].filter(Boolean).join(" · ")}</p>
              <Lines text={exp.description} className="mt-1 space-y-0.5 text-sm leading-relaxed text-gray-700" />
            </div>
          ))}
        </Section>
      )}

      {hasEducation(data) && (
        <Section title={t.education}>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-900">{edu.degree}</h3>
                <span className="shrink-0 text-xs text-gray-600">
                  {formatRange(edu.startDate, edu.endDate, false, data.lang)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{edu.institution}</p>
            </div>
          ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title={t.skills}>
          <p className="text-sm text-gray-700">{data.skills.filter(Boolean).join(" · ")}</p>
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title={t.languages}>
          <p className="text-sm text-gray-700">
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
              <div key={i} className="mb-1 text-sm text-gray-700">
                <strong>{c.name}</strong>
                {c.issuer && ` · ${c.issuer}`}
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
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                  <span className="shrink-0 text-xs text-gray-600">{fmtMonth(p.date, data.lang)}</span>
                </div>
                {p.technologies && <p className="text-xs text-gray-600">{p.technologies}</p>}
                <Lines text={p.description} className="text-sm text-gray-700" />
              </div>
            ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      {/* gray-500 y no gray-400: el título necesita 4.5:1 sobre blanco. */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">{title}</h2>
      {children}
    </section>
  );
}
