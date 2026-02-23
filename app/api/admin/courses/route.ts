/**
 * Admin Courses API
 * CRUD operations for courses (admin only)
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { z } from "zod";

// Validation schema
const courseSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  order: z.number().min(0),
  isPublished: z.boolean(),

});

// GET /api/admin/courses - List all courses with stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const courses = await prisma.course.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { 
            lessons: true,
          }
        },
        lessons: {
          select: {
            id: true,
            progress: {
              select: {
                userId: true,
              },
              distinct: ["userId"],
            },
          },
        },
      },
    });

    // Calculate enrolled users per course
    const coursesWithStats = courses.map(course => {
      const enrolledUsers = new Set<string>();
      course.lessons.forEach(lesson => {
        lesson.progress.forEach(p => enrolledUsers.add(p.userId));
      });

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        order: course.order,
        isPublished: course.isPublished,

        lessonsCount: course._count.lessons,
        enrolledUsers: enrolledUsers.size,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });

    return Response.json({
      success: true,
      data: coursesWithStats,
    } satisfies ApiResponse<typeof coursesWithStats>);

  } catch (error) {
    console.error("Error fetching courses:", error);
    return Response.json(
      { success: false, error: "Error al obtener los cursos" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - Create new course (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

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

    // Check for duplicate slug
    const existing = await prisma.course.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return Response.json(
        { success: false, error: "Ya existe un curso con ese slug" } satisfies ApiResponse,
        { status: 409 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        order: data.order,
        isPublished: data.isPublished,

      },
    });

    return Response.json({
      success: true,
      data: course,
    } satisfies ApiResponse<typeof course>);

  } catch (error) {
    console.error("Error creating course:", error);
    return Response.json(
      { success: false, error: "Error al crear el curso" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
