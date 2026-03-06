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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    if (!(await checkAdmin())) {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
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

    const existing = await prisma.courseBibliographyItem.findUnique({
      where: { id: params.itemId },
      select: { id: true, courseId: true },
    });

    if (!existing || existing.courseId !== params.id) {
      return Response.json(
        { success: false, error: "Referencia no encontrada" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const item = await prisma.courseBibliographyItem.update({
      where: { id: params.itemId },
      data: validation.data,
    });

    return Response.json({
      success: true,
      data: item,
    } satisfies ApiResponse<typeof item>);
  } catch (error) {
    console.error("Error updating bibliography item:", error);
    return Response.json(
      { success: false, error: "Error al actualizar la referencia" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    if (!(await checkAdmin())) {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const existing = await prisma.courseBibliographyItem.findUnique({
      where: { id: params.itemId },
      select: { id: true, courseId: true },
    });

    if (!existing || existing.courseId !== params.id) {
      return Response.json(
        { success: false, error: "Referencia no encontrada" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    await prisma.courseBibliographyItem.delete({
      where: { id: params.itemId },
    });

    return Response.json({
      success: true,
      data: { message: "Referencia eliminada" },
    } satisfies ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("Error deleting bibliography item:", error);
    return Response.json(
      { success: false, error: "Error al eliminar la referencia" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
