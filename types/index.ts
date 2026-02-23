import { User, Course, Lesson, Exercise, Progress, CodeSubmission, Subscription, InteractiveSnippet } from '@prisma/client'

export type { User, Course, Lesson, Exercise, Progress, CodeSubmission, Subscription, InteractiveSnippet }

// Extended types with relations
export type LessonWithExercises = Lesson & {
  exercises: Exercise[]
}

export type LessonWithProgress = Lesson & {
  progress: Progress[]
  exercises: { id: string }[]
}

export type CourseWithLessons = Course & {
  lessons: Lesson[]
}

export type CourseWithLessonsAndProgress = Course & {
  lessons: (Lesson & {
    progress: Progress[]
    exercises: { id: string }[]
  })[]
}

export type ExerciseWithLesson = Exercise & {
  lesson: Lesson
}

export type ProgressWithLesson = Progress & {
  lesson: Lesson
}

// API Response types
export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// Validation types
export type ValidationType = "exact" | "contains" | "regex" | "custom"

export interface TestCase {
  input?: string
  expected: string
}

// Exercise validation
export interface ExerciseValidation {
  type: ValidationType
  expected?: string
  testCases?: TestCase[]
}

// Session user extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
    }
  }
}
