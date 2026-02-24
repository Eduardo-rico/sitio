/**
 * Reusable Course Form Component
 * Used for creating and editing courses with validation
 */

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Type, 
  Link as LinkIcon, 
  AlignLeft, 
  Hash,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Image as ImageIcon,
  Code2,
  Cpu
} from "lucide-react";
import {
  COURSE_LANGUAGES,
  LANGUAGE_LABELS,
  RUNTIME_TYPES,
  RUNTIME_LABELS,
  getDefaultRuntimeForLanguage,
} from "@/lib/course-runtime";

// Validation schema
const courseSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  slug: z.string()
    .min(1, "El slug es requerido")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  language: z.enum(COURSE_LANGUAGES),
  runtimeType: z.enum(RUNTIME_TYPES),
  order: z.number().min(0, "El orden debe ser positivo"),
  isPublished: z.boolean().default(false),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  defaultValues?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

// Auto-generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 100);
}

export function CourseForm({ 
  defaultValues, 
  onSubmit, 
  isSubmitting = false,
  mode = "create" 
}: CourseFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      language: "python",
      runtimeType: "browser_pyodide",
      order: 0,
      isPublished: false,
      imageUrl: "",
      ...defaultValues,
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const description = watch("description");
  const language = watch("language");
  const isPublished = watch("isPublished");

  // Auto-generate slug when title changes (only in create mode and if slug is empty)
  useEffect(() => {
    if (mode === "create" && title && !slug) {
      setValue("slug", generateSlug(title), { shouldValidate: true });
    }
  }, [title, mode, slug, setValue]);

  useEffect(() => {
    const fallbackRuntime = getDefaultRuntimeForLanguage(language);
    setValue("runtimeType", fallbackRuntime, { shouldValidate: true });
  }, [language, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            {/* Title */}
            <div>
              <label 
                htmlFor="title" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Type className="w-4 h-4 inline mr-1" />
                Título del curso *
              </label>
              <input
                type="text"
                id="title"
                {...register("title")}
                placeholder="ej. Python desde Cero"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.title && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.title.message}
                </motion.p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label 
                htmlFor="slug" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <LinkIcon className="w-4 h-4 inline mr-1" />
                URL amigable (slug) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-500 dark:text-gray-400 text-sm">
                  /tutoriales/
                </span>
                <input
                  type="text"
                  id="slug"
                  {...register("slug")}
                  placeholder="python-desde-cero"
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.slug && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.slug.message}
                </motion.p>
              )}
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
                <AlignLeft className="w-4 h-4 inline mr-1" />
                Descripción
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                placeholder="Describe de qué trata el curso..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-all"
              />
              {errors.description && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.description.message}
                </motion.p>
              )}
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Breve descripción del curso visible en la lista
                </p>
                <span className="text-xs text-gray-400">
                  {description?.length || 0}/500
                </span>
              </div>
            </div>

            {/* Language */}
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Code2 className="w-4 h-4 inline mr-1" />
                Lenguaje del curso *
              </label>
              <select
                id="language"
                {...register("language")}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {COURSE_LANGUAGES.map((languageOption) => (
                  <option key={languageOption} value={languageOption}>
                    {LANGUAGE_LABELS[languageOption]}
                  </option>
                ))}
              </select>
              {errors.language && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.language.message}
                </motion.p>
              )}
            </div>

            {/* Runtime */}
            <div>
              <label
                htmlFor="runtimeType"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Cpu className="w-4 h-4 inline mr-1" />
                Entorno del intérprete/compilador *
              </label>
              <select
                id="runtimeType"
                {...register("runtimeType")}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {RUNTIME_TYPES.map((runtimeOption) => (
                  <option key={runtimeOption} value={runtimeOption}>
                    {RUNTIME_LABELS[runtimeOption]}
                  </option>
                ))}
              </select>
              {errors.runtimeType && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.runtimeType.message}
                </motion.p>
              )}
            </div>

            {/* Order */}
            <div>
              <label 
                htmlFor="order" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Hash className="w-4 h-4 inline mr-1" />
                Orden
              </label>
              <input
                type="number"
                id="order"
                {...register("order", { valueAsNumber: true })}
                min="0"
                className="w-32 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.order && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.order.message}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Número menor = aparece primero en la lista
              </p>
            </div>

            {/* Published */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input
                type="checkbox"
                id="isPublished"
                {...register("isPublished")}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label 
                htmlFor="isPublished" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Publicar curso inmediatamente
              </label>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Vista previa
            </h3>
            
            <motion.div 
              layout
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white/50" />
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {title || "Título del curso"}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {description || "Descripción del curso..."}
                </p>
                
                <div className="flex items-center gap-2 mt-3">
                  {isPublished ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <Eye className="w-3 h-3" />
                      Publicado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <EyeOff className="w-3 h-3" />
                      Borrador
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === "create" ? "Crear Curso" : "Guardar Cambios"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
