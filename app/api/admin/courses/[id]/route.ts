/**
 * Admin Course Detail API
 * Get, update, delete single course (admin only)
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { z } from "zod";
import { COURSE_LANGUAGES, RUNTIME_TYPES } from "@/lib/course-runtime";

// Validation schema
const courseSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  order: z.number().min(0),
  isPublished: z.boolean(),
  language: z.enum(COURSE_LANGUAGES),
  runtimeType: z.enum(RUNTIME_TYPES),
});

// Check admin access
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return false;
  }
  return true;
}

// GET /api/admin/courses/[id] - Get course with lessons
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await checkAdmin())) {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const { id } = params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        bibliographyItems: {
          orderBy: { order: "asc" },
        },
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            order: true,
            isPublished: true,
            estimatedMinutes: true,
            _count: {
              select: { exercises: true }
            }
          }
        }
      }
    });

    if (!course) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: course,
    } satisfies ApiResponse<typeof course>);

  } catch (error) {
    console.error("Error fetching course:", error);
    return Response.json(
      { success: false, error: "Error al obtener el curso" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await checkAdmin())) {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Validate input
    const validation = courseSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { 
          success: false, 
          error: "Datos inválidos: " + validation.error.errors.map(e => e.message).join(", ")
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if course exists
    const existing = await prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // Check for duplicate slug (excluding current course)
    const duplicate = await prisma.course.findFirst({
      where: { 
        slug: data.slug,
        id: { not: id }
      },
    });

    if (duplicate) {
      return Response.json(
        { success: false, error: "Ya existe otro curso con ese slug" } satisfies ApiResponse,
        { status: 409 }
      );
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        language: data.language,
        runtimeType: data.runtimeType,
        order: data.order,
        isPublished: data.isPublished,
      },
    });

    return Response.json({
      success: true,
      data: course,
    } satisfies ApiResponse<typeof course>);

  } catch (error) {
    console.error("Error updating course:", error);
    return Response.json(
      { success: false, error: "Error al actualizar el curso" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await checkAdmin())) {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if course exists
    const existing = await prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    return Response.json({
      success: true,
      data: { message: "Curso eliminado correctamente" },
    } satisfies ApiResponse<{ message: string }>);

  } catch (error) {
    console.error("Error deleting course:", error);
    return Response.json(
      { success: false, error: "Error al eliminar el curso" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// PATCH /api/admin/courses/[id] - Toggle publish status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await checkAdmin())) {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    if (typeof body.isPublished !== "boolean") {
      return Response.json(
        { success: false, error: "isPublished es requerido" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        isPublished: body.isPublished,
      },
    });

    return Response.json({
      success: true,
      data: course,
    } satisfies ApiResponse<typeof course>);

  } catch (error) {
    console.error("Error updating course:", error);
    return Response.json(
      { success: false, error: "Error al actualizar el curso" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
