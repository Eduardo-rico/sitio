/**
 * Admin Exercises API
 * CRUD operations for exercises (admin only)
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse, ValidationType } from "@/types";
import { z } from "zod";

// Test case schema
const testCaseSchema = z.object({
  input: z.string().optional(),
  expected: z.string().min(1),
  isPublic: z.boolean().default(true),
});

const rubricCriterionSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(300),
  weight: z.number().min(0).max(100),
});

// Exercise schema
const exerciseSchema = z.object({
  title: z.string().min(1).max(150),
  instructions: z.string().min(1),
  order: z.number().min(0),
  starterCode: z.string(),
  solutionCode: z.string().min(1),
  validationType: z.enum(["exact", "contains", "regex", "custom"]),
  expectedOutput: z.string().optional(),
  isPublished: z.boolean(),
  lessonId: z.string(),
  testCases: z.array(testCaseSchema).default([]),
  rubric: z.array(rubricCriterionSchema).default([]),
  hints: z.array(z.string()).default([]),
});

// Check admin access
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return false;
  }
  return true;
}

// GET /api/admin/exercises - List all exercises (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdmin())) {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    const exercises = await prisma.exercise.findMany({
      where: lessonId ? { lessonId } : undefined,
      orderBy: [
        { lesson: { course: { order: "asc" } } },
        { lesson: { order: "asc" } },
        { order: "asc" },
      ],
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              }
            }
          },
        },
        _count: {
          select: { submissions: true }
        }
      },
    });

    return Response.json({
      success: true,
      data: exercises,
    } satisfies ApiResponse<typeof exercises>);

  } catch (error) {
    console.error("Error fetching exercises:", error);
    return Response.json(
      { success: false, error: "Error al obtener los ejercicios" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/admin/exercises - Create new exercise (admin only)
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
    const validation = exerciseSchema.safeParse(body);
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
    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
    });

    if (!lesson) {
      return Response.json(
        { success: false, error: "Lección no encontrada" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        title: data.title,
        instructions: data.instructions,
        order: data.order,
        starterCode: data.starterCode,
        solutionCode: data.solutionCode,
        validationType: data.validationType,
        testCases: data.testCases as any,
        rubric: data.rubric as any,
        hints: data.hints,
        isPublished: data.isPublished,
        lessonId: data.lessonId,
      },
    });

    return Response.json({
      success: true,
      data: exercise,
    } satisfies ApiResponse<typeof exercise>);

  } catch (error) {
    console.error("Error creating exercise:", error);
    return Response.json(
      { success: false, error: "Error al crear el ejercicio" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
