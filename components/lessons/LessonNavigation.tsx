'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Exercise } from '@prisma/client';
import { PythonEditor } from '@/components/python-editor/PythonEditor';
import { useCodeExecution } from '@/components/python-editor/useCodeExecution';
import { OutputPanel } from '@/components/python-editor/OutputPanel';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/hooks/use-toast';
import {
  LANGUAGE_LABELS,
  getDefaultStarterCode,
  type CourseLanguage,
} from '@/lib/course-runtime';
import {
  Play,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  XCircle,
  ListChecks,
  Star,
} from 'lucide-react';

interface LessonNavigationProps {
  exercises: Exercise[];
  courseSlug: string;
  lessonSlug: string;
  language: CourseLanguage;
  runtimeType: string;
}

type ValidationType = 'exact' | 'contains' | 'regex' | 'custom';

interface TestCaseDefinition {
  description?: string;
  expected?: string;
  pattern?: string;
}

interface TestResult {
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
}

interface ApiResult {
  success: boolean;
  error?: string;
}

function normalizeTestCases(rawTestCases: unknown): TestCaseDefinition[] {
  if (!rawTestCases) return [];
  if (Array.isArray(rawTestCases)) {
    return rawTestCases.filter((tc) => typeof tc === 'object' && tc !== null) as TestCaseDefinition[];
  }
  if (typeof rawTestCases === 'object') {
    return [rawTestCases as TestCaseDefinition];
  }
  return [];
}

export function LessonNavigation({
  exercises,
  courseSlug,
  lessonSlug,
  language,
}: LessonNavigationProps) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [code, setCode] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const shownFeedbackForExercise = useRef<Set<string>>(new Set());
  const shownHintsEventForExercise = useRef<Set<string>>(new Set());
  const shownSolutionEventForExercise = useRef<Set<string>>(new Set());

  const { executeCode, result, isExecuting } = useCodeExecution({
    language,
    timeout: 10000,
  });

  const activeExercise = exercises[activeExerciseIndex];

  const trackClientEvent = useCallback(
    async (
      eventType:
        | "exercise_code_run"
        | "hint_opened"
        | "solution_opened",
      metadata?: Record<string, unknown>
    ) => {
      if (!activeExercise) return;

      try {
        await fetch("/api/learning-events/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventType,
            courseSlug,
            lessonSlug,
            exerciseId: activeExercise.id,
            exerciseTitle: activeExercise.title,
            source: "client",
            metadata,
          }),
          keepalive: true,
        });
      } catch {
        // Silencioso para no afectar UX.
      }
    },
    [activeExercise, courseSlug, lessonSlug]
  );

  const persistValidation = useCallback(
    async (
      exerciseId: string,
      payload: { output: string; runtimeError?: string; isCorrect: boolean }
    ) => {
      try {
        await fetch(`/api/exercises/${exerciseId}/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            exerciseId,
            output: payload.output,
            runtimeError: payload.runtimeError,
            isCorrect: payload.isCorrect,
          }),
        });
      } catch (error) {
        console.error('Error persisting exercise validation:', error);
      }
    },
    [code]
  );

  // Initialize code when exercise changes
  useEffect(() => {
    if (activeExercise) {
      setCode(activeExercise.starterCode || getDefaultStarterCode(language));
      setIsCorrect(null);
      setTestResults([]);
      setShowSolution(false);
      setShowFeedbackModal(false);
      setFeedbackRating(0);
      setFeedbackComment('');
    }
  }, [activeExercise, language]);

  const handleExecute = useCallback(async () => {
    setIsCorrect(null);
    const executionResult = await executeCode(code);
    if (activeExercise) {
      await trackClientEvent("exercise_code_run", {
        codeLength: code.length,
        hasError: !!executionResult.error,
      });
    }
  }, [executeCode, code, activeExercise, trackClientEvent]);

  const maybeShowFeedbackModal = useCallback((exerciseId: string, passed: boolean) => {
    if (!passed) return;
    if (shownFeedbackForExercise.current.has(exerciseId)) return;

    shownFeedbackForExercise.current.add(exerciseId);
    setShowFeedbackModal(true);
  }, []);

  const handleValidate = useCallback(async () => {
    const executionResult = await executeCode(code);

    if (activeExercise && executionResult) {
      const stdout = executionResult.stdout || '';
      const validationType = (activeExercise.validationType || 'custom') as ValidationType;
      const normalized = normalizeTestCases(activeExercise.testCases);

      if (executionResult.error) {
        setTestResults([
          {
            description: 'El código debe ejecutarse sin errores',
            passed: false,
            expected: 'Sin excepciones',
            actual: executionResult.error,
          },
        ]);
        setIsCorrect(false);
        await persistValidation(activeExercise.id, {
          output: stdout,
          runtimeError: executionResult.error,
          isCorrect: false,
        });
        return;
      }

      const fallbackResults: TestResult[] = [
        {
          description: 'El código se ejecutó correctamente',
          passed: true,
          expected: 'Ejecución exitosa',
          actual: 'OK',
        },
      ];

      if (normalized.length === 0) {
        setTestResults(fallbackResults);
        setIsCorrect(true);
        await persistValidation(activeExercise.id, {
          output: stdout,
          isCorrect: true,
        });
        maybeShowFeedbackModal(activeExercise.id, true);
        return;
      }

      const results: TestResult[] = normalized.map((test, index) => {
        if (validationType === 'regex') {
          const pattern = test.pattern || '';
          let passed = false;
          try {
            passed = new RegExp(pattern, 'm').test(stdout);
          } catch {
            passed = false;
          }
          return {
            description: test.description || `Test ${index + 1}`,
            passed,
            expected: `Regex: ${pattern || '(vacío)'}`,
            actual: stdout.trim() || '(sin salida)',
          };
        }

        const expected = test.expected || '';
        const actual = stdout.trim();
        const passed =
          validationType === 'exact'
            ? actual === expected.trim()
            : actual.includes(expected);

        return {
          description: test.description || `Test ${index + 1}`,
          passed,
          expected,
          actual: actual || '(sin salida)',
        };
      });

      const passedAllTests = results.every((testResult) => testResult.passed);

      setTestResults(results);
      setIsCorrect(passedAllTests);
      await persistValidation(activeExercise.id, {
        output: stdout,
        isCorrect: passedAllTests,
      });
      maybeShowFeedbackModal(activeExercise.id, passedAllTests);
    }
  }, [
    executeCode,
    code,
    activeExercise,
    persistValidation,
    maybeShowFeedbackModal,
  ]);

  const handleSubmitFeedback = useCallback(async () => {
    if (!activeExercise) return;
    if (!feedbackRating) {
      toast.warning('Selecciona una calificación en estrellas antes de enviar.');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const response = await fetch(`/api/exercises/${activeExercise.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment,
        }),
      });

      const payload = (await response.json().catch(() => null)) as ApiResult | null;

      if (!response.ok || payload?.success === false) {
        toast.warning(payload?.error || 'No se pudo guardar tu feedback, pero gracias por evaluarlo.');
      } else {
        toast.success('Gracias por tu feedback. Nos ayuda a mejorar los ejercicios.');
      }

      setShowFeedbackModal(false);
      setFeedbackRating(0);
      setFeedbackComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.warning('No se pudo enviar tu feedback en este momento.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [activeExercise, feedbackRating, feedbackComment]);

  const handleReset = () => {
    if (activeExercise) {
      setCode(activeExercise.starterCode || getDefaultStarterCode(language));
      setIsCorrect(null);
      setTestResults([]);
    }
  };

  const handleToggleHints = async () => {
    const nextShowHints = !showHints;
    setShowHints(nextShowHints);

    if (nextShowHints && activeExercise && !shownHintsEventForExercise.current.has(activeExercise.id)) {
      shownHintsEventForExercise.current.add(activeExercise.id);
      await trackClientEvent("hint_opened");
    }
  };

  const handleToggleSolution = async () => {
    const nextShowSolution = !showSolution;
    setShowSolution(nextShowSolution);

    if (
      nextShowSolution &&
      activeExercise &&
      !shownSolutionEventForExercise.current.has(activeExercise.id)
    ) {
      shownSolutionEventForExercise.current.add(activeExercise.id);
      await trackClientEvent("solution_opened");
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Editor de {LANGUAGE_LABELS[language]}
        </h3>
        <PythonEditor
          value={code}
          onChange={setCode}
          height="300px"
          language={language}
          placeholder={`# Escribe tu código ${LANGUAGE_LABELS[language]} aquí...`}
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
          </button>
        </div>
        <div className="mt-4">
          <OutputPanel result={result} isExecuting={isExecuting} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Selector de ejercicios */}
        {exercises.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {exercises.map((exercise, index) => (
              <button
                key={exercise.id}
                onClick={() => setActiveExerciseIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  index === activeExerciseIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                Ejercicio {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Panel de ejercicio */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header del ejercicio */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {activeExercise?.title || 'Ejercicio'}
              </h3>
              {isCorrect !== null && (
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  {isCorrect ? '¡Correcto!' : 'Inténtalo de nuevo'}
                </span>
              )}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm prose dark:prose-invert max-w-none">
              {activeExercise?.instructions}
            </div>
          </div>

          {/* Editor */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <PythonEditor
              value={code}
              onChange={setCode}
              height="250px"
              language={language}
              placeholder={`# Escribe tu código ${LANGUAGE_LABELS[language]} aquí...`}
            />
          </div>

          {/* Controles */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
              </button>

              <button
                onClick={handleValidate}
                disabled={isExecuting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Verificar
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </button>

              {activeExercise?.hints && (activeExercise.hints as string[]).length > 0 && (
                <button
                  onClick={handleToggleHints}
                  className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-lg font-medium transition-colors ml-auto"
                >
                  <Lightbulb className="w-4 h-4" />
                  Pistas
                  {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Pistas */}
          {showHints && activeExercise?.hints && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Pistas:</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                {(activeExercise.hints as string[]).map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Solución (colapsable) */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleToggleSolution}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
            >
              <span>Ver solución</span>
              {showSolution ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showSolution && (
              <div className="px-4 pb-4">
                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-x-auto">
                  <code>{activeExercise?.solutionCode}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Output */}
          <div className="p-4">
            {testResults.length > 0 && (
              <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Resultado de tests ({testResults.filter((r) => r.passed).length}/{testResults.length})
                  </span>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {testResults.map((testResult, index) => (
                    <div key={index} className="p-3 text-sm">
                      <div className="flex items-start gap-2 mb-1">
                        {testResult.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{testResult.description}</p>
                          {!testResult.passed && (
                            <>
                              <p className="text-gray-500 dark:text-gray-400">Esperado: {testResult.expected}</p>
                              <p className="text-gray-500 dark:text-gray-400">Actual: {testResult.actual}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <OutputPanel result={result} isExecuting={isExecuting} />
          </div>
        </div>
      </div>

      <Modal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Buen trabajo, reto completado"
        description="Califica este ejercicio para ayudarnos a mejorar la experiencia."
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowFeedbackModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Ahora no
            </button>
            <button
              type="button"
              onClick={handleSubmitFeedback}
              disabled={isSubmittingFeedback}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors"
            >
              {isSubmittingFeedback ? 'Enviando...' : 'Enviar evaluación'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              ¿Qué tanto te gustó este ejercicio?
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFeedbackRating(value)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label={`Calificar con ${value} estrella${value > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      value <= feedbackRating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="exercise-feedback-comment"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Comentario (opcional)
            </label>
            <textarea
              id="exercise-feedback-comment"
              value={feedbackComment}
              onChange={(event) => setFeedbackComment(event.target.value)}
              placeholder="¿Qué mejorarías o qué te gustó más?"
              maxLength={400}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
