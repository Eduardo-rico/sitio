import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

// GET /api/admin/users - List all users with pagination, filtering, and sorting (admin only)
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"
    
    // Filter params
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Build where clause
    const where: any = {}
    
    // Search filter (name or email)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }
    
    // Role filter
    if (role && role !== "all") {
      where.role = role
    }
    
    // Status filter (suspended users have a specific flag or email prefix)
    if (status && status !== "all") {
      if (status === "suspended") {
        where.email = { startsWith: "disabled:" }
      } else {
        // Active users don't have the disabled prefix
        where.NOT = { email: { startsWith: "disabled:" } }
      }
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z")
      }
    }

    // Build order by
    const orderBy: any = {}
    if (sortBy === "progress") {
      // Progress sorting handled in-memory after fetch
      orderBy.createdAt = sortOrder
    } else if (sortBy === "lastActive") {
      // Last active sorting - use updatedAt as proxy or custom field
      orderBy.updatedAt = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where })

    // Calculate stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [activeToday, newThisWeek] = await Promise.all([
      prisma.user.count({
        where: {
          ...where,
          updatedAt: { gte: today },
        },
      }),
      prisma.user.count({
        where: {
          ...where,
          createdAt: { gte: weekAgo },
        },
      }),
    ])

    // Fetch users with counts
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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

    // Transform users to add computed fields
    const transformedUsers = users.map(user => ({
      ...user,
      isSuspended: user.email.startsWith("disabled:"),
      lastActive: user.updatedAt.toISOString(),
      stats: {
        totalCoursesEnrolled: user._count.progress,
        coursesCompleted: 0, // Will be computed from actual progress data if needed
        certificatesEarned: 0,
        totalLessonsViewed: 0,
        exercisesAttempted: user._count.codeSubmissions,
        exercisesCorrect: 0,
        averageScore: 0,
        streakDays: 0,
        totalTimeSpentMinutes: 0,
      },
    }))

    return Response.json({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        stats: {
          totalUsers: totalCount,
          activeToday,
          newThisWeek,
        },
      },
    } satisfies ApiResponse<{
      users: typeof transformedUsers
      pagination: {
        page: number
        limit: number
        totalCount: number
        totalPages: number
      }
      stats: {
        totalUsers: number
        activeToday: number
        newThisWeek: number
      }
    }>)

  } catch (error) {
    console.error("Error fetching users:", error)
    return Response.json(
      { success: false, error: "Error al obtener los usuarios" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
