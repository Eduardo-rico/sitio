import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

// GET /api/lessons/[id] - Obtener lección específica con ejercicios
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const session = await auth()
    const userId = session?.user?.id

    const lesson = await prisma.lesson.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        isPublished: true,
        course: {
          isPublished: true,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        exercises: {
          where: { isPublished: true },
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
          },
        },
        progress: userId ? {
          where: { userId },
          select: { status: true, completedAt: true, lastAccessedAt: true },
        } : false,
      },
    })

    if (!lesson) {
      return Response.json(
        { success: false, error: "Lección no encontrada" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    // Update last accessed if user is logged in
    if (userId) {
      await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: lesson.id,
          },
        },
        update: {
          lastAccessedAt: new Date(),
        },
        create: {
          userId,
          lessonId: lesson.id,
          status: "in_progress",
        },
      })
    }

    const response = {
      ...lesson,
      progress: lesson.progress?.[0] || null,
    }

    return Response.json({
      success: true,
      data: response,
    } satisfies ApiResponse<typeof response>)

  } catch (error) {
    console.error("Error fetching lesson:", error)
    return Response.json(
      { success: false, error: "Error al obtener la lección" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
