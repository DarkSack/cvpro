# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Principal:** personas de México y Latinoamérica que buscan empleo y necesitan un CV presentable. Lo usan por igual desde el teléfono y desde una computadora (confirmado por Sack, 2026-11-13). No se asume soltura técnica: el lenguaje es llano.
- **Secundario:** reclutadores y clientes que llegan desde el portafolio de Sack y juzgan su oficio como desarrollador por cómo está hecha la herramienta.

## Product Purpose

CVpro es una herramienta web gratuita para armar un currículum paso a paso, pulir la redacción con IA y guardarlo como PDF. Existe por dos razones confirmadas: ser útil de verdad a quien busca trabajo, y ser pieza de portafolio de Sack.

Éxito: alguien entra, termina su CV y se lleva el PDF. Y quien la mira como muestra de trabajo ve cuidado en dos minutos.

## Positioning

- El PDF lleva texto real (seleccionable, legible para un ATS), no una imagen.
- Sin cuentas ni registro: el CV se guarda solo en el navegador de quien lo escribe.
- La IA reescribe lo que la persona escribió; no inventa cifras, empresas ni logros.

## Operating Context

- Flujo: datos personales → resumen → experiencia → educación → habilidades → idiomas → certificaciones → proyectos → vista previa → guardar como PDF.
- Atajo: subir un CV en PDF existente; la IA reparte su texto en los campos.
- El PDF sale por el diálogo de impresión del navegador (destino «Guardar como PDF»).

## Capabilities and Constraints

- 7 plantillas: Moderno, Clásico, Creativo, Minimalista, Harvard, ATS-Optimizado, Ejecutivo. Las plantillas son el producto que la persona se lleva: su aspecto es independiente del de la aplicación.
- IA: Groq desde una función serverless; cuota limitada (5 peticiones por minuto y 30 por día por IP, 300 por día en total). Sin clave configurada, todo lo demás funciona.
- Importar PDF solo lee PDF con texto, no escaneos.
- Interfaz en español. El CV puede escribirse en español o inglés.
- Stack: React 19 + Vite + TypeScript + Tailwind 3, desplegable en Vercel.
- Sin decidir: dominio propio, analítica, monetización (hoy no hay ninguna).

## Brand Commitments

- Nombre: **CVpro**.
- Familia Sackito (confirmado por Sack, 2026-11-13): debe sentirse parte de sus sitios (sackito.online). El sistema visual de referencia vive en `E:\Dev\sackglobal\src\app\globals.css` («digital engineering notebook»). Firma de Sack visible.
- Recurso de marca: avatar de Sack en `E:\Dev\sackglobal\public\logo.png`.
- Voz: directa, en español de México, sin tecnicismos ni promesas infladas.

## Evidence on Hand

- La aplicación funcionando y sus 7 plantillas con datos de ejemplo.
- No hay testimonios, cifras de uso, clientes ni reseñas. No inventarlos.

## Product Principles

1. Terminar gana: cada pantalla acerca a tener el PDF en la mano.
2. Lo que ves es lo que se imprime.
3. La IA ayuda a decir mejor lo cierto, nunca a decir de más.
4. Los datos de la persona son suyos: no salen del navegador salvo el texto que manda a pulir.
5. Igual de usable con el pulgar que con teclado.

## Accessibility & Inclusion

WCAG 2.2 nivel AA como meta de la aplicación (decisión de Claude a partir de la auditoría de accesibilidad que pidió Sack; no es un requisito legal confirmado). Respeta `prefers-reduced-motion`.
