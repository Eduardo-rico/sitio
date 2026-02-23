/**
 * Admin Lesson Detail API
 * Get, update, delete single lesson (admin only)
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { z } from "zod";

// Validation schema
const lessonSchema = z.object({
  title: z.string().min(1).max(150),
  slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  order: z.number().min(0),
  estimatedMinutes: z.number().min(1).max(300),
  isPublished: z.boolean(),
});

// Check admin access
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return false;
  }
  return true;
}

// GET /api/admin/lessons/[id] - Get lesson with exercises
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

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        exercises: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            isPublished: true,
            validationType: true,
            _count: {
              select: { submissions: true }
            }
          }
        }
      }
    });

    if (!lesson) {
      return Response.json(
        { success: false, error: "Lección no encontrada" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: lesson,
    } satisfies ApiResponse<typeof lesson>);

  } catch (error) {
    console.error("Error fetching lesson:", error);
    return Response.json(
      { success: false, error: "Error al obtener la lección" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// PUT /api/admin/lessons/[id] - Update lesson
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
    const validation = lessonSchema.safeParse(body);
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

    // Check if lesson exists
    const existing = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json(
        { success: false, error: "Lección no encontrada" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // Check for duplicate slug within course
    const duplicate = await prisma.lesson.findFirst({
      where: { 
        slug: data.slug,
        courseId: existing.courseId,
        id: { not: id }
      },
    });

    if (duplicate) {
      return Response.json(
        { success: false, error: "Ya existe otra lección con ese slug en este curso" } satisfies ApiResponse,
        { status: 409 }
      );
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        order: data.order,
        estimatedMinutes: data.estimatedMinutes,
        isPublished: data.isPublished,
      },
    });

    return Response.json({
      success: true,
      data: lesson,
    } satisfies ApiResponse<typeof lesson>);

  } catch (error) {
    console.error("Error updating lesson:", error);
    return Response.json(
      { success: false, error: "Error al actualizar la lección" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// PATCH /api/admin/lessons/[id] - Update lesson order
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

    if (typeof body.order !== "number") {
      return Response.json(
        { success: false, error: "order es requerido" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        order: body.order,
      },
    });

    return Response.json({
      success: true,
      data: lesson,
    } satisfies ApiResponse<typeof lesson>);

  } catch (error) {
    console.error("Error updating lesson order:", error);
    return Response.json(
      { success: false, error: "Error al actualizar el orden" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE /api/admin/lessons/[id] - Delete lesson
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

    // Check if lesson exists
    const existing = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json(
        { success: false, error: "Lección no encontrada" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    await prisma.lesson.delete({
      where: { id },
    });

    return Response.json({
      success: true,
      data: { message: "Lección eliminada correctamente" },
    } satisfies ApiResponse<{ message: string }>);

  } catch (error) {
    console.error("Error deleting lesson:", error);
    return Response.json(
      { success: false, error: "Error al eliminar la lección" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
