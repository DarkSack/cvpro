import { useState, type ChangeEvent } from "react";
import {
  User,
  Download,
  Eye,
  Wand2,
  Languages,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { chatCompletion, extractTextFromPdf, RenderAlert } from "@/functions";
import { downloadElementAsPdf } from "@/lib/pdf";
import { validateForDownload } from "@/validation";
import { getTemplate, TEMPLATES } from "@/preview/registry";
import type {
  CVData,
  CVEducation,
  CVExperience,
  CVCertification,
  CVLanguage,
  CVProject,
  LanguageLevel,
  TemplateId,
} from "@/types";

// ══════════════════════════════════════════════════════════════════
// Initial state
// ══════════════════════════════════════════════════════════════════

const INITIAL_DATA: CVData = {
  photo: "",
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  experience: [
    {
      position: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ],
  education: [
    {
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
    },
  ],
  skills: [""],
  languages: [{ language: "", level: "Básico" }],
  certifications: [{ name: "", issuer: "", date: "", url: "" }],
  projects: [
    { name: "", description: "", technologies: "", url: "", date: "" },
  ],
};

const STEPS = [
  "Información Personal",
  "Resumen Profesional",
  "Experiencia Laboral",
  "Educación",
  "Habilidades",
  "Idiomas",
  "Certificaciones",
  "Proyectos",
] as const;

const LANG_LEVELS: LanguageLevel[] = [
  "Básico",
  "Intermedio",
  "Avanzado",
  "Nativo",
];

type UploadStatus = "uploading" | "success" | "error" | null;

// ══════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════

export default function CvGenerator() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [data, setData] = useState<CVData>(INITIAL_DATA);

  // ── Field mutators ────────────────────────────────────────────
  const setField = <K extends keyof CVData>(key: K, value: CVData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  function setListItem<K extends keyof CVData>(
    key: K,
    index: number,
    updater: (item: CVData[K] extends (infer U)[] ? U : never) =>
      CVData[K] extends (infer U)[] ? U : never
  ) {
    setData((prev) => {
      const arr = prev[key] as unknown[];
      const next = arr.map((item, i) =>
        i === index ? updater(item as never) : item
      );
      return { ...prev, [key]: next as CVData[K] };
    });
  }

  function addListItem<K extends keyof CVData>(
    key: K,
    template: CVData[K] extends (infer U)[] ? U : never
  ) {
    setData((prev) => {
      const arr = prev[key] as unknown[];
      return { ...prev, [key]: [...arr, template] as CVData[K] };
    });
  }

  function removeListItem<K extends keyof CVData>(key: K, index: number) {
    setData((prev) => {
      const arr = prev[key] as unknown[];
      return {
        ...prev,
        [key]: arr.filter((_, i) => i !== index) as CVData[K],
      };
    });
  }

  // ── PDF import ────────────────────────────────────────────────
  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus("uploading");
    setUploadedFileName(file.name);
    try {
      const text = await extractTextFromPdf(file);
      if (text) {
        const parsed = (await chatCompletion(text, "cv")) as Partial<CVData>;
        populateFromParsed(parsed);
      }
      setUploadStatus("success");
      setTimeout(() => setUploadStatus(null), 3000);
      await RenderAlert({
        icon: "success",
        title: "✅ PDF procesado correctamente",
        timer: 2000,
      });
    } catch (err) {
      console.error("PDF import:", err);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus(null), 3000);
      await RenderAlert({
        icon: "error",
        title: "❌ No se pudo procesar el PDF",
        text: (err as Error).message,
        timer: 3500,
      });
    }
  };

  const populateFromParsed = (parsed: Partial<CVData>) => {
    setData((prev) => ({
      ...prev,
      fullName: parsed.fullName || prev.fullName,
      title: parsed.title || prev.title,
      email: parsed.email || prev.email,
      phone: parsed.phone || prev.phone,
      location: parsed.location || prev.location,
      linkedin: parsed.linkedin || prev.linkedin,
      github: parsed.github || prev.github,
      portfolio: parsed.portfolio || prev.portfolio,
      summary: parsed.summary || prev.summary,
      experience:
        parsed.experience && parsed.experience.length && parsed.experience[0].position
          ? parsed.experience
          : prev.experience,
      education:
        parsed.education && parsed.education.length && parsed.education[0].degree
          ? parsed.education
          : prev.education,
      skills:
        parsed.skills && parsed.skills.length && parsed.skills[0]
          ? parsed.skills
          : prev.skills,
      languages:
        parsed.languages && parsed.languages.length && parsed.languages[0].language
          ? parsed.languages
          : prev.languages,
      certifications:
        parsed.certifications && parsed.certifications.length && parsed.certifications[0].name
          ? parsed.certifications
          : prev.certifications,
      projects:
        parsed.projects && parsed.projects.length && parsed.projects[0].name
          ? parsed.projects
          : prev.projects,
    }));
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setField("photo", (ev.target?.result as string) || "");
    reader.readAsDataURL(file);
  };

  // ── AI improve ────────────────────────────────────────────────
  const improveWithAI = async (
    section: "summary" | "experience" | "projects",
    content: string,
    index?: number
  ) => {
    if (!content.trim()) {
      await RenderAlert({
        icon: "warning",
        title: "Escribe algo antes de mejorar con IA",
        timer: 2000,
      });
      return;
    }
    setIsGenerating(true);
    try {
      const improved = (await chatCompletion(content, "field")) as string;
      if (section === "summary") setField("summary", improved);
      else if (section === "experience" && index !== undefined)
        setListItem("experience", index, (item) => ({
          ...(item as CVExperience),
          description: improved,
        }));
      else if (section === "projects" && index !== undefined)
        setListItem("projects", index, (item) => ({
          ...(item as CVProject),
          description: improved,
        }));

      await RenderAlert({
        icon: "success",
        title: "Contenido mejorado con IA",
        timer: 1600,
      });
    } catch (err) {
      console.error(err);
      await RenderAlert({
        icon: "error",
        title: "❌ Error al conectar con la IA",
        text: (err as Error).message,
        timer: 2500,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const translateToEnglish = async () => {
    await RenderAlert({
      icon: "info",
      title: "Traducción no disponible aún",
      text: "Esta función se conectará al endpoint de IA en la próxima versión.",
      timer: 3000,
    });
  };

  // ── Download ──────────────────────────────────────────────────
  const downloadCV = async () => {
    const { valid, errors } = validateForDownload(data);
    if (!valid) {
      await RenderAlert({
        icon: "warning",
        title: "Faltan datos obligatorios",
        text: errors.join(" · "),
        timer: 4500,
      });
      return;
    }
    setIsDownloading(true);
    try {
      await downloadElementAsPdf({
        elementId: "cv-preview",
        fileName: `CV_${data.fullName || "MiCV"}_${selectedTemplate}`,
      });
      await RenderAlert({
        icon: "success",
        title: "✅ PDF descargado",
        timer: 1600,
      });
    } catch (err) {
      console.error("PDF download:", err);
      await RenderAlert({
        icon: "error",
        title: "❌ Error al generar PDF",
        text: (err as Error).message,
        timer: 2500,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // Renders
  // ══════════════════════════════════════════════════════════════

  const TemplateComp = getTemplate(selectedTemplate);
  const selectedMeta = TEMPLATES.find((t) => t.id === selectedTemplate);

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          {/* Preview toolbar */}
          <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  ← Volver a Editar
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Plantilla:
                  </span>
                  <select
                    value={selectedTemplate}
                    onChange={(e) =>
                      setSelectedTemplate(e.target.value as TemplateId)
                    }
                    className="rounded border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                        {t.atsOptimized ? " (ATS)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedMeta?.atsOptimized && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    <ShieldCheck className="h-3 w-3" /> ATS-optimized
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={translateToEnglish}
                  disabled={isGenerating}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  <Languages className="h-4 w-4" />
                  {isGenerating ? "Traduciendo…" : "Traducir a Inglés"}
                </button>
                <button
                  type="button"
                  onClick={downloadCV}
                  disabled={isDownloading}
                  className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-wait disabled:opacity-70"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isDownloading ? "Generando PDF…" : "Descargar PDF"}
                </button>
              </div>
            </div>
            {selectedMeta && (
              <p className="mt-2 text-xs text-gray-500">{selectedMeta.description}</p>
            )}
          </div>

          {/* Preview area */}
          <div id="cv-preview">
            <TemplateComp data={data} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Generador de Currículum
            </h1>
            <p className="mt-1 text-gray-600">
              Crea tu CV profesional paso a paso · 7 plantillas · ATS-friendly
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            <Eye className="h-4 w-4" />
            Vista Previa
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Progreso</h2>
              <div className="space-y-2">
                {STEPS.map((step, i) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setCurrentStep(i)}
                    className={`w-full rounded-lg p-3 text-left text-sm transition-colors ${
                      currentStep === i
                        ? "border border-blue-200 bg-blue-100 text-blue-800"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          currentStep === i
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs text-gray-600">
                  <span>Progreso</span>
                  <span>
                    {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            <div className="rounded-lg bg-white p-8 shadow-md">
              {currentStep === 0 && (
                <StepPersonal
                  data={data}
                  onChange={setField}
                  handleFile={handleFile}
                  handlePhotoUpload={handlePhotoUpload}
                  uploadStatus={uploadStatus}
                  uploadedFileName={uploadedFileName}
                  clearUpload={() => {
                    setUploadedFileName("");
                    setUploadStatus(null);
                  }}
                />
              )}
              {currentStep === 1 && (
                <StepSummary
                  value={data.summary}
                  onChange={(v) => setField("summary", v)}
                  isGenerating={isGenerating}
                  onImprove={() => improveWithAI("summary", data.summary)}
                />
              )}
              {currentStep === 2 && (
                <StepExperience
                  items={data.experience}
                  add={() =>
                    addListItem("experience", {
                      position: "",
                      company: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      description: "",
                    } as CVExperience)
                  }
                  remove={(i) => removeListItem("experience", i)}
                  update={(i, patch) =>
                    setListItem("experience", i, (item) => ({
                      ...(item as CVExperience),
                      ...patch,
                    }))
                  }
                  improve={(i, content) => improveWithAI("experience", content, i)}
                  isGenerating={isGenerating}
                />
              )}
              {currentStep === 3 && (
                <StepEducation
                  items={data.education}
                  add={() =>
                    addListItem("education", {
                      degree: "",
                      institution: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      gpa: "",
                    } as CVEducation)
                  }
                  remove={(i) => removeListItem("education", i)}
                  update={(i, patch) =>
                    setListItem("education", i, (item) => ({
                      ...(item as CVEducation),
                      ...patch,
                    }))
                  }
                />
              )}
              {currentStep === 4 && (
                <StepSkills
                  items={data.skills}
                  add={() => addListItem("skills", "" as never)}
                  remove={(i) => removeListItem("skills", i)}
                  update={(i, v) =>
                    setListItem("skills", i, () => v as never)
                  }
                />
              )}
              {currentStep === 5 && (
                <StepLanguages
                  items={data.languages}
                  add={() =>
                    addListItem("languages", {
                      language: "",
                      level: "Básico",
                    } as CVLanguage)
                  }
                  remove={(i) => removeListItem("languages", i)}
                  update={(i, patch) =>
                    setListItem("languages", i, (item) => ({
                      ...(item as CVLanguage),
                      ...patch,
                    }))
                  }
                />
              )}
              {currentStep === 6 && (
                <StepCertifications
                  items={data.certifications}
                  add={() =>
                    addListItem("certifications", {
                      name: "",
                      issuer: "",
                      date: "",
                      url: "",
                    } as CVCertification)
                  }
                  remove={(i) => removeListItem("certifications", i)}
                  update={(i, patch) =>
                    setListItem("certifications", i, (item) => ({
                      ...(item as CVCertification),
                      ...patch,
                    }))
                  }
                />
              )}
              {currentStep === 7 && (
                <StepProjects
                  items={data.projects}
                  add={() =>
                    addListItem("projects", {
                      name: "",
                      description: "",
                      technologies: "",
                      url: "",
                      date: "",
                    } as CVProject)
                  }
                  remove={(i) => removeListItem("projects", i)}
                  update={(i, patch) =>
                    setListItem("projects", i, (item) => ({
                      ...(item as CVProject),
                      ...patch,
                    }))
                  }
                  improve={(i, content) => improveWithAI("projects", content, i)}
                  isGenerating={isGenerating}
                />
              )}

              <div className="mt-8 flex justify-between border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))
                  }
                  disabled={currentStep === STEPS.length - 1}
                  className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Small building blocks
// ══════════════════════════════════════════════════════════════════

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-300 p-4">
      {children}
    </div>
  );
}

function ImproveButton({
  onClick,
  isGenerating,
}: {
  onClick: () => void;
  isGenerating: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isGenerating}
      className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-600 disabled:opacity-50"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="h-4 w-4" />
      )}
      {isGenerating ? "Mejorando…" : "Mejorar con IA"}
    </button>
  );
}

function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
    >
      + {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-red-500 hover:text-red-700"
    >
      Eliminar
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════
// Steps
// ══════════════════════════════════════════════════════════════════

interface StepPersonalProps {
  data: CVData;
  onChange: <K extends keyof CVData>(k: K, v: CVData[K]) => void;
  handleFile: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePhotoUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  uploadStatus: UploadStatus;
  uploadedFileName: string;
  clearUpload: () => void;
}

function StepPersonal({
  data,
  onChange,
  handleFile,
  handlePhotoUpload,
  uploadStatus,
  uploadedFileName,
  clearUpload,
}: StepPersonalProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>

      {/* Upload PDF */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-blue-400 hover:bg-blue-50">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            {uploadStatus === "uploading" ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            ) : uploadStatus === "success" ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : uploadStatus === "error" ? (
              <AlertCircle className="h-6 w-6 text-red-600" />
            ) : (
              <Upload className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <h3 className="mb-1 font-semibold text-gray-800">
            Subir CV Existente
          </h3>
          {uploadStatus === "uploading" && (
            <p className="mb-3 text-sm text-blue-600">
              Procesando {uploadedFileName}…
            </p>
          )}
          {uploadStatus === "success" && (
            <p className="mb-3 text-sm text-green-600">
              ✅ Datos extraídos de {uploadedFileName}
            </p>
          )}
          {uploadStatus === "error" && (
            <p className="mb-3 text-sm text-red-600">
              ❌ Error al procesar el archivo
            </p>
          )}
          {!uploadStatus && (
            <p className="mb-3 text-sm text-gray-600">
              Sube tu CV en PDF y extraeremos la información con IA
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700">
              <FileText className="h-4 w-4" />
              {uploadStatus === "uploading" ? "Procesando…" : "Seleccionar PDF"}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFile}
                className="hidden"
                disabled={uploadStatus === "uploading"}
              />
            </label>
            {uploadedFileName && uploadStatus !== "uploading" && (
              <button
                type="button"
                onClick={clearUpload}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <X className="h-3 w-3" /> Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {data.photo ? (
            <img
              src={data.photo}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <label className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">
          Subir Foto
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nombre Completo *">
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            className={inputCls}
            placeholder="Tu nombre completo"
          />
        </Field>
        <Field label="Título Profesional">
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange("title", e.target.value)}
            className={inputCls}
            placeholder="Ej: Desarrollador Full Stack"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={inputCls}
            placeholder="tu@email.com"
          />
        </Field>
        <Field label="Teléfono">
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className={inputCls}
            placeholder="+52 123 456 7890"
          />
        </Field>
        <Field label="Ubicación">
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange("location", e.target.value)}
            className={inputCls}
            placeholder="Ciudad, País"
          />
        </Field>
        <Field label="LinkedIn">
          <input
            type="url"
            value={data.linkedin}
            onChange={(e) => onChange("linkedin", e.target.value)}
            className={inputCls}
            placeholder="https://linkedin.com/in/tu-perfil"
          />
        </Field>
        <Field label="GitHub">
          <input
            type="url"
            value={data.github}
            onChange={(e) => onChange("github", e.target.value)}
            className={inputCls}
            placeholder="https://github.com/tu-usuario"
          />
        </Field>
        <Field label="Portafolio Web">
          <input
            type="url"
            value={data.portfolio}
            onChange={(e) => onChange("portfolio", e.target.value)}
            className={inputCls}
            placeholder="https://tu-portafolio.com"
          />
        </Field>
      </div>
    </div>
  );
}

function StepSummary({
  value,
  onChange,
  isGenerating,
  onImprove,
}: {
  value: string;
  onChange: (v: string) => void;
  isGenerating: boolean;
  onImprove: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Resumen Profesional</h2>
        <ImproveButton onClick={onImprove} isGenerating={isGenerating} />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className={inputCls}
        placeholder="Profesional con X años de experiencia en…"
      />
    </div>
  );
}

function StepExperience({
  items,
  add,
  remove,
  update,
  improve,
  isGenerating,
}: {
  items: CVExperience[];
  add: () => void;
  remove: (i: number) => void;
  update: (i: number, patch: Partial<CVExperience>) => void;
  improve: (i: number, content: string) => void;
  isGenerating: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Experiencia Laboral</h2>
        <AddButton onClick={add} label="Agregar Experiencia" />
      </div>
      {items.map((exp, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">Experiencia {i + 1}</h3>
            {items.length > 1 && <RemoveButton onClick={() => remove(i)} />}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Puesto">
              <input
                type="text"
                value={exp.position}
                onChange={(e) => update(i, { position: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Empresa">
              <input
                type="text"
                value={exp.company}
                onChange={(e) => update(i, { company: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Ubicación">
              <input
                type="text"
                value={exp.location}
                onChange={(e) => update(i, { location: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Fecha Inicio">
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => update(i, { startDate: e.target.value })}
                className={inputCls}
              />
            </Field>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => update(i, { current: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
                Trabajo actual
              </label>
              {!exp.current && (
                <input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => update(i, { endDate: e.target.value })}
                  className={inputCls}
                />
              )}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Descripción
              </label>
              <ImproveButton
                onClick={() => improve(i, exp.description)}
                isGenerating={isGenerating}
              />
            </div>
            <textarea
              value={exp.description}
              onChange={(e) => update(i, { description: e.target.value })}
              rows={3}
              className={inputCls}
              placeholder="Describe tus responsabilidades y logros…"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

function StepEducation({
  items,
  add,
  remove,
  update,
}: {
  items: CVEducation[];
  add: () => void;
  remove: (i: number) => void;
  update: (i: number, patch: Partial<CVEducation>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Educación</h2>
        <AddButton onClick={add} label="Agregar Educación" />
      </div>
      {items.map((edu, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">Educación {i + 1}</h3>
            {items.length > 1 && <RemoveButton onClick={() => remove(i)} />}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Título / Grado">
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => update(i, { degree: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Institución">
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => update(i, { institution: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Ubicación">
              <input
                type="text"
                value={edu.location}
                onChange={(e) => update(i, { location: e.target.value })}
                className={inputCls}
                placeholder="Ciudad, País"
              />
            </Field>
            <Field label="GPA / Promedio">
              <input
                type="text"
                value={edu.gpa}
                onChange={(e) => update(i, { gpa: e.target.value })}
                className={inputCls}
                placeholder="9.5 / 10  ·  3.8 / 4.0"
              />
            </Field>
            <Field label="Fecha Inicio">
              <input
                type="month"
                value={edu.startDate}
                onChange={(e) => update(i, { startDate: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Fecha Fin">
              <input
                type="month"
                value={edu.endDate}
                onChange={(e) => update(i, { endDate: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        </Card>
      ))}
    </div>
  );
}

function StepSkills({
  items,
  add,
  remove,
  update,
}: {
  items: string[];
  add: () => void;
  remove: (i: number) => void;
  update: (i: number, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Habilidades Técnicas</h2>
      {items.map((skill, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={skill}
            onChange={(e) => update(i, e.target.value)}
            className={`flex-1 ${inputCls}`}
            placeholder="Ej: JavaScript, React, Node.js"
          />
          {items.length > 1 && <RemoveButton onClick={() => remove(i)} />}
        </div>
      ))}
      <AddButton onClick={add} label="Agregar Habilidad" />
    </div>
  );
}

function StepLanguages({
  items,
  add,
  remove,
  update,
}: {
  items: CVLanguage[];
  add: () => void;
  remove: (i: number) => void;
  update: (i: number, patch: Partial<CVLanguage>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Idiomas</h2>
        <AddButton onClick={add} label="Agregar Idioma" />
      </div>
      {items.map((lang, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">Idioma {i + 1}</h3>
            {items.length > 1 && <RemoveButton onClick={() => remove(i)} />}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Idioma">
              <input
                type="text"
                value={lang.language}
                onChange={(e) => update(i, { language: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Nivel">
              <select
                value={lang.level}
                onChange={(e) =>
                  update(i, { level: e.target.value as LanguageLevel })
                }
                className={inputCls}
              >
                {LANG_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>
      ))}
    </div>
  );
}

function StepCertifications({
  items,
  add,
  remove,
  update,
}: {
  items: CVCertification[];
  add: () => void;
  remove: (i: number) => void;
  update: (i: number, patch: Partial<CVCertification>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Certificaciones</h2>
        <AddButton onClick={add} label="Agregar Certificación" />
      </div>
      {items.map((cert, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">Certificación {i + 1}</h3>
            {items.length > 1 && <RemoveButton onClick={() => remove(i)} />}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nombre">
              <input
                type="text"
                value={cert.name}
                onChange={(e) => update(i, { name: e.target.value })}
                className={inputCls}
                placeholder="Ej: AWS Solutions Architect"
              />
            </Field>
            <Field label="Emisor">
              <input
                type="text"
                value={cert.issuer}
                onChange={(e) => update(i, { issuer: e.target.value })}
                className={inputCls}
                placeholder="Ej: Amazon Web Services"
              />
            </Field>
            <Field label="Fecha">
              <input
                type="month"
                value={cert.date}
                onChange={(e) => update(i, { date: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="URL de Verificación">
              <input
                type="url"
                value={cert.url}
                onChange={(e) => update(i, { url: e.target.value })}
                className={inputCls}
                placeholder="https://…"
              />
            </Field>
          </div>
        </Card>
      ))}
    </div>
  );
}

function StepProjects({
  items,
  add,
  remove,
  update,
  improve,
  isGenerating,
}: {
  items: CVProject[];
  add: () => void;
  remove: (i: number) => void;
  update: (i: number, patch: Partial<CVProject>) => void;
  improve: (i: number, content: string) => void;
  isGenerating: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Proyectos Destacados</h2>
        <AddButton onClick={add} label="Agregar Proyecto" />
      </div>
      {items.map((p, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">Proyecto {i + 1}</h3>
            {items.length > 1 && <RemoveButton onClick={() => remove(i)} />}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nombre">
              <input
                type="text"
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Fecha">
              <input
                type="month"
                value={p.date}
                onChange={(e) => update(i, { date: e.target.value })}
                className={inputCls}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Tecnologías">
                <input
                  type="text"
                  value={p.technologies}
                  onChange={(e) => update(i, { technologies: e.target.value })}
                  className={inputCls}
                  placeholder="Ej: React, Node.js, MongoDB"
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="URL del Proyecto">
                <input
                  type="url"
                  value={p.url}
                  onChange={(e) => update(i, { url: e.target.value })}
                  className={inputCls}
                  placeholder="https://…"
                />
              </Field>
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Descripción del Proyecto
              </label>
              <ImproveButton
                onClick={() => improve(i, p.description)}
                isGenerating={isGenerating}
              />
            </div>
            <textarea
              value={p.description}
              onChange={(e) => update(i, { description: e.target.value })}
              rows={3}
              className={inputCls}
              placeholder="Describe el proyecto, características y tu rol…"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
