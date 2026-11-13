---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/CvGenerator.tsx"]
---

## Scope

Pantalla principal de CVpro (editor + hoja viva + vista completa para imprimir). Modo: Operate. Usuarios por igual en móvil y escritorio.

## Direction contract

THESIS: un paso a la vez, con la hoja A4 viva al lado; la sección que editas se marca sobre la hoja. Rechaza el asistente genérico de tarjetas blancas con barra de progreso azul.

OWN-WORLD: mundo Sackito («digital engineering notebook»): fondo casi negro #080a0d con retícula técnica tenue, texto #f2f3f5, un solo acento rubí #e0506a; en claro, papel cálido #f3f2ee con rubí #b52a42. Archivo condensada en mayúsculas para títulos, Geist para leer, Geist Mono para todo dato (paso, estado, guardado). Botones de texto con borde recto, sin radios. La hoja es papel blanco con sombra suave: lo único claro en modo oscuro.

STORY: la persona entiende que llena 8 pasos cortos, ve su CV formarse mientras escribe, confía en que se guarda solo en su navegador y termina con «Guardar como PDF».

FIRST VIEWPORT: cabecera con CVPRO (firma «por Sackito») a la izquierda y Más / Guardar como PDF a la derecha; debajo, fila de 8 pasos con estado (hecho, actual, vacío) y subrayado rubí en el actual. Escritorio: formulario del paso a la izquierda (60 %), título del paso en Archivo grande; hoja A4 viva a la derecha (40 %) con selector de plantilla e idioma encima. Móvil: el paso ocupa todo; barra inferior fija con Anterior / Ver hoja / Siguiente.

FORM: estructura «Un paso a la vez + hoja», primera de mi lista ordenada y elegida por el usuario. seed:f9267134ddf99a61. Gesto propio: la sección en edición se enmarca en rubí sobre la hoja con la etiqueta «[ EDITANDO ]».

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

Ninguna decisión abierta de producto. Tema claro sigue `prefers-color-scheme` como en sackito.online.
