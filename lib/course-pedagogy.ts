import { z } from "zod";

export interface CourseLessonStage {
  fromOrder: number;
  toOrder: number;
  label: string;
  objective: string;
  feedbackFocus: string;
  reflectionPrompt: string;
}

export interface CoursePedagogy {
  slug: string;
  learnerProfile: string;
  timeCommitment: string;
  prerequisites: string[];
  learningOutcomes: string[];
  assessmentPlan: {
    diagnostic: string;
    formative: string[];
    summative: string;
  };
  rubricDimensions: string[];
  masteryCriteria: string[];
  bibliographyGuidance: string;
  lessonStages: CourseLessonStage[];
}

export const courseLessonStageSchema = z.object({
  fromOrder: z.number().int().min(1),
  toOrder: z.number().int().min(1),
  label: z.string().trim().min(1).max(80),
  objective: z.string().trim().min(1).max(500),
  feedbackFocus: z.string().trim().min(1).max(500),
  reflectionPrompt: z.string().trim().min(1).max(500),
});

export const coursePedagogyInputSchema = z.object({
  slug: z.string().trim().optional(),
  learnerProfile: z.string().trim().min(1).max(500),
  timeCommitment: z.string().trim().min(1).max(200),
  prerequisites: z.array(z.string().trim().min(1).max(200)).min(1).max(12),
  learningOutcomes: z.array(z.string().trim().min(1).max(300)).min(3).max(12),
  assessmentPlan: z.object({
    diagnostic: z.string().trim().min(1).max(500),
    formative: z.array(z.string().trim().min(1).max(300)).min(1).max(12),
    summative: z.string().trim().min(1).max(500),
  }),
  rubricDimensions: z.array(z.string().trim().min(1).max(80)).min(1).max(8),
  masteryCriteria: z.array(z.string().trim().min(1).max(300)).min(1).max(12),
  bibliographyGuidance: z.string().trim().min(1).max(500),
  lessonStages: z.array(courseLessonStageSchema).min(1).max(12),
});

export type CoursePedagogyInput = z.infer<typeof coursePedagogyInputSchema>;

export function cloneCoursePedagogy<T extends CoursePedagogy>(pedagogy: T): T {
  return JSON.parse(JSON.stringify(pedagogy)) as T;
}

export function getLessonStageFromPedagogy(
  pedagogy: Pick<CoursePedagogy, "lessonStages"> | null,
  lessonOrder: number
): CourseLessonStage | null {
  if (!pedagogy) {
    return null;
  }

  return (
    pedagogy.lessonStages.find(
      (stage) => lessonOrder >= stage.fromOrder && lessonOrder <= stage.toOrder
    ) ?? null
  );
}

