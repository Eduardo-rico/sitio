import { describe, expect, it } from "vitest";
import {
  PYTHON_COURSE_SLUGS,
  getPythonCoursePedagogy,
  getPythonLessonStage,
  isPythonCourseSlug,
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
});
