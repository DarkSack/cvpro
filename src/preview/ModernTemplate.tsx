import { Mail, Phone, MapPin } from "lucide-react";
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

export default function ModernTemplate({ data }: TemplateProps) {
  const t = labels(data.lang);
  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-xl">
      <header className="mb-8 flex items-start gap-6">
        {data.photo && (
          <img
            src={data.photo}
            alt={`${t.photoOf} ${data.fullName}`}
            className="h-24 w-24 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{data.fullName || t.name}</h1>
          <p className="mb-2 text-xl text-gray-600">{data.title || t.title}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {data.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" aria-hidden /> {data.email}
              </span>
            )}
            {data.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" aria-hidden /> {data.phone}
              </span>
            )}
            {data.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden /> {data.location}
              </span>
            )}
          </div>
        </div>
      </header>

      {data.summary && (
        <Section title={t.summary}>
          <Lines text={data.summary} className="space-y-1 leading-relaxed text-gray-700" />
        </Section>
      )}

      {hasExperience(data) && (
        <Section title={t.experience}>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="mb-1 flex items-start justify-between gap-4">
                <h3 className="font-semibold text-gray-800">{exp.position}</h3>
                <span className="shrink-0 text-sm text-gray-600">
                  {formatRange(exp.startDate, exp.endDate, exp.current, data.lang)}
                </span>
              </div>
              <p className="mb-1 text-gray-600">
                {[exp.company, exp.location].filter(Boolean).join(" · ")}
              </p>
              <Lines text={exp.description} className="space-y-0.5 text-sm text-gray-700" />
            </div>
          ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title={t.skills}>
          <div className="flex flex-wrap gap-2">
            {data.skills.filter(Boolean).map((s, i) => (
              <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {hasEducation(data) && (
        <Section title={t.education}>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="mb-1 flex items-start justify-between gap-4">
                <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                <span className="shrink-0 text-sm text-gray-600">
                  {formatRange(edu.startDate, edu.endDate, false, data.lang)}
                </span>
              </div>
              <p className="mb-1 text-gray-600">
                {[edu.institution, edu.location].filter(Boolean).join(" · ")}
              </p>
              {edu.gpa && (
                <p className="text-sm text-gray-700">
                  {t.gpa}: {edu.gpa}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasProjects(data) && (
        <Section title={t.projects}>
          {data.projects
            .filter((p) => p.name)
            .map((p, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="mb-1 flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <span className="shrink-0 text-sm text-gray-600">{fmtMonth(p.date, data.lang)}</span>
                </div>
                {p.technologies && (
                  <p className="mb-1 text-sm text-blue-700">
                    {t.technologies}: {p.technologies}
                  </p>
                )}
                <Lines text={p.description} className="space-y-0.5 text-sm text-gray-700" />
              </div>
            ))}
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title={t.certifications}>
          {data.certifications
            .filter((c) => c.name)
            .map((c, i) => (
              <div key={i} className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{c.name}</h3>
                  <p className="text-sm text-gray-600">{c.issuer}</p>
                </div>
                <span className="shrink-0 text-sm text-gray-600">{fmtMonth(c.date, data.lang)}</span>
              </div>
            ))}
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title={t.languages}>
          <div className="flex flex-wrap gap-3 text-sm text-gray-700">
            {data.languages
              .filter((l) => l.language)
              .map((l, i) => (
                <span key={i} className="rounded bg-gray-100 px-3 py-1">
                  {l.language} · {levelLabel(l.level, data.lang)}
                </span>
              ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  );
}
