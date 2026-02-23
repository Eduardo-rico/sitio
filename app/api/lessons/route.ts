import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET /api/lessons?courseSlug=xxx - Listar lecciones públicas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseSlug = searchParams.get("courseSlug")

    const session = await auth()
    const userId = session?.user?.id

    const whereClause: any = {
      isPublished: true,
    }

    if (courseSlug) {
      whereClause.course = {
        slug: courseSlug,
        isPublished: true,
      }
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      orderBy: [
        { course: { order: "asc" } },
        { order: "asc" },
      ],
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
          select: { id: true },
        },
        progress: userId ? {
          where: { userId },
          select: { status: true, completedAt: true },
        } : false,
      },
    })

    const formattedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      order: lesson.order,
      course: lesson.course,
      exercisesCount: lesson.exercises.length,
      estimatedMinutes: lesson.estimatedMinutes,
      progress: lesson.progress?.[0] || null,
    }))

    return Response.json({
      success: true,
      data: formattedLessons,
    } satisfies ApiResponse<typeof formattedLessons>)

  } catch (error) {
    console.error("Error fetching lessons:", error)
    return Response.json(
      { success: false, error: "Error al obtener las lecciones" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
