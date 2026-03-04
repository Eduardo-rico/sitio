/**
 * Página de lección individual - Muestra contenido + editor interactivo
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { trackLearningEvent } from '@/lib/learning-events';
import { getSiteUrl } from '@/lib/site-url';
import {
  getDefaultRuntimeForLanguage,
  isCourseLanguage,
  isRuntimeType,
} from '@/lib/course-runtime';
import {
  getPythonCoursePedagogy,
  getPythonLessonStage,
} from '@/lib/python-course-pedagogy';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonNavigation } from '@/components/lessons/LessonNavigation';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Target, Lightbulb } from 'lucide-react';

interface LessonPageProps {
  params: {
    courseSlug: string;
    lessonSlug: string;
  };
}

async function getLessonWithContext(courseSlug: string, lessonSlug: string) {
  try {
    // Obtener el curso con todas sus lecciones para navegación
    const course = await prisma.course.findUnique({
      where: { 
        slug: courseSlug,
        isPublished: true 
      },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!course) return null;

    // Obtener la lección específica con ejercicios
    const lesson = await prisma.lesson.findUnique({
      where: {
        slug: lessonSlug,
        courseId: course.id,
        isPublished: true,
      },
      include: {
        exercises: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!lesson) return null;

    return { course, lesson };
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const data = await getLessonWithContext(params.courseSlug, params.lessonSlug);
  const siteUrl = getSiteUrl();
  
  if (!data) {
    return {
      title: 'Lección no encontrada',
    };
  }

  return {
    title: `${data.lesson.title} | ${data.course.title}`,
    description: `Lección interactiva: ${data.lesson.title}`,
    alternates: {
      canonical: `/tutoriales/${params.courseSlug}/${params.lessonSlug}`,
    },
    openGraph: {
      type: "article",
      url: `${siteUrl}/tutoriales/${params.courseSlug}/${params.lessonSlug}`,
      title: `${data.lesson.title} | ${data.course.title}`,
      description: `Lección interactiva: ${data.lesson.title}`,
    },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const data = await getLessonWithContext(params.courseSlug, params.lessonSlug);
  const siteUrl = getSiteUrl();

  if (!data) {
    notFound();
  }

  const { course, lesson } = data;
  const courseLanguage = isCourseLanguage(course.language) ? course.language : "python";
  const runtimeType = isRuntimeType(course.runtimeType)
    ? course.runtimeType
    : getDefaultRuntimeForLanguage(courseLanguage);
  const pythonPedagogy =
    courseLanguage === "python" ? getPythonCoursePedagogy(course.slug) : null;
  const lessonStage =
    courseLanguage === "python" ? getPythonLessonStage(course.slug, lesson.order) : null;
  const session = await auth();

  if (session?.user?.id) {
    try {
      await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: lesson.id,
          },
        },
        update: {
          lastAccessedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          lessonId: lesson.id,
          status: "in_progress",
          lastAccessedAt: new Date(),
        },
      });

      await trackLearningEvent({
        eventType: "lesson_viewed",
        userId: session.user.id,
        userEmail: session.user.email ?? undefined,
        courseId: course.id,
        courseSlug: course.slug,
        lessonId: lesson.id,
        lessonSlug: lesson.slug,
        source: "server",
      });
    } catch (error) {
      console.error("Error updating lesson access progress:", error);
    }
  }

  // Encontrar índice de la lección actual para navegación
  const currentIndex = course.lessons.findIndex((l) => l.slug === params.lessonSlug);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;
  const progress = ((currentIndex + 1) / course.lessons.length) * 100;
  const lessonSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: `Lección interactiva: ${lesson.title}`,
    inLanguage: "es",
    educationalLevel: "beginner",
    isPartOf: {
      "@type": "Course",
      name: course.title,
      url: `${siteUrl}/tutoriales/${course.slug}`,
    },
    url: `${siteUrl}/tutoriales/${course.slug}/${lesson.slug}`,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lessonSchema) }}
      />
      {/* Header fijo */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Izquierda: Navegación */}
            <div className="flex items-center gap-4">
              <Link
                href={`/tutoriales/${course.slug}`}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver al curso</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <BookOpen className="w-4 h-4" />
                <span>{course.title}</span>
              </div>
            </div>

            {/* Centro: Progreso */}
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progreso del curso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Derecha: Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{lesson.estimatedMinutes} min</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Panel izquierdo: Contenido */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {lesson.title}
              </h1>

              {pythonPedagogy && lessonStage && (
                <div className="mb-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20 p-4">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                      Etapa pedagogica: {lessonStage.label}
                    </span>
                    <span className="text-xs text-blue-700/80 dark:text-blue-300/80">
                      Rubrica: {pythonPedagogy.rubricDimensions.join(" / ")}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-white/70 dark:bg-gray-900/30 p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 inline-flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Objetivo de esta etapa
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">{lessonStage.objective}</p>
                    </div>
                    <div className="rounded-md bg-white/70 dark:bg-gray-900/30 p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 inline-flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Pregunta de reflexion
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">{lessonStage.reflectionPrompt}</p>
                    </div>
                  </div>
                </div>
              )}

              <LessonContent content={lesson.content} />
            </div>

            {/* Navegación al final del contenido */}
            <div className="flex justify-between pt-4">
              {prevLesson ? (
                <Link
                  href={`/tutoriales/${course.slug}/${prevLesson.slug}`}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400 dark:text-gray-500">Anterior</div>
                    <div className="text-sm font-medium hidden sm:block">{prevLesson.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              
              {nextLesson ? (
                <Link
                  href={`/tutoriales/${course.slug}/${nextLesson.slug}`}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="text-right">
                    <div className="text-xs text-blue-200">Siguiente</div>
                    <div className="text-sm font-medium hidden sm:block">{nextLesson.title}</div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={`/tutoriales/${course.slug}`}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span>Completar curso</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Panel derecho: Editor/Ejercicios */}
          <div className="space-y-6">
            <LessonNavigation 
              exercises={lesson.exercises}
              courseSlug={course.slug}
              lessonSlug={lesson.slug}
              language={courseLanguage}
              runtimeType={runtimeType}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
