/**
 * Admin Exercises List Page
 * Manage all exercises with filtering
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Code2,
  FileText,
  BookOpen,
  Filter,
  X,
  Loader2,
  CheckCircle,
  Play,
  BarChart3
} from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
  course: Course;
}

interface Exercise {
  id: string;
  title: string;
  order: number;
  isPublished: boolean;
  validationType: string;
  lesson: Lesson;
  _count: {
    submissions: number;
  };
}

export default function AdminExercisesPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/admin/exercises");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setExercises(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true :
                         statusFilter === "published" ? exercise.isPublished :
                         !exercise.isPublished;
    return matchesSearch && matchesStatus;
  });

  // Delete exercise
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este ejercicio?")) {
      return;
    }

    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/admin/exercises/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setExercises(prev => prev.filter(ex => ex.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get validation type label
  const getValidationLabel = (type: string) => {
    const labels: Record<string, string> = {
      exact: "Exacto",
      contains: "Contiene",
      regex: "Regex",
      custom: "Personalizado",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ejercicios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona todos los ejercicios de la plataforma
          </p>
        </div>
        <Link
          href="/admin/ejercicios/nuevo"
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Ejercicio
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ejercicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{exercises.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total ejercicios</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {exercises.filter(e => e.isPublished).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Publicados</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {exercises.reduce((acc, e) => acc + e._count.submissions, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Intentos totales</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {exercises.length > 0 
              ? Math.round(exercises.reduce((acc, e) => acc + e._count.submissions, 0) / exercises.length)
              : 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Promedio intentos</p>
        </div>
      </div>

      {/* Exercises Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-16">
            <Code2 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {exercises.length === 0 ? "No hay ejercicios aún" : "No se encontraron ejercicios"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {exercises.length === 0 
                ? "Crea tu primer ejercicio para que los estudiantes practiquen" 
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
            {exercises.length === 0 && (
              <Link
                href="/admin/ejercicios/nuevo"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo Ejercicio
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ejercicio
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ubicación
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Validación
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {filteredExercises.map((exercise) => (
                    <motion.tr
                      key={exercise.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Code2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {exercise.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {exercise._count.submissions} intentos
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-gray-100">
                            {exercise.lesson.course.title}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {exercise.lesson.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          <Play className="w-3 h-3" />
                          {getValidationLabel(exercise.validationType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {exercise.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <EyeOff className="w-3 h-3" />
                            Borrador
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/ejercicios/${exercise.id}`}
                            className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(exercise.id)}
                            disabled={deleteLoading === exercise.id}
                            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            {deleteLoading === exercise.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results count */}
      {filteredExercises.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Mostrando {filteredExercises.length} de {exercises.length} ejercicios
        </p>
      )}
    </div>
  );
}
