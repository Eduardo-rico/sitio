/**
 * Admin Exercise Detail API
 * Get, update, delete single exercise (admin only)
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { z } from "zod";

// Test case schema
const testCaseSchema = z.object({
  input: z.string().optional(),
  expected: z.string().min(1),
  isPublic: z.boolean().default(true),
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
  testCases: z.array(testCaseSchema).default([]),
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

// GET /api/admin/exercises/[id] - Get exercise with details
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

    const exercise = await prisma.exercise.findUnique({
      where: { id },
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
      }
    });

    if (!exercise) {
      return Response.json(
        { success: false, error: "Ejercicio no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: exercise,
    } satisfies ApiResponse<typeof exercise>);

  } catch (error) {
    console.error("Error fetching exercise:", error);
    return Response.json(
      { success: false, error: "Error al obtener el ejercicio" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// PUT /api/admin/exercises/[id] - Update exercise
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

    // Check if exercise exists
    const existing = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json(
        { success: false, error: "Ejercicio no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        title: data.title,
        instructions: data.instructions,
        order: data.order,
        starterCode: data.starterCode,
        solutionCode: data.solutionCode,
        validationType: data.validationType,
        testCases: data.testCases as any,
        hints: data.hints,
        isPublished: data.isPublished,
      },
    });

    return Response.json({
      success: true,
      data: exercise,
    } satisfies ApiResponse<typeof exercise>);

  } catch (error) {
    console.error("Error updating exercise:", error);
    return Response.json(
      { success: false, error: "Error al actualizar el ejercicio" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// PATCH /api/admin/exercises/[id] - Update exercise order
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

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        order: body.order,
      },
    });

    return Response.json({
      success: true,
      data: exercise,
    } satisfies ApiResponse<typeof exercise>);

  } catch (error) {
    console.error("Error updating exercise order:", error);
    return Response.json(
      { success: false, error: "Error al actualizar el orden" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE /api/admin/exercises/[id] - Delete exercise
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

    // Check if exercise exists
    const existing = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json(
        { success: false, error: "Ejercicio no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    await prisma.exercise.delete({
      where: { id },
    });

    return Response.json({
      success: true,
      data: { message: "Ejercicio eliminado correctamente" },
    } satisfies ApiResponse<{ message: string }>);

  } catch (error) {
    console.error("Error deleting exercise:", error);
    return Response.json(
      { success: false, error: "Error al eliminar el ejercicio" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
