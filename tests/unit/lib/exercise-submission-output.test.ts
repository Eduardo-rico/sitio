import {
  parseSubmissionOutput,
  serializeSubmissionOutput,
} from "@/lib/exercise-submission-output";

describe("exercise submission output helpers", () => {
  it("parses a plain output string as stdout", () => {
    const payload = parseSubmissionOutput("hola mundo");
    expect(payload).toEqual({ stdout: "hola mundo" });
  });

  it("parses structured output with feedback", () => {
    const payload = parseSubmissionOutput(
      JSON.stringify({
        stdout: "resultado",
        feedback: {
          rating: 5,
          comment: "muy bueno",
          createdAt: "2026-02-24T00:00:00.000Z",
        },
      })
    );

    expect(payload.stdout).toBe("resultado");
    expect(payload.feedback?.rating).toBe(5);
    expect(payload.feedback?.comment).toBe("muy bueno");
  });

  it("omite feedback.comment invalido y acepta verdict 'Mejora'", () => {
    const payload = parseSubmissionOutput(
      JSON.stringify({
        stdout: "resultado",
        feedback: {
          rating: 3,
          comment: 42,
          createdAt: "2026-02-24T00:00:00.000Z",
        },
        rubricEvaluations: [
          {
            title: "Robustness",
            description: "Control de errores",
            weight: 0.4,
            score: 0.3,
            verdict: "Mejora",
            feedback: "Agregar validaciones",
          },
        ],
      })
    );

    expect(payload.feedback).toEqual({
      rating: 3,
      createdAt: "2026-02-24T00:00:00.000Z",
    });
    expect(payload.rubricEvaluations?.[0]?.verdict).toBe("Mejora");
  });

  it("serializes with default stdout when missing", () => {
    const serialized = serializeSubmissionOutput({
      feedback: {
        rating: 4,
        createdAt: "2026-02-24T00:00:00.000Z",
      },
    });

    expect(JSON.parse(serialized)).toEqual({
      stdout: "",
      feedback: {
        rating: 4,
        createdAt: "2026-02-24T00:00:00.000Z",
      },
    });
  });

  it("filters rubric evaluations invalidas y conserva las validas", () => {
    const payload = parseSubmissionOutput(
      JSON.stringify({
        stdout: "resultado",
        rubricEvaluations: [
          {
            title: "Correctness",
            description: "Resultado correcto",
            weight: 0.6,
            score: 1,
            verdict: "Excelente",
            feedback: "Bien resuelto",
          },
          {
            title: "Clarity",
            description: "Codigo legible",
            weight: "0.4",
            score: 0.5,
            verdict: "Bien",
            feedback: "Mejorable",
          },
        ],
      })
    );

    expect(payload.rubricEvaluations).toEqual([
      {
        title: "Correctness",
        description: "Resultado correcto",
        weight: 0.6,
        score: 1,
        verdict: "Excelente",
        feedback: "Bien resuelto",
      },
    ]);
  });

  it("trata JSON no estructurado o invalido como stdout plano", () => {
    expect(parseSubmissionOutput(JSON.stringify("texto"))).toEqual({
      stdout: JSON.stringify("texto"),
    });
    expect(parseSubmissionOutput("{invalido}")).toEqual({
      stdout: "{invalido}",
    });
    expect(parseSubmissionOutput(null)).toEqual({});
  });

  it("ignora stdout no string en payload estructurado", () => {
    const payload = parseSubmissionOutput(
      JSON.stringify({
        stdout: 123,
        feedback: {
          rating: 5,
          createdAt: "2026-02-24T00:00:00.000Z",
        },
      })
    );

    expect(payload).toEqual({
      feedback: {
        rating: 5,
        createdAt: "2026-02-24T00:00:00.000Z",
      },
    });
  });

  it("serializes rubric evaluations cuando existen", () => {
    const serialized = serializeSubmissionOutput({
      stdout: "ok",
      rubricEvaluations: [
        {
          title: "Method",
          description: "Enfoque",
          weight: 1,
          score: 0.75,
          verdict: "Bien",
          feedback: "Buen enfoque",
        },
      ],
    });

    expect(JSON.parse(serialized)).toEqual({
      stdout: "ok",
      rubricEvaluations: [
        {
          title: "Method",
          description: "Enfoque",
          weight: 1,
          score: 0.75,
          verdict: "Bien",
          feedback: "Buen enfoque",
        },
      ],
    });
  });
});
