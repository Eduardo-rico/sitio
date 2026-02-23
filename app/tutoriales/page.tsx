/**
 * Página principal de tutoriales - Listado de cursos disponibles
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Course } from '@prisma/client';

// Force dynamic to avoid build-time DB errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Tutoriales de Python | Eduardo Rico',
  description: 'Aprende Python desde cero con tutoriales interactivos. Ejecuta código directamente en tu navegador.',
};

async function getPublishedCourses(): Promise<Course[]> {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { lessons: true }
        }
      }
    });
    return courses as any;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export default async function TutorialsPage() {
  const courses = await getPublishedCourses();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Tutoriales Interactivos de Python
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Aprende Python ejecutando código directamente en tu navegador. 
          Una experiencia práctica y gratuita para dominar el lenguaje de programación más popular del mundo.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🐍</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Próximamente
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos preparando tutoriales increíbles. ¡Vuelve pronto!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Link
              key={course.id}
              href={`/tutoriales/${course.slug}`}
              className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">🐍</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {course._count?.lessons || 0} lecciones
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {course.description || 'Curso práctico de Python con ejercicios interactivos.'}
                </p>
                
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <span>Comenzar curso</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.estimatedMinutes || 10} min por lección
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Curso destacado */}
      <div className="mt-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">
            ¿Por qué aprender Python?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🚀</span>
              <div>
                <h3 className="font-semibold mb-1">Fácil de aprender</h3>
                <p className="text-blue-100">Sintaxis clara y legible, ideal para principiantes.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <h3 className="font-semibold mb-1">Data Science</h3>
                <p className="text-blue-100">El estándar para análisis de datos e inteligencia artificial.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">💼</span>
              <div>
                <h3 className="font-semibold mb-1">Alta demanda</h3>
                <p className="text-blue-100">Uno de los lenguajes mejor pagados y más solicitados.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
