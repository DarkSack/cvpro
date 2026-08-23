import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
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

export default function CreativeTemplate({ data }: TemplateProps) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Sidebar */}
      <aside className="col-span-1 rounded-l-lg bg-gradient-to-b from-purple-600 to-blue-600 p-6 text-white">
        {data.photo && (
          <img
            src={data.photo}
            alt="Profile"
            className="mx-auto mb-6 h-32 w-32 rounded-full border-4 border-white/40 object-cover"
          />
        )}
        <h1 className="text-center text-2xl font-bold">
          {data.fullName || "Tu Nombre"}
        </h1>
        {data.title && (
          <p className="mb-6 text-center text-sm italic opacity-90">
            {data.title}
          </p>
        )}

        <div className="mb-6 space-y-2 text-sm">
          {data.email && (
            <div className="flex items-center gap-2 break-all">
              <Mail className="h-4 w-4 shrink-0" /> {data.email}
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> {data.phone}
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" /> {data.location}
            </div>
          )}
          {data.linkedin && (
            <div className="flex items-center gap-2 break-all">
              <Linkedin className="h-4 w-4 shrink-0" /> {data.linkedin}
            </div>
          )}
          {data.github && (
            <div className="flex items-center gap-2 break-all">
              <Github className="h-4 w-4 shrink-0" /> {data.github}
            </div>
          )}
          {data.portfolio && (
            <div className="flex items-center gap-2 break-all">
              <Globe className="h-4 w-4 shrink-0" /> {data.portfolio}
            </div>
          )}
        </div>

        {hasSkills(data) && (
          <div className="mb-6">
            <h2 className="mb-3 border-b border-white/40 pb-1 text-sm font-bold uppercase tracking-wider">
              Habilidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.filter(Boolean).map((s, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white/20 px-2 py-1 text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasLanguages(data) && (
          <div className="mb-6">
            <h2 className="mb-3 border-b border-white/40 pb-1 text-sm font-bold uppercase tracking-wider">
              Idiomas
            </h2>
            {data.languages
              .filter((l) => l.language)
              .map((l, i) => (
                <div key={i} className="mb-1 text-sm">
                  {l.language}{" "}
                  <span className="text-xs opacity-80">· {l.level}</span>
                </div>
              ))}
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="col-span-2 p-8">
        {data.summary && (
          <Section title="Sobre mí" color="purple">
            <p className="text-sm leading-relaxed text-gray-700">
              {data.summary}
            </p>
          </Section>
        )}

        {hasExperience(data) && (
          <Section title="Experiencia" color="purple">
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-5 last:mb-0 border-l-2 border-purple-300 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {exp.position}
                </h3>
                <p className="text-sm font-medium text-purple-700">
                  {exp.company}
                </p>
                <p className="mb-2 text-xs text-gray-500">
                  {formatRange(exp.startDate, exp.endDate, exp.current)}
                  {exp.location && ` · ${exp.location}`}
                </p>
                {exp.description && (
                  <p className="text-sm leading-relaxed text-gray-700">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </Section>
        )}

        {hasEducation(data) && (
          <Section title="Educación" color="purple">
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3 last:mb-0 border-l-2 border-purple-300 pl-4">
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-sm text-purple-700">{edu.institution}</p>
                <p className="text-xs text-gray-500">
                  {formatRange(edu.startDate, edu.endDate, false)}
                </p>
              </div>
            ))}
          </Section>
        )}

        {hasProjects(data) && (
          <Section title="Proyectos" color="purple">
            {data.projects
              .filter((p) => p.name)
              .map((p, i) => (
                <div key={i} className="mb-3 last:mb-0 border-l-2 border-purple-300 pl-4">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  {p.technologies && (
                    <p className="text-xs text-purple-700">{p.technologies}</p>
                  )}
                  {p.description && (
                    <p className="mt-1 text-sm text-gray-700">{p.description}</p>
                  )}
                </div>
              ))}
          </Section>
        )}

        {hasCertifications(data) && (
          <Section title="Certificaciones" color="purple">
            <div className="space-y-1 text-sm">
              {data.certifications
                .filter((c) => c.name)
                .map((c, i) => (
                  <div key={i}>
                    <strong>{c.name}</strong>
                    {c.issuer && ` · ${c.issuer}`}
                    {c.date && ` · ${c.date}`}
                  </div>
                ))}
            </div>
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-xl font-bold text-purple-700">{title}</h2>
      {children}
    </section>
  );
}
