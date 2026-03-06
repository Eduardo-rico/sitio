"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2, BookOpen } from "lucide-react";

interface BibliographyItem {
  id: string;
  title: string;
  url: string;
  note: string;
  order: number;
}

interface ItemDraft {
  title: string;
  url: string;
  note: string;
  order: number;
}

const EMPTY_DRAFT: ItemDraft = {
  title: "",
  url: "",
  note: "",
  order: 0,
};

interface CourseBibliographyEditorProps {
  courseId: string;
  initialItems: BibliographyItem[];
}

function normalizeItems(items: BibliographyItem[]) {
  return [...items].sort((a, b) => (a.order === b.order ? a.title.localeCompare(b.title) : a.order - b.order));
}

export function CourseBibliographyEditor({
  courseId,
  initialItems,
}: CourseBibliographyEditorProps) {
  const [items, setItems] = useState<BibliographyItem[]>(() => normalizeItems(initialItems));
  const [newItem, setNewItem] = useState<ItemDraft>({
    ...EMPTY_DRAFT,
    order: initialItems.length,
  });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nextOrder = useMemo(() => items.length, [items.length]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleCreate = async () => {
    try {
      setCreating(true);
      setError(null);
      const response = await fetch(`/api/admin/courses/${courseId}/bibliography`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "No se pudo crear la referencia");
      }
      const created = payload.data as BibliographyItem;
      setItems((prev) => normalizeItems([...prev, created]));
      setNewItem({ ...EMPTY_DRAFT, order: nextOrder + 1 });
      showSuccess("Referencia agregada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear referencia");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (item: BibliographyItem) => {
    try {
      setSavingId(item.id);
      setError(null);
      const response = await fetch(
        `/api/admin/courses/${courseId}/bibliography/${item.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.title,
            url: item.url,
            note: item.note,
            order: item.order,
          }),
        }
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "No se pudo actualizar la referencia");
      }
      setItems((prev) => normalizeItems(prev.map((row) => (row.id === item.id ? payload.data : row))));
      showSuccess("Referencia actualizada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar referencia");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (item: BibliographyItem) => {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return;
    try {
      setDeletingId(item.id);
      setError(null);
      const response = await fetch(
        `/api/admin/courses/${courseId}/bibliography/${item.id}`,
        { method: "DELETE" }
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "No se pudo eliminar la referencia");
      }
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      showSuccess("Referencia eliminada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar referencia");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section
      data-testid="course-bibliography-editor"
      className="border-t border-gray-200 dark:border-gray-700 pt-8 space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Bibliografia del curso
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Referencias editables para los alumnos. Se valida formato de URL en backend.
        </p>
      </div>

      {error && (
        <div
          data-testid="course-bibliography-error"
          className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      )}
      {successMessage && (
        <div
          data-testid="course-bibliography-success"
          className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            data-testid={`bibliography-item-${item.id}`}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3"
          >
            <div className="grid md:grid-cols-[1fr_1fr_120px] gap-3">
              <input
                data-testid={`bibliography-item-title-${item.id}`}
                value={item.title}
                onChange={(event) =>
                  setItems((prev) =>
                    prev.map((row) =>
                      row.id === item.id ? { ...row, title: event.target.value } : row
                    )
                  )
                }
                placeholder="Titulo de la referencia"
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
              />
              <input
                data-testid={`bibliography-item-url-${item.id}`}
                value={item.url}
                onChange={(event) =>
                  setItems((prev) =>
                    prev.map((row) =>
                      row.id === item.id ? { ...row, url: event.target.value } : row
                    )
                  )
                }
                placeholder="https://..."
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
              />
              <input
                data-testid={`bibliography-item-order-${item.id}`}
                type="number"
                min={0}
                value={item.order}
                onChange={(event) =>
                  setItems((prev) =>
                    prev.map((row) =>
                      row.id === item.id ? { ...row, order: Number(event.target.value) || 0 } : row
                    )
                  )
                }
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
              />
            </div>
            <textarea
              data-testid={`bibliography-item-note-${item.id}`}
              rows={2}
              value={item.note}
              onChange={(event) =>
                setItems((prev) =>
                  prev.map((row) =>
                    row.id === item.id ? { ...row, note: event.target.value } : row
                  )
                )
              }
              placeholder="Nota breve para orientar al estudiante"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">Referencia #{index + 1}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  data-testid={`bibliography-item-delete-${item.id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 text-sm"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate(item)}
                  disabled={savingId === item.id}
                  data-testid={`bibliography-item-save-${item.id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {savingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Agregar referencia</h3>
        <div className="grid md:grid-cols-[1fr_1fr_120px] gap-3">
          <input
            data-testid="bibliography-new-title"
            value={newItem.title}
            onChange={(event) => setNewItem((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Titulo"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
          <input
            data-testid="bibliography-new-url"
            value={newItem.url}
            onChange={(event) => setNewItem((prev) => ({ ...prev, url: event.target.value }))}
            placeholder="https://..."
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
          <input
            data-testid="bibliography-new-order"
            type="number"
            min={0}
            value={newItem.order}
            onChange={(event) => setNewItem((prev) => ({ ...prev, order: Number(event.target.value) || 0 }))}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </div>
        <textarea
          data-testid="bibliography-new-note"
          rows={2}
          value={newItem.note}
          onChange={(event) => setNewItem((prev) => ({ ...prev, note: event.target.value }))}
          placeholder="Nota de apoyo"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          data-testid="bibliography-create-button"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-sm"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Agregar referencia
        </button>
      </div>
    </section>
  );
}
