---
name: CVpro
description: Editor de CV paso a paso con la hoja A4 viva al lado, en el mundo Sackito.
colors:
  canvas: "#080a0d"
  raised: "#0d1015"
  sunken: "#05070a"
  ink: "#f2f3f5"
  muted: "#8b929d"
  line: "rgb(242 243 245 / 0.09)"
  line-strong: "rgb(242 243 245 / 0.2)"
  grid-line: "rgb(242 243 245 / 0.035)"
  accent: "#e0506a"
  accent-ink: "#ff8196"
  accent-soft: "rgb(224 80 106 / 0.12)"
  canvas-light: "#f3f2ee"
  raised-light: "#fbfaf7"
  sunken-light: "#e9e7e1"
  ink-light: "#0b0d10"
  muted-light: "#555b64"
  line-light: "rgb(11 13 16 / 0.1)"
  line-strong-light: "rgb(11 13 16 / 0.24)"
  grid-line-light: "rgb(11 13 16 / 0.04)"
  accent-light: "#b52a42"
  accent-ink-light: "#9c1f35"
  accent-soft-light: "rgb(181 42 66 / 0.09)"
  sheet-paper: "#ffffff"
typography:
  display:
    fontFamily: "Archivo Variable, ui-sans-serif, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 72"
  headline:
    fontFamily: "Archivo Variable, ui-sans-serif, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 72"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  label:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.08em"
  meta:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.06em"
    fontFeature: "'tnum'"
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  grid: "32px"
components:
  button-bracket:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5em 1.1em"
    height: "44px"
  button-bracket-hover:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
  button-bracket-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5em 1.1em"
    height: "44px"
  button-bracket-solid-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
  field:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.6rem 0.75rem"
    height: "44px"
  step-tab:
    textColor: "{colors.muted}"
    typography: "{typography.title}"
    padding: "0 12px"
    height: "48px"
  step-tab-current:
    textColor: "{colors.ink}"
  toggle-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.none}"
    height: "44px"
---

# Design System: CVpro

## Overview

**Creative North Star: "El cuaderno de ingeniería con la hoja encima"**

CVpro vive en el mundo Sackito, el mismo de sackito.online: un cuaderno de ingeniería digital. En oscuro, fondo casi negro con una retícula técnica apenas visible; en claro, papel cálido. Sobre ese plano todo es recto y lineal: bordes de 1px, cero radios y un solo acento rubí que marca dónde estás. La única superficie clara en modo oscuro es la hoja A4 blanca, y por eso manda la vista.

La densidad es de herramienta, no de folleto. Títulos de paso enormes en Archivo condensada y mayúsculas, lectura en Geist, y todo dato de máquina (paso, estado, guardado, etiquetas de botón) en Geist Mono en mayúsculas espaciadas. El gesto propio del sistema es el marco rubí «[ EDITANDO ]» que señala sobre la hoja la sección que se está llenando.

El tema sigue `prefers-color-scheme`; no hay selector manual. Se rechaza el asistente genérico de tarjetas blancas redondeadas con barra de progreso azul.

**Key Characteristics:**
- Un solo acento (rubí) para estado actual, foco, error y hover; nada más lleva color.
- Esquinas rectas en todo el cromo de la app.
- Profundidad por tono (canvas, raised, sunken) y líneas, no por sombras; la sombra es de la hoja y de lo que flota.
- Mono en mayúsculas para datos y botones; Archivo condensada solo para títulos.
- La hoja es otro mundo: papel blanco con la tipografía de su plantilla.

## Colors

Neutros fríos casi negros (o papel cálido en claro) con un único rubí.

### Primary
- **Rubí Sackito** (accent / accent-light): subrayado del paso actual, borde de foco, borde de campo inválido, fondo del botón sólido en hover, marco «[ EDITANDO ]» sobre la hoja, `::selection` y caret.
- **Rubí tinta** (accent-ink / accent-ink-light): el rubí cuando es texto o icono: mensajes de error, icono de paso con error, texto de botón en hover, idioma activo. Más claro en oscuro y más profundo en claro para que se lea.
- **Velo rubí** (accent-soft / accent-soft-light): fondo tenue de botón en hover, idioma activo y elementos de menú en hover.

### Neutral
- **Negro de cuaderno** (canvas / canvas-light): fondo de la app y de la barra inferior móvil.
- **Superficie elevada** (raised / raised-light): campos, menú «Más», diálogo y avisos.
- **Fondo hundido** (sunken / sunken-light): columna de la hoja; hace que el papel resalte.
- **Tinta** (ink / ink-light): texto principal y fondo del botón sólido en reposo.
- **Gris de nota** (muted / muted-light): textos de ayuda, pasos no actuales, `.meta`, placeholders.
- **Línea** (line / line-light): divisores de cabecera, columnas y pie del formulario.
- **Línea fuerte** (line-strong / line-strong-light): bordes de botón, campo, menú, diálogo y entradas de lista.
- **Retícula** (grid-line / grid-line-light): solo la retícula `.blueprint` de 2rem.
- **Papel** (sheet-paper): la hoja A4. Blanca en ambos temas.

### Named Rules
**The One Ruby Rule.** El rubí es el único color de la app. Marca lo actual, lo enfocado o lo que falla; nunca decora.

**The Tinta-para-texto Rule.** Si el rubí es texto o icono, usa accent-ink, no accent. accent queda para bordes, rellenos y subrayados.

## Typography

**Display Font:** Archivo Variable al 72 % de ancho (`font-stretch: 72%`, eje wdth), autoalojada con @fontsource-variable
**Body Font:** Geist Variable (con ui-sans-serif, system-ui)
**Label/Mono Font:** Geist Mono Variable (con ui-monospace)

**Character:** Archivo condensada y negra grita el paso como un rótulo técnico; Geist lee tranquila; Geist Mono etiqueta como un instrumento. Geist y Geist Mono son la familia fijada de Sackito (excepción registrada en `.impeccable/config.json`).

### Hierarchy
- **Display** (800, 3rem en móvil y 3.75rem desde 640px, interlineado 0.86, mayúsculas, -0.02em): título de cada paso. Entra con el único momento animado (`.rise`). La marca CVpro usa la misma clase a 1.75rem.
- **Headline** (800, 1.875rem, misma clase `.display`): título del diálogo de confirmación.
- **Body** (400, 1rem, 1.5): texto de ayuda del paso (con `max-width: 65ch`) y contenido de campos.
- **Title** (500, 0.875rem): etiquetas de campo y nombres de paso en la navegación.
- **Label** (mono, 0.75rem, 0.08em, mayúsculas): texto de todos los botones `.bracket`.
- **Meta** (mono, 0.6875rem, 0.06em, mayúsculas, cifras tabulares, color muted): firma «por Sackito» (con el avatar de Sack a 22px, `public/sackito-64.png`, que también es el favicon), número de paso, «Se guarda solo en este navegador», leyenda de cada entrada («Puesto 1»), «Hasta hoy».

### Named Rules
**The Mono-es-dato Rule.** Geist Mono solo lleva datos de estado y acciones. Nunca va en párrafos ni en títulos.

**The Display-es-paso Rule.** Archivo condensada aparece solo en la marca, el título del paso y el título del diálogo.

## Layout

Escritorio (desde 1024px): cabecera de 56px más una fila de pasos de 48px. Debajo, una cuadrícula de dos columnas `3fr / 2fr`: el formulario a la izquierda y la hoja viva a la derecha. Cada columna tiene su propio scroll y la app ocupa `100dvh`. El formulario tiene un ancho máximo de 42rem, padding lateral de 40px y navegación Anterior / Siguiente al pie.

Móvil (menos de 1024px): el paso ocupa todo el ancho, con padding lateral de 16px. Una barra inferior fija de tres celdas (Anterior / Ver hoja / Siguiente) mide 56px y respeta `safe-area-inset-bottom`. «Ver hoja» abre la hoja a pantalla completa. La fila de pasos se desplaza en horizontal sin barra visible.

La hoja siempre mide 794px (A4) y se reduce entera con `zoom` (`--sheet-zoom`) para caber en su columna. Al imprimir mide 210mm, sin margen de página.

El ritmo usa la escala de Tailwind: 8px entre controles, 16px entre campos, 24px de padding en diálogos, 32px antes del formulario y 48px antes del pie. Los campos van en una o dos columnas (dos desde 768px).

La retícula `.blueprint` (celdas de 2rem) va en la columna del formulario y detrás de la hoja.

## Elevation & Depth

La app es plana: la profundidad viene del tono (sunken, canvas y raised) y de las líneas. Solo llevan sombra las cosas que flotan sobre el plano: la hoja, el menú, el aviso y el diálogo.

### Shadow Vocabulary
- **Sombra de hoja** (`--sheet-shadow`, cambia con el tema): separa el papel de la columna hundida. Se quita al imprimir.
- **Flotante** (`--float-shadow`, cambia con el tema: negro al 65 % en oscuro, tinta al 28 % en claro): aviso, menú «Más» y diálogo.
- **Velo del diálogo** (`--backdrop`, cambia con el tema): oscurece la pantalla detrás del diálogo.

### Named Rules
**The Plano-por-defecto Rule.** Botones, campos y entradas no llevan sombra. La sombra es para el papel y para lo que tapa la pantalla.

## Shapes

Todo es recto: radio 0 en botones, campos, menús, diálogo, avisos, recuadro de foto y zona de subida. Los bordes son de 1px. La línea discontinua marca solo zonas para soltar o añadir algo («Llenar desde un CV en PDF», «Agregar …»). El select dibuja su flecha con dos gradientes, sin icono. Los iconos son Lucide de trazo lineal de 16px (14px dentro de los botones quietos).

**The Sin-radios Rule.** Ningún elemento del cromo de la app se redondea. La regla no alcanza la hoja: las plantillas tienen su propia forma.

## Components

### Buttons
Botón de texto con borde recto, siempre en mono y mayúsculas: «[ GUARDAR COMO PDF ]» sin corchetes dibujados.
- **Shape:** recto (0px), borde de 1px line-strong y altura mínima de 44px.
- **Primary (`bracket-solid`):** relleno de tinta con texto canvas. En hover y foco pasa a relleno rubí. Hay uno por zona: Guardar como PDF, Siguiente y confirmar.
- **Default (`bracket`):** borde line-strong y texto ink. En hover y foco toma borde rubí, texto accent-ink y velo rubí.
- **Quiet (`bracket-quiet`):** sin borde visible en reposo y con el mismo hover. Sirve para acciones secundarias en línea (Mejorar con IA, Quitar, Traducir).
- **Disabled:** opacidad 0.45, sin hover y cursor `not-allowed`.
- **Barra móvil:** botones de 56px sin borde, separados por líneas.

### Inputs / Fields
- **Style:** fondo raised, borde line-strong de 1px, recto, 44px de alto mínimo y texto de 1rem. El select es nativo, sin apariencia y con flecha dibujada.
- **Hover:** el borde pasa a muted.
- **Focus:** borde rubí más un anillo interior de 1px rubí. No lleva outline exterior.
- **Error:** borde rubí con `aria-invalid`, más un mensaje en accent-ink con icono de alerta debajo.
- **Mes:** donde no hay selector de mes, el placeholder `2024-03` y un `pattern` guían el formato.

### Navigation
- **Fila de pasos:** número en meta (o check si tiene datos, o alerta en accent-ink si falla) seguido del nombre del paso en Title. Los pasos no actuales van en muted. El actual va en ink con un subrayado rubí de 2px. Se marca con `aria-current="step"`.
- **Menú «Más»:** `details` con panel raised, borde line-strong y sombra flotante. Elementos de 44px con hover en velo rubí. Al pie lleva una nota en meta.

### Chips (selector de idioma)
- **Style:** dos `bracket` pegados (ES / EN) sobre radios ocultos.
- **State:** el activo lleva borde rubí, velo rubí y texto accent-ink.

### Cards / Containers
- **Entrada de lista:** fieldset sin caja, con línea superior line-strong. La leyenda va en meta tinta y «Quitar» va como botón quieto.
- **Diálogo:** `dialog` nativo raised, con borde line-strong, título display, texto muted y botones Cancelar / confirmar alineados a la derecha.
- **Aviso:** uno a la vez, raised, recto y abajo al centro. Su borde es rubí si es error. Se anuncia con `aria-live`.

### Marco «[ EDITANDO ]» (signature)
La sección de la hoja que corresponde al paso actual lleva un outline rubí de 2px, separado 6px. Encima lleva la etiqueta «[ EDITANDO ]» en mono 600 de 11px sobre fondo rubí, con el color de fondo de la app como texto (`var(--bg)`: 5.3:1 en oscuro, 5.9:1 en claro; el blanco no llegaba a 4.5:1). Ambos se dividen entre `--sheet-zoom`, así que en pantalla miden lo mismo a cualquier escala. Al cambiar de paso, la hoja se desplaza hasta esa sección. En impresión desaparecen.

### La hoja
`#cv-preview`: papel blanco A4 con la tipografía y la paleta de su plantilla (7 plantillas en `src/preview/`). No forma parte de este sistema y no hereda sus tokens. La app solo le aporta el ancho, el zoom, la sombra, el marco de edición y las reglas de impresión.

### Movimiento
Hay un solo momento animado: el título del paso entra con `rise` (0.5s, `cubic-bezier(0.16, 1, 0.3, 1)`, subida de 0.35em con desenfoque de 4px). El resto son transiciones de color de 0.2s. `prefers-reduced-motion` las anula todas.

## Do's and Don'ts

### Do:
- **Do** usar `bracket` / `bracket-solid` / `bracket-quiet` para toda acción, con 44px mínimos de alto.
- **Do** usar accent-ink para el rubí como texto o icono, y accent para bordes, subrayados y rellenos.
- **Do** poner en `.meta` los datos de estado (paso, guardado, número de entrada) y nada más.
- **Do** mantener la profundidad por tono: sunken detrás de la hoja, raised para campos y flotantes.
- **Do** dividir entre `--sheet-zoom` cualquier marca que la app dibuje sobre la hoja.
- **Do** ocultar en `@media print` todo lo que no sea `#cv-preview`.

### Don't:
- **Don't** redondear nada del cromo de la app (radio 0px).
- **Don't** introducir un segundo color de acento ni degradados de color.
- **Don't** aplicar los tokens de la app a las plantillas de la hoja, ni las de la hoja a la app.
- **Don't** añadir sombras a botones, campos o entradas.
- **Don't** animar nada más que la entrada del título del paso.

## Imagen para compartir

`public/og.png` (1200×630): fondo canvas con retícula, barra rubí al pie, CVPRO en display, lema en Geist, datos en mono y una captura real de la hoja con el marco «[ EDITANDO ]». La URL absoluta sale de `SITE_URL` o de `VERCEL_PROJECT_PRODUCTION_URL` (plugin `siteUrl` en `vite.config.ts`). Las tres imágenes de `public/` llevan su procedencia grabada (`impeccable embed-prompt`).
