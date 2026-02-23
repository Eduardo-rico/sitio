import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

interface RouteParams {
  params: Promise<{ id: string }>
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

    // Soft delete: Disable user by setting role to "disabled" and clearing sensitive data
    // Note: This requires adding "disabled" as a valid role in your application
    // For now, we'll use a different approach: delete sessions to log them out
    // and optionally mark them in a way your app understands

    // Delete all sessions for this user (force logout)
    await prisma.session.deleteMany({
      where: { userId: id },
    })

    // Option 1: Mark as disabled by prepending to email (soft delete pattern)
    // This preserves referential integrity while preventing login
    const disabledEmail = `disabled:${Date.now()}:${existingUser.email}`
    
    await prisma.user.update({
      where: { id },
      data: {
        email: disabledEmail,
        name: existingUser.name ? `[Disabled] ${existingUser.name}` : "[Disabled User]",
        // Keep the original role for reference, but they can't login due to email change
      },
    })

    // Alternative: If you want hard delete (use with caution due to referential integrity)
    // await prisma.user.delete({ where: { id } })

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
