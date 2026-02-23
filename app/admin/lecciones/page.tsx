/**
 * Admin Lessons List Page
 * Manage all lessons with filtering by course
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
  FileText,
  Clock,
  BookOpen,
  Filter,
  X,
  Loader2,
  CheckCircle,
  MoreVertical
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
  isPublished: boolean;
  estimatedMinutes: number;
  course: Course;
  _count: {
    exercises: number;
  };
}

export default function AdminLessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [lessonsRes, coursesRes] = await Promise.all([
        fetch("/api/admin/lessons"),
        fetch("/api/admin/courses"),
      ]);

      const lessonsData = await lessonsRes.json();
      const coursesData = await coursesRes.json();

      if (!lessonsData.success) throw new Error(lessonsData.error);
      if (!coursesData.success) throw new Error(coursesData.error);

      setLessons(lessonsData.data);
      setCourses(coursesData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "all" ? true : lesson.course.id === courseFilter;
    const matchesStatus = statusFilter === "all" ? true :
                         statusFilter === "published" ? lesson.isPublished :
                         !lesson.isPublished;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Delete lesson
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta lección?")) {
      return;
    }

    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setLessons(prev => prev.filter(lesson => lesson.id !== id));
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
            Lecciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona todas las lecciones de la plataforma
          </p>
        </div>
        <Link
          href="/admin/lecciones/nueva"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Lección
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar lecciones..."
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
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los cursos</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="published">Publicadas</option>
            <option value="draft">Borradores</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lessons.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total lecciones</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {lessons.filter(l => l.isPublished).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Publicadas</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {lessons.reduce((acc, l) => acc + l._count.exercises, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ejercicios</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(lessons.reduce((acc, l) => acc + l.estimatedMinutes, 0) / 60)}h
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Contenido total</p>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {lessons.length === 0 ? "No hay lecciones aún" : "No se encontraron lecciones"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {lessons.length === 0 
                ? "Crea tu primera lección para comenzar" 
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
            {lessons.length === 0 && (
              <Link
                href="/admin/lecciones/nueva"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva Lección
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lección
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Curso
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Orden
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
                  {filteredLessons.map((lesson) => (
                    <motion.tr
                      key={lesson.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.estimatedMinutes} min
                              </span>
                              <span>•</span>
                              <span>{lesson._count.exercises} ejercicios</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/cursos/${lesson.course.id}`}
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <BookOpen className="w-4 h-4" />
                          {lesson.course.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                          {lesson.order + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {lesson.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Publicada
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
                            href={`/tutoriales/${lesson.course.slug}/${lesson.slug}`}
                            target="_blank"
                            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Ver lección"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/lecciones/${lesson.id}`}
                            className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(lesson.id)}
                            disabled={deleteLoading === lesson.id}
                            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            {deleteLoading === lesson.id ? (
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
      {filteredLessons.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Mostrando {filteredLessons.length} de {lessons.length} lecciones
        </p>
      )}
    </div>
  );
}
