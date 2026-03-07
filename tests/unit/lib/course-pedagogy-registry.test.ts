import { describe, expect, it } from "vitest";
import {
  getCoursePedagogyInputSchema,
  resolveCoursePedagogy,
  supportsEditableCoursePedagogy,
  isEditableCoursePedagogyLanguage,
  EDITABLE_COURSE_PEDAGOGY_LANGUAGES,
} from "@/lib/course-pedagogy-registry";
import type { CourseLanguage } from "@/lib/course-runtime";

describe("course-pedagogy-registry", () => {
  describe("EDITABLE_COURSE_PEDAGOGY_LANGUAGES", () => {
    it("contiene python y clojure como lenguajes soportados", () => {
      expect(EDITABLE_COURSE_PEDAGOGY_LANGUAGES).toContain("python");
      expect(EDITABLE_COURSE_PEDAGOGY_LANGUAGES).toContain("clojure");
      expect(EDITABLE_COURSE_PEDAGOGY_LANGUAGES).toHaveLength(2);
    });
  });

  describe("supportsEditableCoursePedagogy", () => {
    it("retorna true para python y clojure", () => {
      expect(supportsEditableCoursePedagogy("python")).toBe(true);
      expect(supportsEditableCoursePedagogy("clojure")).toBe(true);
    });

    it("retorna false para otros lenguajes", () => {
      expect(supportsEditableCoursePedagogy("javascript")).toBe(false);
      expect(supportsEditableCoursePedagogy("typescript")).toBe(false);
      expect(supportsEditableCoursePedagogy("java")).toBe(false);
      expect(supportsEditableCoursePedagogy("go")).toBe(false);
      expect(supportsEditableCoursePedagogy("rust")).toBe(false);
      expect(supportsEditableCoursePedagogy("bash")).toBe(false);
      expect(supportsEditableCoursePedagogy("")).toBe(false);
      expect(supportsEditableCoursePedagogy("unknown")).toBe(false);
    });
  });

  describe("isEditableCoursePedagogyLanguage", () => {
    it("funciona como type guard correctamente", () => {
      const pythonLang: CourseLanguage = "python";
      const clojureLang: CourseLanguage = "clojure";
      const jsLang: CourseLanguage = "javascript";

      expect(isEditableCoursePedagogyLanguage(pythonLang)).toBe(true);
      expect(isEditableCoursePedagogyLanguage(clojureLang)).toBe(true);
      expect(isEditableCoursePedagogyLanguage(jsLang)).toBe(false);
    });

    it("narrowing de tipo funciona correctamente", () => {
      const lang: CourseLanguage = "python";

      if (isEditableCoursePedagogyLanguage(lang)) {
        // En este bloque, lang debería ser de tipo EditableCoursePedagogyLanguage
        expect(lang).toBe("python");
      }
    });
  });

  describe("getCoursePedagogyInputSchema", () => {
    it("retorna schema correcto para python", () => {
      const schema = getCoursePedagogyInputSchema("python");

      expect(schema).not.toBeNull();
      expect(
        schema?.safeParse({
          learnerProfile: "Persona aprendiz",
          timeCommitment: "2 horas",
          prerequisites: ["Base"],
          learningOutcomes: ["Uno", "Dos", "Tres"],
          assessmentPlan: {
            diagnostic: "Diag",
            formative: ["Formativa"],
            summative: "Sumativa",
          },
          rubricDimensions: ["Correctness"],
          masteryCriteria: ["Criterio"],
          bibliographyGuidance: "Guia",
          lessonStages: [
            {
              fromOrder: 1,
              toOrder: 2,
              label: "Inicio",
              objective: "Objetivo",
              feedbackFocus: "Feedback",
              reflectionPrompt: "Reflexion",
            },
          ],
        }).success
      ).toBe(true);
    });

    it("retorna schema correcto para clojure", () => {
      const schema = getCoursePedagogyInputSchema("clojure");

      expect(schema).not.toBeNull();
    });

    it("retorna null para lenguajes no soportados", () => {
      expect(getCoursePedagogyInputSchema("javascript")).toBeNull();
      expect(getCoursePedagogyInputSchema("typescript")).toBeNull();
      expect(getCoursePedagogyInputSchema("java")).toBeNull();
      expect(getCoursePedagogyInputSchema("go")).toBeNull();
      expect(getCoursePedagogyInputSchema("rust")).toBeNull();
      expect(getCoursePedagogyInputSchema("bash")).toBeNull();
      expect(getCoursePedagogyInputSchema("")).toBeNull();
      expect(getCoursePedagogyInputSchema("unknown")).toBeNull();
    });
  });

  describe("resolveCoursePedagogy", () => {
    it("resuelve pedagogía correctamente para python", () => {
      const pythonPedagogy = resolveCoursePedagogy("python", "python-basico");

      expect(pythonPedagogy).not.toBeNull();
      expect(pythonPedagogy?.slug).toBe("python-basico");
    });

    it("resuelve pedagogía correctamente para clojure", () => {
      const clojurePedagogy = resolveCoursePedagogy(
        "clojure",
        "clojure-spec-testing-y-tooling"
      );

      expect(clojurePedagogy).not.toBeNull();
      expect(clojurePedagogy?.slug).toBe("clojure-spec-testing-y-tooling");
    });

    it("resuelve pedagogía con datos personalizados validos", () => {
      const customPedagogy = resolveCoursePedagogy("python", "python-basico", {
        learnerProfile: "Persona de negocio",
        timeCommitment: "1 hora por dia",
        prerequisites: ["Excel"],
        learningOutcomes: ["Entender variables", "Crear scripts", "Interpretar salidas"],
        assessmentPlan: {
          diagnostic: "Quiz",
          formative: ["Check 1", "Check 2"],
          summative: "Proyecto",
        },
        rubricDimensions: ["Correctness"],
        masteryCriteria: ["Completar ejercicios"],
        bibliographyGuidance: "Usar docs",
        lessonStages: [
          {
            fromOrder: 1,
            toOrder: 1,
            label: "Inicio",
            objective: "Arrancar",
            feedbackFocus: "Sintaxis",
            reflectionPrompt: "Que aprendiste?",
          },
        ],
      });

      expect(customPedagogy).not.toBeNull();
      expect(customPedagogy?.slug).toBe("python-basico");
      expect(customPedagogy?.learnerProfile).toBe("Persona de negocio");
      expect(customPedagogy?.timeCommitment).toBe("1 hora por dia");
    });

    it("usa fallback cuando los datos personalizados son invalidos", () => {
      const fallback = resolveCoursePedagogy("python", "python-basico");
      const withInvalidData = resolveCoursePedagogy("python", "python-basico", {
        learnerProfile: "",
        learningOutcomes: [],
      });

      expect(withInvalidData).toEqual(fallback);
    });

    it("retorna null para lenguajes no soportados", () => {
      expect(resolveCoursePedagogy("javascript", "javascript-desde-cero")).toBeNull();
      expect(resolveCoursePedagogy("typescript", "typescript-basico")).toBeNull();
      expect(resolveCoursePedagogy("java", "java-basico")).toBeNull();
      expect(resolveCoursePedagogy("go", "go-basico")).toBeNull();
      expect(resolveCoursePedagogy("rust", "rust-basico")).toBeNull();
      expect(resolveCoursePedagogy("bash", "bash-basico")).toBeNull();
      expect(resolveCoursePedagogy("", "empty")).toBeNull();
      expect(resolveCoursePedagogy("unknown", "unknown-course")).toBeNull();
    });
  });
});
