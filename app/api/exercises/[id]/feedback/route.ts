import { NextRequest } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { trackLearningEvent } from "@/lib/learning-events"
import {
  parseSubmissionOutput,
  serializeSubmissionOutput,
} from "@/lib/exercise-submission-output"
import { ApiResponse } from "@/types"

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .max(400)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
})

// POST /api/exercises/[id]/feedback - Guardar feedback del ejercicio
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const session = await auth()
    const userId = session?.user?.id
    const { rating, comment } = feedbackSchema.parse(await request.json())

    // Si no hay sesión, no bloqueamos UX; simplemente no persistimos.
    if (!userId) {
      return Response.json({
        success: true,
        data: { saved: false },
      } satisfies ApiResponse<{ saved: boolean }>)
    }

    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        lesson: {
          select: {
            id: true,
            slug: true,
            courseId: true,
            course: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!exercise) {
      return Response.json(
        { success: false, error: "Ejercicio no encontrado" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    const submissionId = `${userId}_${id}`
    const existingSubmission = await prisma.codeSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        code: true,
        output: true,
        attempts: true,
        isCorrect: true,
      },
    })

    const existingPayload = parseSubmissionOutput(existingSubmission?.output)
    const output = serializeSubmissionOutput({
      stdout: existingPayload.stdout ?? "",
      feedback: {
        rating,
        comment,
        createdAt: new Date().toISOString(),
      },
    })

    await prisma.codeSubmission.upsert({
      where: {
        id: submissionId,
      },
      update: {
        output,
      },
      create: {
        id: submissionId,
        userId,
        exerciseId: id,
        code: existingSubmission?.code ?? "",
        output,
        attempts: existingSubmission?.attempts ?? 1,
        isCorrect: existingSubmission?.isCorrect ?? null,
      },
    })

    await trackLearningEvent({
      eventType: "exercise_feedback_submitted",
      userId,
      userEmail: session?.user?.email ?? undefined,
      courseId: exercise.lesson.courseId,
      courseSlug: exercise.lesson.course.slug,
      lessonId: exercise.lesson.id,
      lessonSlug: exercise.lesson.slug,
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      source: "api",
      metadata: {
        rating,
        hasComment: !!comment,
      },
    })

    return Response.json({
      success: true,
      data: { saved: true },
    } satisfies ApiResponse<{ saved: boolean }>)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: "Datos inválidos: " + error.issues[0].message } satisfies ApiResponse,
        { status: 400 }
      )
    }

    console.error("Error saving exercise feedback:", error)
    return Response.json(
      { success: false, error: "Error al guardar el feedback" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
