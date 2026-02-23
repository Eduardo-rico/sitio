import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { ApiResponse } from "@/types"

// GET /api/exercises?lessonId=xxx - Listar ejercicios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    if (!lessonId) {
      return Response.json(
        { success: false, error: "Se requiere lessonId" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    const exercises = await prisma.exercise.findMany({
      where: {
        lessonId,
        isPublished: true,
        lesson: {
          isPublished: true,
          course: {
            isPublished: true,
          },
        },
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        instructions: true,
        starterCode: true,
        hints: true,
        order: true,
        validationType: true,
        testCases: true,
        lessonId: true,
      },
    })

    return Response.json({
      success: true,
      data: exercises,
    } satisfies ApiResponse<typeof exercises>)

  } catch (error) {
    console.error("Error fetching exercises:", error)
    return Response.json(
      { success: false, error: "Error al obtener los ejercicios" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
