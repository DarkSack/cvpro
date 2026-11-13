import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
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

export default function CreativeTemplate({ data }: TemplateProps) {
  const t = labels(data.lang);
  const contact = [
    { icon: Mail, value: data.email },
    { icon: Phone, value: data.phone },
    { icon: MapPin, value: data.location },
    { icon: Linkedin, value: data.linkedin },
    { icon: Github, value: data.github },
    { icon: Globe, value: data.portfolio },
  ].filter((c) => c.value);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-3 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="col-span-1 bg-gradient-to-b from-purple-700 to-blue-700 p-6 text-white">
        {data.photo && (
          <img
            src={data.photo}
            alt={`${t.photoOf} ${data.fullName}`}
            className="mx-auto mb-6 h-32 w-32 rounded-full border-4 border-white/40 object-cover"
          />
        )}
        <h1 className="text-center text-2xl font-bold">{data.fullName || t.name}</h1>
        {data.title && <p className="mb-6 text-center text-sm italic">{data.title}</p>}

        <div className="mb-6 space-y-2 text-sm">
          {contact.map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-2 break-all">
              <Icon className="h-4 w-4 shrink-0" aria-hidden /> {value}
            </div>
          ))}
        </div>

        {hasSkills(data) && (
          <div className="mb-6">
            <h2 className="mb-3 border-b border-white/40 pb-1 text-sm font-bold uppercase tracking-wider">{t.skills}</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.filter(Boolean).map((s, i) => (
                <span key={i} className="rounded-full bg-white/20 px-2 py-1 text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasLanguages(data) && (
          <div className="mb-6">
            <h2 className="mb-3 border-b border-white/40 pb-1 text-sm font-bold uppercase tracking-wider">
              {t.languages}
            </h2>
            {data.languages
              .filter((l) => l.language)
              .map((l, i) => (
                <div key={i} className="mb-1 text-sm">
                  {l.language} <span className="text-xs">· {levelLabel(l.level, data.lang)}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="col-span-2 p-8">
        {data.summary && (
          <Section title={t.summary}>
            <Lines text={data.summary} className="space-y-1 text-sm leading-relaxed text-gray-700" />
          </Section>
        )}

        {hasExperience(data) && (
          <Section title={t.experience}>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-5 border-l-2 border-purple-300 pl-4 last:mb-0">
                <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                <p className="text-sm font-medium text-purple-700">{exp.company}</p>
                <p className="mb-2 text-xs text-gray-600">
                  {formatRange(exp.startDate, exp.endDate, exp.current, data.lang)}
                  {exp.location && ` · ${exp.location}`}
                </p>
                <Lines text={exp.description} className="space-y-0.5 text-sm leading-relaxed text-gray-700" />
              </div>
            ))}
          </Section>
        )}

        {hasEducation(data) && (
          <Section title={t.education}>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3 border-l-2 border-purple-300 pl-4 last:mb-0">
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-sm text-purple-700">{edu.institution}</p>
                <p className="text-xs text-gray-600">{formatRange(edu.startDate, edu.endDate, false, data.lang)}</p>
              </div>
            ))}
          </Section>
        )}

        {hasProjects(data) && (
          <Section title={t.projects}>
            {data.projects
              .filter((p) => p.name)
              .map((p, i) => (
                <div key={i} className="mb-3 border-l-2 border-purple-300 pl-4 last:mb-0">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  {p.technologies && <p className="text-xs text-purple-700">{p.technologies}</p>}
                  <Lines text={p.description} className="mt-1 text-sm text-gray-700" />
                </div>
              ))}
          </Section>
        )}

        {hasCertifications(data) && (
          <Section title={t.certifications}>
            <div className="space-y-1 text-sm">
              {data.certifications
                .filter((c) => c.name)
                .map((c, i) => (
                  <div key={i}>
                    <strong>{c.name}</strong>
                    {c.issuer && ` · ${c.issuer}`}
                    {c.date && ` · ${fmtMonth(c.date, data.lang)}`}
                  </div>
                ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-xl font-bold text-purple-700">{title}</h2>
      {children}
    </section>
  );
}
