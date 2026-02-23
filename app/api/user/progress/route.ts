import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ProgressStats {
  coursesStarted: number
  lessonsCompleted: number
  exercisesSolved: number
  totalLessonsInProgress: number
  overallProgress: {
    completedLessons: number
    totalAvailableLessons: number
    completionPercentage: number
  }
}

// GET /api/user/progress - Get user's progress statistics
export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get all progress entries for the user with lesson info
    const userProgress = await prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            courseId: true,
          },
        },
      },
    })

    // Calculate unique courses started (any lesson with progress counts)
    const uniqueCourseIds = new Set(
      userProgress.map((p) => p.lesson.courseId)
    )
    const coursesStarted = uniqueCourseIds.size

    // Count lessons by status
    const lessonsCompleted = userProgress.filter(
      (p) => p.status === "completed"
    ).length

    const lessonsInProgress = userProgress.filter(
      (p) => p.status === "in_progress"
    ).length

    // Get exercise submissions that are correct
    const correctSubmissions = await prisma.codeSubmission.findMany({
      where: {
        userId,
        isCorrect: true,
      },
      distinct: ["exerciseId"],
      select: {
        exerciseId: true,
      },
    })
    const exercisesSolved = correctSubmissions.length

    // Get total published lessons count for overall progress calculation
    const totalPublishedLessons = await prisma.lesson.count({
      where: { isPublished: true },
    })

    // Calculate overall completion percentage
    const completionPercentage =
      totalPublishedLessons > 0
        ? Math.round((lessonsCompleted / totalPublishedLessons) * 100)
        : 0

    const stats: ProgressStats = {
      coursesStarted,
      lessonsCompleted,
      exercisesSolved,
      totalLessonsInProgress: lessonsInProgress,
      overallProgress: {
        completedLessons: lessonsCompleted,
        totalAvailableLessons: totalPublishedLessons,
        completionPercentage,
      },
    }

    return Response.json(
      { success: true, data: stats } satisfies ApiResponse,
      { status: 200 }
    )

  } catch (error) {
    console.error("Error fetching user progress:", error)
    return Response.json(
      { success: false, error: "Error fetching user progress" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
