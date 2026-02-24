"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CourseStartButtonProps {
  courseSlug: string;
  firstLessonSlug: string;
}

interface EnrollResponse {
  success: boolean;
  data?: {
    lessonSlug?: string;
  };
  error?: string;
}

export function CourseStartButton({
  courseSlug,
  firstLessonSlug,
}: CourseStartButtonProps) {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();
  const fallbackPath = `/tutoriales/${courseSlug}/${firstLessonSlug}`;

  const handleStart = async () => {
    if (isStarting) return;

    setIsStarting(true);
    try {
      const response = await fetch(`/api/courses/${courseSlug}/enroll`, {
        method: "POST",
      });

      if (response.status === 401) {
        router.push(
          `/auth/signin?callbackUrl=${encodeURIComponent(fallbackPath)}`
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | EnrollResponse
        | null;

      if (response.ok && payload?.success) {
        const lessonSlug = payload.data?.lessonSlug || firstLessonSlug;
        router.push(`/tutoriales/${courseSlug}/${lessonSlug}`);
        return;
      }

      toast.warning(
        payload?.error ||
          "No se pudo registrar tu progreso al iniciar. Abriremos la lección inicial."
      );
      router.push(fallbackPath);
    } catch {
      toast.warning(
        "No se pudo registrar tu progreso al iniciar. Abriremos la lección inicial."
      );
      router.push(fallbackPath);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={isStarting}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
    >
      <Play className="w-5 h-5" />
      {isStarting ? "Iniciando..." : "Comenzar"}
    </button>
  );
}
