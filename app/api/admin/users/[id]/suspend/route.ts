import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/admin/users/[id]/suspend - Suspend or reactivate user account (admin only)
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Safety: Prevent admin from suspending themselves
    if (id === session.user.id) {
      return Response.json(
        { success: false, error: "Cannot suspend your own account" } satisfies ApiResponse,
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { suspended } = body

    if (typeof suspended !== "boolean") {
      return Response.json(
        { success: false, error: "Invalid request. 'suspended' must be a boolean" } satisfies ApiResponse,
        { status: 400 }
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

    const isCurrentlySuspended = existingUser.email.startsWith("disabled:")

    if (suspended) {
      // Suspend user
      if (isCurrentlySuspended) {
        return Response.json(
          { success: false, error: "User is already suspended" } satisfies ApiResponse,
          { status: 400 }
        )
      }

      // Delete all sessions (force logout)
      await prisma.session.deleteMany({
        where: { userId: id },
      })

      // Mark as suspended by prepending to email
      const suspendedEmail = `disabled:${Date.now()}:${existingUser.email}`
      
      await prisma.user.update({
        where: { id },
        data: {
          email: suspendedEmail,
          name: existingUser.name ? `[Suspended] ${existingUser.name}` : "[Suspended User]",
        },
      })

      return Response.json({
        success: true,
        data: { message: "User suspended successfully" },
      } satisfies ApiResponse<{ message: string }>)

    } else {
      // Reactivate user
      if (!isCurrentlySuspended) {
        return Response.json(
          { success: false, error: "User is not suspended" } satisfies ApiResponse,
          { status: 400 }
        )
      }

      // Restore original email by removing the disabled:timestamp: prefix
      const originalEmail = existingUser.email.replace(/^disabled:\d+:/, "")
      const originalName = existingUser.name?.replace(/^\[Suspended\]\s*/, "") || null

      await prisma.user.update({
        where: { id },
        data: {
          email: originalEmail,
          name: originalName,
        },
      })

      return Response.json({
        success: true,
        data: { message: "User reactivated successfully" },
      } satisfies ApiResponse<{ message: string }>)
    }

  } catch (error) {
    console.error("Error suspending/reactivating user:", error)
    return Response.json(
      { success: false, error: "Error al actualizar el estado del usuario" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}

// GET /api/admin/users/[id]/suspend - Check user suspension status (admin only)
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    const isSuspended = user.email.startsWith("disabled:")

    return Response.json({
      success: true,
      data: {
        userId: user.id,
        isSuspended,
        email: isSuspended ? user.email.replace(/^disabled:\d+:/, "") : user.email,
      },
    } satisfies ApiResponse<{
      userId: string
      isSuspended: boolean
      email: string
    }>)

  } catch (error) {
    console.error("Error checking user suspension status:", error)
    return Response.json(
      { success: false, error: "Error al verificar el estado del usuario" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
