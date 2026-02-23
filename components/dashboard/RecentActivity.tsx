"use client";

import Link from "next/link";
import {
  BookOpen,
  Code,
  Clock,
  ChevronRight,
  Activity,
  CheckCircle,
  Play,
  RotateCcw,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "lesson" | "exercise";
  title: string;
  courseTitle: string;
  timestamp: string;
  status: string;
}

interface RecentActivityProps {
  activity: ActivityItem[];
}

// Mock data for demonstration when no activity is provided
const mockActivity: ActivityItem[] = [
  {
    id: "1",
    type: "lesson",
    title: "Introducción a React",
    courseTitle: "React Fundamentals",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: "completed",
  },
  {
    id: "2",
    type: "exercise",
    title: "Componente de Contador",
    courseTitle: "React Fundamentals",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: "completed",
  },
  {
    id: "3",
    type: "lesson",
    title: "Estado y Props",
    courseTitle: "React Fundamentals",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: "in_progress",
  },
];

export function RecentActivity({ activity }: RecentActivityProps) {
  // Use mock data if no activity is provided, limited to 5 items
  const displayActivity = activity.length > 0 ? activity.slice(0, 5) : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividad Reciente
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {displayActivity.length > 0 ? (
          <div className="space-y-4">
            {displayActivity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const isLesson = item.type === "lesson";
  const isCompleted = item.status === "completed";

  // Format timestamp
  const timestamp = formatTimestamp(item.timestamp);

  return (
    <div className="flex items-start gap-3 group">
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
          isLesson
            ? isCompleted
              ? "bg-green-50 dark:bg-green-900/20"
              : "bg-blue-50 dark:bg-blue-900/20"
            : "bg-purple-50 dark:bg-purple-900/20"
        }`}
      >
        {isLesson ? (
          isCompleted ? (
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )
        ) : (
          <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {isLesson ? "Lección: " : "Ejercicio: "}
          {item.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {item.courseTitle}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
            <Clock className="w-3 h-3" />
            {timestamp}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              isCompleted
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
          >
            {isCompleted ? "Completado" : "En progreso"}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
        <RotateCcw className="w-6 h-6 text-gray-400" />
      </div>
      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
        Sin actividad reciente
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Tu actividad aparecerá aquí cuando comiences a aprender
      </p>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "Hace un momento";
  } else if (diffMins < 60) {
    return `Hace ${diffMins} min${diffMins === 1 ? "" : "s"}`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours === 1 ? "" : "s"}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} día${diffDays === 1 ? "" : "s"}`;
  } else {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  }
}
