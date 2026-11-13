import { test } from "node:test";
import assert from "node:assert/strict";
import { fmtMonth, formatRange, levelLabel, lines, labels } from "../src/preview/shared.ts";

test("un mes AAAA-MM se escribe en el idioma del CV", () => {
  assert.equal(fmtMonth("2022-03", "es"), "mar 2022");
  assert.equal(fmtMonth("2022-03", "en"), "Mar 2022");
});

test("un texto que no es AAAA-MM se deja tal cual", () => {
  assert.equal(fmtMonth("Primavera 2020", "es"), "Primavera 2020");
  assert.equal(fmtMonth("", "es"), "");
});

test("un puesto actual termina en Presente o Present según el idioma", () => {
  assert.equal(formatRange("2021-03", "", true, "es"), "mar 2021 — Presente");
  assert.equal(formatRange("2021-03", "", true, "en"), "Mar 2021 — Present");
});

test("un rango sin inicio muestra solo el fin", () => {
  assert.equal(formatRange("", "2020-01", false, "es"), "ene 2020");
});

test("el nivel de idioma se traduce al inglés", () => {
  assert.equal(levelLabel("Avanzado", "en"), "Advanced");
  assert.equal(levelLabel("Nativo", "en"), "Native");
  assert.equal(levelLabel("Básico", "es"), "Básico");
});

test("una descripción se parte en líneas sin vacías ni espacios sobrantes", () => {
  assert.deepEqual(lines("Dirijo 15 agentes.  \n\n  Subí la calidad.\n"), [
    "Dirijo 15 agentes.",
    "Subí la calidad.",
  ]);
  assert.deepEqual(lines(""), []);
});

test("los títulos de sección cambian con el idioma", () => {
  assert.equal(labels("es").experience, "Experiencia");
  assert.equal(labels("en").experience, "Experience");
});
