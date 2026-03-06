import { describe, expect, it } from "vitest";
import {
  CLOJURE_COURSE_SLUGS,
  getClojureCoursePedagogy,
  getClojureLessonStage,
  getClojureLessonStageFromPedagogy,
  isClojureCourseSlug,
  resolveClojureCoursePedagogy,
} from "@/lib/clojure-course-pedagogy";

describe("clojure-course-pedagogy", () => {
  it("expone metadata para toda la ruta de cursos Clojure", () => {
    for (const slug of CLOJURE_COURSE_SLUGS) {
      expect(isClojureCourseSlug(slug)).toBe(true);
      const pedagogy = getClojureCoursePedagogy(slug);
      expect(pedagogy).not.toBeNull();
      expect(pedagogy?.learningOutcomes.length).toBeGreaterThanOrEqual(3);
      expect(pedagogy?.assessmentPlan.formative.length).toBeGreaterThanOrEqual(2);
      expect(pedagogy?.lessonStages.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("resuelve etapa pedagogica por orden de leccion", () => {
    const stageBasics = getClojureLessonStage("clojure-desde-cero", 1);
    const stageSpec = getClojureLessonStage("clojure-spec-testing-y-tooling", 4);

    expect(stageBasics?.label).toBe("Fundamentos del REPL");
    expect(stageSpec?.label).toBe("Testing y Workflow");
    expect(getClojureLessonStage("clojure-desde-cero", 99)).toBeNull();
    expect(getClojureLessonStage("python-basico", 1)).toBeNull();
  });

  it("clona la pedagogia base para no compartir referencia mutable", () => {
    const original = getClojureCoursePedagogy("clojure-intermedio");
    const secondCopy = getClojureCoursePedagogy("clojure-intermedio");

    original?.masteryCriteria.push("Mutacion local");

    expect(secondCopy?.masteryCriteria).not.toContain("Mutacion local");
  });

  it("resuelve pedagogia personalizada validada y preserva el slug oficial", () => {
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

    expect(custom?.slug).toBe("clojure-spec-testing-y-tooling");
    expect(custom?.learnerProfile).toContain("rigor");
    expect(getClojureLessonStageFromPedagogy(custom, 2)?.label).toBe("Inicio");
  });

  it("usa fallback cuando la pedagogia almacenada es invalida", () => {
    const fallback = getClojureCoursePedagogy("clojure-macros-estado-y-arquitectura");
    const resolved = resolveClojureCoursePedagogy("clojure-macros-estado-y-arquitectura", {
      learnerProfile: "",
      learningOutcomes: [],
    });

    expect(resolved).toEqual(fallback);
    expect(resolveClojureCoursePedagogy("javascript-desde-cero", {})).toBeNull();
    expect(getClojureLessonStageFromPedagogy(null, 1)).toBeNull();
  });
});
