import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

// GET /api/admin/stats - Get site statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check if user is admin
    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      )
    }

    // Get today's date range (start and end of day)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Run all count queries in parallel
    const [
      totalUsers,
      totalCourses,
      totalLessons,
      totalExercises,
      exercisesCompletedToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.exercise.count(),
      prisma.codeSubmission.count({
        where: {
          isCorrect: true,
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),
    ])

    // Get recent users (last 5 registered)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        image: true,
        _count: {
          select: {
            progress: true,
            codeSubmissions: true,
          },
        },
      },
    })

    // Get additional useful stats
    const [
      totalSubmissions,
      totalProgressRecords,
      publishedCourses,
      publishedLessons,
      publishedExercises,
    ] = await Promise.all([
      prisma.codeSubmission.count(),
      prisma.progress.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.lesson.count({ where: { isPublished: true } }),
      prisma.exercise.count({ where: { isPublished: true } }),
    ])

    // Calculate completion rate
    const completionRate = totalSubmissions > 0 
      ? Math.round((await prisma.codeSubmission.count({ where: { isCorrect: true } }) / totalSubmissions) * 100)
      : 0

    return Response.json({
      success: true,
      data: {
        // Core stats
        totalUsers,
        totalCourses,
        totalLessons,
        totalExercises,
        exercisesCompletedToday,
        recentUsers,
        
        // Additional stats
        totalSubmissions,
        totalProgressRecords,
        publishedCourses,
        publishedLessons,
        publishedExercises,
        completionRate,
      },
    } satisfies ApiResponse<{
      totalUsers: number
      totalCourses: number
      totalLessons: number
      totalExercises: number
      exercisesCompletedToday: number
      recentUsers: typeof recentUsers
      totalSubmissions: number
      totalProgressRecords: number
      publishedCourses: number
      publishedLessons: number
      publishedExercises: number
      completionRate: number
    }>)

  } catch (error) {
    console.error("Error fetching stats:", error)
    return Response.json(
      { success: false, error: "Error al obtener las estadísticas" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
