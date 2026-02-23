import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

// GET /api/exercises/[id] - Obtener ejercicio específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const session = await auth()
    const userId = session?.user?.id

    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        isPublished: true,
        lesson: {
          isPublished: true,
          course: {
            isPublished: true,
          },
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            course: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
          },
        },
        submissions: userId ? {
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            code: true,
            isCorrect: true,
            createdAt: true,
          },
        } : false,
      },
    })

    if (!exercise) {
      return Response.json(
        { success: false, error: "Ejercicio no encontrado" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    // Don't send solution to client
    const { solutionCode, ...exerciseWithoutSolution } = exercise

    const response = {
      ...exerciseWithoutSolution,
      lastSubmission: exercise.submissions?.[0] || null,
    }

    return Response.json({
      success: true,
      data: response,
    } satisfies ApiResponse<typeof response>)

  } catch (error) {
    console.error("Error fetching exercise:", error)
    return Response.json(
      { success: false, error: "Error al obtener el ejercicio" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
