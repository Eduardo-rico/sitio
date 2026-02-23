import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hashPassword, verifyPassword } from "@/lib/password"
import { ApiResponse } from "@/types"

interface ChangePasswordBody {
  currentPassword: string
  newPassword: string
}

// POST /api/user/change-password - Change user password (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      )
    }

    const body: ChangePasswordBody = await request.json()
    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return Response.json(
        { success: false, error: "Current password and new password are required" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return Response.json(
        { success: false, error: "New password must be at least 8 characters long" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" } satisfies ApiResponse,
        { status: 404 }
      )
    }

    // Note: The current User model doesn't have a password field
    // This endpoint assumes you have added a password field to the User model
    // or are using a separate credentials table
    // For now, we return an error indicating the feature is not fully configured
    
    // If you have a password field, uncomment the following:
    /*
    // Verify current password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    })

    if (!userWithPassword?.password) {
      return Response.json(
        { success: false, error: "User has no password set" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    const isValidPassword = await verifyPassword(currentPassword, userWithPassword.password)

    if (!isValidPassword) {
      return Response.json(
        { success: false, error: "Current password is incorrect" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    // Hash new password and update user
    const hashedNewPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    })
    */

    return Response.json(
      { 
        success: false, 
        error: "Password change requires a password field in the User model. Please update your Prisma schema." 
      } satisfies ApiResponse,
      { status: 501 }
    )

  } catch (error) {
    console.error("Error changing password:", error)
    return Response.json(
      { success: false, error: "Error changing password" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
