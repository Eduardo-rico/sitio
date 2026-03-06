/**
 * Página de curso específico - Muestra todas las lecciones del curso
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/site-url';
import {
  LANGUAGE_LABELS,
  RUNTIME_LABELS,
  isCourseLanguage,
  isRuntimeType,
} from '@/lib/course-runtime';
import { getCourseBibliography } from '@/lib/course-bibliography';
import { resolveCoursePedagogy } from '@/lib/course-pedagogy-registry';
import { CourseStartButton } from '@/components/lessons/CourseStartButton';
import {
  Circle,
  Play,
  Clock,
  BookOpen,
  ExternalLink,
  Target,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';

interface CoursePageProps {
  params: {
    courseSlug: string;
  };
}

async function getCourseWithLessons(courseSlug: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { 
        slug: courseSlug,
        isPublished: true 
      },
      include: {
        bibliographyItems: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            exercises: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    return course;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const course = await getCourseWithLessons(params.courseSlug);
  const siteUrl = getSiteUrl();
  
  if (!course) {
    return {
      title: 'Curso no encontrado',
    };
  }

  return {
    title: `${course.title} | Tutoriales Interactivos`,
    description: course.description || `Aprende ${course.title} con ejercicios interactivos`,
    alternates: {
      canonical: `/tutoriales/${params.courseSlug}`,
    },
    openGraph: {
      type: "website",
      url: `${siteUrl}/tutoriales/${params.courseSlug}`,
      title: `${course.title} | Tutoriales Interactivos`,
      description: course.description || `Aprende ${course.title} con ejercicios interactivos`,
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getCourseWithLessons(params.courseSlug);
  const siteUrl = getSiteUrl();

  if (!course) {
    notFound();
  }

  const language = isCourseLanguage(course.language) ? course.language : "python";
  const runtime = isRuntimeType(course.runtimeType) ? course.runtimeType : "browser_pyodide";
  const coursePedagogy = resolveCoursePedagogy(language, course.slug, course.pedagogy);
  const fallbackBibliography = getCourseBibliography(course.slug, language);
  const bibliography =
    course.bibliographyItems.length > 0
      ? course.bibliographyItems.map((item) => ({
          title: item.title,
          url: item.url,
          note: item.note,
        }))
      : fallbackBibliography;
  const totalLessons = course.lessons.length;
  const totalExercises = course.lessons.reduce(
    (acc, lesson) => acc + lesson.exercises.length, 
    0
  );
  const totalMinutes = course.lessons.reduce(
    (acc, lesson) => acc + lesson.estimatedMinutes, 
    0
  );
  const courseUrl = `${siteUrl}/tutoriales/${course.slug}`;
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description || "Curso práctico con ejercicios interactivos.",
    inLanguage: "es",
    provider: {
      "@type": "Person",
      name: "Eduardo Rico Sotomayor",
      url: `${siteUrl}/cv`,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      url: courseUrl,
    },
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/tutoriales" className="hover:text-blue-600 dark:hover:text-blue-400">
          Tutoriales
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">{course.title}</span>
      </nav>

      {/* Header del curso */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="text-6xl">{getCourseEmoji(language)}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {course.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {course.description || 'Curso práctico con ejercicios interactivos.'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-full">
                {LANGUAGE_LABELS[language]}
              </span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-full">
                {RUNTIME_LABELS[runtime]}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{totalLessons} lecciones</span>
              </div>
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                <span>{totalExercises} ejercicios</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{totalMinutes} minutos</span>
              </div>
            </div>
          </div>
          
          {course.lessons.length > 0 && (
            <CourseStartButton
              courseSlug={course.slug}
              firstLessonSlug={course.lessons[0].slug}
            />
          )}
        </div>
      </div>

      {coursePedagogy && (
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Ruta pedagogica
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Perfil objetivo: {coursePedagogy.learnerProfile}
          </p>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
                <Target className="w-4 h-4" />
                <span className="text-sm font-semibold">Learning Outcomes</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {coursePedagogy.learningOutcomes.map((outcome) => (
                  <li key={outcome}>• {outcome}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-300">
                <ClipboardList className="w-4 h-4" />
                <span className="text-sm font-semibold">Plan de evaluacion</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Diagnostica: {coursePedagogy.assessmentPlan.diagnostic}
              </p>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                {coursePedagogy.assessmentPlan.formative.map((check) => (
                  <li key={check}>• {check}</li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sumativa: {coursePedagogy.assessmentPlan.summative}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-2 text-violet-700 dark:text-violet-300">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Criterios de dominio</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Dedicacion sugerida: {coursePedagogy.timeCommitment}
              </p>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {coursePedagogy.masteryCriteria.map((criterion) => (
                  <li key={criterion}>• {criterion}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Lista de lecciones */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Contenido del curso
        </h2>
        
        {course.lessons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-600 dark:text-gray-400">
              Este curso aún no tiene lecciones publicadas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={`/tutoriales/${course.slug}/${lesson.slug}`}
                className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              >
                {/* Número de lección */}
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {index + 1}
                </div>
                
                {/* Info de la lección */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.estimatedMinutes} min
                    </span>
                    {lesson.exercises.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {lesson.exercises.length} ejercicios
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Estado (placeholder para futuro tracking) */}
                <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {bibliography.length > 0 && (
        <section className="mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Bibliografia recomendada
          </h2>
          <ul className="space-y-3">
            {bibliography.map((item) => (
              <li
                key={item.url}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300 hover:underline"
                >
                  {item.title}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Botón de navegación */}
      <div className="mt-8 flex justify-between">
        <Link
          href="/tutoriales"
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a tutoriales
        </Link>
      </div>
    </main>
  );
}

function getCourseEmoji(language: keyof typeof LANGUAGE_LABELS): string {
  switch (language) {
    case "python":
      return "🐍";
    case "clojure":
      return "🧠";
    case "javascript":
      return "🟨";
    case "typescript":
      return "🔷";
    case "sql":
      return "🗄️";
    case "go":
      return "🐹";
    case "rust":
      return "🦀";
    case "bash":
      return "🖥️";
  }
}
