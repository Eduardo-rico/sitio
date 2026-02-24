/**
 * Edit Course Page
 * Edit course details and manage lessons
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
  FileText,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { CourseForm, CourseFormData } from "@/components/admin/course-form";
import { DraggableList } from "@/components/admin/draggable-list";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
  isPublished: boolean;
  estimatedMinutes: number;
  _count: {
    exercises: number;
  };
}

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
  lessons: Lesson[];
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // Fetch course
  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setCourse(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el curso");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Handle form submit
  const handleSubmit = async (formData: CourseFormData) => {
    try {
      setIsSubmitting(true);
      setSaveError(null);

      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh course data
      await fetchCourse();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle lesson reorder
  const handleReorder = async (items: { id: string; order: number }[]) => {
    try {
      setReordering(true);
      
      // Update all lessons
      const updates = items.map((item, index) => 
        fetch(`/api/admin/lessons/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        })
      );

      await Promise.all(updates);
      
      // Refresh data
      await fetchCourse();
    } catch (err) {
      console.error("Error reordering lessons:", err);
    } finally {
      setReordering(false);
    }
  };

  // Handle lesson delete
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta lección?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      await fetchCourse();
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

  if (error || !course) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Error al cargar el curso
          </h2>
        </div>
        <p className="text-red-600 dark:text-red-400">{error || "Curso no encontrado"}</p>
        <Link
          href="/admin/cursos"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/cursos"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Curso
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {course.title}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/tutoriales/${course.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver curso
          </Link>
        </div>
      </div>

      {/* Course Form */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Información del curso
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

        <CourseForm
          defaultValues={{
            title: course.title,
            slug: course.slug,
            description: course.description || "",
            language: course.language as CourseFormData["language"],
            runtimeType: course.runtimeType as CourseFormData["runtimeType"],
            order: course.order,
            isPublished: course.isPublished,
            imageUrl: course.imageUrl || "",
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      </section>

      {/* Lessons Section */}
      <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Lecciones
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona las lecciones de este curso
            </p>
          </div>
          <Link
            href={`/admin/lecciones/nueva?courseId=${courseId}`}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Añadir Lección
          </Link>
        </div>

        {reordering && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Actualizando orden...
          </div>
        )}

        {course.lessons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No hay lecciones aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Añade tu primera lección a este curso
            </p>
            <Link
              href={`/admin/lecciones/nueva?courseId=${courseId}`}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir Lección
            </Link>
          </div>
        ) : (
          <DraggableList
            items={course.lessons.map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              subtitle: `${lesson.estimatedMinutes} min • ${lesson._count.exercises} ejercicios`,
              order: lesson.order + 1,
              isPublished: lesson.isPublished,
              href: `/tutoriales/${course.slug}/${lesson.slug}`,
            }))}
            onReorder={handleReorder}
            onDelete={handleDeleteLesson}
            onEdit={(id) => router.push(`/admin/lecciones/${id}`)}
            emptyMessage="No hay lecciones"
          />
        )}
      </section>
    </div>
  );
}
