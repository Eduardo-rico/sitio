import { describe, expect, it } from "vitest";
import {
  PYTHON_COURSE_SLUGS,
  type PythonCourseSlug,
  type PythonCoursePedagogy,
  pythonCoursePedagogyInputSchema,
  getPythonCoursePedagogy,
  getPythonLessonStageFromPedagogy,
  getPythonLessonStage,
  isPythonCourseSlug,
  resolvePythonCoursePedagogy,
} from "@/lib/python-course-pedagogy";

describe("python-course-pedagogy", () => {
  describe("PYTHON_COURSE_SLUGS", () => {
    it("contiene todos los slugs de cursos de Python", () => {
      expect(PYTHON_COURSE_SLUGS).toEqual([
        "python-basico",
        "python-intermedio",
        "python-analisis-datos",
        "python-analisis-negocio",
        "python-forecasting-ab-testing",
      ]);
    });
  });

  describe("isPythonCourseSlug", () => {
    it("retorna true para slugs validos", () => {
      const validSlugs: PythonCourseSlug[] = [
        "python-basico",
        "python-intermedio",
        "python-analisis-datos",
        "python-analisis-negocio",
        "python-forecasting-ab-testing",
      ];

      for (const slug of validSlugs) {
        expect(isPythonCourseSlug(slug)).toBe(true);
      }
    });

    it("retorna false para slugs invalidos", () => {
      const invalidSlugs = [
        "javascript-desde-cero",
        "clojure-basico",
        "python-avanzado",
        "",
        "random-string",
        "PYTHON-BASICO",
        "python_basico",
      ];

      for (const slug of invalidSlugs) {
        expect(isPythonCourseSlug(slug)).toBe(false);
      }
    });
  });

  describe("getPythonCoursePedagogy", () => {
    it("retorna pedagogia correcta para cada slug", () => {
      for (const slug of PYTHON_COURSE_SLUGS) {
        const pedagogy = getPythonCoursePedagogy(slug);
        expect(pedagogy).not.toBeNull();
        expect(pedagogy?.slug).toBe(slug);
        expect(pedagogy?.learningOutcomes.length).toBeGreaterThanOrEqual(3);
        expect(pedagogy?.assessmentPlan.formative.length).toBeGreaterThanOrEqual(2);
        expect(pedagogy?.lessonStages.length).toBeGreaterThanOrEqual(2);
        expect(pedagogy?.prerequisites.length).toBeGreaterThanOrEqual(1);
        expect(pedagogy?.masteryCriteria.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("retorna null para slug invalido", () => {
      expect(getPythonCoursePedagogy("invalid-slug")).toBeNull();
      expect(getPythonCoursePedagogy("javascript-desde-cero")).toBeNull();
      expect(getPythonCoursePedagogy("")).toBeNull();
      expect(getPythonCoursePedagogy("python-avanzado")).toBeNull();
    });

    it("hace clone y no muta el original", () => {
      const original = getPythonCoursePedagogy("python-basico");
      const secondCopy = getPythonCoursePedagogy("python-basico");

      expect(original).not.toBeNull();
      expect(secondCopy).not.toBeNull();
      expect(original).not.toBe(secondCopy);
      expect(original).toEqual(secondCopy);

      // Mutar el original no debe afectar la segunda copia
      original?.learningOutcomes.push("Mutacion local");
      expect(secondCopy?.learningOutcomes).not.toContain("Mutacion local");

      // Restaurar para no afectar otros tests
      original?.learningOutcomes.pop();
    });
  });

  describe("getPythonLessonStageFromPedagogy", () => {
    it("encuentra stage correcto por orden de leccion", () => {
      const pedagogy = getPythonCoursePedagogy("python-basico");
      expect(pedagogy).not.toBeNull();

      const stage1 = getPythonLessonStageFromPedagogy(pedagogy, 1);
      expect(stage1?.label).toBe("Fundamentos");
      expect(stage1?.fromOrder).toBe(1);
      expect(stage1?.toOrder).toBe(2);

      const stage2 = getPythonLessonStageFromPedagogy(pedagogy, 3);
      expect(stage2?.label).toBe("Control de Flujo");

      const stage3 = getPythonLessonStageFromPedagogy(pedagogy, 6);
      expect(stage3?.label).toBe("Abstraccion de Soluciones");
    });

    it("retorna null cuando la leccion no pertenece a ningun stage", () => {
      const pedagogy = getPythonCoursePedagogy("python-basico");

      expect(getPythonLessonStageFromPedagogy(pedagogy, 0)).toBeNull();
      expect(getPythonLessonStageFromPedagogy(pedagogy, 99)).toBeNull();
      expect(getPythonLessonStageFromPedagogy(pedagogy, -1)).toBeNull();
    });

    it("retorna null cuando la pedagogia es null", () => {
      expect(getPythonLessonStageFromPedagogy(null, 1)).toBeNull();
    });
  });

  describe("resolvePythonCoursePedagogy", () => {
    it("maneja rawPedagogy valido y preserva el slug oficial", () => {
      const customPedagogy = {
        slug: "python-intermedio", // Debe ser ignorado y usar el del slug param
        learnerProfile: "Persona de negocio con cero experiencia.",
        timeCommitment: "1 hora por dia",
        prerequisites: ["Excel", "Lectura de tablas"],
        learningOutcomes: ["Entender variables", "Crear scripts", "Interpretar salidas"],
        assessmentPlan: {
          diagnostic: "Quiz corto",
          formative: ["Check 1", "Check 2"],
          summative: "Proyecto final",
        },
        rubricDimensions: ["Correctness"],
        masteryCriteria: ["Completar ejercicios"],
        bibliographyGuidance: "Usar docs oficiales",
        lessonStages: [
          {
            fromOrder: 1,
            toOrder: 2,
            label: "Inicio",
            objective: "Arrancar",
            feedbackFocus: "Sintaxis",
            reflectionPrompt: "Que aprendiste?",
          },
        ],
      };

      const resolved = resolvePythonCoursePedagogy("python-basico", customPedagogy);

      expect(resolved).not.toBeNull();
      expect(resolved?.slug).toBe("python-basico"); // Preserva el slug oficial
      expect(resolved?.learnerProfile).toBe("Persona de negocio con cero experiencia.");
      expect(resolved?.lessonStages[0].label).toBe("Inicio");
    });

    it("usa fallback cuando rawPedagogy es invalido", () => {
      const fallback = getPythonCoursePedagogy("python-analisis-datos");

      const resolved = resolvePythonCoursePedagogy("python-analisis-datos", {
        learnerProfile: "",
        learningOutcomes: [],
      });

      expect(resolved).toEqual(fallback);
    });

    it("usa fallback cuando rawPedagogy es undefined", () => {
      const fallback = getPythonCoursePedagogy("python-intermedio");

      const resolved = resolvePythonCoursePedagogy("python-intermedio", undefined);

      expect(resolved).toEqual(fallback);
    });

    it("retorna null cuando el slug no es valido", () => {
      expect(resolvePythonCoursePedagogy("invalid-slug", {})).toBeNull();
      expect(resolvePythonCoursePedagogy("javascript-desde-cero", {})).toBeNull();
    });
  });

  describe("getPythonLessonStage", () => {
    it("integra todo correctamente para encontrar stages", () => {
      // python-basico
      expect(getPythonLessonStage("python-basico", 1)?.label).toBe("Fundamentos");
      expect(getPythonLessonStage("python-basico", 2)?.label).toBe("Fundamentos");
      expect(getPythonLessonStage("python-basico", 3)?.label).toBe("Control de Flujo");
      expect(getPythonLessonStage("python-basico", 5)?.label).toBe("Abstraccion de Soluciones");

      // python-forecasting-ab-testing
      expect(getPythonLessonStage("python-forecasting-ab-testing", 1)?.label).toBe("Forecasting");
      expect(getPythonLessonStage("python-forecasting-ab-testing", 4)?.label).toBe("Experimentacion");
    });

    it("retorna null para leccion fuera de rango", () => {
      expect(getPythonLessonStage("python-basico", 99)).toBeNull();
      expect(getPythonLessonStage("python-basico", 0)).toBeNull();
    });

    it("retorna null para slug invalido", () => {
      expect(getPythonLessonStage("invalid-slug", 1)).toBeNull();
      expect(getPythonLessonStage("javascript-desde-cero", 1)).toBeNull();
    });
  });

  describe("pythonCoursePedagogyInputSchema", () => {
    it("valida entradas correctas", () => {
      const validInput = {
        learnerProfile: "Perfil de aprendiz",
        timeCommitment: "2 horas por semana",
        prerequisites: ["Prerequisito 1"],
        learningOutcomes: ["Outcome 1", "Outcome 2", "Outcome 3"],
        assessmentPlan: {
          diagnostic: "Diagnostico",
          formative: ["Formative 1"],
          summative: "Summative",
        },
        rubricDimensions: ["Dimension 1"],
        masteryCriteria: ["Criterio 1"],
        bibliographyGuidance: "Guia de bibliografia",
        lessonStages: [
          {
            fromOrder: 1,
            toOrder: 2,
            label: "Etapa 1",
            objective: "Objetivo",
            feedbackFocus: "Feedback",
            reflectionPrompt: "Pregunta",
          },
        ],
      };

      const result = pythonCoursePedagogyInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("rechaza entradas invalidas", () => {
      const invalidInputs = [
        {}, // Vacio
        { learnerProfile: "" }, // Campos vacios
        {
          learnerProfile: "Valid",
          learningOutcomes: [], // Array vacio (necesita minimo 3)
        },
        {
          learnerProfile: "Valid",
          learningOutcomes: ["1", "2", "3"],
          lessonStages: [], // Array vacio (necesita minimo 1)
        },
      ];

      for (const input of invalidInputs) {
        const result = pythonCoursePedagogyInputSchema.safeParse(input);
        expect(result.success).toBe(false);
      }
    });
  });
});
