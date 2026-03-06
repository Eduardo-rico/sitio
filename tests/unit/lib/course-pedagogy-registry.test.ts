import { describe, expect, it } from "vitest";
import {
  getCoursePedagogyInputSchema,
  resolveCoursePedagogy,
  supportsEditableCoursePedagogy,
} from "@/lib/course-pedagogy-registry";

describe("course-pedagogy-registry", () => {
  it("solo habilita pedagogia editable para python y clojure", () => {
    expect(supportsEditableCoursePedagogy("python")).toBe(true);
    expect(supportsEditableCoursePedagogy("clojure")).toBe(true);
    expect(supportsEditableCoursePedagogy("javascript")).toBe(false);
  });

  it("resuelve pedagogia compartida segun lenguaje y slug", () => {
    const pythonPedagogy = resolveCoursePedagogy("python", "python-basico");
    const clojurePedagogy = resolveCoursePedagogy("clojure", "clojure-spec-testing-y-tooling");

    expect(pythonPedagogy?.slug).toBe("python-basico");
    expect(clojurePedagogy?.slug).toBe("clojure-spec-testing-y-tooling");
    expect(resolveCoursePedagogy("javascript", "javascript-desde-cero")).toBeNull();
  });

  it("expone schema de validacion solo para lenguajes soportados", () => {
    const pythonSchema = getCoursePedagogyInputSchema("python");
    const clojureSchema = getCoursePedagogyInputSchema("clojure");

    expect(pythonSchema).not.toBeNull();
    expect(clojureSchema).not.toBeNull();
    expect(getCoursePedagogyInputSchema("bash")).toBeNull();
    expect(
      pythonSchema?.safeParse({
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
});
