import { describe, expect, it } from "vitest";
import {
  CLOJURE_COURSE_SLUGS,
  type ClojureCoursePedagogy,
  clojureCoursePedagogyInputSchema,
  getClojureCoursePedagogy,
  getClojureLessonStage,
  getClojureLessonStageFromPedagogy,
  isClojureCourseSlug,
  resolveClojureCoursePedagogy,
} from "@/lib/clojure-course-pedagogy";

describe("clojure-course-pedagogy", () => {
  describe("CLOJURE_COURSE_SLUGS", () => {
    it("contiene todos los slugs de cursos de Clojure", () => {
      expect(CLOJURE_COURSE_SLUGS).toEqual([
        "clojure-desde-cero",
        "clojure-intermedio",
        "clojure-datos-y-transformacion",
        "clojure-macros-estado-y-arquitectura",
        "clojure-spec-testing-y-tooling",
      ]);
    });
  });

  describe("clojureCoursePedagogyInputSchema", () => {
    it("exporta el schema de validacion", () => {
      expect(clojureCoursePedagogyInputSchema).toBeDefined();
    });
  });

  describe("isClojureCourseSlug", () => {
    it("retorna true para slugs validos", () => {
      expect(isClojureCourseSlug("clojure-desde-cero")).toBe(true);
      expect(isClojureCourseSlug("clojure-intermedio")).toBe(true);
      expect(isClojureCourseSlug("clojure-datos-y-transformacion")).toBe(true);
      expect(isClojureCourseSlug("clojure-macros-estado-y-arquitectura")).toBe(true);
      expect(isClojureCourseSlug("clojure-spec-testing-y-tooling")).toBe(true);
    });

    it("retorna false para slugs invalidos", () => {
      expect(isClojureCourseSlug("")).toBe(false);
      expect(isClojureCourseSlug("invalid-slug")).toBe(false);
      expect(isClojureCourseSlug("python-basico")).toBe(false);
      expect(isClojureCourseSlug("clojure")).toBe(false);
      expect(isClojureCourseSlug("CLOJURE-DESDE-CERO")).toBe(false);
      expect(isClojureCourseSlug("clojure_desde_cero")).toBe(false);
    });
  });

  describe("getClojureCoursePedagogy", () => {
    it("retorna pedagogia correcta para cada slug", () => {
      const pedagogyZero = getClojureCoursePedagogy("clojure-desde-cero");
      expect(pedagogyZero).not.toBeNull();
      expect(pedagogyZero?.slug).toBe("clojure-desde-cero");
      expect(pedagogyZero?.learningOutcomes.length).toBeGreaterThanOrEqual(3);
      expect(pedagogyZero?.assessmentPlan.formative.length).toBeGreaterThanOrEqual(2);
      expect(pedagogyZero?.lessonStages.length).toBeGreaterThanOrEqual(2);

      const pedagogyInter = getClojureCoursePedagogy("clojure-intermedio");
      expect(pedagogyInter).not.toBeNull();
      expect(pedagogyInter?.slug).toBe("clojure-intermedio");

      const pedagogyData = getClojureCoursePedagogy("clojure-datos-y-transformacion");
      expect(pedagogyData).not.toBeNull();
      expect(pedagogyData?.slug).toBe("clojure-datos-y-transformacion");

      const pedagogyMacros = getClojureCoursePedagogy("clojure-macros-estado-y-arquitectura");
      expect(pedagogyMacros).not.toBeNull();
      expect(pedagogyMacros?.slug).toBe("clojure-macros-estado-y-arquitectura");

      const pedagogySpec = getClojureCoursePedagogy("clojure-spec-testing-y-tooling");
      expect(pedagogySpec).not.toBeNull();
      expect(pedagogySpec?.slug).toBe("clojure-spec-testing-y-tooling");
    });

    it("retorna null para slug invalido", () => {
      expect(getClojureCoursePedagogy("invalid-slug")).toBeNull();
      expect(getClojureCoursePedagogy("")).toBeNull();
      expect(getClojureCoursePedagogy("python-basico")).toBeNull();
      expect(getClojureCoursePedagogy("javascript-desde-cero")).toBeNull();
    });

    it("hace clone sin mutar el original", () => {
      const original = getClojureCoursePedagogy("clojure-intermedio");
      const secondCopy = getClojureCoursePedagogy("clojure-intermedio");

      expect(original).not.toBe(secondCopy);
      expect(original).toEqual(secondCopy);

      // Mutar el original no debe afectar la segunda copia
      original?.masteryCriteria.push("Mutacion local");
      expect(secondCopy?.masteryCriteria).not.toContain("Mutacion local");

      // Mutar lessonStages tampoco debe afectar
      const originalStageLabel = original?.lessonStages[0]?.label;
      if (original?.lessonStages[0]) {
        original.lessonStages[0].label = "Etapa modificada";
        expect(secondCopy?.lessonStages[0]?.label).toBe(originalStageLabel);
      }
    });
  });

  describe("getClojureLessonStageFromPedagogy", () => {
    it("encuentra stage correcto para orden de leccion", () => {
      const pedagogy = getClojureCoursePedagogy("clojure-desde-cero");
      
      const stage1 = getClojureLessonStageFromPedagogy(pedagogy, 1);
      expect(stage1?.label).toBe("Fundamentos del REPL");
      expect(stage1?.fromOrder).toBe(1);
      expect(stage1?.toOrder).toBe(2);

      const stage2 = getClojureLessonStageFromPedagogy(pedagogy, 2);
      expect(stage2?.label).toBe("Fundamentos del REPL");

      const stage3 = getClojureLessonStageFromPedagogy(pedagogy, 3);
      expect(stage3?.label).toBe("Transformaciones Basicas");

      const stage4 = getClojureLessonStageFromPedagogy(pedagogy, 4);
      expect(stage4?.label).toBe("Transformaciones Basicas");
    });

    it("retorna null cuando la leccion no esta en ningun stage", () => {
      const pedagogy = getClojureCoursePedagogy("clojure-desde-cero");
      expect(getClojureLessonStageFromPedagogy(pedagogy, 0)).toBeNull();
      expect(getClojureLessonStageFromPedagogy(pedagogy, 99)).toBeNull();
      expect(getClojureLessonStageFromPedagogy(pedagogy, -1)).toBeNull();
    });

    it("retorna null cuando la pedagogia es null", () => {
      expect(getClojureLessonStageFromPedagogy(null, 1)).toBeNull();
    });

    it("funciona con pedagogia parcial (solo lessonStages)", () => {
      const partialPedagogy: Pick<ClojureCoursePedagogy, "lessonStages"> = {
        lessonStages: [
          {
            fromOrder: 1,
            toOrder: 3,
            label: "Etapa parcial",
            objective: "Objetivo de prueba",
            feedbackFocus: "Feedback de prueba",
            reflectionPrompt: "Reflexion de prueba",
          },
        ],
      };
      expect(getClojureLessonStageFromPedagogy(partialPedagogy, 2)?.label).toBe("Etapa parcial");
      expect(getClojureLessonStageFromPedagogy(partialPedagogy, 4)).toBeNull();
    });
  });

  describe("resolveClojureCoursePedagogy", () => {
    it("resuelve rawPedagogy valido y preserva el slug oficial", () => {
      const custom = resolveClojureCoursePedagogy("clojure-spec-testing-y-tooling", {
        slug: "clojure-desde-cero",
        learnerProfile: "Equipo funcional que quiere mas rigor.",
        timeCommitment: "1 hora diaria",
        prerequisites: ["Clojure intermedio"],
        learningOutcomes: ["Validar datos", "Probar funciones", "Ordenar workflow"],
        assessmentPlan: {
          diagnostic: "Quiz corto",
          formative: ["Check 1", "Check 2"],
          summative: "Proyecto final",
        },
        rubricDimensions: ["Validation"],
        masteryCriteria: ["Completar suite"],
        bibliographyGuidance: "Usar docs oficiales",
        lessonStages: [
          {
            fromOrder: 1,
            toOrder: 4,
            label: "Inicio",
            objective: "Alinear rigor",
            feedbackFocus: "Claridad",
            reflectionPrompt: "Que mejoro?",
          },
        ],
      });

      expect(custom).not.toBeNull();
      expect(custom?.slug).toBe("clojure-spec-testing-y-tooling");
      expect(custom?.learnerProfile).toContain("rigor");
    });

    it("usa fallback cuando rawPedagogy es invalido", () => {
      const fallback = getClojureCoursePedagogy("clojure-macros-estado-y-arquitectura");
      
      const resolved = resolveClojureCoursePedagogy("clojure-macros-estado-y-arquitectura", {
        learnerProfile: "",
        learningOutcomes: [],
      });

      expect(resolved).toEqual(fallback);
    });

    it("usa fallback cuando rawPedagogy es undefined", () => {
      const fallback = getClojureCoursePedagogy("clojure-desde-cero");
      const resolved = resolveClojureCoursePedagogy("clojure-desde-cero", undefined);
      expect(resolved).toEqual(fallback);
    });

    it("usa fallback cuando rawPedagogy es null", () => {
      const fallback = getClojureCoursePedagogy("clojure-intermedio");
      const resolved = resolveClojureCoursePedagogy("clojure-intermedio", null);
      expect(resolved).toEqual(fallback);
    });

    it("retorna null para slug invalido aunque rawPedagogy sea valido", () => {
      const resolved = resolveClojureCoursePedagogy("invalid-slug", {
        learnerProfile: "Perfil valido",
        timeCommitment: "1 hora",
        prerequisites: [],
        learningOutcomes: ["Outcome 1"],
        assessmentPlan: {
          diagnostic: "Quiz",
          formative: ["Check 1"],
          summative: "Final",
        },
        rubricDimensions: ["Correctness"],
        masteryCriteria: ["Completar"],
        bibliographyGuidance: "Docs",
        lessonStages: [],
      });
      expect(resolved).toBeNull();
    });

    it("ignora el slug del rawPedagogy y usa el del primer parametro", () => {
      const resolved = resolveClojureCoursePedagogy("clojure-desde-cero", {
        slug: "clojure-intermedio",
        learnerProfile: "Perfil personalizado",
        timeCommitment: "2 horas",
        prerequisites: ["Prereq 1"],
        learningOutcomes: ["Outcome 1", "Outcome 2", "Outcome 3"],
        assessmentPlan: {
          diagnostic: "Diag",
          formative: ["Form 1"],
          summative: "Summ",
        },
        rubricDimensions: ["Dim 1"],
        masteryCriteria: ["Crit 1"],
        bibliographyGuidance: "Biblio",
        lessonStages: [
          {
            fromOrder: 1,
            toOrder: 2,
            label: "Etapa custom",
            objective: "Objetivo",
            feedbackFocus: "Feedback",
            reflectionPrompt: "Reflexion",
          },
        ],
      });

      expect(resolved?.slug).toBe("clojure-desde-cero");
      expect(resolved?.learnerProfile).toBe("Perfil personalizado");
    });
  });

  describe("getClojureLessonStage", () => {
    it("integra todo correctamente para encontrar stages", () => {
      const stageBasics = getClojureLessonStage("clojure-desde-cero", 1);
      expect(stageBasics?.label).toBe("Fundamentos del REPL");

      const stageTransform = getClojureLessonStage("clojure-desde-cero", 3);
      expect(stageTransform?.label).toBe("Transformaciones Basicas");

      const stageSpec = getClojureLessonStage("clojure-spec-testing-y-tooling", 3);
      expect(stageSpec?.label).toBe("Testing y Workflow");

      const stageContract = getClojureLessonStage("clojure-spec-testing-y-tooling", 1);
      expect(stageContract?.label).toBe("Contratos y Validacion");
    });

    it("retorna null para orden de leccion fuera de rango", () => {
      expect(getClojureLessonStage("clojure-desde-cero", 99)).toBeNull();
      expect(getClojureLessonStage("clojure-desde-cero", 0)).toBeNull();
      expect(getClojureLessonStage("clojure-desde-cero", -1)).toBeNull();
    });

    it("retorna null para slug invalido", () => {
      expect(getClojureLessonStage("python-basico", 1)).toBeNull();
      expect(getClojureLessonStage("javascript-desde-cero", 1)).toBeNull();
      expect(getClojureLessonStage("", 1)).toBeNull();
    });

    it("funciona con todos los cursos de la ruta Clojure", () => {
      for (const slug of CLOJURE_COURSE_SLUGS) {
        const pedagogy = getClojureCoursePedagogy(slug);
        expect(pedagogy).not.toBeNull();
        
        // Verificar que al menos el primer orden funciona
        const firstStage = getClojureLessonStage(slug, 1);
        expect(firstStage).not.toBeNull();
        expect(firstStage?.label).toBeDefined();
      }
    });
  });
});
