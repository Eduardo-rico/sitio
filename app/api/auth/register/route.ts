import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { ApiResponse } from "@/types"

interface RegisterBody {
  email: string
  password: string
  name: string
}

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body: RegisterBody = await request.json()
    const { email, password, name } = body

    // Validate required fields
    if (!email || !password || !name) {
      return Response.json(
        { success: false, error: "Email, password, and name are required" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json(
        { success: false, error: "Invalid email format" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return Response.json(
        { success: false, error: "Password must be at least 8 characters long" } satisfies ApiResponse,
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return Response.json(
        { success: false, error: "Email already registered" } satisfies ApiResponse,
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with role="user"
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        role: "user",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // Note: Password is not stored in the User model as per current schema
    // If you need to store credentials, you'll need to add a password field to the schema
    // or use a separate Credentials model

    return Response.json(
      { 
        success: true, 
        data: { 
          message: "User registered successfully",
          user,
        } 
      } satisfies ApiResponse,
      { status: 201 }
    )

  } catch (error) {
    console.error("Error registering user:", error)
    return Response.json(
      { success: false, error: "Error registering user" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
