'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Exercise } from '@prisma/client';
import { PythonEditor } from '@/components/python-editor/PythonEditor';
import { useCodeExecution } from '@/components/python-editor/useCodeExecution';
import { OutputPanel } from '@/components/python-editor/OutputPanel';
import {
  Play,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  XCircle,
  ListChecks,
} from 'lucide-react';

interface LessonNavigationProps {
  exercises: Exercise[];
  courseSlug: string;
  lessonSlug: string;
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

export function LessonNavigation({ exercises }: LessonNavigationProps) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [code, setCode] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const { executeCode, result, isExecuting } = useCodeExecution({
    timeout: 10000,
  });

  const activeExercise = exercises[activeExerciseIndex];

  // Initialize code when exercise changes
  useEffect(() => {
    if (activeExercise) {
      setCode(activeExercise.starterCode || '# Escribe tu código aquí\n');
      setIsCorrect(null);
      setTestResults([]);
      setShowSolution(false);
    }
  }, [activeExercise]);

  const handleExecute = useCallback(async () => {
    setIsCorrect(null);
    await executeCode(code);
  }, [executeCode, code]);

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

      setTestResults(results);
      setIsCorrect(results.every((result) => result.passed));
    }
  }, [executeCode, code, activeExercise]);

  const handleReset = () => {
    if (activeExercise) {
      setCode(activeExercise.starterCode || '# Escribe tu código aquí\n');
      setIsCorrect(null);
      setTestResults([]);
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Editor de Python
        </h3>
        <PythonEditor
          value={code}
          onChange={setCode}
          height="300px"
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
                onClick={() => setShowHints(!showHints)}
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
            onClick={() => setShowSolution(!showSolution)}
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
  );
}
