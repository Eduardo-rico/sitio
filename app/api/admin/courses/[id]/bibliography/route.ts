import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";

const bibliographyItemSchema = z.object({
  title: z.string().trim().min(1).max(180),
  url: z
    .string()
    .trim()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), {
      message: "La URL debe iniciar con http:// o https://",
    }),
  note: z.string().trim().min(1).max(1200),
  order: z.number().int().min(0).default(0),
});

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
      select: { id: true },
    });

    if (!course) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const items = await prisma.courseBibliographyItem.findMany({
      where: { courseId: params.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return Response.json({
      success: true,
      data: items,
    } satisfies ApiResponse<typeof items>);
  } catch (error) {
    console.error("Error fetching bibliography items:", error);
    return Response.json(
      { success: false, error: "Error al obtener la bibliografia" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(
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
      select: { id: true },
    });

    if (!course) {
      return Response.json(
        { success: false, error: "Curso no encontrado" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const validation = bibliographyItemSchema.safeParse(await request.json());
    if (!validation.success) {
      return Response.json(
        {
          success: false,
          error: "Datos inválidos: " + validation.error.errors.map((e) => e.message).join(", "),
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const item = await prisma.courseBibliographyItem.create({
      data: {
        ...validation.data,
        courseId: params.id,
      },
    });

    return Response.json({
      success: true,
      data: item,
    } satisfies ApiResponse<typeof item>);
  } catch (error) {
    console.error("Error creating bibliography item:", error);
    return Response.json(
      { success: false, error: "Error al crear la referencia" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
