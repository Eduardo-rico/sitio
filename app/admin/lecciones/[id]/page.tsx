/**
 * Edit Lesson Page
 * Edit lesson with split view editor and manage exercises
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Code2,
  ExternalLink,
  AlertCircle,
  Play,
  Users
} from "lucide-react";
import { LessonEditor, LessonFormData } from "@/components/admin/lesson-editor";
import { DraggableList } from "@/components/admin/draggable-list";

interface Exercise {
  id: string;
  title: string;
  order: number;
  isPublished: boolean;
  validationType: string;
  _count: {
    submissions: number;
  };
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  estimatedMinutes: number;
  isPublished: boolean;
  course: Course;
  exercises: Exercise[];
}

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // Fetch lesson
  const fetchLesson = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/lessons/${lessonId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setLesson(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la lección");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  // Handle form submit
  const handleSubmit = async (formData: LessonFormData) => {
    try {
      setIsSubmitting(true);
      setSaveError(null);

      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh lesson data
      await fetchLesson();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle exercise reorder
  const handleReorder = async (items: { id: string; order: number }[]) => {
    try {
      setReordering(true);
      
      // Update all exercises
      const updates = items.map((item, index) => 
        fetch(`/api/admin/exercises/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        })
      );

      await Promise.all(updates);
      
      // Refresh data
      await fetchLesson();
    } catch (err) {
      console.error("Error reordering exercises:", err);
    } finally {
      setReordering(false);
    }
  };

  // Handle exercise delete
  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm("¿Estás seguro de eliminar este ejercicio?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/exercises/${exerciseId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      await fetchLesson();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Error al cargar la lección
          </h2>
        </div>
        <p className="text-red-600 dark:text-red-400">{error || "Lección no encontrada"}</p>
        <Link
          href="/admin/lecciones"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a lecciones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/lecciones"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Lección
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {lesson.title}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/tutoriales/${lesson.course.slug}/${lesson.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver lección
          </Link>
        </div>
      </div>

      {/* Lesson Editor */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Contenido de la lección
        </h2>
        
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-red-600 dark:text-red-400">{saveError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <LessonEditor
          defaultValues={{
            title: lesson.title,
            slug: lesson.slug,
            content: lesson.content,
            order: lesson.order,
            estimatedMinutes: lesson.estimatedMinutes,
            isPublished: lesson.isPublished,
          }}
          courseSlug={lesson.course.slug}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      </section>

      {/* Exercises Section */}
      <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Ejercicios
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona los ejercicios de esta lección
            </p>
          </div>
          <Link
            href={`/admin/ejercicios/nuevo?lessonId=${lessonId}`}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Añadir Ejercicio
          </Link>
        </div>

        {reordering && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Actualizando orden...
          </div>
        )}

        {lesson.exercises.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Code2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No hay ejercicios aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Añade ejercicios para que los estudiantes practiquen
            </p>
            <Link
              href={`/admin/ejercicios/nuevo?lessonId=${lessonId}`}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir Ejercicio
            </Link>
          </div>
        ) : (
          <DraggableList
            items={lesson.exercises.map(exercise => ({
              id: exercise.id,
              title: exercise.title,
              subtitle: `${exercise.validationType} • ${exercise._count.submissions} intentos`,
              order: exercise.order + 1,
              isPublished: exercise.isPublished,
            }))}
            onReorder={handleReorder}
            onDelete={handleDeleteExercise}
            onEdit={(id) => router.push(`/admin/ejercicios/${id}`)}
            emptyMessage="No hay ejercicios"
            renderExtra={(item) => (
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Play className="w-3 h-3" />
                <span>{item.subtitle?.split(" • ")[1]}</span>
              </div>
            )}
          />
        )}
      </section>
    </div>
  );
}
