import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const LEARNING_EVENT_TYPES = [
  "course_enrolled",
  "lesson_viewed",
  "lesson_active_time",
  "exercise_code_run",
  "exercise_validated",
  "exercise_feedback_submitted",
  "hint_opened",
  "solution_opened",
] as const;

export type LearningEventType = (typeof LEARNING_EVENT_TYPES)[number];

export interface LearningEventInput {
  eventType: LearningEventType;
  userId?: string | null;
  userEmail?: string | null;
  courseId?: string | null;
  courseSlug?: string | null;
  lessonId?: string | null;
  lessonSlug?: string | null;
  exerciseId?: string | null;
  exerciseTitle?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
}

export async function trackLearningEvent(input: LearningEventInput) {
  try {
    await prisma.learningEvent.create({
      data: {
        eventType: input.eventType,
        userId: input.userId ?? null,
        userEmail: input.userEmail ?? null,
        courseId: input.courseId ?? null,
        courseSlug: input.courseSlug ?? null,
        lessonId: input.lessonId ?? null,
        lessonSlug: input.lessonSlug ?? null,
        exerciseId: input.exerciseId ?? null,
        exerciseTitle: input.exerciseTitle ?? null,
        source: input.source ?? "web",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    // No interrumpir experiencia de usuario por fallas de tracking.
    console.error("Error tracking learning event:", error);
  }
}
