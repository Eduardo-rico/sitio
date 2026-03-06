import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import {
  getCoursePedagogyInputSchema,
  resolveCoursePedagogy,
  supportsEditableCoursePedagogy,
} from "@/lib/course-pedagogy-registry";

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

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

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        slug: true,
        language: true,
        pedagogy: true,
      },
    });

    if (!course) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    if (!supportsEditableCoursePedagogy(course.language)) {
      return Response.json(
        {
          success: false,
          error: "La pedagogia editable solo aplica a cursos Python y Clojure.",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const pedagogy = resolveCoursePedagogy(course.language, course.slug, course.pedagogy);

    return Response.json({
      success: true,
      data: pedagogy,
    } satisfies ApiResponse<typeof pedagogy>);
  } catch (error) {
    console.error("Error fetching course pedagogy:", error);
    return Response.json(
      { success: false, error: "Error al obtener la pedagogia del curso" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

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

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        slug: true,
        language: true,
      },
    });

    if (!course) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    if (!supportsEditableCoursePedagogy(course.language)) {
      return Response.json(
        {
          success: false,
          error: "La pedagogia editable solo aplica a cursos Python y Clojure.",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const schema = getCoursePedagogyInputSchema(course.language);
    if (!schema) {
      return Response.json(
        {
          success: false,
          error: "No existe schema de pedagogia para este lenguaje.",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const validation = schema.safeParse(await request.json());
    if (!validation.success) {
      return Response.json(
        {
          success: false,
          error: "Datos inválidos: " + validation.error.errors.map((error) => error.message).join(", "),
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const pedagogy = {
      ...validation.data,
      slug: course.slug,
    };

    await prisma.course.update({
      where: { id: params.id },
      data: {
        pedagogy,
      },
    });

    return Response.json({
      success: true,
      data: pedagogy,
    } satisfies ApiResponse<typeof pedagogy>);
  } catch (error) {
    console.error("Error updating course pedagogy:", error);
    return Response.json(
      { success: false, error: "Error al actualizar la pedagogia del curso" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
