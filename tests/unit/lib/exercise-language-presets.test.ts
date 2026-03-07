import { describe, expect, it } from "vitest";
import {
  getExercisePreset,
  getExerciseLanguageBadge,
  type ExerciseLanguagePreset,
} from "@/lib/exercise-language-presets";
import { COURSE_LANGUAGES } from "@/lib/course-runtime";

describe("exercise-language-presets", () => {
  describe("getExercisePreset", () => {
    it("retorna preset correcto para cada lenguaje", () => {
      const expectedLanguages = [
        "python",
        "clojure",
        "javascript",
        "typescript",
        "sql",
        "go",
        "rust",
        "bash",
      ] as const;

      for (const language of expectedLanguages) {
        const preset = getExercisePreset(language);
        expect(preset).toBeDefined();
        expect(typeof preset).toBe("object");
      }
    });

    it("cada preset tiene las propiedades requeridas", () => {
      for (const language of COURSE_LANGUAGES) {
        const preset = getExercisePreset(language);

        expect(preset).toHaveProperty("starterCode");
        expect(preset).toHaveProperty("solutionCode");
        expect(preset).toHaveProperty("hints");
        expect(preset).toHaveProperty("rubricCriteria");
        expect(preset).toHaveProperty("testHints");
        expect(preset).toHaveProperty("testInputPlaceholder");
        expect(preset).toHaveProperty("testExpectedPlaceholder");

        expect(typeof preset.starterCode).toBe("string");
        expect(typeof preset.solutionCode).toBe("string");
        expect(Array.isArray(preset.hints)).toBe(true);
        expect(Array.isArray(preset.rubricCriteria)).toBe(true);
        expect(Array.isArray(preset.testHints)).toBe(true);
        expect(typeof preset.testInputPlaceholder).toBe("string");
        expect(typeof preset.testExpectedPlaceholder).toBe("string");
      }
    });

    it("los rubricCriteria tienen title, description y weight", () => {
      for (const language of COURSE_LANGUAGES) {
        const preset = getExercisePreset(language);

        expect(preset.rubricCriteria.length).toBeGreaterThan(0);

        for (const criteria of preset.rubricCriteria) {
          expect(criteria).toHaveProperty("title");
          expect(criteria).toHaveProperty("description");
          expect(criteria).toHaveProperty("weight");

          expect(typeof criteria.title).toBe("string");
          expect(typeof criteria.description).toBe("string");
          expect(typeof criteria.weight).toBe("number");
          expect(criteria.weight).toBeGreaterThan(0);
        }
      }
    });

    it("la suma de weights de rubricCriteria es 100 para cada lenguaje", () => {
      for (const language of COURSE_LANGUAGES) {
        const preset = getExercisePreset(language);
        const totalWeight = preset.rubricCriteria.reduce(
          (sum, criteria) => sum + criteria.weight,
          0
        );
        expect(totalWeight).toBe(100);
      }
    });
  });

  describe("getExerciseLanguageBadge", () => {
    it("retorna el label correcto para cada lenguaje", () => {
      const testCases = [
        { language: "python" as const, expected: "Python" },
        { language: "clojure" as const, expected: "Clojure" },
        { language: "javascript" as const, expected: "JavaScript" },
        { language: "typescript" as const, expected: "TypeScript" },
        { language: "sql" as const, expected: "SQL" },
        { language: "go" as const, expected: "Go" },
        { language: "rust" as const, expected: "Rust" },
        { language: "bash" as const, expected: "Bash" },
      ];

      for (const { language, expected } of testCases) {
        const label = getExerciseLanguageBadge(language);
        expect(label).toBe(expected);
      }
    });
  });
});
