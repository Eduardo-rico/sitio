import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/users/[id] - Get detailed user information (admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    // Check if user is admin
    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      )
    }

    // Fetch user with detailed information
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        emailVerified: true,
        _count: {
          select: {
            progress: true,
            codeSubmissions: true,
          },
        },
      },
    })

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    // Fetch user's progress with course details
    const progressWithCourses = await prisma.progress.findMany({
      where: { userId: id },
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
    })

    // Group progress by course
    const courseMap = new Map()
    progressWithCourses.forEach(p => {
      const courseId = p.lesson.courseId
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseId,
          courseTitle: p.lesson.course.title,
          courseSlug: p.lesson.course.slug,
          completedLessons: 0,
          totalLessons: 0,
          lastAccessedAt: p.lastAccessedAt,
          enrolledAt: p.lesson.course.createdAt,
        })
      }
      const course = courseMap.get(courseId)
      course.totalLessons++
      if (p.status === "completed") {
        course.completedLessons++
      }
      if (p.lastAccessedAt > course.lastAccessedAt) {
        course.lastAccessedAt = p.lastAccessedAt
      }
    })

    // Calculate progress percentage for each course
    const courses = Array.from(courseMap.values()).map(course => ({
      ...course,
      progress: course.totalLessons > 0 
        ? Math.round((course.completedLessons / course.totalLessons) * 100) 
        : 0,
    }))

    // Fetch code submissions for stats
    const submissions = await prisma.codeSubmission.findMany({
      where: { userId: id },
      select: {
        isCorrect: true,
        createdAt: true,
      },
    })

    // Calculate stats
    const correctSubmissions = submissions.filter(s => s.isCorrect).length
    const averageScore = submissions.length > 0 
      ? Math.round((correctSubmissions / submissions.length) * 100) 
      : 0

    // Generate recent activities
    const activities = []
    
    // Add progress activities
    progressWithCourses.slice(0, 10).forEach(p => {
      activities.push({
        id: `progress-${p.id}`,
        type: p.status === "completed" ? "lesson_viewed" : "lesson_viewed",
        description: p.status === "completed" 
          ? `Completed lesson "${p.lesson.title}"` 
          : `Viewed lesson "${p.lesson.title}"`,
        timestamp: p.lastAccessedAt.toISOString(),
        metadata: { lessonId: p.lessonId, courseId: p.lesson.courseId },
      })
    })

    // Add submission activities
    submissions.slice(0, 10).forEach(s => {
      activities.push({
        id: `submission-${s.createdAt.toISOString()}`,
        type: "exercise_completed",
        description: s.isCorrect ? "Completed an exercise correctly" : "Attempted an exercise",
        timestamp: s.createdAt.toISOString(),
        metadata: { correct: s.isCorrect },
      })
    })

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Generate login history (mock data based on sessions)
    const sessions = await prisma.session.findMany({
      where: { userId: id },
      orderBy: { expires: "desc" },
      take: 10,
    })

    const loginHistory = sessions.map(s => ({
      timestamp: s.expires.toISOString(),
      ip: undefined,
      userAgent: undefined,
    }))

    // Transform user with computed fields
    const transformedUser = {
      ...user,
      isSuspended: user.email.startsWith("disabled:"),
      lastActive: user.updatedAt.toISOString(),
      stats: {
        totalCoursesEnrolled: courses.length,
        coursesCompleted: courses.filter(c => c.progress === 100).length,
        certificatesEarned: courses.filter(c => c.progress === 100).length, // Same as completed for now
        totalLessonsViewed: progressWithCourses.length,
        exercisesAttempted: submissions.length,
        exercisesCorrect: correctSubmissions,
        averageScore,
        streakDays: 0, // Would need additional tracking
        totalTimeSpentMinutes: 0, // Would need additional tracking
      },
    }

    return Response.json({
      success: true,
      data: {
        user: transformedUser,
        courses,
        activities,
        loginHistory,
      },
    } satisfies ApiResponse<{
      user: typeof transformedUser
      courses: typeof courses
      activities: typeof activities
      loginHistory: typeof loginHistory
    }>)

  } catch (error) {
    console.error("Error fetching user details:", error)
    return Response.json(
      { success: false, error: "Error al obtener los detalles del usuario" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user role (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    // Check if user is admin
    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { role } = body

    // Validate role
    if (!role || !["user", "admin"].includes(role)) {
      return Response.json(
        { success: false, error: "Invalid role. Must be 'user' or 'admin'" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    // Safety: Prevent admin from removing their own admin role
    if (id === session.user.id && role !== "admin") {
      return Response.json(
        { success: false, error: "Cannot remove your own admin role" } satisfies ApiResponse,
        { status: 403 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return Response.json(
        { success: false, error: "User not found" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
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

    return Response.json({
      success: true,
      data: updatedUser,
    } satisfies ApiResponse<typeof updatedUser>)

  } catch (error) {
    console.error("Error updating user:", error)
    return Response.json(
      { success: false, error: "Error al actualizar el usuario" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Soft delete user by disabling (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    // Check if user is admin
    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      )
    }

    // Safety: Prevent admin from deleting themselves
    if (id === session.user.id) {
      return Response.json(
        { success: false, error: "Cannot delete your own account" } satisfies ApiResponse,
        { status: 403 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return Response.json(
        { success: false, error: "User not found" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    // Soft delete: Disable user by modifying email to prevent login
    // Delete all sessions for this user (force logout)
    await prisma.session.deleteMany({
      where: { userId: id },
    })

    // Mark as disabled by prepending to email (soft delete pattern)
    const disabledEmail = `disabled:${Date.now()}:${existingUser.email}`
    
    await prisma.user.update({
      where: { id },
      data: {
        email: disabledEmail,
        name: existingUser.name ? `[Disabled] ${existingUser.name}` : "[Disabled User]",
      },
    })

    return Response.json({
      success: true,
      data: { message: "User disabled successfully" },
    } satisfies ApiResponse<{ message: string }>)

  } catch (error) {
    console.error("Error deleting user:", error)
    return Response.json(
      { success: false, error: "Error al eliminar el usuario" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
