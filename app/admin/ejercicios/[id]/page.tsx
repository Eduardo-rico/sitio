/**
 * Edit Exercise Page
 * Complete exercise editor with test cases and hints
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Loader2, 
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { ExerciseBuilder, ExerciseFormData } from "@/components/admin/exercise-builder";
import { isCourseLanguage } from "@/lib/course-runtime";

interface Course {
  id: string;
  title: string;
  slug: string;
  language: string;
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  course: Course;
}

interface Exercise {
  id: string;
  title: string;
  instructions: string;
  order: number;
  starterCode: string;
  solutionCode: string;
  validationType: "exact" | "contains" | "regex" | "custom";
  testCases: Array<{
    input?: string;
    expected: string;
    isPublic: boolean;
  }>;
  rubric?: Array<{
    title: string;
    description: string;
    weight: number;
  }>;
  hints: string[];
  isPublished: boolean;
  lesson: Lesson;
  _count: {
    submissions: number;
  };
}

export default function EditExercisePage() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch exercise
  const fetchExercise = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/exercises/${exerciseId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setExercise(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el ejercicio");
    } finally {
      setLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  // Handle form submit
  const handleSubmit = async (formData: ExerciseFormData) => {
    try {
      setIsSubmitting(true);
      setSaveError(null);

      // Convert hints from { value: string }[] to string[]
      const formattedData = {
        ...formData,
        hints: formData.hints.map(h => h.value),
      };

      const response = await fetch(`/api/admin/exercises/${exerciseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh exercise data
      await fetchExercise();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
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

  if (error || !exercise) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Error al cargar el ejercicio
          </h2>
        </div>
        <p className="text-red-600 dark:text-red-400">{error || "Ejercicio no encontrado"}</p>
        <Link
          href="/admin/ejercicios"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a ejercicios
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/ejercicios"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Ejercicio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {exercise.title}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {exercise._count.submissions} intentos
          </p>
          <Link
            href={`/tutoriales/${exercise.lesson.course.slug}/${exercise.lesson.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver en lección
          </Link>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-600 dark:text-red-400">{saveError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Builder */}
      <ExerciseBuilder
        language={isCourseLanguage(exercise.lesson.course.language) ? exercise.lesson.course.language : "python"}
        defaultValues={{
          title: exercise.title,
          instructions: exercise.instructions,
          order: exercise.order,
          starterCode: exercise.starterCode,
          solutionCode: exercise.solutionCode,
          validationType: exercise.validationType,
          isPublished: exercise.isPublished,
          testCases: exercise.testCases || [],
          rubric:
            exercise.rubric && exercise.rubric.length > 0
              ? exercise.rubric
              : [
                  {
                    title: "Correctness",
                    description: "Cumple los casos de prueba del ejercicio.",
                    weight: 50,
                  },
                ],
          hints: exercise.hints.map(h => ({ value: h })),
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="edit"
      />
    </div>
  );
}
