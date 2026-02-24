export const ISSUE_TICKET_CATEGORIES = [
  "bug",
  "ux",
  "content",
  "performance",
  "other",
] as const;

export const ISSUE_TICKET_STATUSES = [
  "open",
  "triaged",
  "in_progress",
  "resolved",
  "closed",
] as const;

export const ISSUE_TICKET_SEVERITIES = [
  "untriaged",
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const ISSUE_TICKET_SOURCE_AREAS = ["tutorials", "admin"] as const;

export type IssueTicketCategory = (typeof ISSUE_TICKET_CATEGORIES)[number];
export type IssueTicketStatus = (typeof ISSUE_TICKET_STATUSES)[number];
export type IssueTicketSeverity = (typeof ISSUE_TICKET_SEVERITIES)[number];
export type IssueTicketSourceArea = (typeof ISSUE_TICKET_SOURCE_AREAS)[number];

export const ISSUE_TICKET_CATEGORY_LABELS: Record<IssueTicketCategory, string> = {
  bug: "Bug",
  ux: "UX/UI",
  content: "Contenido",
  performance: "Performance",
  other: "Otro",
};

export const ISSUE_TICKET_STATUS_LABELS: Record<IssueTicketStatus, string> = {
  open: "Abierto",
  triaged: "Triageado",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
};

export const ISSUE_TICKET_SEVERITY_LABELS: Record<IssueTicketSeverity, string> = {
  untriaged: "Sin evaluar",
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};
