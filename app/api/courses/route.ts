import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET /api/courses - Listar cursos públicos
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            order: true,
            estimatedMinutes: true,
            progress: userId ? {
              where: { userId },
              select: { status: true, completedAt: true },
            } : false,
          },
        },
      },
    })

    // Calculate progress stats for each course
    const coursesWithStats = courses.map((course) => {
      const totalLessons = course.lessons.length
      const completedLessons = course.lessons.filter(
        (l) => l.progress?.[0]?.status === "completed"
      ).length

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        order: course.order,
        lessonsCount: totalLessons,
        completedLessons,
        progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        lessons: course.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          order: lesson.order,
          estimatedMinutes: lesson.estimatedMinutes,
          status: lesson.progress?.[0]?.status || "not_started",
        })),
      }
    })

    return Response.json({
      success: true,
      data: coursesWithStats,
    } satisfies ApiResponse<typeof coursesWithStats>)

  } catch (error) {
    console.error("Error fetching courses:", error)
    return Response.json(
      { success: false, error: "Error al obtener los cursos" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
