import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import {
  ISSUE_TICKET_CATEGORIES,
  ISSUE_TICKET_SOURCE_AREAS,
} from "@/lib/issue-tickets";

const createTicketSchema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(10).max(4000),
  category: z.enum(ISSUE_TICKET_CATEGORIES).default("bug"),
  sourceArea: z.enum(ISSUE_TICKET_SOURCE_AREAS).default("tutorials"),
  pageUrl: z.string().url().max(500).optional(),
});

// POST /api/tickets - Crear ticket de incidencia (usuarios autenticados)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "Debes iniciar sesión para reportar un problema.",
        } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error:
            "Datos inválidos: " + parsed.error.issues.map((issue) => issue.message).join(", "),
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const data = parsed.data;

    const ticket = await prisma.issueTicket.create({
      data: {
        userId,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        sourceArea: data.sourceArea,
        pageUrl: data.pageUrl ?? null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        createdAt: true,
      },
    });

    return Response.json({
      success: true,
      data: ticket,
    } satisfies ApiResponse<typeof ticket>);
  } catch (error) {
    console.error("Error creating issue ticket:", error);
    return Response.json(
      { success: false, error: "Error al crear el ticket" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
