export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from "next/navigation";

import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BookOpen, Clock, ChevronRight, Award } from "lucide-react";

interface CourseWithProgress {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessonsCompleted: number;
  totalLessons: number;
  progressPercentage: number;
  lastAccessedAt: Date | null;
  nextLesson: {
    slug: string;
    title: string;
  } | null;
}

async function getUserCoursesWithProgress(
  userId: string
): Promise<CourseWithProgress[]> {
  try {
    // Get all courses with their lessons and user progress
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        lessons: {
          some: {
            progress: {
              some: {
                userId,
              },
            },
          },
        },
      },
      include: {
        lessons: {
          where: {
            isPublished: true,
          },
          include: {
            progress: {
              where: {
                userId,
              },
              select: {
                status: true,
                lastAccessedAt: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return courses.map((course) => {
      const totalLessons = course.lessons.length;
      const lessonsCompleted = course.lessons.filter(
        (lesson) => lesson.progress[0]?.status === "completed"
      ).length;

      // Find the last accessed lesson or the first incomplete one
      const sortedByAccess = [...course.lessons]
        .filter((l) => l.progress[0]?.lastAccessedAt)
        .sort(
          (a, b) =>
            new Date(b.progress[0]!.lastAccessedAt!).getTime() -
            new Date(a.progress[0]!.lastAccessedAt!).getTime()
        );

      const lastAccessed = sortedByAccess[0];

      // Find first incomplete lesson
      const firstIncomplete = course.lessons.find(
        (lesson) => lesson.progress[0]?.status !== "completed"
      );

      const nextLesson = firstIncomplete || course.lessons[0];

      // Calculate last accessed time for the course
      const lastAccessedAt = lastAccessed?.progress[0]?.lastAccessedAt || null;

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        lessonsCompleted,
        totalLessons,
        progressPercentage:
          totalLessons > 0
            ? Math.round((lessonsCompleted / totalLessons) * 100)
            : 0,
        lastAccessedAt,
        nextLesson: nextLesson
          ? {
              slug: nextLesson.slug,
              title: nextLesson.title,
            }
          : null,
      };
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export default async function MyCoursesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/cursos");
  }

  const courses = await getUserCoursesWithProgress(session.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mis Cursos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {courses.length > 0
              ? `Estás cursando ${courses.length} curso${
                  courses.length === 1 ? "" : "s"
                }`
              : "Aún no has comenzado ningún curso"}
          </p>
        </div>
        <Link
          href="/tutoriales"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Explorar Cursos
        </Link>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Course Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {course.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progreso
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {course.lessonsCompleted}/{course.totalLessons} lecciones
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex flex-col items-start md:items-end gap-3">
                  {/* Completion Badge */}
                  {course.progressPercentage === 100 ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                      <Award className="w-4 h-4" />
                      Completado
                    </div>
                  ) : course.progressPercentage > 0 ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      En progreso
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-full text-sm font-medium">
                      <BookOpen className="w-4 h-4" />
                      Sin empezar
                    </div>
                  )}

                  {/* Last Accessed */}
                  {course.lastAccessedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Último acceso:{" "}
                      {new Date(course.lastAccessedAt).toLocaleDateString(
                        "es-ES",
                        {
                          day: "numeric",
                          month: "short",
                        }
                      )}
                    </p>
                  )}

                  {/* Continue Button */}
                  <Link
                    href={`/tutoriales/${course.slug}/${
                      course.nextLesson?.slug || ""
                    }`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    {course.progressPercentage === 0
                      ? "Comenzar"
                      : course.progressPercentage === 100
                      ? "Repasar"
                      : "Continuar"}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tienes cursos activos
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Comienza tu viaje de aprendizaje explorando nuestros cursos
            disponibles.
          </p>
          <Link
            href="/tutoriales"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Ver todos los cursos
          </Link>
        </div>
      )}
    </div>
  );
}
