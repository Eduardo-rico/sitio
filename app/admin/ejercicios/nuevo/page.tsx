/**
 * Create New Exercise Page
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ExerciseBuilder, ExerciseFormData } from "@/components/admin/exercise-builder";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  course: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function NewExercisePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLessonId = searchParams.get("lessonId");

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(preselectedLessonId || "");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lessons
  useEffect(() => {
    async function fetchLessons() {
      try {
        const response = await fetch("/api/admin/lessons");
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        setLessons(data.data);
        
        // If no preselected lesson, select the first one
        if (!preselectedLessonId && data.data.length > 0) {
          setSelectedLessonId(data.data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar lecciones");
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [preselectedLessonId]);

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  const handleSubmit = async (data: ExerciseFormData) => {
    if (!selectedLessonId) {
      setError("Selecciona una lección");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Convert hints from { value: string }[] to string[]
      const formattedData = {
        ...data,
        lessonId: selectedLessonId,
        hints: data.hints.map(h => h.value),
      };

      const response = await fetch("/api/admin/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Redirect
      if (preselectedLessonId) {
        router.push(`/admin/lecciones/${preselectedLessonId}`);
      } else {
        router.push("/admin/ejercicios");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el ejercicio");
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
          href={preselectedLessonId ? `/admin/lecciones/${preselectedLessonId}` : "/admin/ejercicios"}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Nuevo Ejercicio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea un ejercicio de programación
          </p>
        </div>
      </div>

      {/* Lesson selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Lección *
        </label>
        <select
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecciona una lección</option>
          {lessons.map(lesson => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.course.title} - {lesson.title}
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

      {/* Exercise Builder */}
      {selectedLesson ? (
        <ExerciseBuilder
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">
            Selecciona una lección para comenzar
          </p>
        </div>
      )}
    </div>
  );
}
