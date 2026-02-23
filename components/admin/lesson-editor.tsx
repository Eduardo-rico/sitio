/**
 * Lesson Editor Component
 * Markdown editor with toolbar and live preview
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Type, 
  Link as LinkIcon, 
  Hash,
  Clock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  FileText,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  SplitSquareVertical,
  Monitor,
  Edit3
} from "lucide-react";
import { ContentPreview } from "./content-preview";

// Validation schema
const lessonSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(150, "Máximo 150 caracteres"),
  slug: z.string()
    .min(1, "El slug es requerido")
    .max(150, "Máximo 150 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  content: z.string().min(1, "El contenido es requerido"),
  order: z.number().min(0, "El orden debe ser positivo"),
  estimatedMinutes: z.number().min(1, "Mínimo 1 minuto").max(300, "Máximo 300 minutos"),
  isPublished: z.boolean().default(false),
});

export type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonEditorProps {
  defaultValues?: Partial<LessonFormData>;
  courseId?: string;
  courseSlug?: string;
  onSubmit: (data: LessonFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

// Toolbar button component
interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}

function ToolbarButton({ icon, onClick, title, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active 
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {icon}
    </button>
  );
}

// Insert markdown at cursor position
function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = ""
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);
  
  const newText = text.substring(0, start) + before + selected + after + text.substring(end);
  
  // Set cursor position after the inserted text
  setTimeout(() => {
    textarea.focus();
    const newCursorPos = start + before.length + selected.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);
  
  return newText;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 150);
}

export function LessonEditor({ 
  defaultValues, 
  courseId,
  courseSlug,
  onSubmit, 
  isSubmitting = false,
  mode = "create" 
}: LessonEditorProps) {
  const [activeTab, setActiveTab] = useState<"split" | "edit" | "preview">("split");
  const [contentValue, setContentValue] = useState(defaultValues?.content || "");
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      order: 0,
      estimatedMinutes: 10,
      isPublished: false,
      ...defaultValues,
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const content = watch("content");
  const isPublished = watch("isPublished");
  const estimatedMinutes = watch("estimatedMinutes");

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentValue(e.target.value);
    setValue("content", e.target.value, { shouldValidate: true });
  };

  // Toolbar actions
  const textareaRef = (ref: HTMLTextAreaElement | null) => {
    if (ref) {
      (window as any).__lessonTextarea = ref;
    }
  };

  const applyMarkdown = (before: string, after: string = "") => {
    const textarea = (window as any).__lessonTextarea as HTMLTextAreaElement;
    if (!textarea) return;
    
    const newContent = insertMarkdown(textarea, before, after);
    setContentValue(newContent);
    setValue("content", newContent, { shouldValidate: true });
  };

  const toolbarActions = [
    { icon: <Heading1 className="w-4 h-4" />, action: () => applyMarkdown("# ", ""), title: "Título H1" },
    { icon: <Heading2 className="w-4 h-4" />, action: () => applyMarkdown("## ", ""), title: "Título H2" },
    { icon: <Heading3 className="w-4 h-4" />, action: () => applyMarkdown("### ", ""), title: "Título H3" },
    null, // separator
    { icon: <Bold className="w-4 h-4" />, action: () => applyMarkdown("**", "**"), title: "Negrita" },
    { icon: <Italic className="w-4 h-4" />, action: () => applyMarkdown("*", "*"), title: "Cursiva" },
    null, // separator
    { icon: <List className="w-4 h-4" />, action: () => applyMarkdown("- ", ""), title: "Lista" },
    { icon: <ListOrdered className="w-4 h-4" />, action: () => applyMarkdown("1. ", ""), title: "Lista numerada" },
    null, // separator
    { icon: <Code className="w-4 h-4" />, action: () => applyMarkdown("```python\n", "\n```"), title: "Bloque de código" },
    { icon: <Quote className="w-4 h-4" />, action: () => applyMarkdown("> ", ""), title: "Cita" },
  ];

  // Auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);
    if (mode === "create" && !slug) {
      setValue("slug", generateSlug(newTitle), { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header with tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "edit"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "split"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <SplitSquareVertical className="w-4 h-4" />
            Dividido
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "preview"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Monitor className="w-4 h-4" />
            Vista previa
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              {...register("isPublished")}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="text-sm text-gray-700 dark:text-gray-300">
              Publicada
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Type className="w-4 h-4 inline mr-1" />
            Título *
          </label>
          <input
            type="text"
            {...register("title")}
            onChange={handleTitleChange}
            placeholder="Título de la lección"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <LinkIcon className="w-4 h-4 inline mr-1" />
            Slug *
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-500 text-sm">
              /{courseSlug || "curso"}/
            </span>
            <input
              type="text"
              {...register("slug")}
              placeholder="mi-leccion"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug.message}</p>
          )}
        </div>

        <div className="sm:col-span-2 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Hash className="w-4 h-4 inline mr-1" />
              Orden
            </label>
            <input
              type="number"
              {...register("order", { valueAsNumber: true })}
              min="0"
              className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Minutos estimados
            </label>
            <input
              type="number"
              {...register("estimatedMinutes", { valueAsNumber: true })}
              min="1"
              max="300"
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.estimatedMinutes && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.estimatedMinutes.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className={`grid gap-6 ${
            activeTab === "split" ? "lg:grid-cols-2" : "grid-cols-1"
          }`}>
            {/* Editor Panel */}
            {(activeTab === "edit" || activeTab === "split") && (
              <div className="space-y-2">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
                  {toolbarActions.map((action, index) => (
                    action === null ? (
                      <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    ) : (
                      <ToolbarButton
                        key={index}
                        icon={action.icon}
                        onClick={action.action}
                        title={action.title}
                      />
                    )
                  ))}
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={contentValue}
                    onChange={handleContentChange}
                    placeholder="# Escribe el contenido de la lección en Markdown...\n\n## Introducción\n\nAquí va el contenido..."
                    className="w-full h-[500px] px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                    spellCheck={false}
                  />
                  {errors.content && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Preview Panel */}
            {(activeTab === "preview" || activeTab === "split") && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Monitor className="w-4 h-4" />
                    Vista previa
                  </div>
                </div>
                <div className="p-6 h-[500px] overflow-y-auto">
                  <ContentPreview 
                    title={title || "Título de la lección"}
                    content={contentValue || "El contenido aparecerá aquí..."}
                    estimatedMinutes={estimatedMinutes}
                    isPublished={isPublished}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </form>
  );
}
