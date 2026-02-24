/**
 * Admin Courses List Page
 * Course management with search, filters, and actions
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
  BookOpen,
  Users,
  FileText,
  Filter,
  MoreVertical,
  CheckCircle,
  X,
  Loader2
} from "lucide-react";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: string;
  runtimeType: string;
  order: number;
  isPublished: boolean;
  imageUrl: string | null;
  lessonsCount: number;
  enrolledUsers: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/courses");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setCourses(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los cursos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true :
                         statusFilter === "published" ? course.isPublished :
                         !course.isPublished;
    return matchesSearch && matchesStatus;
  });

  // Toggle publish status
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      setToggleLoading(id);
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === id ? { ...course, isPublished: !currentStatus } : course
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setToggleLoading(null);
    }
  };

  // Delete course
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Remove from local state
      setCourses(prev => prev.filter(course => course.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleteLoading(null);
    }
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
          onClick={fetchCourses}
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
            Cursos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los cursos disponibles en la plataforma
          </p>
        </div>
        <Link
          href="/admin/cursos/nuevo"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Curso
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cursos..."
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
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{courses.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total cursos</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {courses.filter(c => c.isPublished).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Publicados</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {courses.reduce((acc, c) => acc + c.enrolledUsers, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios inscritos</p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {courses.length === 0 ? "No hay cursos aún" : "No se encontraron cursos"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
              {courses.length === 0 
                ? "Crea tu primer curso para comenzar a compartir conocimiento" 
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
            {courses.length === 0 && (
              <Link
                href="/admin/cursos/nuevo"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Curso
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Curso
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lecciones
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Usuarios
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {filteredCourses.map((course) => (
                    <motion.tr
                      key={course.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {course.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              /tutoriales/{course.slug}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {course.language} · {course.runtimeType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(course.id, course.isPublished)}
                          disabled={toggleLoading === course.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            course.isPublished
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                          }`}
                        >
                          {toggleLoading === course.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : course.isPublished ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Publicado
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Borrador
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <FileText className="w-4 h-4" />
                          <span>{course.lessonsCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{course.enrolledUsers}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/tutoriales/${course.slug}`}
                            target="_blank"
                            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Ver curso"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/cursos/${course.id}`}
                            className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(course.id)}
                            disabled={deleteLoading === course.id}
                            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            {deleteLoading === course.id ? (
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
      {filteredCourses.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Mostrando {filteredCourses.length} de {courses.length} cursos
        </p>
      )}
    </div>
  );
}
