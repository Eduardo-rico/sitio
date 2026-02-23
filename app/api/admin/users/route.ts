import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

// GET /api/admin/users - List all users with pagination (admin only)
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

    // Parse pagination params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.user.count()

    // Fetch users with counts
    const users = await prisma.user.findMany({
      skip,
      take: limit,
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

    return Response.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    } satisfies ApiResponse<{
      users: typeof users
      pagination: {
        page: number
        limit: number
        totalCount: number
        totalPages: number
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
