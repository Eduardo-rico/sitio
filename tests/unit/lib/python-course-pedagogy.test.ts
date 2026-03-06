import { describe, expect, it } from "vitest";
import {
  PYTHON_COURSE_SLUGS,
  getPythonCoursePedagogy,
  getPythonLessonStageFromPedagogy,
  getPythonLessonStage,
  isPythonCourseSlug,
  resolvePythonCoursePedagogy,
} from "@/lib/python-course-pedagogy";

describe("python-course-pedagogy", () => {
  it("expone metadata para todos los cursos de python", () => {
    for (const slug of PYTHON_COURSE_SLUGS) {
      expect(isPythonCourseSlug(slug)).toBe(true);
      const pedagogy = getPythonCoursePedagogy(slug);
      expect(pedagogy).not.toBeNull();
      expect(pedagogy?.learningOutcomes.length).toBeGreaterThanOrEqual(3);
      expect(pedagogy?.assessmentPlan.formative.length).toBeGreaterThanOrEqual(2);
      expect(pedagogy?.lessonStages.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("resuelve etapa pedagogica por orden de leccion", () => {
    const stageBasics = getPythonLessonStage("python-basico", 1);
    const stageAdvanced = getPythonLessonStage("python-forecasting-ab-testing", 4);

    expect(stageBasics?.label).toBe("Fundamentos");
    expect(stageAdvanced?.label).toBe("Experimentacion");
    expect(getPythonLessonStage("python-basico", 99)).toBeNull();
    expect(getPythonLessonStage("javascript-desde-cero", 1)).toBeNull();
  });

  it("clona la pedagogia base para no compartir referencia mutable", () => {
    const original = getPythonCoursePedagogy("python-basico");
    const secondCopy = getPythonCoursePedagogy("python-basico");

    original?.learningOutcomes.push("Mutacion local");

    expect(secondCopy?.learningOutcomes).not.toContain("Mutacion local");
  });

  it("resuelve pedagogia personalizada validada y preserva el slug oficial", () => {
    const custom = resolvePythonCoursePedagogy("python-basico", {
      slug: "python-intermedio",
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
    });

    expect(custom?.slug).toBe("python-basico");
    expect(custom?.learnerProfile).toContain("negocio");
    expect(getPythonLessonStageFromPedagogy(custom, 2)?.label).toBe("Inicio");
  });

  it("usa fallback cuando la pedagogia almacenada es invalida", () => {
    const fallback = getPythonCoursePedagogy("python-analisis-datos");
    const resolved = resolvePythonCoursePedagogy("python-analisis-datos", {
      learnerProfile: "",
      learningOutcomes: [],
    });

    expect(resolved).toEqual(fallback);
    expect(resolvePythonCoursePedagogy("javascript-desde-cero", {})).toBeNull();
    expect(getPythonLessonStageFromPedagogy(null, 1)).toBeNull();
  });
});
