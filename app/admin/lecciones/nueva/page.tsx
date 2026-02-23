/**
 * Create New Lesson Page
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { LessonEditor, LessonFormData } from "@/components/admin/lesson-editor";

interface Course {
  id: string;
  title: string;
  slug: string;
}

export default function NewLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourseId = searchParams.get("courseId");

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(preselectedCourseId || "");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch("/api/admin/courses");
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        setCourses(data.data);
        
        // If no preselected course, select the first one
        if (!preselectedCourseId && data.data.length > 0) {
          setSelectedCourseId(data.data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar cursos");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [preselectedCourseId]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const handleSubmit = async (data: LessonFormData) => {
    if (!selectedCourseId) {
      setError("Selecciona un curso");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          courseId: selectedCourseId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Redirect to lessons list or course page
      if (preselectedCourseId) {
        router.push(`/admin/cursos/${preselectedCourseId}`);
      } else {
        router.push("/admin/lecciones");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la lección");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={preselectedCourseId ? `/admin/cursos/${preselectedCourseId}` : "/admin/lecciones"}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Nueva Lección
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea una nueva lección para el curso
          </p>
        </div>
      </div>

      {/* Course selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Curso *
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecciona un curso</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      {selectedCourse ? (
        <LessonEditor
          courseSlug={selectedCourse.slug}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">
            Selecciona un curso para comenzar
          </p>
        </div>
      )}
    </div>
  );
}
