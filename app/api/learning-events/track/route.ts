import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  LEARNING_EVENT_TYPES,
  trackLearningEvent,
} from "@/lib/learning-events";
import { ApiResponse } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const trackEventSchema = z.object({
  eventType: z.enum(LEARNING_EVENT_TYPES),
  courseId: z.string().optional(),
  courseSlug: z.string().optional(),
  lessonId: z.string().optional(),
  lessonSlug: z.string().optional(),
  exerciseId: z.string().optional(),
  exerciseTitle: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

function normalizeMetadata(raw: Record<string, unknown> | undefined) {
  if (!raw) return {};
  const serialized = JSON.stringify(raw);
  if (serialized.length > 8000) {
    return {
      truncated: true,
      size: serialized.length,
    };
  }
  return raw;
}

// POST /api/learning-events/track - Registra evento de aprendizaje
export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, error: "Payload JSON invalido." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const payload = trackEventSchema.parse(body);
    const session = await auth();

    await trackLearningEvent({
      eventType: payload.eventType,
      userId: session?.user?.id,
      userEmail: session?.user?.email ?? undefined,
      courseId: payload.courseId,
      courseSlug: payload.courseSlug,
      lessonId: payload.lessonId,
      lessonSlug: payload.lessonSlug,
      exerciseId: payload.exerciseId,
      exerciseTitle: payload.exerciseTitle,
      source: payload.source ?? "web",
      metadata: normalizeMetadata(payload.metadata),
    });

    return Response.json({
      success: true,
      data: { tracked: true },
    } satisfies ApiResponse<{ tracked: boolean }>);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: "Datos inválidos: " + error.issues[0].message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    console.error("Error creating learning event:", error);
    return Response.json(
      { success: false, error: "Error al registrar el evento" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
