import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Download,
  Eye,
  Wand2,
  Languages,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import { chatCompletion, extractTextFromPdf, RenderAlert } from "./functions";
import html2canvas from "html2canvas";

const CVGenerator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [formData, setFormData] = useState({
    // Información personal
    photo: "",
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    // Resumen profesional
    summary: "",
    // Experiencia laboral
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
    // Educación
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

    // Habilidades
    skills: [""],

    // Idiomas
    languages: [
      {
        language: "",
        level: "Básico",
      },
    ],

    // Certificaciones
    certifications: [
      {
        name: "",
        issuer: "",
        date: "",
        url: "",
      },
    ],

    // Proyectos
    projects: [
      {
        name: "",
        description: "",
        technologies: "",
        url: "",
        date: "",
      },
    ],
  });

  const steps = [
    "Información Personal",
    "Resumen Profesional",
    "Experiencia Laboral",
    "Educación",
    "Habilidades",
    "Idiomas",
    "Certificaciones",
    "Proyectos",
  ];

  const templates = [
    { id: "modern", name: "Moderno" },
    { id: "classic", name: "Clásico" },
    { id: "creative", name: "Creativo" },
    { id: "minimal", name: "Minimalista" },
    { id: "harvard", name: "Harvard" },
  ];

  const languageLevels = ["Básico", "Intermedio", "Avanzado", "Nativo"];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const populateFormData = (extractedData) => {
    try {
      const data = extractedData;

      // Merge extracted data with current form data, preserving array structures
      setFormData((prev) => ({
        ...prev,
        fullName: data.fullName || prev.fullName,
        title: data.title || prev.title,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        location: data.location || prev.location,
        linkedin: data.linkedin || prev.linkedin,
        github: data.github || prev.github,
        portfolio: data.portfolio || prev.portfolio,
        summary: data.summary || prev.summary,
        experience:
          data.experience &&
          data.experience.length > 0 &&
          data.experience[0].position
            ? data.experience
            : prev.experience,
        education:
          data.education &&
          data.education.length > 0 &&
          data.education[0].degree
            ? data.education
            : prev.education,
        skills:
          data.skills && data.skills.length > 0 && data.skills[0]
            ? data.skills
            : prev.skills,
        languages:
          data.languages &&
          data.languages.length > 0 &&
          data.languages[0].language
            ? data.languages
            : prev.languages,
        certifications:
          data.certifications &&
          data.certifications.length > 0 &&
          data.certifications[0].name
            ? data.certifications
            : prev.certifications,
        projects:
          data.projects && data.projects.length > 0 && data.projects[0].name
            ? data.projects
            : prev.projects,
      }));

      setUploadStatus("success");
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      console.error("Error parsing extracted data:", error);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus("uploading");
    setUploadedFileName(file.name);

    try {
      const extractedText = await extractTextFromPdf(file);
      if (extractedText) {
        const response = await chatCompletion(extractedText, "cv");
        populateFormData(response);
      }
      const props = {
        icon: "success",
        title: "✅ PDF procesado correctamente",
        timer: 2000,
      };
      RenderAlert(props);
    } catch (error) {
      setUploadStatus("error");
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const clearUploadedData = () => {
    setUploadedFileName("");
    setUploadStatus(null);
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) => {
        if (i === index) {
          if (field === null) {
            // For simple arrays like skills
            return value;
          } else {
            // For object arrays
            return { ...item, [field]: value };
          }
        }
        return item;
      }),
    }));
  };

  const addArrayItem = (section, template) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], template],
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange("photo", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const improveWithGrok = async (section, content, index = null) => {
    setIsGenerating(true);
    try {
      setTimeout(async () => {
        const improvedContent = await chatCompletion(content, "field");
        if (section === "summary") {
          handleInputChange("summary", improvedContent);
        } else if (section === "experience" && index !== null) {
          handleArrayChange(
            "experience",
            index,
            "description",
            improvedContent,
          );
        } else if (section === "project" && index !== null) {
          handleArrayChange("projects", index, "description", improvedContent);
        }

        setIsGenerating(false);
        const props = {
          icon: "success",
          title: "Contenido mejorado con IA de Grok",
          text: "El contenido ha sido mejorado con éxito",
          timer: 2000,
        };
        RenderAlert(props);
      }, 2000);
    } catch (error) {
      setIsGenerating(false);
      const props = {
        icon: "error",
        title: "❌ Error al conectar la solicitud",
        timer: 2000,
      };
      RenderAlert(props);
    }
  };

  const translateToEnglish = async () => {
    setIsGenerating(true);
    try {
      // Simulación de traducción con Grok API
      setTimeout(() => {
        setIsGenerating(false);
        const props = {
          icon: "success",
          title: "CV traducido al inglés",
          timer: 2000,
        };
        RenderAlert(props);
      }, 3000);
    } catch (error) {
      setIsGenerating(false);
      const props = {
        icon: "error",
        title: "❌ Error al traducir",
        timer: 2000,
      };
      RenderAlert(props);
    }
  };

  const downloadCV = async () => {
    try {
      const previewElement = document.getElementById("cv-preview");
      if (!previewElement) {
        const props = {
          icon: "error",
          title: "❌ Error: No se pudo encontrar la vista previa",
          timer: 2000,
        };
        RenderAlert(props);
        return;
      }

      // Crear canvas con configuración optimizada
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: previewElement.scrollWidth,
        height: previewElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      // PDF sin márgenes
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Dimensiones A4 completas
      const pageWidth = 210;
      const pageHeight = 297;

      // Calcular dimensiones proporcionales
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // Agregar imagen sin márgenes
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        imgWidth,
        Math.min(imgHeight, pageHeight),
      );

      const fileName = `CV_${formData.fullName || "MiCV"}.pdf`.replace(
        /\s+/g,
        "_",
      );
      pdf.save(fileName);
    } catch (error) {
      console.error("Error:", error);
      const props = {
        icon: "error",
        title: "❌ Error al generar PDF",
        timer: 2000,
      };
      RenderAlert(props);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Información Personal
        return (
          <div className="space-y-6">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Información Personal
            </h2>

            {/* Improved PDF Upload Section */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  {uploadStatus === "uploading" ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  ) : uploadStatus === "success" ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : uploadStatus === "error" ? (
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  ) : (
                    <Upload className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  Subir CV Existente
                </h3>
                {uploadStatus === "uploading" && (
                  <p className="mb-4 text-sm text-blue-600">
                    Procesando tu CV: {uploadedFileName}...
                  </p>
                )}
                {uploadStatus === "success" && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm text-green-600">
                      ✅ CV procesado exitosamente: {uploadedFileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Los datos han sido extraídos y poblados en el formulario
                    </p>
                  </div>
                )}

                {uploadStatus === "error" && (
                  <p className="mb-4 text-sm text-red-600">
                    ❌ Error al procesar el archivo. Intenta de nuevo.
                  </p>
                )}

                {!uploadStatus && (
                  <p className="mb-4 text-sm text-gray-600">
                    Sube tu CV actual y extraeremos automáticamente la
                    información para llenar los campos
                  </p>
                )}

                <div className="flex items-center justify-center space-x-4">
                  <label className="inline-flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">
                      {uploadStatus === "uploading"
                        ? "Procesando..."
                        : "Seleccionar PDF"}
                    </span>
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
                      onClick={clearUploadedData}
                      className="inline-flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                      <span>Limpiar</span>
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Formatos soportados: PDF (máx. 10MB)
                </p>
              </div>
            </div>
            {/* Upload de foto */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <label className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
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
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Título Profesional
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Desarrollador Full Stack"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+52 123 456 7890"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ciudad, País"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) =>
                    handleInputChange("linkedin", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/tu-perfil"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  GitHub
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => handleInputChange("github", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/tu-usuario"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Portafolio Web
                </label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) =>
                    handleInputChange("portfolio", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://tu-portafolio.com"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Resumen Profesional
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Resumen Profesional
              </h2>
              <button
                onClick={() => improveWithGrok("summary", formData.summary)}
                disabled={isGenerating}
                className="flex items-center space-x-2 rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
              >
                <Wand2 className="h-4 w-4" />
                <span>{isGenerating ? "Mejorando..." : "Mejorar con IA"}</span>
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Describe brevemente tu perfil profesional
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Profesional con X años de experiencia en..."
              />
            </div>
          </div>
        );

      case 2: // Experiencia Laboral
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Experiencia Laboral
              </h2>
              <button
                onClick={() =>
                  addArrayItem("experience", {
                    position: "",
                    company: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    current: false,
                    description: "",
                  })
                }
                className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Agregar Experiencia
              </button>
            </div>

            {formData.experience.map((exp, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border border-gray-300 p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">
                    Experiencia {index + 1}
                  </h3>
                  {formData.experience.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("experience", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Puesto
                    </label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "position",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "company",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "location",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Fecha Inicio
                    </label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "startDate",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) =>
                          handleArrayChange(
                            "experience",
                            index,
                            "current",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Trabajo actual
                      </span>
                    </label>
                    {!exp.current && (
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) =>
                          handleArrayChange(
                            "experience",
                            index,
                            "endDate",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Descripción
                    </h2>
                    <button
                      onClick={() =>
                        improveWithGrok("experience", exp.description)
                      }
                      disabled={isGenerating}
                      className="mb-2 flex items-center space-x-2 rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>
                        {isGenerating ? "Mejorando..." : "Mejorar con IA"}
                      </span>
                    </button>
                  </div>

                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleArrayChange(
                        "experience",
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe tus responsabilidades y logros..."
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 3: // Educación
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Educación</h2>
              <button
                onClick={() =>
                  addArrayItem("education", {
                    degree: "",
                    institution: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    gpa: "",
                  })
                }
                className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Agregar Educación
              </button>
            </div>

            {formData.education.map((edu, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border border-gray-300 p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">
                    Educación {index + 1}
                  </h3>
                  {formData.education.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("education", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Título/Grado
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        handleArrayChange(
                          "education",
                          index,
                          "degree",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Institución
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        handleArrayChange(
                          "education",
                          index,
                          "institution",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 4: // Habilidades
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Habilidades Técnicas
            </h2>

            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) =>
                    handleArrayChange("skills", index, null, e.target.value)
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: JavaScript, React, Node.js"
                />
                {formData.skills.length > 1 && (
                  <button
                    onClick={() => removeArrayItem("skills", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => addArrayItem("skills", "")}
              className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Agregar Habilidad
            </button>
          </div>
        );

      case 5: // Idiomas
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Idiomas</h2>
              <button
                onClick={() =>
                  addArrayItem("languages", { language: "", level: "Básico" })
                }
                className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Agregar Idioma
              </button>
            </div>

            {formData.languages.map((lang, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-300 p-4"
              >
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-semibold">Idioma {index + 1}</h3>
                  {formData.languages.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("languages", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Idioma
                    </label>
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) =>
                        handleArrayChange(
                          "languages",
                          index,
                          "language",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nivel
                    </label>
                    <select
                      value={lang.level}
                      onChange={(e) =>
                        handleArrayChange(
                          "languages",
                          index,
                          "level",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {languageLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 6: // Certificaciones
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Certificaciones
              </h2>
              <button
                onClick={() =>
                  addArrayItem("certifications", {
                    name: "",
                    issuer: "",
                    date: "",
                    url: "",
                  })
                }
                className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Agregar Certificación
              </button>
            </div>

            {formData.certifications.map((cert, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border border-gray-300 p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">
                    Certificación {index + 1}
                  </h3>
                  {formData.certifications.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("certifications", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nombre de la Certificación
                    </label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) =>
                        handleArrayChange(
                          "certifications",
                          index,
                          "name",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: AWS Solutions Architect"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Emisor
                    </label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) =>
                        handleArrayChange(
                          "certifications",
                          index,
                          "issuer",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Amazon Web Services"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Fecha de Obtención
                    </label>
                    <input
                      type="month"
                      value={cert.date}
                      onChange={(e) =>
                        handleArrayChange(
                          "certifications",
                          index,
                          "date",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      URL de Verificación
                    </label>
                    <input
                      type="url"
                      value={cert.url}
                      onChange={(e) =>
                        handleArrayChange(
                          "certifications",
                          index,
                          "url",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 7: // Proyectos
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Proyectos Destacados
              </h2>
              <button
                onClick={() =>
                  addArrayItem("projects", {
                    name: "",
                    description: "",
                    technologies: "",
                    url: "",
                    date: "",
                  })
                }
                className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Agregar Proyecto
              </button>
            </div>

            {formData.projects.map((project, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border border-gray-300 p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">
                    Proyecto {index + 1}
                  </h3>
                  {formData.projects.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("projects", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nombre del Proyecto
                    </label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) =>
                        handleArrayChange(
                          "projects",
                          index,
                          "name",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: E-commerce Platform"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Fecha de Finalización
                    </label>
                    <input
                      type="month"
                      value={project.date}
                      onChange={(e) =>
                        handleArrayChange(
                          "projects",
                          index,
                          "date",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Tecnologías Utilizadas
                    </label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) =>
                        handleArrayChange(
                          "projects",
                          index,
                          "technologies",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: React, Node.js, MongoDB, AWS"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      URL del Proyecto
                    </label>
                    <input
                      type="url"
                      value={project.url}
                      onChange={(e) =>
                        handleArrayChange(
                          "projects",
                          index,
                          "url",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Descripción del Proyecto
                    </h2>
                    <button
                      onClick={() =>
                        improveWithGrok("projects", project.description)
                      }
                      disabled={isGenerating}
                      className="mb-2 flex items-center space-x-2 rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>
                        {isGenerating ? "Mejorando..." : "Mejorar con IA"}
                      </span>
                    </button>
                  </div>
                  <textarea
                    value={project.description}
                    onChange={(e) =>
                      handleArrayChange(
                        "projects",
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe el proyecto, sus características principales y tu rol..."
                  />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Paso en desarrollo...</div>;
    }
  };

  const renderPreview = () => {
    const templateStyles = {
      modern: "bg-white shadow-xl",
      classic: "bg-gray-50 border-2 border-gray-300",
      creative: "bg-gradient-to-br from-purple-50 to-blue-50",
      minimal: "bg-white border border-gray-200",
      harvard: "bg-white border-l-4 border-l-red-600",
    };

    // Harvard Template Specific Rendering
    if (selectedTemplate === "harvard") {
      return (
        <div className="mx-auto max-w-4xl bg-white p-8">
          {/* Harvard Header - Traditional Academic Format */}
          <div className="mb-8 border-b-2 border-red-600 pb-6 text-center">
            <h1 className="mb-2 font-serif text-4xl font-bold text-gray-900">
              {formData.fullName || "YOUR NAME"}
            </h1>
            {formData.title && (
              <p className="mb-4 font-serif text-xl text-gray-700">
                {formData.title}
              </p>
            )}
            <div className="flex items-center justify-center space-x-6 font-serif text-sm text-gray-600">
              {formData.email && (
                <span className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{formData.email}</span>
                </span>
              )}
              {formData.phone && (
                <span className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{formData.phone}</span>
                </span>
              )}
              {formData.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{formData.location}</span>
                </span>
              )}
            </div>
            {(formData.linkedin || formData.github || formData.portfolio) && (
              <div className="mt-2 flex items-center justify-center space-x-4 font-serif text-sm text-blue-600">
                {formData.linkedin && (
                  <a href={formData.linkedin} className="hover:underline">
                    LinkedIn
                  </a>
                )}
                {formData.github && (
                  <a href={formData.github} className="hover:underline">
                    GitHub
                  </a>
                )}
                {formData.portfolio && (
                  <a href={formData.portfolio} className="hover:underline">
                    Portfolio
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Harvard Education Section - Prioritized */}
          {formData.education[0].degree && (
            <div className="mb-8">
              <h2 className="mb-4 border-b border-gray-300 pb-2 font-serif text-2xl font-bold text-red-600">
                EDUCATION
              </h2>
              {formData.education.map((edu, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="mb-1 flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-gray-900">
                        {edu.institution}
                      </h3>
                      <p className="font-serif italic text-gray-700">
                        {edu.degree}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-sm text-gray-600">
                        {edu.startDate} - {edu.endDate}
                      </span>
                      {edu.location && (
                        <p className="font-serif text-sm text-gray-600">
                          {edu.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {edu.gpa && (
                    <p className="mb-2 font-serif text-sm text-gray-700">
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Harvard Professional Experience */}
          {formData.experience[0].position && (
            <div className="mb-8">
              <h2 className="mb-4 border-b border-gray-300 pb-2 font-serif text-2xl font-bold text-red-600">
                PROFESSIONAL EXPERIENCE
              </h2>
              {formData.experience.map((exp, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-gray-900">
                        {exp.position}
                      </h3>
                      <p className="font-serif italic text-gray-700">
                        {exp.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-sm text-gray-600">
                        {exp.startDate} -{" "}
                        {exp.current ? "Present" : exp.endDate}
                      </span>
                      {exp.location && (
                        <p className="font-serif text-sm text-gray-600">
                          {exp.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="ml-4 font-serif text-sm leading-relaxed text-gray-800">
                      {exp.description.split("\n").map((line, i) => (
                        <p key={i} className="mb-1">
                          • {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Harvard Research & Projects */}
          {formData.projects[0].name && (
            <div className="mb-8">
              <h2 className="mb-4 border-b border-gray-300 pb-2 font-serif text-2xl font-bold text-red-600">
                RESEARCH & PROJECTS
              </h2>
              {formData.projects
                .filter((proj) => proj.name)
                .map((project, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="mb-1 flex items-start justify-between">
                      <h3 className="font-serif font-bold text-gray-900">
                        {project.name}
                      </h3>
                      <span className="font-serif text-sm text-gray-600">
                        {project.date}
                      </span>
                    </div>
                    {project.technologies && (
                      <p className="mb-1 font-serif text-sm italic text-gray-600">
                        Technologies: {project.technologies}
                      </p>
                    )}
                    {project.description && (
                      <p className="mb-2 ml-4 font-serif text-sm leading-relaxed text-gray-800">
                        {project.description}
                      </p>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 font-serif text-sm text-blue-600 hover:underline"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Harvard Skills & Competencies */}
          {formData.skills[0] && (
            <div className="mb-8">
              <h2 className="mb-4 border-b border-gray-300 pb-2 font-serif text-2xl font-bold text-red-600">
                TECHNICAL COMPETENCIES
              </h2>
              <div className="font-serif text-gray-800">
                {formData.skills.filter((skill) => skill).join(" • ")}
              </div>
            </div>
          )}

          {/* Harvard Languages */}
          {formData.languages[0].language && (
            <div className="mb-8">
              <h2 className="mb-4 border-b border-gray-300 pb-2 font-serif text-2xl font-bold text-red-600">
                LANGUAGES
              </h2>
              <div className="font-serif text-gray-800">
                {formData.languages
                  .filter((lang) => lang.language)
                  .map((lang, index) => (
                    <span key={index}>
                      {lang.language} ({lang.level})
                      {index <
                      formData.languages.filter((l) => l.language).length - 1
                        ? " • "
                        : ""}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Harvard Certifications */}
          {formData.certifications[0].name && (
            <div className="mb-8">
              <h2 className="mb-4 border-b border-gray-300 pb-2 font-serif text-2xl font-bold text-red-600">
                CERTIFICATIONS & CREDENTIALS
              </h2>
              {formData.certifications
                .filter((cert) => cert.name)
                .map((cert, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif font-semibold text-gray-900">
                          {cert.name}
                        </h3>
                        <p className="font-serif text-sm italic text-gray-700">
                          {cert.issuer}
                        </p>
                      </div>
                      <span className="font-serif text-sm text-gray-600">
                        {cert.date}
                      </span>
                    </div>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-serif text-sm text-blue-600 hover:underline"
                      >
                        Verify Credential →
                      </a>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Harvard Summary/Objective - At the end in Harvard style */}
          {formData.summary && (
            <div className="mb-8">
              <h2 className="mb-4 border-b border-gray-300 pb-2 font-serif text-2xl font-bold text-red-600">
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-justify font-serif leading-relaxed text-gray-800">
                {formData.summary}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Original templates
    return (
      <div
        className={`mx-auto max-w-4xl p-8 ${templateStyles[selectedTemplate]} rounded-lg`}
      >
        {/* Header */}
        <div className="mb-8 flex items-start space-x-6">
          {formData.photo && selectedTemplate !== "harvard" && (
            <img
              src={formData.photo}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
              {formData.fullName || "Tu Nombre"}
            </h1>
            <p className="mb-2 text-xl text-gray-600">
              {formData.title || "Tu Título Profesional"}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {formData.email && (
                <span className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{formData.email}</span>
                </span>
              )}
              {formData.phone && (
                <span className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{formData.phone}</span>
                </span>
              )}
              {formData.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{formData.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {formData.summary && (
          <div className="mb-8">
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-800">
              Resumen Profesional
            </h2>
            <p className="leading-relaxed text-gray-700">{formData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {formData.experience[0].position && (
          <div className="mb-8">
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-800">
              Experiencia Laboral
            </h2>
            {formData.experience.map((exp, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="mb-1 flex items-start justify-between">
                  <h3 className="font-semibold text-gray-800">
                    {exp.position}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {exp.startDate} - {exp.current ? "Presente" : exp.endDate}
                  </span>
                </div>
                <p className="mb-1 text-gray-600">
                  {exp.company} | {exp.location}
                </p>
                {exp.description && (
                  <p className="text-sm text-gray-700">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {formData.skills[0] && (
          <div className="mb-8">
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-800">
              Habilidades Técnicas
            </h2>
            <div className="flex flex-wrap gap-2">
              {formData.skills
                .filter((skill) => skill)
                .map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Education */}
        {formData.education[0].degree && (
          <div className="mb-8">
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-800">
              Educación
            </h2>
            {formData.education.map((edu, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="mb-1 flex items-start justify-between">
                  <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                  <span className="text-sm text-gray-600">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="mb-1 text-gray-600">{edu.institution}</p>
                {edu.gpa && (
                  <p className="text-sm text-gray-700">GPA: {edu.gpa}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {formData.certifications[0].name && (
          <div className="mb-8">
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-800">
              Certificaciones
            </h2>
            {formData.certifications
              .filter((cert) => cert.name)
              .map((cert, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="mb-1 flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800">{cert.name}</h3>
                    <span className="text-sm text-gray-600">{cert.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                </div>
              ))}
          </div>
        )}

        {/* Projects */}
        {formData.projects[0].name && (
          <div className="mb-8">
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-800">
              Proyectos Destacados
            </h2>
            {formData.projects
              .filter((proj) => proj.name)
              .map((project, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="mb-1 flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800">
                      {project.name}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {project.date}
                    </span>
                  </div>
                  {project.technologies && (
                    <p className="mb-1 text-sm text-blue-600">
                      Tecnologías: {project.technologies}
                    </p>
                  )}
                  {project.description && (
                    <p className="mb-2 text-sm text-gray-700">
                      {project.description}
                    </p>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Ver proyecto →
                    </a>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          {/* Preview Controls */}
          <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="flex items-center space-x-2 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  <span>← Volver a Editar</span>
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Plantilla:
                  </span>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="rounded border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={translateToEnglish}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  <Languages className="h-4 w-4" />
                  <span>
                    {isGenerating ? "Traduciendo..." : "Traducir a Inglés"}
                  </span>
                </button>

                <button
                  onClick={downloadCV}
                  className="flex items-center space-x-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* CV Preview */}
          <div id="cv-preview">{renderPreview()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Generador de Currículum
              </h1>
              <p className="mt-1 text-gray-600">
                Crea tu CV profesional paso a paso
              </p>
            </div>

            <button
              onClick={() => setPreviewMode(true)}
              className="flex items-center space-x-2 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
            >
              <Eye className="h-4 w-4" />
              <span>Vista Previa</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar - Steps */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Progreso
              </h2>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full rounded-lg p-3 text-left transition-colors ${
                      currentStep === index
                        ? "border border-blue-200 bg-blue-100 text-blue-800"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          currentStep === index
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                  <span>Progreso</span>
                  <span>
                    {Math.round(((currentStep + 1) / steps.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / steps.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white p-8 shadow-md">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between border-t border-gray-200 pt-6">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                <button
                  onClick={() =>
                    setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
                  }
                  disabled={currentStep === steps.length - 1}
                  className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVGenerator;
