import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Eye,
  FileDown,
  FileUp,
  Languages,
  Loader2,
  MoreHorizontal,
  Trash2,
  Undo2,
} from "lucide-react";
import { chatCompletion, downloadFile, extractTextFromPdf, resizePhoto } from "@/functions";
import { loadCV, saveCV } from "@/storage";
import { fieldErrors, parseCV } from "@/validation";
import { getTemplate, TEMPLATES } from "@/preview/registry";
import { labels } from "@/preview/shared";
import { EMPTY_ITEM, STEPS, stepHasError, type Item, type ListKey, type StepCtx } from "@/steps";
import { useConfirm, useNotice } from "@/ui";
import type { CVData, CVLang, TemplateId } from "@/types";

// ══════════════════════════════════════════════════════════════════
// Estado inicial
// ══════════════════════════════════════════════════════════════════

const INITIAL_DATA: CVData = {
  lang: "es",
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
  experience: [EMPTY_ITEM.experience],
  education: [EMPTY_ITEM.education],
  skills: [""],
  languages: [EMPTY_ITEM.languages],
  certifications: [EMPTY_ITEM.certifications],
  projects: [EMPTY_ITEM.projects],
};

const LANG_NAME: Record<CVLang, string> = { es: "español", en: "inglés" };
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

// ══════════════════════════════════════════════════════════════════
// Editor
// ══════════════════════════════════════════════════════════════════

export default function CvGenerator() {
  const [stepIndex, setStepIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false); // hoja a pantalla completa (móvil)
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [attempted, setAttempted] = useState(false); // ya intentó guardar el PDF
  const [beforeTranslate, setBeforeTranslate] = useState<CVData | null>(null);
  const [data, setData] = useState<CVData>(() => loadCV() ?? INITIAL_DATA);
  const { notify, view: noticeView } = useNotice();
  const { confirm, view: confirmView } = useConfirm();

  const step = STEPS[stepIndex];
  const errors = fieldErrors(data, attempted);
  const TemplateComp = getTemplate(template);

  // Toda edición pasa por aquí: tras editar ya no se ofrece deshacer la
  // traducción, porque volver atrás borraría lo que escribiste después.
  const edit = (fn: (prev: CVData) => CVData) => {
    setBeforeTranslate(null);
    setData(fn);
  };

  // Guarda en el navegador tras una pausa: con foto, el CV pesa y
  // escribirlo en cada tecla traba el formulario.
  useEffect(() => {
    const timer = setTimeout(() => saveCV(data), 400);
    return () => clearTimeout(timer);
  }, [data]);

  // ── Hoja viva ─────────────────────────────────────────────────
  // La hoja mide siempre 794 px (A4); se reduce entera con zoom para
  // caber en su columna, en vez de salirse.
  const fitRef = useRef<HTMLDivElement>(null);
  const sheetScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = fitRef.current;
    if (!box) return;
    const fit = () => {
      if (box.clientWidth)
        box.style.setProperty("--sheet-zoom", String(Math.min(1, box.clientWidth / 794)));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Marca en la hoja la sección que estás llenando.
  useEffect(() => {
    const sheet = document.getElementById("cv-preview");
    if (!sheet) return;
    sheet.querySelectorAll("[data-editing]").forEach((el) => el.removeAttribute("data-editing"));
    const title = step.section && labels(data.lang)[step.section].toLowerCase();
    const target = title
      ? [...sheet.querySelectorAll("h2")].find((h) => h.textContent?.trim().toLowerCase() === title)
          ?.parentElement
      : (sheet.querySelector("header") ?? sheet.querySelector("h1")?.parentElement);
    target?.setAttribute("data-editing", "");
  });

  // Al cambiar de paso, la hoja se desplaza hasta esa sección.
  useEffect(() => {
    const box = sheetScrollRef.current;
    const target = document.querySelector<HTMLElement>("#cv-preview [data-editing]");
    if (!box || !target) return;
    const top =
      target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 48;
    box.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [stepIndex, sheetOpen]);

  // Al cambiar de paso, el foco va al título del paso nuevo y el
  // formulario empieza arriba.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formScrollRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    formScrollRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
    document
      .querySelector('[aria-current="step"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [stepIndex]);

  // La hoja a pantalla completa se cierra con Esc, o sola si la ventana
  // crece hasta el ancho donde la hoja ya va al lado.
  useEffect(() => {
    if (!sheetOpen) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    const onWide = () => wide.matches && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [sheetOpen]);

  // ── Edición ───────────────────────────────────────────────────
  const ctx: StepCtx = {
    data,
    errors,
    busy,
    pdfBusy,
    set: (key, value) => edit((prev) => ({ ...prev, [key]: value })),
    patch: <K extends ListKey>(key: K, index: number, p: Partial<Item<K>>) =>
      edit((prev) => ({
        ...prev,
        [key]: (prev[key] as Item<K>[]).map((item, i) => (i === index ? { ...item, ...p } : item)),
      })),
    add: (key) => edit((prev) => ({ ...prev, [key]: [...prev[key], EMPTY_ITEM[key]] })),
    remove: (key, index) =>
      edit((prev) => ({ ...prev, [key]: (prev[key] as unknown[]).filter((_, i) => i !== index) })),
    improve: async (text, apply) => {
      if (!text.trim()) {
        notify("Escribe algo primero; la IA mejora lo que ya tienes.", "error");
        return;
      }
      setBusy(true);
      try {
        apply((await chatCompletion(text, "field")) as string);
        notify("Texto mejorado. Revísalo y ajusta lo que no suene a ti.");
      } catch (err) {
        notify((err as Error).message, "error");
      } finally {
        setBusy(false);
      }
    },
    importPdf: async (file) => {
      setPdfBusy(true);
      try {
        const text = await extractTextFromPdf(file);
        if (!text.trim())
          throw new Error("Ese PDF no tiene texto que se pueda leer (¿es un escaneo?).");
        const parsed = parseCV(await chatCompletion(text, "cv"));
        if (!parsed) throw new Error("La IA no devolvió un CV legible. Intenta de nuevo.");
        edit((prev) => mergeParsed(prev, parsed));
        notify(`Listo: llenamos los pasos con ${file.name}. Revisa cada uno.`);
      } catch (err) {
        notify((err as Error).message, "error");
      } finally {
        setPdfBusy(false);
      }
    },
    setPhoto: async (file) => {
      if (!file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES) {
        notify("Elige una imagen JPG o PNG de menos de 20 MB.", "error");
        return;
      }
      try {
        const photo = await resizePhoto(file);
        edit((prev) => ({ ...prev, photo }));
      } catch {
        notify("No se pudo abrir esa imagen. Prueba con JPG o PNG.", "error");
      }
    },
  };

  // ── Acciones del menú ─────────────────────────────────────────
  const resetAll = async () => {
    const ok = await confirm({
      title: "¿Borrar todo?",
      text: "Se borra lo que escribiste y la copia guardada en este navegador. No se puede deshacer.",
      confirm: "Borrar todo",
    });
    if (!ok) return;
    setData(INITIAL_DATA);
    setBeforeTranslate(null);
    setAttempted(false);
    setStepIndex(0);
  };

  const exportJson = () => {
    const slug = data.fullName.trim().toLowerCase().replace(/[^a-z0-9]+/gi, "-");
    downloadFile(`cv-${slug || "cvpro"}.json`, JSON.stringify(data, null, 2));
  };

  const importJson = async (file: File) => {
    let next: CVData | null = null;
    try {
      next = parseCV(JSON.parse(await file.text()));
    } catch {
      /* lo maneja el aviso de abajo */
    }
    if (!next) {
      notify("Ese archivo no es una copia de CVpro.", "error");
      return;
    }
    const ok = await confirm({
      title: "¿Reemplazar tu CV?",
      text: `Lo que tienes ahora se sustituye por el contenido de ${file.name}.`,
      confirm: "Reemplazar",
    });
    if (!ok) return;
    edit(() => next);
    setStepIndex(0);
    notify("Copia abierta.");
  };

  // ── Idioma y traducción ───────────────────────────────────────
  const translate = async () => {
    const { photo, lang, ...content } = data;
    setTranslating(true);
    try {
      const out = await chatCompletion(JSON.stringify(content), "translate", lang);
      if (!out || typeof out !== "object") throw new Error("La IA no devolvió un CV legible.");
      const next = parseCV({ ...data, ...out, photo, lang });
      if (!next) throw new Error("La IA no devolvió un CV legible.");
      setData(next);
      setBeforeTranslate(data);
      notify(`Textos traducidos al ${LANG_NAME[lang]}. Revisa que digan lo que quieres.`);
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setTranslating(false);
    }
  };

  const undoTranslate = () => {
    if (!beforeTranslate) return;
    setData(beforeTranslate);
    setBeforeTranslate(null);
    notify("Traducción deshecha.");
  };

  // ── PDF ───────────────────────────────────────────────────────
  // El PDF lo genera la impresión del navegador: así el texto es texto
  // de verdad (seleccionable y legible para un ATS), no una imagen.
  const savePdf = () => {
    const missing = fieldErrors(data, true);
    if (Object.keys(missing).length) {
      setAttempted(true);
      setSheetOpen(false);
      setStepIndex(Math.max(0, STEPS.findIndex((s) => stepHasError(s, missing))));
      notify("Antes de guardar, corrige los campos marcados.", "error");
      return;
    }
    // En móvil la hoja está oculta y no se puede medir: se abre antes de imprimir.
    if (!window.matchMedia("(min-width: 1024px)").matches) flushSync(() => setSheetOpen(true));
    window.print();
  };

  // Antes de imprimir (con el botón o con Ctrl+P): el navegador propone el
  // título de la página como nombre del archivo, y la hoja se estira a
  // páginas enteras para que los fondos de color lleguen al pie de la última.
  useEffect(() => {
    const pageTitle = document.title;
    const sheet = () => document.querySelector<HTMLElement>("#cv-preview > *");
    const before = () => {
      const el = sheet();
      if (!el) return;
      document.title = `CV_${data.fullName}_${template}`
        .replace(/[/\\?%*:|"<>]/g, "_")
        .replace(/\s+/g, "_");
      el.style.minHeight = "0";
      const pagePx = el.offsetWidth * (297 / 210);
      // -1 mm: un redondeo hacia arriba añadiría una hoja en blanco.
      el.style.minHeight = `${Math.ceil(el.scrollHeight / pagePx) * 297 - 1}mm`;
    };
    const after = () => {
      document.title = pageTitle;
      const el = sheet();
      if (el) el.style.minHeight = "";
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [data.fullName, template]);

  // ══════════════════════════════════════════════════════════════
  // Vista
  // ══════════════════════════════════════════════════════════════

  const isLast = stepIndex === STEPS.length - 1;
  const go = (i: number) => setStepIndex(Math.min(STEPS.length - 1, Math.max(0, i)));

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh print:block print:h-auto print:min-h-0">
      <a href="#contenido" className="skip-link meta !text-canvas">
        Saltar al formulario
      </a>

      {/* ── Cabecera ── */}
      <header inert={sheetOpen} className="shrink-0 border-b border-line print:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
          <p className="flex items-center gap-2.5">
            <span className="display text-[1.75rem]">CVpro</span>
            <a
              href="https://sackito.online"
              className="meta flex min-h-11 items-center gap-1.5 hover:text-accent-ink"
            >
              <img src="/sackito-64.png" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
              por Sackito
            </a>
          </p>
          <div className="flex items-center gap-2">
            <p className="meta mr-2 hidden lg:block">Se guarda solo en este navegador</p>
            <MoreMenu onExport={exportJson} onImport={importJson} onReset={resetAll} />
            <button type="button" onClick={savePdf} className="bracket bracket-solid">
              <Download className="h-4 w-4" aria-hidden />
              <span>
                <span className="hidden sm:inline">Guardar como </span>PDF
              </span>
            </button>
          </div>
        </div>

        <nav aria-label="Pasos del CV" className="border-t border-line">
          <ol className="flex overflow-x-auto px-2 [scrollbar-width:none] lg:px-4">
            {STEPS.map((s, i) => {
              const current = i === stepIndex;
              const hasError = attempted && stepHasError(s, errors);
              const done = s.done(data);
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={current ? "step" : undefined}
                    className={`relative flex min-h-12 items-center gap-2 px-3 text-sm transition-colors ${
                      current ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {hasError ? (
                      <AlertCircle className="h-4 w-4 text-accent-ink" aria-hidden />
                    ) : done ? (
                      <Check className="h-4 w-4" aria-hidden />
                    ) : (
                      <span className="meta w-4 text-center" aria-hidden>
                        {i + 1}
                      </span>
                    )}
                    {s.label}
                    <span className="sr-only">
                      {hasError ? " (revisar)" : done ? " (con datos)" : ""}
                    </span>
                    {current && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-accent" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      <div className="flex-1 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] print:block">
        {/* ── Formulario del paso ── */}
        <main id="contenido" ref={formScrollRef} inert={sheetOpen} className="blueprint lg:overflow-y-auto print:hidden">
          <div className="mx-auto max-w-2xl px-4 pb-32 pt-8 sm:pt-10 lg:px-10 lg:pb-12">
            <h1
              key={step.id}
              ref={headingRef}
              tabIndex={-1}
              className="display rise text-balance text-5xl outline-none sm:text-6xl"
            >
              {step.title}
            </h1>
            <p className="mt-4 max-w-prose text-muted">{step.hint}</p>
            <p className="meta mt-3 lg:hidden">Se guarda solo en este navegador</p>

            <div className="mt-8">
              <step.Form ctx={ctx} />
            </div>

            <div className="mt-12 hidden items-center justify-between border-t border-line pt-6 lg:flex">
              <button
                type="button"
                onClick={() => go(stepIndex - 1)}
                disabled={stepIndex === 0}
                className="bracket"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Anterior
              </button>
              {isLast ? (
                <button type="button" onClick={savePdf} className="bracket bracket-solid">
                  <Download className="h-4 w-4" aria-hidden />
                  Guardar como PDF
                </button>
              ) : (
                <button type="button" onClick={() => go(stepIndex + 1)} className="bracket bracket-solid">
                  {STEPS[stepIndex + 1].label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </main>

        {/* ── Hoja viva ── */}
        <section
          aria-label="Vista previa del CV"
          className={`flex-col bg-sunken print:!static print:!block print:bg-white ${
            sheetOpen
              ? "fixed inset-0 z-40 flex lg:static lg:z-auto"
              : "hidden lg:flex"
          } lg:min-h-0 lg:border-l lg:border-line`}
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2 print:hidden">
            {sheetOpen && (
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="bracket mr-auto lg:hidden"
                autoFocus
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Editar
              </button>
            )}
            <label htmlFor="plantilla" className="sr-only">
              Plantilla
            </label>
            <select
              id="plantilla"
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateId)}
              className="field !w-auto !py-1.5 text-sm"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <fieldset className="flex">
              <legend className="sr-only">Idioma del CV</legend>
              {(["es", "en"] as const).map((l) => (
                <label
                  key={l}
                  className="bracket !min-h-11 !px-3 has-[:checked]:!border-accent has-[:checked]:!bg-accent-soft has-[:checked]:!text-accent-ink [&+&]:-ml-px"
                >
                  <input
                    type="radio"
                    name="lang"
                    value={l}
                    checked={data.lang === l}
                    onChange={() => ctx.set("lang", l)}
                    className="sr-only"
                  />
                  <span aria-hidden>{l.toUpperCase()}</span>
                  <span className="sr-only">{LANG_NAME[l]}</span>
                </label>
              ))}
            </fieldset>

            {sheetOpen && (
              <button type="button" onClick={savePdf} className="bracket bracket-solid lg:hidden">
                <Download className="h-4 w-4" aria-hidden />
                PDF
              </button>
            )}
            {beforeTranslate ? (
              <button type="button" onClick={undoTranslate} className="bracket bracket-quiet !px-3">
                <Undo2 className="h-4 w-4" aria-hidden />
                Deshacer traducción
              </button>
            ) : (
              <button
                type="button"
                onClick={translate}
                disabled={translating}
                className="bracket bracket-quiet !px-3"
              >
                {translating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Languages className="h-4 w-4" aria-hidden />
                )}
                {translating ? "Traduciendo…" : `Traducir al ${LANG_NAME[data.lang]}`}
              </button>
            )}
          </div>

          <div
            ref={sheetScrollRef}
            tabIndex={0}
            className="blueprint min-h-0 flex-1 overflow-y-auto p-4 lg:p-6 print:overflow-visible print:bg-none print:p-0"
          >
            <div ref={fitRef}>
              <div id="cv-preview" lang={data.lang}>
                <TemplateComp data={data} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Barra inferior (móvil) ── */}
      <nav
        aria-label="Navegación entre pasos"
        inert={sheetOpen}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line-strong bg-canvas pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden"
      >
        <button
          type="button"
          onClick={() => go(stepIndex - 1)}
          disabled={stepIndex === 0}
          className="bracket !min-h-14 border-0"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Anterior
        </button>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="bracket !min-h-14 border-0 border-x !border-line"
        >
          <Eye className="h-4 w-4" aria-hidden />
          Ver hoja
        </button>
        {isLast ? (
          <button type="button" onClick={savePdf} className="bracket bracket-solid !min-h-14 border-0">
            <Download className="h-4 w-4" aria-hidden />
            PDF
          </button>
        ) : (
          <button
            type="button"
            onClick={() => go(stepIndex + 1)}
            className="bracket bracket-solid !min-h-14 border-0"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </nav>

      {noticeView}
      {confirmView}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Piezas
// ══════════════════════════════════════════════════════════════════

/** Lo que llegó del PDF manda; lo vacío conserva lo que ya había. */
function mergeParsed(prev: CVData, parsed: CVData): CVData {
  const pick = <T,>(list: T[], keep: T[], filled: (x: T) => unknown) =>
    list.some(filled) ? list : keep;
  return {
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
    experience: pick(parsed.experience, prev.experience, (e) => e.position || e.company),
    education: pick(parsed.education, prev.education, (e) => e.degree || e.institution),
    skills: pick(parsed.skills, prev.skills, (s) => s.trim()),
    languages: pick(parsed.languages, prev.languages, (l) => l.language),
    certifications: pick(parsed.certifications, prev.certifications, (c) => c.name),
    projects: pick(parsed.projects, prev.projects, (p) => p.name),
  };
}

function MoreMenu({
  onExport,
  onImport,
  onReset,
}: {
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => ref.current?.removeAttribute("open");

  // Un clic fuera del menú lo cierra.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const item =
    "flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 text-left text-sm hover:bg-accent-soft hover:text-accent-ink focus-visible:bg-accent-soft has-[:focus-visible]:bg-accent-soft";
  return (
    <details ref={ref} className="relative" onKeyDown={(e) => e.key === "Escape" && close()}>
      <summary className="bracket list-none !px-3 [&::-webkit-details-marker]:hidden">
        <MoreHorizontal className="h-4 w-4" aria-hidden />
        <span className="sr-only sm:not-sr-only">Más</span>
      </summary>
      <div className="absolute right-0 top-full z-40 mt-2 w-64 border border-line-strong bg-raised py-1 shadow-[var(--float-shadow)]">
        <button
          type="button"
          className={item}
          onClick={() => {
            close();
            onExport();
          }}
        >
          <FileDown className="h-4 w-4" aria-hidden />
          Descargar copia (.json)
        </button>
        <label className={item}>
          <FileUp className="h-4 w-4" aria-hidden />
          Abrir copia (.json)
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              close();
              if (file) onImport(file);
            }}
          />
        </label>
        <div className="my-1 border-t border-line" />
        <button
          type="button"
          className={item}
          onClick={() => {
            close();
            onReset();
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Borrar todo
        </button>
        <p className="meta border-t border-line px-4 pb-2 pt-3">
          Tu CV se guarda solo en este navegador. La copia .json sirve para pasarlo a otro equipo.
        </p>
      </div>
    </details>
  );
}
