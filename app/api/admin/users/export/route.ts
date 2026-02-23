import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ApiResponse } from "@/types"

// POST /api/admin/users/export - Export users as CSV (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check if user is admin
    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      )
    }

    // Parse request body for filters
    const body = await request.json().catch(() => ({}))
    const { filters = {} } = body

    // Build where clause based on filters
    const where: any = {}
    
    // Search filter (name or email)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ]
    }
    
    // Role filter
    if (filters.role && filters.role !== "all") {
      where.role = filters.role
    }
    
    // Status filter
    if (filters.status && filters.status !== "all") {
      if (filters.status === "suspended") {
        where.email = { startsWith: "disabled:" }
      } else {
        where.NOT = { email: { startsWith: "disabled:" } }
      }
    }
    
    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo + "T23:59:59.999Z")
      }
    }

    // Fetch users with related data
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        _count: {
          select: {
            progress: true,
            codeSubmissions: true,
          },
        },
      },
    })

    // Generate CSV content
    const csvHeaders = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Email Verified",
      "Courses Enrolled",
      "Code Submissions",
      "Joined Date",
      "Last Active",
    ]

    const csvRows = users.map(user => {
      const isSuspended = user.email.startsWith("disabled:")
      const cleanEmail = isSuspended 
        ? user.email.replace(/^disabled:\d+:/, "") 
        : user.email

      return [
        user.id,
        user.name || "",
        cleanEmail,
        user.role,
        isSuspended ? "Suspended" : "Active",
        user.emailVerified ? "Yes" : "No",
        user._count.progress,
        user._count.codeSubmissions,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString(),
      ]
    })

    // Escape CSV values
    const escapeCsv = (value: string | number) => {
      const str = String(value)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // Build CSV content
    const csvContent = [
      csvHeaders.map(escapeCsv).join(","),
      ...csvRows.map(row => row.map(escapeCsv).join(",")),
    ].join("\n")

    // Return CSV as downloadable file
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error("Error exporting users:", error)
    return Response.json(
      { success: false, error: "Error al exportar los usuarios" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}

// GET /api/admin/users/export - Alternative export method via GET
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

    // Parse query params for filters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }
    
    if (role && role !== "all") {
      where.role = role
    }
    
    if (status && status !== "all") {
      if (status === "suspended") {
        where.email = { startsWith: "disabled:" }
      } else {
        where.NOT = { email: { startsWith: "disabled:" } }
      }
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z")
      }
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        _count: {
          select: {
            progress: true,
            codeSubmissions: true,
          },
        },
      },
    })

    // Generate CSV
    const csvHeaders = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Email Verified",
      "Courses Enrolled",
      "Code Submissions",
      "Joined Date",
      "Last Active",
    ]

    const csvRows = users.map(user => {
      const isSuspended = user.email.startsWith("disabled:")
      const cleanEmail = isSuspended 
        ? user.email.replace(/^disabled:\d+:/, "") 
        : user.email

      return [
        user.id,
        user.name || "",
        cleanEmail,
        user.role,
        isSuspended ? "Suspended" : "Active",
        user.emailVerified ? "Yes" : "No",
        user._count.progress,
        user._count.codeSubmissions,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString(),
      ]
    })

    const escapeCsv = (value: string | number) => {
      const str = String(value)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvContent = [
      csvHeaders.map(escapeCsv).join(","),
      ...csvRows.map(row => row.map(escapeCsv).join(",")),
    ].join("\n")

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error("Error exporting users:", error)
    return Response.json(
      { success: false, error: "Error al exportar los usuarios" } satisfies ApiResponse,
      { status: 500 }
    )
  }
}
