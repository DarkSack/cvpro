import type { ComponentType } from "react";
import type { TemplateId, TemplateMeta, TemplateProps } from "@/types";
import ModernTemplate from "./ModernTemplate";
import ClassicTemplate from "./ClassicTemplate";
import CreativeTemplate from "./CreativeTemplate";
import MinimalTemplate from "./MinimalTemplate";
import HarvardTemplate from "./HarvardTemplate";
import AtsTemplate from "./AtsTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "modern",
    name: "Moderno",
    description: "Diseño limpio con acentos azules, foto redonda y chips de skills.",
    atsOptimized: false,
  },
  {
    id: "classic",
    name: "Clásico",
    description: "Estilo tradicional serif centrado, ideal para roles conservadores.",
    atsOptimized: false,
  },
  {
    id: "creative",
    name: "Creativo",
    description: "Sidebar con gradiente y contenido a la derecha. Para roles creativos.",
    atsOptimized: false,
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Sin adornos, mucho whitespace, tipografía ligera.",
    atsOptimized: false,
  },
  {
    id: "harvard",
    name: "Harvard",
    description: "Formato académico tradicional con acento rojo.",
    atsOptimized: false,
  },
  {
    id: "ats",
    name: "ATS-Optimizado",
    description:
      "Diseñado para pasar Applicant Tracking Systems: 1 columna, sin gráficos, fuentes seguras.",
    atsOptimized: true,
  },
  {
    id: "executive",
    name: "Ejecutivo",
    description: "Sobrio, serif elegante, para roles senior/director.",
    atsOptimized: false,
  },
];

const REGISTRY: Record<TemplateId, ComponentType<TemplateProps>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  harvard: HarvardTemplate,
  ats: AtsTemplate,
  executive: ExecutiveTemplate,
};

export function getTemplate(id: TemplateId): ComponentType<TemplateProps> {
  return REGISTRY[id] ?? ModernTemplate;
}
