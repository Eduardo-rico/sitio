/**
 * Dashboard del panel de administración
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { 
  BookOpen, 
  Users, 
  Code2, 
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react';

async function getDashboardStats() {
  try {
    const [
      totalCourses,
      totalLessons,
      totalExercises,
      totalUsers,
      publishedCourses,
      recentSubmissions,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.exercise.count(),
      prisma.user.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.codeSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          exercise: { select: { title: true } },
        },
      }),
    ]);

    return {
      totalCourses,
      totalLessons,
      totalExercises,
      totalUsers,
      publishedCourses,
      recentSubmissions,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalCourses: 0,
      totalLessons: 0,
      totalExercises: 0,
      totalUsers: 0,
      publishedCourses: 0,
      recentSubmissions: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { 
      label: 'Cursos', 
      value: stats.totalCourses, 
      icon: BookOpen,
      href: '/admin/cursos',
      color: 'bg-blue-500',
    },
    { 
      label: 'Lecciones', 
      value: stats.totalLessons, 
      icon: BookOpen,
      href: '/admin/lecciones',
      color: 'bg-green-500',
    },
    { 
      label: 'Ejercicios', 
      value: stats.totalExercises, 
      icon: Code2,
      href: '/admin/ejercicios',
      color: 'bg-purple-500',
    },
    { 
      label: 'Usuarios', 
      value: stats.totalUsers, 
      icon: Users,
      href: '/admin/usuarios',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <div className="flex gap-2">
          <Link
            href="/admin/cursos/nuevo"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Curso
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cursos Publicados */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Estado de Cursos
            </h2>
            <Link 
              href="/admin/cursos"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Cursos Publicados
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Visibles para estudiantes
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.publishedCourses}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    En Borrador
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No visibles públicamente
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.totalCourses - stats.publishedCourses}
              </span>
            </div>
          </div>
        </div>

        {/* Envíos Recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Envíos Recientes
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          {stats.recentSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Code2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aún no hay envíos de código</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentSubmissions.map((submission) => (
                <div 
                  key={submission.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {submission.user?.name || submission.user?.email || 'Anónimo'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {submission.exercise?.title || 'Ejercicio'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.isCorrect ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        Correcto
                      </span>
                    ) : (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                        Incorrecto
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/cursos/nuevo"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">Crear Curso</span>
          </Link>
          <Link
            href="/admin/lecciones/nueva"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">Crear Lección</span>
          </Link>
          <Link
            href="/admin/ejercicios/nuevo"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-gray-700 dark:text-gray-300">Crear Ejercicio</span>
          </Link>
          <Link
            href="/admin/estadisticas"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-gray-700 dark:text-gray-300">Ver Estadísticas</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
