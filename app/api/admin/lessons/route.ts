/**
 * Admin Lessons API
 * CRUD operations for lessons (admin only)
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
  courseId: z.string(),
});

// Check admin access
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return false;
  }
  return true;
}

// GET /api/admin/lessons - List all lessons (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdmin())) {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const lessons = await prisma.lesson.findMany({
      where: courseId ? { courseId } : undefined,
      orderBy: [
        { course: { order: "asc" } },
        { order: "asc" },
      ],
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: { exercises: true }
        }
      },
    });

    return Response.json({
      success: true,
      data: lessons,
    } satisfies ApiResponse<typeof lessons>);

  } catch (error) {
    console.error("Error fetching lessons:", error);
    return Response.json(
      { success: false, error: "Error al obtener las lecciones" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/admin/lessons - Create new lesson (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdmin())) {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

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

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // Check for duplicate slug within course
    const existing = await prisma.lesson.findFirst({
      where: { 
        slug: data.slug,
        courseId: data.courseId
      },
    });

    if (existing) {
      return Response.json(
        { success: false, error: "Ya existe una lección con ese slug en este curso" } satisfies ApiResponse,
        { status: 409 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        order: data.order,
        estimatedMinutes: data.estimatedMinutes,
        isPublished: data.isPublished,
        courseId: data.courseId,
      },
    });

    return Response.json({
      success: true,
      data: lesson,
    } satisfies ApiResponse<typeof lesson>);

  } catch (error) {
    console.error("Error creating lesson:", error);
    return Response.json(
      { success: false, error: "Error al crear la lección" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
