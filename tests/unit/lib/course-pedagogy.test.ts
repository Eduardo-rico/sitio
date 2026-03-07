import {
  cloneCoursePedagogy,
  getLessonStageFromPedagogy,
  courseLessonStageSchema,
  coursePedagogyInputSchema,
  type CoursePedagogy,
} from "@/lib/course-pedagogy";

const mockPedagogy: CoursePedagogy = {
  slug: "test-course",
  learnerProfile: "Estudiantes principiantes en programación",
  timeCommitment: "4 semanas, 5 horas por semana",
  prerequisites: ["Conocimientos básicos de computación"],
  learningOutcomes: [
    "Comprender conceptos básicos",
    "Aplicar buenas prácticas",
    "Resolver problemas simples",
  ],
  assessmentPlan: {
    diagnostic: "Evaluación inicial de conocimientos",
    formative: ["Quizzes semanales", "Ejercicios prácticos"],
    summative: "Proyecto final integrador",
  },
  rubricDimensions: ["Correctness", "Clarity", "Efficiency"],
  masteryCriteria: [
    "Completar todos los ejercicios",
    "Obtener 80% en evaluaciones",
  ],
  bibliographyGuidance: "Consultar documentación oficial",
  lessonStages: [
    {
      fromOrder: 1,
      toOrder: 3,
      label: "Fundamentos",
      objective: "Establecer bases conceptuales",
      feedbackFocus: "Comprensión de conceptos",
      reflectionPrompt: "¿Qué conceptos fueron más desafiantes?",
    },
    {
      fromOrder: 4,
      toOrder: 6,
      label: "Práctica",
      objective: "Aplicar conocimientos",
      feedbackFocus: "Calidad del código",
      reflectionPrompt: "¿Cómo mejoraste tu código?",
    },
    {
      fromOrder: 7,
      toOrder: 10,
      label: "Avanzado",
      objective: "Dominar técnicas avanzadas",
      feedbackFocus: "Optimización y diseño",
      reflectionPrompt: "¿Qué patrones aplicaste?",
    },
  ],
};

describe("course-pedagogy helpers", () => {
  describe("cloneCoursePedagogy", () => {
    it("hace deep clone correctamente", () => {
      const original = mockPedagogy;
      const cloned = cloneCoursePedagogy(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.lessonStages).not.toBe(original.lessonStages);
      expect(cloned.lessonStages[0]).not.toBe(original.lessonStages[0]);
    });

    it("modificar el clone no afecta el original", () => {
      const original = mockPedagogy;
      const cloned = cloneCoursePedagogy(original);

      cloned.slug = "modified-slug";
      cloned.lessonStages[0].label = "Modified Label";

      expect(original.slug).toBe("test-course");
      expect(original.lessonStages[0].label).toBe("Fundamentos");
    });
  });

  describe("getLessonStageFromPedagogy", () => {
    it("encuentra el stage correcto basado en lessonOrder", () => {
      const stage1 = getLessonStageFromPedagogy(mockPedagogy, 1);
      expect(stage1?.label).toBe("Fundamentos");

      const stage2 = getLessonStageFromPedagogy(mockPedagogy, 3);
      expect(stage2?.label).toBe("Fundamentos");

      const stage3 = getLessonStageFromPedagogy(mockPedagogy, 5);
      expect(stage3?.label).toBe("Práctica");

      const stage4 = getLessonStageFromPedagogy(mockPedagogy, 8);
      expect(stage4?.label).toBe("Avanzado");
    });

    it("retorna null cuando no hay pedagogy", () => {
      const stage = getLessonStageFromPedagogy(null, 1);
      expect(stage).toBeNull();
    });

    it("retorna null cuando no encuentra stage", () => {
      const stage = getLessonStageFromPedagogy(mockPedagogy, 0);
      expect(stage).toBeNull();

      const stage2 = getLessonStageFromPedagogy(mockPedagogy, 11);
      expect(stage2).toBeNull();

      const stage3 = getLessonStageFromPedagogy(mockPedagogy, -1);
      expect(stage3).toBeNull();
    });

    it("encuentra stage en los límites del rango", () => {
      const firstStage = getLessonStageFromPedagogy(mockPedagogy, 1);
      expect(firstStage?.label).toBe("Fundamentos");

      const lastStage = getLessonStageFromPedagogy(mockPedagogy, 10);
      expect(lastStage?.label).toBe("Avanzado");
    });
  });

  describe("courseLessonStageSchema", () => {
    it("valida datos válidos", () => {
      const validData = {
        fromOrder: 1,
        toOrder: 5,
        label: "Etapa 1",
        objective: "Objetivo de la etapa",
        feedbackFocus: "Enfoque del feedback",
        reflectionPrompt: "Pregunta de reflexión",
      };

      const result = courseLessonStageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rechaza fromOrder menor a 1", () => {
      const invalidData = {
        fromOrder: 0,
        toOrder: 5,
        label: "Etapa 1",
        objective: "Objetivo",
        feedbackFocus: "Feedback",
        reflectionPrompt: "Reflexión",
      };

      const result = courseLessonStageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza label vacío", () => {
      const invalidData = {
        fromOrder: 1,
        toOrder: 5,
        label: "",
        objective: "Objetivo",
        feedbackFocus: "Feedback",
        reflectionPrompt: "Reflexión",
      };

      const result = courseLessonStageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza label con más de 80 caracteres", () => {
      const invalidData = {
        fromOrder: 1,
        toOrder: 5,
        label: "a".repeat(81),
        objective: "Objetivo",
        feedbackFocus: "Feedback",
        reflectionPrompt: "Reflexión",
      };

      const result = courseLessonStageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza objective con más de 500 caracteres", () => {
      const invalidData = {
        fromOrder: 1,
        toOrder: 5,
        label: "Etapa 1",
        objective: "a".repeat(501),
        feedbackFocus: "Feedback",
        reflectionPrompt: "Reflexión",
      };

      const result = courseLessonStageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("trimmea strings con espacios", () => {
      const dataWithSpaces = {
        fromOrder: 1,
        toOrder: 5,
        label: "  Etapa 1  ",
        objective: "  Objetivo  ",
        feedbackFocus: "  Feedback  ",
        reflectionPrompt: "  Reflexión  ",
      };

      const result = courseLessonStageSchema.safeParse(dataWithSpaces);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.label).toBe("Etapa 1");
        expect(result.data.objective).toBe("Objetivo");
      }
    });
  });

  describe("coursePedagogyInputSchema", () => {
    it("valida datos válidos", () => {
      const result = coursePedagogyInputSchema.safeParse(mockPedagogy);
      expect(result.success).toBe(true);
    });

    it("permite slug opcional", () => {
      const dataWithoutSlug = { ...mockPedagogy };
      delete (dataWithoutSlug as { slug?: string }).slug;

      const result = coursePedagogyInputSchema.safeParse(dataWithoutSlug);
      expect(result.success).toBe(true);
    });

    it("rechaza learnerProfile vacío", () => {
      const invalidData = { ...mockPedagogy, learnerProfile: "" };

      const result = coursePedagogyInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza prerequisites vacío", () => {
      const invalidData = { ...mockPedagogy, prerequisites: [] };

      const result = coursePedagogyInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza learningOutcomes con menos de 3 elementos", () => {
      const invalidData = {
        ...mockPedagogy,
        learningOutcomes: ["Outcome 1", "Outcome 2"],
      };

      const result = coursePedagogyInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza lessonStages vacío", () => {
      const invalidData = { ...mockPedagogy, lessonStages: [] };

      const result = coursePedagogyInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza más de 12 lessonStages", () => {
      const invalidData = {
        ...mockPedagogy,
        lessonStages: Array(13).fill(mockPedagogy.lessonStages[0]),
      };

      const result = coursePedagogyInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza más de 12 prerequisites", () => {
      const invalidData = {
        ...mockPedagogy,
        prerequisites: Array(13).fill("Prerequisite"),
      };

      const result = coursePedagogyInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza formative vacío en assessmentPlan", () => {
      const invalidData = {
        ...mockPedagogy,
        assessmentPlan: { ...mockPedagogy.assessmentPlan, formative: [] },
      };

      const result = coursePedagogyInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza rubricDimensions vacío", () => {
      const invalidData = { ...mockPedagogy, rubricDimensions: [] };

      const result = coursePedagogyInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rechaza masteryCriteria vacío", () => {
      const invalidData = { ...mockPedagogy, masteryCriteria: [] };

      const result = coursePedagogyInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
