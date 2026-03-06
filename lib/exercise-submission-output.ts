export interface ExerciseFeedback {
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface RubricEvaluationPayload {
  title: string;
  description: string;
  weight: number;
  score: number;
  verdict: "Excelente" | "Bien" | "Mejora";
  feedback: string;
}

export interface SubmissionOutputPayload {
  stdout?: string;
  feedback?: ExerciseFeedback;
  rubricEvaluations?: RubricEvaluationPayload[];
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
      rubricEvaluations: Array.isArray(parsed.rubricEvaluations)
        ? parsed.rubricEvaluations
            .filter(
              (item): item is RubricEvaluationPayload =>
                !!item &&
                typeof item === "object" &&
                typeof item.title === "string" &&
                typeof item.description === "string" &&
                typeof item.weight === "number" &&
                typeof item.score === "number" &&
                (item.verdict === "Excelente" ||
                  item.verdict === "Bien" ||
                  item.verdict === "Mejora") &&
                typeof item.feedback === "string"
            )
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
    rubricEvaluations: payload.rubricEvaluations,
  });
}
