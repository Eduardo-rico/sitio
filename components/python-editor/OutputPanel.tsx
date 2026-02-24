/**
 * OutputPanel Component - Muestra resultados de ejecución Python
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { Terminal, AlertCircle, Clock, Image as ImageIcon } from 'lucide-react';
import { SuccessCheck } from '@/components/animations/success-check';
import { ExecutionResult } from './useCodeExecution';

export interface OutputPanelProps {
  /** Resultado de la ejecución */
  result: ExecutionResult | null;
  /** Si está ejecutando */
  isExecuting?: boolean;
  /** Altura del panel */
  height?: string | number;
  /** Clase CSS adicional */
  className?: string;
  /** Mostrar tiempo de ejecución */
  showExecutionTime?: boolean;
}

/**
 * Panel de salida para mostrar resultados de ejecución Python
 * Diferencia stdout/stderr con colores y soporta imágenes matplotlib
 */
export function OutputPanel({
  result,
  isExecuting = false,
  height = '200px',
  className = '',
  showExecutionTime = true,
}: OutputPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevo output
  useEffect(() => {
    if (scrollRef.current && result) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result]);

  const hasOutput = result && (result.stdout || result.stderr || result.error || result.plots.length > 0);

  return (
    <div
      className={`output-panel bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Consola
          </span>
        </div>
        {showExecutionTime && result?.executionTime && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{result.executionTime}ms</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        ref={scrollRef}
        className="p-4 overflow-auto font-mono text-sm"
        style={{ height: 'calc(100% - 41px)' }}
      >
        {/* Estado vacío */}
        {!result && !isExecuting && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <Terminal className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Ejecuta el código para ver el resultado</p>
            <p className="text-xs mt-1 opacity-70">Presiona Ctrl+Enter</p>
          </div>
        )}

        {/* Loading */}
        {isExecuting && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Ejecutando...</span>
          </div>
        )}

        {/* Output */}
        {hasOutput && !isExecuting && (
          <div className="space-y-3">
            {/* stdout */}
            {result.stdout && (
              <div className="output-section">
                <div className="flex items-center gap-1 mb-1 text-xs text-gray-500 dark:text-gray-500">
                  <SuccessCheck className="w-4 h-4 text-green-500" />
                  <span>Salida estándar</span>
                </div>
                <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-950 p-3 rounded border border-gray-200 dark:border-gray-800">
                  {result.stdout || <span className="text-gray-400 italic">(sin salida)</span>}
                </pre>
              </div>
            )}

            {/* stderr */}
            {result.stderr && (
              <div className="output-section">
                <div className="flex items-center gap-1 mb-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>Advertencias</span>
                </div>
                <pre className="whitespace-pre-wrap text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 rounded border border-amber-200 dark:border-amber-900">
                  {result.stderr}
                </pre>
              </div>
            )}

            {/* Error */}
            {result.error && (
              <div className="output-section">
                <div className="flex items-center gap-1 mb-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>Error</span>
                </div>
                <pre className="whitespace-pre-wrap text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 p-3 rounded border border-red-200 dark:border-red-900">
                  {result.error}
                </pre>
              </div>
            )}

            {/* Plots */}
            {result.plots.length > 0 && (
              <div className="output-section">
                <div className="flex items-center gap-1 mb-2 text-xs text-gray-500 dark:text-gray-500">
                  <ImageIcon className="w-3 h-3" />
                  <span>Gráficos ({result.plots.length})</span>
                </div>
                <div className="space-y-2">
                  {result.plots.map((plot, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-950 p-2 rounded border border-gray-200 dark:border-gray-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/png;base64,${plot}`}
                        alt={`Plot ${index + 1}`}
                        className="max-w-full h-auto matplotlib-plot"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sin output pero tampoco error */}
            {!result.stdout && !result.stderr && !result.error && result.plots.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 italic">
                El código se ejecutó sin producir salida.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
