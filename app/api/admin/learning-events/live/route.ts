import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/learning-events/live - Monitoreo de eventos en tiempo casi real
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
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 30), 5), 100);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const [events, eventsLastHour, activeUsersRecent, activeCoursesRecent, topEventTypes] =
      await Promise.all([
        prisma.learningEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
        }),
        prisma.learningEvent.count({
          where: {
            createdAt: { gte: oneHourAgo },
          },
        }),
        prisma.learningEvent.findMany({
          where: {
            createdAt: { gte: fiveMinutesAgo },
            userId: { not: null },
          },
          distinct: ["userId"],
          select: {
            userId: true,
          },
        }),
        prisma.learningEvent.findMany({
          where: {
            createdAt: { gte: fifteenMinutesAgo },
            courseSlug: { not: null },
          },
          distinct: ["courseSlug"],
          select: {
            courseSlug: true,
          },
        }),
        prisma.learningEvent.groupBy({
          by: ["eventType"],
          where: {
            createdAt: { gte: oneHourAgo },
          },
          _count: {
            eventType: true,
          },
          orderBy: {
            _count: {
              eventType: "desc",
            },
          },
          take: 5,
        }),
      ]);

    const response = {
      metrics: {
        activeUsersLast5m: activeUsersRecent.length,
        activeCoursesLast15m: activeCoursesRecent.length,
        eventsLastHour,
      },
      topEventTypes: topEventTypes.map((item) => ({
        eventType: item.eventType,
        count: item._count.eventType,
      })),
      events: events.map((event) => ({
        id: event.id,
        eventType: event.eventType,
        userId: event.userId,
        userEmail: event.userEmail,
        courseSlug: event.courseSlug,
        lessonSlug: event.lessonSlug,
        exerciseId: event.exerciseId,
        exerciseTitle: event.exerciseTitle,
        source: event.source,
        metadata: event.metadata,
        createdAt: event.createdAt,
      })),
    };

    return Response.json({
      success: true,
      data: response,
    } satisfies ApiResponse<typeof response>);
  } catch (error) {
    console.error("Error fetching live learning events:", error);
    return Response.json(
      { success: false, error: "Error al obtener eventos en vivo" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
