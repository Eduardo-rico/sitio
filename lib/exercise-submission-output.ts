export interface ExerciseFeedback {
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SubmissionOutputPayload {
  stdout?: string;
  feedback?: ExerciseFeedback;
}

export function parseSubmissionOutput(
  rawOutput: string | null | undefined
): SubmissionOutputPayload {
  if (!rawOutput) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawOutput) as SubmissionOutputPayload;
    if (!parsed || typeof parsed !== "object") {
      return { stdout: rawOutput };
    }

    return {
      stdout: typeof parsed.stdout === "string" ? parsed.stdout : undefined,
      feedback:
        parsed.feedback &&
        typeof parsed.feedback === "object" &&
        typeof parsed.feedback.rating === "number" &&
        typeof parsed.feedback.createdAt === "string"
          ? {
              rating: parsed.feedback.rating,
              comment:
                typeof parsed.feedback.comment === "string"
                  ? parsed.feedback.comment
                  : undefined,
              createdAt: parsed.feedback.createdAt,
            }
          : undefined,
    };
  } catch {
    return { stdout: rawOutput };
  }
}

export function serializeSubmissionOutput(
  payload: SubmissionOutputPayload
): string {
  return JSON.stringify({
    stdout: payload.stdout ?? "",
    feedback: payload.feedback,
  });
}
