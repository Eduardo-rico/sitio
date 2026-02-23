import { NextRequest } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

const validateSchema = z.object({
  code: z.string(),
  exerciseId: z.string(),
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

    const body = await request.json()
    const { code, exerciseId } = validateSchema.parse(body)

    // Get exercise with solution
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        isPublished: true,
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
    let output = ""

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

    // Save submission if user is logged in
    if (userId) {
      await prisma.codeSubmission.upsert({
        where: {
          id: `${userId}_${exerciseId}`,
        },
        update: {
          code,
          output,
          isCorrect,
          attempts: { increment: 1 },
        },
        create: {
          id: `${userId}_${exerciseId}`,
          userId,
          exerciseId: id,
          code,
          output,
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
          },
          create: {
            userId,
            lessonId,
            status: "completed",
            completedAt: new Date(),
          },
        })
      }
    }

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
