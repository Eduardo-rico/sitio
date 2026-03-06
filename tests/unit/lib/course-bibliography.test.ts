import { describe, expect, it } from "vitest";
import { getCourseBibliography } from "@/lib/course-bibliography";

describe("course-bibliography", () => {
  it("retorna bibliografia especifica para cursos de Python especializados", () => {
    const dataScienceRefs = getCourseBibliography("python-analisis-datos", "python");
    const businessRefs = getCourseBibliography("python-analisis-negocio", "python");
    const forecastRefs = getCourseBibliography("python-forecasting-ab-testing", "python");

    expect(dataScienceRefs.length).toBeGreaterThanOrEqual(3);
    expect(dataScienceRefs.some((ref) => /pandas/i.test(ref.title))).toBe(true);
    expect(dataScienceRefs.some((ref) => /matplotlib/i.test(ref.title))).toBe(true);

    expect(businessRefs.length).toBeGreaterThanOrEqual(3);
    expect(businessRefs.some((ref) => /negocio|kpi|decision|analytics|data/i.test(ref.note))).toBe(
      true
    );

    expect(forecastRefs.length).toBeGreaterThanOrEqual(4);
    expect(
      forecastRefs.some((ref) => /forecasting: principles and practice|time series/i.test(ref.title))
    ).toBe(true);
    expect(
      forecastRefs.some((ref) => /controlled experiments|cuped|experimenters/i.test(ref.title))
    ).toBe(true);
  });

  it("usa fallback por lenguaje cuando no hay bibliografia especifica por slug", () => {
    const refs = getCourseBibliography("clojure-desde-cero", "clojure");

    expect(refs.length).toBeGreaterThan(0);
    expect(refs.some((ref) => /clojure/i.test(ref.title))).toBe(true);
  });

  it("expone bibliografia especializada para la ruta avanzada de clojure", () => {
    const intermediateRefs = getCourseBibliography("clojure-intermedio", "clojure");
    const dataRefs = getCourseBibliography("clojure-datos-y-transformacion", "clojure");
    const architectureRefs = getCourseBibliography(
      "clojure-macros-estado-y-arquitectura",
      "clojure"
    );
    const specRefs = getCourseBibliography("clojure-spec-testing-y-tooling", "clojure");

    expect(intermediateRefs.some((ref) => /joy of clojure|sequences/i.test(ref.title))).toBe(true);
    expect(dataRefs.some((ref) => /threading macros|data structures/i.test(ref.title))).toBe(true);
    expect(
      architectureRefs.some((ref) => /atoms|macros|elements of clojure/i.test(ref.title))
    ).toBe(true);
    expect(specRefs.some((ref) => /spec|clojure\.test|repl/i.test(ref.title))).toBe(true);
  });

  it("retorna arreglo vacio cuando no existe slug ni lenguaje soportado", () => {
    const refs = getCourseBibliography("curso-inexistente", "desconocido" as never);

    expect(refs).toEqual([]);
  });
});
