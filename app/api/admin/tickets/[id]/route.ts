import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { ISSUE_TICKET_SEVERITIES, ISSUE_TICKET_STATUSES } from "@/lib/issue-tickets";

const updateTicketSchema = z.object({
  status: z.enum(ISSUE_TICKET_STATUSES).optional(),
  severity: z.enum(ISSUE_TICKET_SEVERITIES).optional(),
  adminNotes: z.string().max(5000).optional(),
});

// PATCH /api/admin/tickets/[id] - Actualizar ticket (status/severity/notas)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, error: "Body JSON inválido" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const parsed = updateTicketSchema.safeParse(body);
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
    const updatePayload: {
      status?: string;
      severity?: string;
      adminNotes?: string | null;
      resolvedAt?: Date | null;
    } = {};

    if (data.status) {
      updatePayload.status = data.status;
      updatePayload.resolvedAt = data.status === "resolved" ? new Date() : null;
    }
    if (data.severity) updatePayload.severity = data.severity;
    if (typeof data.adminNotes === "string") updatePayload.adminNotes = data.adminNotes.trim();

    const updated = await prisma.issueTicket.update({
      where: { id: params.id },
      data: updatePayload,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return Response.json({
      success: true,
      data: updated,
    } satisfies ApiResponse<typeof updated>);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return Response.json(
      { success: false, error: "Error al actualizar ticket" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
