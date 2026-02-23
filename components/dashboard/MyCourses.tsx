"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Award,
  Play,
  RefreshCw,
} from "lucide-react";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessonsCompleted: number;
  totalLessons: number;
  progressPercentage: number;
  lastAccessedAt: string | null;
}

interface MyCoursesProps {
  courses: Course[];
}

export function MyCourses({ courses }: MyCoursesProps) {
  // Show only first 3 courses on dashboard, or empty state
  const displayCourses = courses.slice(0, 3);
  const hasMoreCourses = courses.length > 3;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mis Cursos
          </h3>
        </div>
        <Link
          href="/dashboard/cursos"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-6">
        {displayCourses.length > 0 ? (
          <div className="space-y-6">
            {displayCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}

            {hasMoreCourses && (
              <Link
                href="/dashboard/cursos"
                className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-t border-gray-100 dark:border-gray-700 transition-colors"
              >
                Ver {courses.length - 3} curso{courses.length - 3 === 1 ? "" : "s"}{" "}
                más
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const isCompleted = course.progressPercentage === 100;
  const isStarted = course.progressPercentage > 0;

  // Determine button text and icon
  let buttonText = "Comenzar";
  let ButtonIcon = Play;
  if (isCompleted) {
    buttonText = "Repasar";
    ButtonIcon = RefreshCw;
  } else if (isStarted) {
    buttonText = "Continuar";
    ButtonIcon = Play;
  }

  return (
    <div className="group">
      <div className="flex items-start gap-4">
        {/* Course Icon/Thumbnail */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            isCompleted
              ? "bg-green-100 dark:bg-green-900/30"
              : isStarted
              ? "bg-blue-100 dark:bg-blue-900/30"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          {isCompleted ? (
            <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <BookOpen
              className={`w-6 h-6 ${
                isStarted
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400"
              }`}
            />
          )}
        </div>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
            {course.title}
          </h4>
          {course.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
              {course.description}
            </p>
          )}

          {/* Progress Info */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {course.lessonsCompleted}/{course.totalLessons} lecciones
            </span>
            {course.lastAccessedAt && (
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {new Date(course.lastAccessedAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-2">
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isCompleted
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
                style={{ width: `${course.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/tutoriales/${course.slug}`}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-blue-600 dark:bg-gray-700 dark:hover:bg-blue-600 text-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white rounded-lg font-medium text-sm transition-all opacity-0 group-hover:opacity-100"
        >
          {buttonText}
          <ButtonIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-gray-400" />
      </div>
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
        No has comenzado ningún curso
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Explora nuestros cursos y comienza tu viaje de aprendizaje
      </p>
      <Link
        href="/tutoriales"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
      >
        <Play className="w-4 h-4" />
        Explorar Cursos
      </Link>
    </div>
  );
}
