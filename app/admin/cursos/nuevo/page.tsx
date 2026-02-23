/**
 * Crear nuevo curso
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Nuevo Curso | Admin',
};

async function createCourse(formData: FormData) {
  'use server';
  
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const order = parseInt(formData.get('order') as string) || 0;
  const isPublished = formData.get('isPublished') === 'on';

  if (!title || !slug) {
    throw new Error('Título y slug son requeridos');
  }

  try {
    await prisma.course.create({
      data: {
        title,
        slug,
        description,
        order,
        isPublished,
      },
    });
    
    redirect('/admin/cursos');
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/cursos"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Nuevo Curso
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea un nuevo curso para la plataforma
          </p>
        </div>
      </div>

      {/* Form */}
      <form action={createCourse} className="max-w-2xl space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Title */}
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Título del curso *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="ej. Python desde Cero"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Slug */}
          <div>
            <label 
              htmlFor="slug" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              URL amigable (slug) *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-500 dark:text-gray-400 text-sm">
                /tutoriales/
              </span>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                placeholder="python-desde-cero"
                pattern="[a-z0-9-]+"
                title="Solo letras minúsculas, números y guiones"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Solo letras minúsculas, números y guiones. Se usará en la URL.
            </p>
          </div>

          {/* Description */}
          <div>
            <label 
              htmlFor="description" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe de qué trata el curso..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Order */}
          <div>
            <label 
              htmlFor="order" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Orden
            </label>
            <input
              type="number"
              id="order"
              name="order"
              defaultValue="0"
              min="0"
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Número menor = aparece primero en la lista
            </p>
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label 
              htmlFor="isPublished" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Publicar curso inmediatamente
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Crear Curso
          </button>
          <Link
            href="/admin/cursos"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
