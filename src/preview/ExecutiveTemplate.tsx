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
 * Executive template — para roles senior / director.
 * Diseño sobrio con acento oscuro, tipografía serif y jerarquía marcada.
 */
export default function ExecutiveTemplate({ data }: TemplateProps) {
  return (
    <div
      className="mx-auto max-w-4xl bg-white p-10"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <header className="mb-8 border-b-4 border-slate-800 pb-6">
        <h1 className="mb-1 text-4xl font-bold uppercase tracking-wide text-slate-900">
          {data.fullName || "Tu Nombre"}
        </h1>
        {data.title && (
          <p className="mb-3 text-lg text-slate-700">{data.title}</p>
        )}
        <div className="flex flex-wrap gap-x-4 text-xs uppercase tracking-widest text-slate-600">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
          {data.linkedin && <span>· LinkedIn</span>}
        </div>
      </header>

      {data.summary && (
        <Section title="Executive Summary">
          <p className="text-justify leading-relaxed text-slate-800">
            {data.summary}
          </p>
        </Section>
      )}

      {hasSkills(data) && (
        <Section title="Core Competencies">
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
        <Section title="Professional Experience">
          {data.experience.map((exp, i) => (
            <article key={i} className="mb-6 last:mb-0">
              <header className="mb-1 flex items-baseline justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {exp.position}
                  </h3>
                  <p className="text-sm italic text-slate-700">
                    {[exp.company, exp.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="text-sm uppercase tracking-wider text-slate-600">
                  {formatRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </header>
              {exp.description && (
                <div className="mt-2 space-y-1 text-sm leading-relaxed text-slate-800">
                  {exp.description.split("\n").map((line, j) => (
                    <p key={j} className="pl-4 -indent-4">
                      ▸ {line}
                    </p>
                  ))}
                </div>
              )}
            </article>
          ))}
        </Section>
      )}

      {hasEducation(data) && (
        <Section title="Education">
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3 last:mb-0 flex items-baseline justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                <p className="text-sm italic text-slate-700">
                  {[edu.institution, edu.location].filter(Boolean).join(" · ")}
                </p>
                {edu.gpa && (
                  <p className="text-sm text-slate-600">GPA: {edu.gpa}</p>
                )}
              </div>
              <span className="text-sm uppercase tracking-wider text-slate-600">
                {formatRange(edu.startDate, edu.endDate, false)}
              </span>
            </div>
          ))}
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title="Professional Credentials">
          {data.certifications
            .filter((c) => c.name)
            .map((c, i) => (
              <div key={i} className="mb-2 flex items-start justify-between text-sm">
                <div>
                  <strong className="text-slate-900">{c.name}</strong>
                  {c.issuer && (
                    <span className="text-slate-700"> · {c.issuer}</span>
                  )}
                </div>
                <span className="text-slate-600">{c.date}</span>
              </div>
            ))}
        </Section>
      )}

      {hasProjects(data) && (
        <Section title="Key Initiatives">
          {data.projects
            .filter((p) => p.name)
            .map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-baseline justify-between">
                  <strong className="text-slate-900">{p.name}</strong>
                  {p.date && (
                    <span className="text-sm text-slate-600">{p.date}</span>
                  )}
                </div>
                {p.technologies && (
                  <p className="text-sm italic text-slate-700">
                    {p.technologies}
                  </p>
                )}
                {p.description && (
                  <p className="text-sm text-slate-800">{p.description}</p>
                )}
              </div>
            ))}
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title="Languages">
          <p className="text-sm text-slate-800">
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language} — ${l.level}`)
              .join(" · ")}
          </p>
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
    <section className="mb-7">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-800">
        {title}
      </h2>
      {children}
    </section>
  );
}
