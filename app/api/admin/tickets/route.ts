import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import {
  ISSUE_TICKET_SEVERITIES,
  ISSUE_TICKET_SOURCE_AREAS,
  ISSUE_TICKET_STATUSES,
} from "@/lib/issue-tickets";

const listQuerySchema = z.object({
  status: z.enum(ISSUE_TICKET_STATUSES).optional(),
  severity: z.enum(ISSUE_TICKET_SEVERITIES).optional(),
  sourceArea: z.enum(ISSUE_TICKET_SOURCE_AREAS).optional(),
  search: z.string().max(200).optional(),
});

// GET /api/admin/tickets - Listado de tickets para admin
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = listQuerySchema.safeParse({
      status: searchParams.get("status") || undefined,
      severity: searchParams.get("severity") || undefined,
      sourceArea: searchParams.get("sourceArea") || undefined,
      search: searchParams.get("search") || undefined,
    });

    if (!query.success) {
      return Response.json(
        {
          success: false,
          error:
            "Query inválida: " + query.error.issues.map((issue) => issue.message).join(", "),
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { status, severity, sourceArea, search } = query.data;

    const tickets = await prisma.issueTicket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(severity ? { severity } : {}),
        ...(sourceArea ? { sourceArea } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { user: { email: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      take: 300,
    });

    return Response.json({
      success: true,
      data: tickets,
    } satisfies ApiResponse<typeof tickets>);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return Response.json(
      { success: false, error: "Error al obtener tickets" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
