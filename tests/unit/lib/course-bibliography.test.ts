import { describe, expect, it } from "vitest";
import {
  getCourseBibliography,
  type CourseBibliographyItem,
} from "@/lib/course-bibliography";
import { COURSE_LANGUAGES, type CourseLanguage } from "@/lib/course-runtime";

describe("course-bibliography", () => {
  describe("getCourseBibliography", () => {
    it("retorna bibliografia especifica cuando existe el slug", () => {
      const result = getCourseBibliography("python-analisis-datos", "python");

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((ref) => ref.title.includes("pandas"))).toBe(true);
    });

    it("retorna bibliografia base del lenguaje cuando no existe especifica", () => {
      const result = getCourseBibliography("curso-inexistente", "python");

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((ref) => ref.title.includes("Python"))).toBe(true);
    });

    it("retorna array vacio para lenguajes no soportados", () => {
      const result = getCourseBibliography(
        "curso-inexistente",
        "lenguaje-invalido" as CourseLanguage
      );

      expect(result).toEqual([]);
    });

    it("retorna array vacio cuando no existe slug ni lenguaje soportado", () => {
      const result = getCourseBibliography(
        "curso-inexistente",
        "desconocido" as CourseLanguage
      );

      expect(result).toEqual([]);
    });

    it("las estructuras tienen title, url y note", () => {
      const result = getCourseBibliography("python-basico", "python");

      expect(result.length).toBeGreaterThan(0);
      for (const item of result) {
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("url");
        expect(item).toHaveProperty("note");
        expect(typeof item.title).toBe("string");
        expect(typeof item.url).toBe("string");
        expect(typeof item.note).toBe("string");
      }
    });

    it("retorna bibliografia especializada para cursos de Python avanzados", () => {
      const dataScienceRefs = getCourseBibliography("python-analisis-datos", "python");
      const businessRefs = getCourseBibliography("python-analisis-negocio", "python");
      const forecastRefs = getCourseBibliography(
        "python-forecasting-ab-testing",
        "python"
      );

      expect(dataScienceRefs.length).toBeGreaterThanOrEqual(3);
      expect(dataScienceRefs.some((ref) => /pandas/i.test(ref.title))).toBe(true);
      expect(dataScienceRefs.some((ref) => /matplotlib/i.test(ref.title))).toBe(true);

      expect(businessRefs.length).toBeGreaterThanOrEqual(3);
      expect(
        businessRefs.some((ref) => /negocio|kpi|decision|analytics|data/i.test(ref.note))
      ).toBe(true);

      expect(forecastRefs.length).toBeGreaterThanOrEqual(4);
      expect(
        forecastRefs.some((ref) =>
          /forecasting: principles and practice|time series/i.test(ref.title)
        )
      ).toBe(true);
      expect(
        forecastRefs.some((ref) =>
          /controlled experiments|cuped|experimenters/i.test(ref.title)
        )
      ).toBe(true);
    });

    it("retorna bibliografia especializada para la ruta de aprendizaje de Clojure", () => {
      const beginnerRefs = getCourseBibliography("clojure-desde-cero", "clojure");
      const intermediateRefs = getCourseBibliography("clojure-intermedio", "clojure");
      const dataRefs = getCourseBibliography(
        "clojure-datos-y-transformacion",
        "clojure"
      );
      const architectureRefs = getCourseBibliography(
        "clojure-macros-estado-y-arquitectura",
        "clojure"
      );
      const specRefs = getCourseBibliography(
        "clojure-spec-testing-y-tooling",
        "clojure"
      );

      expect(beginnerRefs.length).toBeGreaterThan(0);
      expect(beginnerRefs.some((ref) => /getting started|brave|cheatsheet/i.test(ref.title))).toBe(
        true
      );

      expect(intermediateRefs.some((ref) => /joy of clojure|sequences/i.test(ref.title))).toBe(
        true
      );

      expect(dataRefs.some((ref) => /threading macros|data structures/i.test(ref.title))).toBe(
        true
      );

      expect(
        architectureRefs.some((ref) => /atoms|macros|elements of clojure/i.test(ref.title))
      ).toBe(true);

      expect(specRefs.some((ref) => /spec|clojure\.test|repl/i.test(ref.title))).toBe(true);
    });

    it("retorna bibliografia base para todos los lenguajes soportados", () => {
      for (const language of COURSE_LANGUAGES) {
        const result = getCourseBibliography("curso-generico", language);

        expect(result.length).toBeGreaterThan(0);
        for (const item of result) {
          expect(item).toHaveProperty("title");
          expect(item).toHaveProperty("url");
          expect(item).toHaveProperty("note");
        }
      }
    });

    it("cada item tiene una URL valida", () => {
      const result = getCourseBibliography("python-basico", "python");

      for (const item of result) {
        expect(item.url).toMatch(/^https?:\/\/.+/);
      }
    });
  });

  describe("CourseBibliographyItem type", () => {
    it("acepta objetos con la estructura correcta", () => {
      const item: CourseBibliographyItem = {
        title: "Test Title",
        url: "https://example.com",
        note: "Test note",
      };

      expect(item.title).toBe("Test Title");
      expect(item.url).toBe("https://example.com");
      expect(item.note).toBe("Test note");
    });
  });
});
