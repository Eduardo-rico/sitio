"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Loader2, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  ISSUE_TICKET_CATEGORIES,
  ISSUE_TICKET_CATEGORY_LABELS,
  type IssueTicketSourceArea,
} from "@/lib/issue-tickets";

interface IssueReportFabProps {
  sourceArea: IssueTicketSourceArea;
}

export function IssueReportFab({ sourceArea }: IssueReportFabProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof ISSUE_TICKET_CATEGORIES)[number]>("bug");

  const sourceLabel = useMemo(
    () => (sourceArea === "admin" ? "admin" : "tutoriales"),
    [sourceArea]
  );

  async function handleSubmit() {
    if (title.trim().length < 5) {
      toast.warning("El título debe tener al menos 5 caracteres.");
      return;
    }
    if (description.trim().length < 10) {
      toast.warning("Describe el problema con un poco más de detalle.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          sourceArea,
          pageUrl: window.location.href,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "No se pudo crear el ticket.");
      }

      toast.success("Ticket enviado. Gracias por ayudarnos a mejorar.");
      setOpen(false);
      setTitle("");
      setDescription("");
      setCategory("bug");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error enviando ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="issue-report-fab"
        className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
        aria-label="Reportar problema"
      >
        <AlertCircle className="h-4 w-4" />
        Reportar
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="h-5 w-5 text-rose-600" />
            Reportar problema
          </div>
        }
        description={`Cuéntanos qué mejorar en ${sourceLabel}. El equipo de admin lo revisará.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="issue-ticket-submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar ticket"
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Categoría
            </label>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as (typeof ISSUE_TICKET_CATEGORIES)[number])
              }
              data-testid="issue-ticket-category"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {ISSUE_TICKET_CATEGORIES.map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  {ISSUE_TICKET_CATEGORY_LABELS[categoryOption]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Título
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              data-testid="issue-ticket-title"
              placeholder="Ej. El ejercicio no valida correctamente"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              data-testid="issue-ticket-description"
              rows={5}
              placeholder="Describe qué pasó, qué esperabas y cómo reproducirlo."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

export default IssueReportFab;
