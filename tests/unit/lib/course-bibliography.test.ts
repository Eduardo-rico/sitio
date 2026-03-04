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
});
