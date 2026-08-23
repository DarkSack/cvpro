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

export default function HarvardTemplate({ data }: TemplateProps) {
  return (
    <div className="mx-auto max-w-4xl border-l-4 border-l-red-600 bg-white p-10 font-serif">
      <header className="mb-8 border-b-2 border-red-600 pb-6 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          {data.fullName || "YOUR NAME"}
        </h1>
        {data.title && (
          <p className="mb-4 text-xl text-gray-700">{data.title}</p>
        )}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-700">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
        </div>
        {(data.linkedin || data.github || data.portfolio) && (
          <div className="mt-2 flex justify-center gap-4 text-sm text-blue-700">
            {data.linkedin && (
              <a href={data.linkedin} className="hover:underline">
                LinkedIn
              </a>
            )}
            {data.github && (
              <a href={data.github} className="hover:underline">
                GitHub
              </a>
            )}
            {data.portfolio && (
              <a href={data.portfolio} className="hover:underline">
                Portfolio
              </a>
            )}
          </div>
        )}
      </header>

      {hasEducation(data) && (
        <Section title="EDUCATION">
          {data.education.map((edu, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{edu.institution}</h3>
                  <p className="italic text-gray-700">{edu.degree}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{formatRange(edu.startDate, edu.endDate, false)}</div>
                  {edu.location && <div>{edu.location}</div>}
                </div>
              </div>
              {edu.gpa && (
                <p className="text-sm text-gray-700">GPA: {edu.gpa}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasExperience(data) && (
        <Section title="PROFESSIONAL EXPERIENCE">
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="mb-1 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{exp.position}</h3>
                  <p className="italic text-gray-700">{exp.company}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{formatRange(exp.startDate, exp.endDate, exp.current)}</div>
                  {exp.location && <div>{exp.location}</div>}
                </div>
              </div>
              {exp.description && (
                <div className="ml-4 text-sm leading-relaxed text-gray-800">
                  {exp.description.split("\n").map((line, j) => (
                    <p key={j} className="mb-1">
                      • {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasProjects(data) && (
        <Section title="RESEARCH & PROJECTS">
          {data.projects
            .filter((p) => p.name)
            .map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold">{p.name}</h3>
                  <span className="text-sm text-gray-600">{p.date}</span>
                </div>
                {p.technologies && (
                  <p className="text-sm italic text-gray-600">
                    Technologies: {p.technologies}
                  </p>
                )}
                {p.description && (
                  <p className="ml-4 text-sm text-gray-800">{p.description}</p>
                )}
              </div>
            ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title="TECHNICAL COMPETENCIES">
          <p className="text-gray-800">
            {data.skills.filter(Boolean).join(" • ")}
          </p>
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title="LANGUAGES">
          <p className="text-gray-800">
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language} (${l.level})`)
              .join(" • ")}
          </p>
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title="CERTIFICATIONS & CREDENTIALS">
          {data.certifications
            .filter((c) => c.name)
            .map((c, i) => (
              <div key={i} className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm italic text-gray-700">{c.issuer}</p>
                </div>
                <span className="text-sm text-gray-600">{c.date}</span>
              </div>
            ))}
        </Section>
      )}

      {data.summary && (
        <Section title="PROFESSIONAL SUMMARY">
          <p className="text-justify leading-relaxed text-gray-800">
            {data.summary}
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
    <section className="mb-6">
      <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-bold text-red-600">
        {title}
      </h2>
      {children}
    </section>
  );
}
