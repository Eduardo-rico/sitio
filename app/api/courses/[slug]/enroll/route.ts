import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

// POST /api/courses/[slug]/enroll - Inicia curso y registra enrolamiento/progreso
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const { slug } = params

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      )
    }

    const course = await prisma.course.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        lessons: {
          where: {
            isPublished: true,
          },
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            slug: true,
            title: true,
          },
          take: 1,
        },
      },
    })

    if (!course) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    const firstLesson = course.lessons[0]
    if (!firstLesson) {
      return Response.json(
        { success: false, error: "El curso no tiene lecciones disponibles" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: firstLesson.id,
        },
      },
      update: {
        lastAccessedAt: new Date(),
      },
      create: {
        userId,
        lessonId: firstLesson.id,
        status: "in_progress",
        lastAccessedAt: new Date(),
      },
    })

    const response = {
      courseSlug: course.slug,
      lessonSlug: firstLesson.slug,
      lessonTitle: firstLesson.title,
    }

    return Response.json({
      success: true,
      data: response,
    } satisfies ApiResponse<typeof response>)
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return Response.json(
      { success: false, error: "Error al iniciar el curso" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
