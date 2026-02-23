'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Exercise } from '@prisma/client';
import { PythonEditor } from '@/components/python-editor/PythonEditor';
import { useCodeExecution } from '@/components/python-editor/useCodeExecution';
import { OutputPanel } from '@/components/python-editor/OutputPanel';
import { Play, RotateCcw, CheckCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface LessonNavigationProps {
  exercises: Exercise[];
  courseSlug: string;
  lessonSlug: string;
}

export function LessonNavigation({ exercises }: LessonNavigationProps) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [code, setCode] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const { executeCode, result, isExecuting } = useCodeExecution({
    timeout: 10000,
  });

  const activeExercise = exercises[activeExerciseIndex];

  // Initialize code when exercise changes
  useEffect(() => {
    if (activeExercise) {
      setCode(activeExercise.starterCode || '# Escribe tu código aquí\n');
      setIsCorrect(null);
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
      // Simple validation based on exercise type
      const { stdout } = executionResult;
      let correct = false;

      const testCases = activeExercise.testCases as any;

      switch (activeExercise.validationType) {
        case 'exact':
          correct = stdout.trim() === testCases?.expected?.trim();
          break;
        case 'contains':
          correct = stdout.includes(testCases?.expected);
          break;
        case 'regex':
          try {
            const regex = new RegExp(testCases?.pattern || '');
            correct = regex.test(stdout);
          } catch {
            correct = false;
          }
          break;
        default:
          // For exercises without validation, just check if code ran successfully
          correct = !executionResult.error;
      }

      setIsCorrect(correct);
    }
  }, [executeCode, code, activeExercise]);

  const handleReset = () => {
    if (activeExercise) {
      setCode(activeExercise.starterCode || '# Escribe tu código aquí\n');
      setIsCorrect(null);
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
          <OutputPanel result={result} isExecuting={isExecuting} />
        </div>
      </div>
    </div>
  );
}
