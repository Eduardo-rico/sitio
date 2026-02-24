"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Ticket,
} from "lucide-react";
import {
  ISSUE_TICKET_SEVERITIES,
  ISSUE_TICKET_SEVERITY_LABELS,
  ISSUE_TICKET_STATUSES,
  ISSUE_TICKET_STATUS_LABELS,
  type IssueTicketSeverity,
  type IssueTicketStatus,
} from "@/lib/issue-tickets";

interface TicketUser {
  id: string;
  email: string | null;
  name: string | null;
}

interface IssueTicketRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  status: IssueTicketStatus;
  severity: IssueTicketSeverity;
  pageUrl: string | null;
  sourceArea: "tutorials" | "admin";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  user: TicketUser | null;
}

interface TicketDraft {
  status?: IssueTicketStatus;
  severity?: IssueTicketSeverity;
  adminNotes?: string;
}

const SOURCE_AREA_LABELS: Record<IssueTicketRecord["sourceArea"], string> = {
  tutorials: "Tutoriales",
  admin: "Admin",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<IssueTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | IssueTicketStatus>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | IssueTicketSeverity>("all");
  const [sourceAreaFilter, setSourceAreaFilter] = useState<"all" | IssueTicketRecord["sourceArea"]>("all");

  const [drafts, setDrafts] = useState<Record<string, TicketDraft>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  const fetchTickets = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (sourceAreaFilter !== "all") params.set("sourceArea", sourceAreaFilter);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/admin/tickets${params.toString() ? `?${params.toString()}` : ""}`);
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "No se pudieron cargar los tickets");
      }

      setTickets(payload.data as IssueTicketRecord[]);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Error cargando tickets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, severityFilter, sourceAreaFilter, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchTickets();
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [fetchTickets]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
      resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
    };
  }, [tickets]);

  const getEffectiveValue = <K extends keyof TicketDraft>(
    ticket: IssueTicketRecord,
    key: K
  ): NonNullable<TicketDraft[K]> => {
    const draft = drafts[ticket.id];
    if (draft && typeof draft[key] !== "undefined") {
      return draft[key] as NonNullable<TicketDraft[K]>;
    }

    if (key === "status") return ticket.status as NonNullable<TicketDraft[K]>;
    if (key === "severity") return ticket.severity as NonNullable<TicketDraft[K]>;
    return (ticket.adminNotes ?? "") as NonNullable<TicketDraft[K]>;
  };

  const hasTicketChanges = (ticket: IssueTicketRecord) => {
    const draft = drafts[ticket.id];
    if (!draft) return false;

    const statusChanged = typeof draft.status !== "undefined" && draft.status !== ticket.status;
    const severityChanged = typeof draft.severity !== "undefined" && draft.severity !== ticket.severity;
    const notesChanged =
      typeof draft.adminNotes !== "undefined" &&
      draft.adminNotes.trim() !== (ticket.adminNotes ?? "").trim();

    return statusChanged || severityChanged || notesChanged;
  };

  const updateDraft = (ticketId: string, patch: TicketDraft) => {
    setDrafts((current) => ({
      ...current,
      [ticketId]: {
        ...current[ticketId],
        ...patch,
      },
    }));
  };

  const saveTicket = async (ticket: IssueTicketRecord) => {
    const draft = drafts[ticket.id];
    if (!draft) return;

    const payload: TicketDraft = {};
    if (typeof draft.status !== "undefined" && draft.status !== ticket.status) {
      payload.status = draft.status;
    }
    if (typeof draft.severity !== "undefined" && draft.severity !== ticket.severity) {
      payload.severity = draft.severity;
    }
    if (typeof draft.adminNotes !== "undefined" && draft.adminNotes.trim() !== (ticket.adminNotes ?? "").trim()) {
      payload.adminNotes = draft.adminNotes.trim();
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    try {
      setSavingIds((current) => ({ ...current, [ticket.id]: true }));

      const response = await fetch(`/api/admin/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "No se pudo actualizar el ticket");
      }

      setTickets((current) =>
        current.map((item) => (item.id === ticket.id ? (data.data as IssueTicketRecord) : item))
      );

      setDrafts((current) => {
        const next = { ...current };
        delete next[ticket.id];
        return next;
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Error guardando ticket");
    } finally {
      setSavingIds((current) => ({ ...current, [ticket.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tickets de incidencias</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Revisa reportes de usuarios y asigna severidad/estado manualmente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchTickets(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          disabled={refreshing}
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Abiertos" value={stats.open} color="text-amber-600 dark:text-amber-400" />
        <StatCard label="En progreso" value={stats.inProgress} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Resueltos" value={stats.resolved} color="text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por título, descripción o email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              data-testid="tickets-search-input"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | IssueTicketStatus)}
            data-testid="tickets-status-filter"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos los estados</option>
            {ISSUE_TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ISSUE_TICKET_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={severityFilter}
              onChange={(event) =>
                setSeverityFilter(event.target.value as "all" | IssueTicketSeverity)
              }
              data-testid="tickets-severity-filter"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="all">Severidad</option>
              {ISSUE_TICKET_SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {ISSUE_TICKET_SEVERITY_LABELS[severity]}
                </option>
              ))}
            </select>

            <select
              value={sourceAreaFilter}
              onChange={(event) =>
                setSourceAreaFilter(event.target.value as "all" | IssueTicketRecord["sourceArea"])
              }
              data-testid="tickets-source-filter"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="all">Origen</option>
              <option value="tutorials">Tutoriales</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Ticket className="mb-3 h-10 w-10 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sin tickets</h2>
            <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-400">
              No hay incidencias con los filtros actuales.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Origen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Severidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Notas admin
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tickets.map((ticket) => {
                  const isSaving = !!savingIds[ticket.id];
                  const statusValue = getEffectiveValue(ticket, "status");
                  const severityValue = getEffectiveValue(ticket, "severity");
                  const notesValue = getEffectiveValue(ticket, "adminNotes");
                  const isDirty = hasTicketChanges(ticket);

                  return (
                    <tr key={ticket.id} className="align-top">
                      <td className="max-w-[380px] px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{ticket.title}</p>
                          <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300">{ticket.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                            {ticket.pageUrl ? (
                              <a
                                href={ticket.pageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Ver página
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {ticket.user?.email || ticket.user?.name || "Usuario eliminado"}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          {SOURCE_AREA_LABELS[ticket.sourceArea]}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={statusValue}
                          onChange={(event) =>
                            updateDraft(ticket.id, { status: event.target.value as IssueTicketStatus })
                          }
                          data-testid={`ticket-status-${ticket.id}`}
                          className="w-full min-w-[130px] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        >
                          {ISSUE_TICKET_STATUSES.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {ISSUE_TICKET_STATUS_LABELS[statusOption]}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={severityValue}
                          onChange={(event) =>
                            updateDraft(ticket.id, {
                              severity: event.target.value as IssueTicketSeverity,
                            })
                          }
                          data-testid={`ticket-severity-${ticket.id}`}
                          className="w-full min-w-[130px] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        >
                          {ISSUE_TICKET_SEVERITIES.map((severityOption) => (
                            <option key={severityOption} value={severityOption}>
                              {ISSUE_TICKET_SEVERITY_LABELS[severityOption]}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="min-w-[220px] px-4 py-4">
                        <textarea
                          value={notesValue}
                          onChange={(event) =>
                            updateDraft(ticket.id, {
                              adminNotes: event.target.value,
                            })
                          }
                          data-testid={`ticket-notes-${ticket.id}`}
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                          placeholder="Notas internas para seguimiento"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => void saveTicket(ticket)}
                          disabled={!isDirty || isSaving}
                          data-testid={`ticket-save-${ticket.id}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Guardar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <p>
            Recomendación de operación: iniciar en estado <strong>triaged</strong>, asignar severidad y mover a
            <strong> in_progress</strong> cuando el fix esté en curso.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color ?? "text-gray-900 dark:text-gray-100"}`}>{value}</p>
    </div>
  );
}
