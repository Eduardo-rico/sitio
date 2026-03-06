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

const validateSchema = z.object({
  code: z.string(),
  exerciseId: z.string().optional(),
  output: z.string().optional(),
  runtimeError: z.string().optional(),
  isCorrect: z.boolean().optional(),
  rubricEvaluations: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        weight: z.number(),
        score: z.number(),
        verdict: z.enum(["Excelente", "Bien", "Mejora"]),
        feedback: z.string(),
      })
    )
    .optional(),
})

function normalizeTestCases(raw: unknown): Array<{ expected?: string; pattern?: string }> {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as Array<{ expected?: string; pattern?: string }>
  if (typeof raw === "object") return [raw as { expected?: string; pattern?: string }]
  return []
}

// POST /api/exercises/[id]/validate - Validar solución de usuario
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const session = await auth()
    const userId = session?.user?.id

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { success: false, error: "Payload JSON invalido." } satisfies ApiResponse,
        { status: 400 }
      )
    }
    const {
      code,
      output: rawOutput,
      runtimeError,
      isCorrect: clientIsCorrect,
      rubricEvaluations,
    } =
      validateSchema.parse(body)

    // Get exercise with solution
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        isPublished: true,
      },
      include: {
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

    // Validate code based on validation type
    let isCorrect = false
    let feedback = ""
    const output = rawOutput ?? ""

    if (typeof clientIsCorrect === "boolean") {
      isCorrect = clientIsCorrect
      if (!isCorrect) {
        feedback = runtimeError
          ? `Tu código tiene un error: ${runtimeError}`
          : "Tu solución no pasó todos los tests."
      }
    } else {
      switch (exercise.validationType) {
        case "exact":
          // Normalize whitespace and compare
          const normalizedCode = code.trim().replace(/\s+/g, " ")
          const normalizedSolution = exercise.solutionCode.trim().replace(/\s+/g, " ")
          isCorrect = normalizedCode === normalizedSolution
          if (!isCorrect) {
            feedback = "El código no coincide exactamente con la solución esperada."
          }
          break

        case "contains":
          // Check if code contains expected output or specific patterns
          const testCases = normalizeTestCases(exercise.testCases)
          if (testCases.length > 0) {
            isCorrect = testCases.every((tc) =>
              typeof tc.expected === "string" ? code.includes(tc.expected) : true
            )
            if (!isCorrect) {
              feedback = "Tu código no contiene todos los elementos requeridos."
            }
          } else {
            isCorrect = code.trim() === exercise.solutionCode.trim()
          }
          break

        case "regex":
          // Validate with regex patterns
          const patterns = normalizeTestCases(exercise.testCases)
          if (patterns.length > 0) {
            isCorrect = patterns.every((p) =>
              typeof p.pattern === "string" ? new RegExp(p.pattern, "i").test(code) : true
            )
            if (!isCorrect) {
              feedback = "Tu código no cumple con el patrón requerido."
            }
          }
          break

        case "custom":
          // For custom validation, we'll mark it as correct for now
          // The actual validation should be done client-side with Pyodide
          // and this endpoint just records the result
          isCorrect = true
          break

        default:
          isCorrect = code.trim() === exercise.solutionCode.trim()
      }
    }

    // Save submission if user is logged in
    if (userId) {
      const submissionId = `${userId}_${id}`
      const existingSubmission = await prisma.codeSubmission.findUnique({
        where: { id: submissionId },
        select: { output: true },
      })
      const previousPayload = parseSubmissionOutput(existingSubmission?.output)
      const serializedOutput = serializeSubmissionOutput({
        stdout: output,
        feedback: previousPayload.feedback,
        rubricEvaluations: rubricEvaluations ?? previousPayload.rubricEvaluations,
      })

      await prisma.codeSubmission.upsert({
        where: {
          id: submissionId,
        },
        update: {
          code,
          output: serializedOutput,
          error: runtimeError ?? null,
          isCorrect,
          attempts: { increment: 1 },
        },
        create: {
          id: submissionId,
          userId,
          exerciseId: id,
          code,
          output: serializedOutput,
          error: runtimeError ?? null,
          isCorrect,
          attempts: 1,
        },
      })

      // If correct, update lesson progress
      if (isCorrect) {
        const lessonId = exercise.lessonId
        await prisma.progress.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },
          update: {
            status: "completed",
            completedAt: new Date(),
            lastAccessedAt: new Date(),
          },
          create: {
            userId,
            lessonId,
            status: "completed",
            completedAt: new Date(),
            lastAccessedAt: new Date(),
          },
        })
      }
    }

    await trackLearningEvent({
      eventType: "exercise_validated",
      userId: userId ?? undefined,
      userEmail: session?.user?.email ?? undefined,
      courseId: exercise.lesson.courseId,
      courseSlug: exercise.lesson.course.slug,
      lessonId: exercise.lesson.id,
      lessonSlug: exercise.lesson.slug,
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      source: "api",
      metadata: {
        isCorrect,
        hasRuntimeError: !!runtimeError,
        outputLength: output.length,
        codeLength: code.length,
        validationType: exercise.validationType,
        rubricCriteriaEvaluated: rubricEvaluations?.length ?? 0,
      },
    })

    const response = {
      isCorrect,
      output,
      feedback: isCorrect ? "¡Correcto! Has completado el ejercicio." : feedback,
    }

    return Response.json({
      success: true,
      data: response,
    } satisfies ApiResponse<typeof response>)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: "Datos inválidos: " + error.issues[0].message } satisfies ApiResponse,
        { status: 400 }
      )
    }

    console.error("Error validating exercise:", error)
    return Response.json(
      { success: false, error: "Error al validar el ejercicio" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
