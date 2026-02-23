/**
 * Hook useCodeExecution - Maneja la ejecución de código Python
 */

import { useState, useCallback, useRef } from 'react';
import { usePyodide, PyodideStatus } from './usePyodide';

export interface ExecutionResult {
  /** Salida estándar */
  stdout: string;
  /** Salida de error */
  stderr: string;
  /** Error de ejecución */
  error?: string;
  /** Imágenes matplotlib generadas */
  plots: string[];
  /** Tiempo de ejecución en ms */
  executionTime: number;
}

export interface UseCodeExecutionReturn {
  /** Estado de Pyodide */
  pyodideStatus: PyodideStatus;
  /** Resultado de la última ejecución */
  result: ExecutionResult | null;
  /** Si está ejecutando código actualmente */
  isExecuting: boolean;
  /** Error de carga de Pyodide */
  pyodideError: Error | null;
  /** Función para ejecutar código */
  executeCode: (code: string) => Promise<ExecutionResult>;
  /** Función para cargar Pyodide manualmente */
  loadPyodide: () => Promise<void>;
  /** Limpiar resultado */
  clearResult: () => void;
}

export interface UseCodeExecutionOptions {
  /** Timeout de ejecución en ms (default: 5000) */
  timeout?: number;
  /** Capturar imágenes matplotlib */
  capturePlots?: boolean;
}

// Timeout por defecto: 5 segundos
const DEFAULT_EXECUTION_TIMEOUT = 5000;

/**
 * Hook para ejecutar código Python usando Pyodide
 * Captura stdout, stderr y maneja timeouts
 */
export function useCodeExecution(
  options: UseCodeExecutionOptions = {}
): UseCodeExecutionReturn {
  const { timeout = DEFAULT_EXECUTION_TIMEOUT, capturePlots = true } = options;

  const { status: pyodideStatus, pyodide, error: pyodideError, load: loadPyodide } = usePyodide({
    autoLoad: false,
  });

  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Ref para cancelar ejecución
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeCode = useCallback(
    async (code: string): Promise<ExecutionResult> => {
      // Asegurar que Pyodide esté cargado
      if (!pyodide) {
        await loadPyodide();
      }

      const pyodideInstance = pyodide || (await loadPyodide().then(() => pyodide));
      if (!pyodideInstance) {
        throw new Error('Pyodide no pudo cargarse');
      }

      setIsExecuting(true);
      const startTime = performance.now();

      // Capturar salida
      const stdout: string[] = [];
      const stderr: string[] = [];
      const plots: string[] = [];

      try {
        // Crear AbortController para timeout
        abortControllerRef.current = new AbortController();

        // Configurar handlers de salida
        pyodideInstance.setStdout({ batched: (text: string) => stdout.push(text) });
        pyodideInstance.setStderr({ batched: (text: string) => stderr.push(text) });

        // Capturar plots si está habilitado
        let codeWithPlotCapture = code;
        if (capturePlots) {
          codeWithPlotCapture = `
import matplotlib.pyplot as plt

# Capturar show() original
_original_show = plt.show if hasattr(plt, 'show') else None

def _capture_and_show(*args, **kwargs):
    from io import BytesIO
    import base64
    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    print(f'__PLOT__:{img_str}')
    plt.close()

plt.show = _capture_and_show

# Código del usuario
${code}

# Restaurar
if _original_show:
    plt.show = _original_show
          `;
        }

        // Ejecutar con timeout
        const executionPromise = pyodideInstance.runPythonAsync(codeWithPlotCapture);
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timer = setTimeout(() => {
            reject(new Error(`Timeout: La ejecución excedió ${timeout}ms`));
          }, timeout);
          
          abortControllerRef.current?.signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new Error('Ejecución cancelada'));
          });
        });

        await Promise.race([executionPromise, timeoutPromise]);

        // Procesar salida para extraer plots
        const fullStdout = stdout.join('');
        const plotRegex = /__PLOT__:([A-Za-z0-9+/=]+)/g;
        let match;
        const cleanedStdout: string[] = [];
        let lastIndex = 0;

        while ((match = plotRegex.exec(fullStdout)) !== null) {
          // Agregar texto antes del plot
          if (match.index > lastIndex) {
            cleanedStdout.push(fullStdout.slice(lastIndex, match.index));
          }
          plots.push(match[1]);
          lastIndex = match.index + match[0].length;
        }
        // Agregar resto del texto
        if (lastIndex < fullStdout.length) {
          cleanedStdout.push(fullStdout.slice(lastIndex));
        }

        const executionResult: ExecutionResult = {
          stdout: cleanedStdout.join(''),
          stderr: stderr.join(''),
          plots,
          executionTime: Math.round(performance.now() - startTime),
        };

        setResult(executionResult);
        return executionResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        // Limpiar mensajes de error de Pyodide para hacerlos más amigables
        const cleanedError = cleanPythonError(errorMessage);

        const executionResult: ExecutionResult = {
          stdout: stdout.join(''),
          stderr: stderr.join(''),
          error: cleanedError,
          plots,
          executionTime: Math.round(performance.now() - startTime),
        };

        setResult(executionResult);
        return executionResult;
      } finally {
        // Restaurar handlers sin captura explícita
        pyodideInstance.setStdout({});
        pyodideInstance.setStderr({});
        setIsExecuting(false);
        abortControllerRef.current = null;
      }
    },
    [pyodide, loadPyodide, timeout, capturePlots]
  );

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    pyodideStatus,
    result,
    isExecuting,
    pyodideError,
    executeCode,
    loadPyodide,
    clearResult,
  };
}

/**
 * Limpia mensajes de error de Python para hacerlos más amigables
 */
function cleanPythonError(error: string): string {
  // Eliminar trazas internas de Pyodide/JavaScript
  let cleaned = error
    .replace(/File "[^"]*pyodide[^"]*", line \d+, in [^\n]*\n/g, '')
    .replace(/\s*at [^\n]*\n/g, '');

  // Resaltar la línea del error del usuario
  const userErrorMatch = cleaned.match(/File "<exec>", line (\d+)[^:]*:?(.*)/);
  if (userErrorMatch) {
    const lineNum = userErrorMatch[1];
    const rest = userErrorMatch[2] || cleaned.split('\n').pop() || '';
    cleaned = `Error en línea ${lineNum}:\n${rest.trim()}`;
  }

  // Traducir errores comunes
  const translations: Record<string, string> = {
    'SyntaxError': 'Error de Sintaxis',
    'NameError': 'Nombre no definido',
    'TypeError': 'Error de Tipo',
    'ValueError': 'Error de Valor',
    'IndexError': 'Índice fuera de rango',
    'KeyError': 'Clave no encontrada',
    'AttributeError': 'Atributo no encontrado',
    'ZeroDivisionError': 'División por cero',
    'ImportError': 'Error de importación',
    'ModuleNotFoundError': 'Módulo no encontrado',
  };

  for (const [original, translated] of Object.entries(translations)) {
    cleaned = cleaned.replace(new RegExp(`\\b${original}\\b`, 'g'), translated);
  }

  return cleaned.trim();
}

export default useCodeExecution;
