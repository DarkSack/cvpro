import { Mail, Phone, MapPin } from "lucide-react";
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

export default function ModernTemplate({ data }: TemplateProps) {
  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-xl">
      <header className="mb-8 flex items-start gap-6">
        {data.photo && (
          <img
            src={data.photo}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">
            {data.fullName || "Tu Nombre"}
          </h1>
          <p className="mb-2 text-xl text-gray-600">
            {data.title || "Tu Título Profesional"}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {data.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> {data.email}
              </span>
            )}
            {data.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> {data.phone}
              </span>
            )}
            {data.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {data.location}
              </span>
            )}
          </div>
        </div>
      </header>

      {data.summary && (
        <Section title="Resumen Profesional">
          <p className="leading-relaxed text-gray-700">{data.summary}</p>
        </Section>
      )}

      {hasExperience(data) && (
        <Section title="Experiencia Laboral">
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="mb-1 flex items-start justify-between">
                <h3 className="font-semibold text-gray-800">{exp.position}</h3>
                <span className="text-sm text-gray-600">
                  {formatRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </div>
              <p className="mb-1 text-gray-600">
                {[exp.company, exp.location].filter(Boolean).join(" · ")}
              </p>
              {exp.description && (
                <p className="text-sm text-gray-700">{exp.description}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasSkills(data) && (
        <Section title="Habilidades Técnicas">
          <div className="flex flex-wrap gap-2">
            {data.skills.filter(Boolean).map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {hasEducation(data) && (
        <Section title="Educación">
          {data.education.map((edu, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="mb-1 flex items-start justify-between">
                <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                <span className="text-sm text-gray-600">
                  {formatRange(edu.startDate, edu.endDate, false)}
                </span>
              </div>
              <p className="mb-1 text-gray-600">
                {[edu.institution, edu.location].filter(Boolean).join(" · ")}
              </p>
              {edu.gpa && <p className="text-sm text-gray-700">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </Section>
      )}

      {hasProjects(data) && (
        <Section title="Proyectos Destacados">
          {data.projects.filter((p) => p.name).map((p, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="mb-1 flex items-start justify-between">
                <h3 className="font-semibold text-gray-800">{p.name}</h3>
                <span className="text-sm text-gray-600">{p.date}</span>
              </div>
              {p.technologies && (
                <p className="mb-1 text-sm text-blue-600">
                  Tecnologías: {p.technologies}
                </p>
              )}
              {p.description && (
                <p className="text-sm text-gray-700">{p.description}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {hasCertifications(data) && (
        <Section title="Certificaciones">
          {data.certifications.filter((c) => c.name).map((c, i) => (
            <div key={i} className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{c.name}</h3>
                <p className="text-sm text-gray-600">{c.issuer}</p>
              </div>
              <span className="text-sm text-gray-600">{c.date}</span>
            </div>
          ))}
        </Section>
      )}

      {hasLanguages(data) && (
        <Section title="Idiomas">
          <div className="flex flex-wrap gap-3 text-sm text-gray-700">
            {data.languages.filter((l) => l.language).map((l, i) => (
              <span key={i} className="rounded bg-gray-100 px-3 py-1">
                {l.language} · {l.level}
              </span>
            ))}
          </div>
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
      <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-800">
        {title}
      </h2>
      {children}
    </section>
  );
}
