import { describe, expect, it } from "vitest";
import {
  ISSUE_TICKET_CATEGORIES,
  ISSUE_TICKET_CATEGORY_LABELS,
  ISSUE_TICKET_SEVERITIES,
  ISSUE_TICKET_SEVERITY_LABELS,
  ISSUE_TICKET_SOURCE_AREAS,
  ISSUE_TICKET_STATUSES,
  ISSUE_TICKET_STATUS_LABELS,
} from "@/lib/issue-tickets";

describe("issue-tickets", () => {
  it("define catálogos base esperados", () => {
    expect(ISSUE_TICKET_CATEGORIES).toEqual([
      "bug",
      "ux",
      "content",
      "performance",
      "other",
    ]);
    expect(ISSUE_TICKET_STATUSES).toContain("open");
    expect(ISSUE_TICKET_STATUSES).toContain("resolved");
    expect(ISSUE_TICKET_SEVERITIES).toContain("critical");
    expect(ISSUE_TICKET_SOURCE_AREAS).toEqual(["tutorials", "admin"]);
  });

  it("mantiene labels para cada categoría/estado/severidad", () => {
    expect(Object.keys(ISSUE_TICKET_CATEGORY_LABELS).sort()).toEqual(
      [...ISSUE_TICKET_CATEGORIES].sort()
    );
    expect(Object.keys(ISSUE_TICKET_STATUS_LABELS).sort()).toEqual(
      [...ISSUE_TICKET_STATUSES].sort()
    );
    expect(Object.keys(ISSUE_TICKET_SEVERITY_LABELS).sort()).toEqual(
      [...ISSUE_TICKET_SEVERITIES].sort()
    );
  });
});
