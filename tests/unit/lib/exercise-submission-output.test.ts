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
});
