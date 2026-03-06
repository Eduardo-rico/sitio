"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, BookOpen, Clock, RefreshCw, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveEvent {
  id: string;
  eventType: string;
  userEmail: string | null;
  courseSlug: string | null;
  lessonSlug: string | null;
  exerciseTitle: string | null;
  createdAt: string;
}

interface LivePayload {
  metrics: {
    activeUsersLast5m: number;
    activeCoursesLast15m: number;
    eventsLastHour: number;
  };
  topEventTypes: Array<{
    eventType: string;
    count: number;
  }>;
  events: LiveEvent[];
}

const EMPTY_EVENTS: LiveEvent[] = [];

const EVENT_LABELS: Record<string, string> = {
  course_enrolled: "Curso iniciado",
  lesson_viewed: "Lección vista",
  lesson_active_time: "Tiempo activo en lección",
  exercise_code_run: "Código ejecutado",
  exercise_validated: "Ejercicio verificado",
  exercise_feedback_submitted: "Feedback enviado",
  hint_opened: "Pista abierta",
  solution_opened: "Solución vista",
};

function formatRelative(isoDate: string) {
  const diffSeconds = Math.max(
    1,
    Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  );

  if (diffSeconds < 60) return `${diffSeconds}s`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
  return `${Math.floor(diffSeconds / 86400)}d`;
}

export function LiveCourseMonitor() {
  const [data, setData] = useState<LivePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/admin/learning-events/live?limit=25");
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "No se pudo cargar el monitoreo en vivo");
      }

      setData(payload.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando monitoreo");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(() => {
      void fetchLiveData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const events = data?.events ?? EMPTY_EVENTS;
  const topEventTypes = data?.topEventTypes ?? [];
  const metrics = data?.metrics;

  const latestUpdatedAt = useMemo(() => {
    if (!events[0]?.createdAt) return null;
    return new Date(events[0].createdAt).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [events]);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Monitoreo en vivo de cursos
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Actualización cada 10 segundos{latestUpdatedAt ? ` · Último evento ${latestUpdatedAt}` : ""}
          </p>
        </div>
        <button
          onClick={() => fetchLiveData(true)}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
            "border border-gray-200 dark:border-gray-700",
            "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
            refreshing && "opacity-80"
          )}
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          Refrescar
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Cargando monitoreo...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs uppercase tracking-wide">
                <Users className="w-3.5 h-3.5" />
                Usuarios activos (5m)
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {metrics?.activeUsersLast5m ?? 0}
              </p>
            </div>
            <div className="rounded-lg p-3 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5" />
                Cursos activos (15m)
              </div>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                {metrics?.activeCoursesLast15m ?? 0}
              </p>
            </div>
            <div className="rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 text-xs uppercase tracking-wide">
                <Activity className="w-3.5 h-3.5" />
                Eventos (1h)
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                {metrics?.eventsLastHour ?? 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="px-4 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                Últimos eventos
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                {events.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    Aún no hay eventos registrados.
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {EVENT_LABELS[event.eventType] || event.eventType}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelative(event.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {event.userEmail || "Usuario anónimo"} · {event.courseSlug || "-"} ·{" "}
                        {event.lessonSlug || "-"} {event.exerciseTitle ? `· ${event.exerciseTitle}` : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="px-4 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                Top eventos (1h)
              </div>
              <div className="p-3 space-y-2">
                {topEventTypes.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sin datos recientes.
                  </p>
                ) : (
                  topEventTypes.map((item) => (
                    <div
                      key={item.eventType}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {EVENT_LABELS[item.eventType] || item.eventType}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
