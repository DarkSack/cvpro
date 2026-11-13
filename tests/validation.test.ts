import { test } from "node:test";
import assert from "node:assert/strict";
import { fieldErrors, parseCV } from "../src/validation.ts";

const EMPTY = parseCV({})!;

test("un CV vacío no tiene errores mientras se edita", () => {
  assert.deepEqual(fieldErrors(EMPTY), {});
});

test("marca el campo con formato inválido por su ruta", () => {
  const cv = {
    ...EMPTY,
    email: "ana@",
    linkedin: "linkedin.com/in/ana",
    certifications: [{ name: "AWS", issuer: "", date: "", url: "aws.com" }],
  };

  assert.deepEqual(Object.keys(fieldErrors(cv)).sort(), [
    "certifications.0.url",
    "email",
    "linkedin",
  ]);
});

test("una experiencia que termina antes de empezar marca la fecha de fin", () => {
  const cv = {
    ...EMPTY,
    experience: [
      {
        position: "Analista",
        company: "",
        location: "",
        startDate: "2022-05",
        endDate: "2021-01",
        current: false,
        description: "",
      },
    ],
  };

  assert.ok(fieldErrors(cv)["experience.0.endDate"]);
});

test("para guardar el PDF pide nombre y un medio de contacto", () => {
  const errors = fieldErrors(EMPTY, true);

  assert.ok(errors.fullName);
  assert.ok(errors.email);
});

test("con nombre y teléfono el CV se puede guardar", () => {
  assert.deepEqual(fieldErrors({ ...EMPTY, fullName: "Ana Ruiz", phone: "+52 33 1234 5678" }, true), {});
});
