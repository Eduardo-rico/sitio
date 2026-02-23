/**
 * Exercise Builder Component
 * Complete exercise form with validation, test cases, and hints manager
 */

"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Type, 
  Hash,
  Code,
  Save,
  Loader2,
  Plus,
  Trash2,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Play,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileCode,
  FlaskConical
} from "lucide-react";

// Validation types
const validationTypes = [
  { value: "exact", label: "Coincidencia exacta", description: "El output debe ser idéntico al esperado" },
  { value: "contains", label: "Contiene texto", description: "El output debe contener el texto esperado" },
  { value: "regex", label: "Expresión regular", description: "El output debe coincidir con el patrón regex" },
  { value: "custom", label: "Validación personalizada", description: "Lógica de validación personalizada" },
] as const;

// Test case schema
const testCaseSchema = z.object({
  input: z.string().optional(),
  expected: z.string().min(1, "El resultado esperado es requerido"),
  isPublic: z.boolean().default(true),
});

// Exercise schema
const exerciseSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(150, "Máximo 150 caracteres"),
  instructions: z.string().min(1, "Las instrucciones son requeridas"),
  order: z.number().min(0, "El orden debe ser positivo"),
  starterCode: z.string(),
  solutionCode: z.string().min(1, "El código solución es requerido"),
  validationType: z.enum(["exact", "contains", "regex", "custom"]),
  expectedOutput: z.string().optional(),
  isPublished: z.boolean().default(false),
  testCases: z.array(testCaseSchema).min(0),
  hints: z.array(z.object({
    value: z.string().min(1, "La pista no puede estar vacía"),
  })),
});

export type ExerciseFormData = z.infer<typeof exerciseSchema>;

interface ExerciseBuilderProps {
  defaultValues?: Partial<ExerciseFormData>;
  lessonId?: string;
  onSubmit: (data: ExerciseFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

// Code editor wrapper
function CodeEditor({
  value,
  onChange,
  label,
  placeholder,
  error,
  height = "200px",
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  error?: string;
  height?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Code className="w-4 h-4 inline mr-1" />
        {label}
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          style={{ height }}
        />
        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
          Python
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export function ExerciseBuilder({ 
  defaultValues, 
  lessonId,
  onSubmit, 
  isSubmitting = false,
  mode = "create" 
}: ExerciseBuilderProps) {
  const [activeSection, setActiveSection] = useState<"basic" | "code" | "validation" | "hints">("basic");
  const [testCaseExpanded, setTestCaseExpanded] = useState<number | null>(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      title: "",
      instructions: "",
      order: 0,
      starterCode: "# Escribe tu código aquí\n\n",
      solutionCode: "# Solución\n\n",
      validationType: "exact",
      expectedOutput: "",
      isPublished: false,
      testCases: [],
      hints: [],
      ...defaultValues,
    },
  });

  const { 
    fields: testCaseFields, 
    append: appendTestCase, 
    remove: removeTestCase 
  } = useFieldArray({
    control,
    name: "testCases",
  });

  const { 
    fields: hintFields, 
    append: appendHint, 
    remove: removeHint,
    move: moveHint
  } = useFieldArray({
    control,
    name: "hints",
  });

  const validationType = watch("validationType");
  const starterCode = watch("starterCode");
  const solutionCode = watch("solutionCode");
  const instructions = watch("instructions");
  const isPublished = watch("isPublished");
  const testCases = watch("testCases");

  const sectionButtons = [
    { id: "basic", label: "Información básica", icon: Type },
    { id: "code", label: "Código", icon: FileCode },
    { id: "validation", label: "Validación", icon: FlaskConical },
    { id: "hints", label: "Pistas", icon: Lightbulb },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {sectionButtons.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === section.id
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Basic Info Section */}
      {activeSection === "basic" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Información básica
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Type className="w-4 h-4 inline mr-1" />
                Título del ejercicio *
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="ej. Calcula el factorial de un número"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Orden
              </label>
              <input
                type="number"
                {...register("order", { valueAsNumber: true })}
                min="0"
                className="w-32 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isPublished")}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Publicar ejercicio
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instrucciones *
            </label>
            <textarea
              {...register("instructions")}
              rows={6}
              placeholder="Describe detalladamente lo que el estudiante debe hacer...\n\nPuedes usar Markdown para formatear el texto."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
            {errors.instructions && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.instructions.message}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Code Section */}
      {activeSection === "code" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Código inicial
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Este código aparecerá en el editor cuando el estudiante abra el ejercicio.
            </p>
            <CodeEditor
              value={starterCode}
              onChange={(value) => setValue("starterCode", value)}
              label=""
              placeholder="# Código que verá el estudiante\ndef main():\n    pass\n\nif __name__ == \"__main__\":\n    main()"
              height="300px"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Código solución *
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Esta es la solución correcta del ejercicio.
            </p>
            <CodeEditor
              value={solutionCode}
              onChange={(value) => setValue("solutionCode", value)}
              label=""
              placeholder="# Solución correcta\ndef main():\n    # Implementación...\n    pass"
              error={errors.solutionCode?.message}
              height="300px"
            />
          </div>
        </motion.div>
      )}

      {/* Validation Section */}
      {activeSection === "validation" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Validation Type */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Tipo de validación
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              {validationTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    validationType === type.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    value={type.value}
                    {...register("validationType")}
                    className="mt-0.5 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{type.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Expected Output (for exact/contains/regex) */}
            {validationType !== "custom" && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Output esperado
                </label>
                <textarea
                  {...register("expectedOutput")}
                  rows={3}
                  placeholder="Texto o patrón que debe coincidir con el output..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Test Cases */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Casos de prueba
              </h3>
              <button
                type="button"
                onClick={() => {
                  appendTestCase({ input: "", expected: "", isPublic: true });
                  setTestCaseExpanded(testCaseFields.length);
                }}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <Plus className="w-4 h-4" />
                Añadir caso
              </button>
            </div>

            <AnimatePresence>
              {testCaseFields.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No hay casos de prueba</p>
                  <button
                    type="button"
                    onClick={() => appendTestCase({ input: "", expected: "", isPublic: true })}
                    className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Añadir el primero
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {testCaseFields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setTestCaseExpanded(testCaseExpanded === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Caso de prueba {index + 1}
                          </span>
                          {testCases?.[index]?.isPublic && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                              Público
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTestCase(index);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {testCaseExpanded === index ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {testCaseExpanded === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-4 space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Input (opcional)
                              </label>
                              <textarea
                                {...register(`testCases.${index}.input`)}
                                rows={2}
                                placeholder="Datos de entrada para el programa..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Output esperado *
                              </label>
                              <textarea
                                {...register(`testCases.${index}.expected`)}
                                rows={2}
                                placeholder="Resultado esperado..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {errors.testCases?.[index]?.expected && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                  {errors.testCases[index]?.expected?.message}
                                </p>
                              )}
                            </div>

                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                {...register(`testCases.${index}.isPublic`)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Mostrar este caso a los estudiantes
                              </span>
                            </label>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Hints Section */}
      {activeSection === "hints" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Pistas
            </h3>
            <button
              type="button"
              onClick={() => appendHint({ value: "" })}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              <Plus className="w-4 h-4" />
              Añadir pista
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Las pistas se muestran progresivamente cuando el estudiante se atasca. 
            Ordena las pistas de más general a más específica.
          </p>

          <AnimatePresence>
            {hintFields.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Lightbulb className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No hay pistas aún</p>
                <button
                  type="button"
                  onClick={() => appendHint({ value: "" })}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Añadir la primera pista
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {hintFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => index > 0 && moveHint(index, index - 1)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 rounded"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => index < hintFields.length - 1 && moveHint(index, index + 1)}
                        disabled={index === hintFields.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 rounded"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <textarea
                        {...register(`hints.${index}.value`)}
                        rows={2}
                        placeholder="Escribe una pista útil..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      {errors.hints?.[index]?.value && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.hints[index]?.value?.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mr-auto">
          <input
            type="checkbox"
            id="isPublishedSubmit"
            {...register("isPublished")}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublishedSubmit" className="text-sm text-gray-700 dark:text-gray-300">
            {isPublished ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Eye className="w-4 h-4" />
                Publicado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <EyeOff className="w-4 h-4" />
                Borrador
              </span>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {mode === "create" ? "Crear Ejercicio" : "Guardar Cambios"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
