import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

// GET /api/courses/[slug] - Obtener curso con sus lecciones
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const session = await auth()
    const userId = session?.user?.id

    const course = await prisma.course.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          include: {
            exercises: {
              where: { isPublished: true },
              select: { id: true },
            },
            progress: userId ? {
              where: { userId },
              select: { status: true, completedAt: true, lastAccessedAt: true },
            } : false,
          },
        },
      },
    })

    if (!course) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    // Calculate course stats
    const totalLessons = course.lessons.length
    const completedLessons = course.lessons.filter(
      (l) => l.progress?.[0]?.status === "completed"
    ).length

    const response = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      order: course.order,
      createdAt: course.createdAt,
      lessonsCount: totalLessons,
      completedLessons,
      progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      lessons: course.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        order: lesson.order,
        content: lesson.content,
        estimatedMinutes: lesson.estimatedMinutes,
        exercisesCount: lesson.exercises.length,
        progress: lesson.progress?.[0] || null,
      })),
    }

    return Response.json({
      success: true,
      data: response,
    } satisfies ApiResponse<typeof response>)

  } catch (error) {
    console.error("Error fetching course:", error)
    return Response.json(
      { success: false, error: "Error al obtener el curso" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
