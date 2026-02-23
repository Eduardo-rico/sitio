import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface UpdateProfileBody {
  name?: string
  image?: string
}

// GET /api/user/profile - Get current user profile
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

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    return Response.json(
      { success: true, data: user } satisfies ApiResponse,
      { status: 200 }
    )

  } catch (error) {
    console.error("Error fetching user profile:", error)
    return Response.json(
      { success: false, error: "Error fetching user profile" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Update user profile (name and image only)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      )
    }

    const body: UpdateProfileBody = await request.json()
    const { name, image } = body

    // Validate that at least one field is provided
    if (name === undefined && image === undefined) {
      return Response.json(
        { success: false, error: "At least one field (name or image) must be provided" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    // Validate name if provided
    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return Response.json(
        { success: false, error: "Name must be a non-empty string" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    // Validate image URL if provided
    if (image !== undefined && image !== null) {
      try {
        new URL(image)
      } catch {
        return Response.json(
          { success: false, error: "Image must be a valid URL or null" } satisfies ApiResponse,
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(image !== undefined && { image }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return Response.json(
      { success: true, data: updatedUser } satisfies ApiResponse,
      { status: 200 }
    )

  } catch (error) {
    console.error("Error updating user profile:", error)
    return Response.json(
      { success: false, error: "Error updating user profile" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
