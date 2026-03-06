/**
 * Hook useCodeExecution - Maneja la ejecución de código en browser por lenguaje
 */

import { useState, useCallback, useRef } from "react";
import type { PyodideInterface } from "pyodide";
import type { CourseLanguage } from "@/lib/course-runtime";
import { usePyodide, PyodideStatus } from "./usePyodide";
import { executeWasmLanguage } from "./wasm-language-runtime";

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
  loadPyodide: () => Promise<import("pyodide").PyodideInterface>;
  /** Limpiar resultado */
  clearResult: () => void;
}

export interface UseCodeExecutionOptions {
  /** Lenguaje del curso */
  language?: CourseLanguage;
  /** Timeout de ejecución en ms (default: 5000) */
  timeout?: number;
  /** Capturar imágenes matplotlib */
  capturePlots?: boolean;
}

// Timeout por defecto: 5 segundos
const DEFAULT_EXECUTION_TIMEOUT = 5000;

type PythonOptionalPackage = "pandas" | "matplotlib";

interface PythonRuntimeNeeds {
  needsPandas: boolean;
  needsMatplotlib: boolean;
}

const PANDAS_IMPORT_PATTERN = /\b(?:import\s+pandas|from\s+pandas)\b/i;
const MATPLOTLIB_IMPORT_PATTERN =
  /\b(?:import\s+matplotlib|from\s+matplotlib|import\s+matplotlib\.pyplot|from\s+matplotlib\.pyplot)\b/i;
const MATPLOTLIB_USAGE_PATTERN = /\bplt\./i;

const pythonRuntimeAvailabilityCache = new WeakMap<
  PyodideInterface,
  Partial<Record<PythonOptionalPackage, boolean>>
>();

/**
 * Hook para ejecutar código en browser, enroutando por lenguaje.
 * Python usa Pyodide; JS/TS/SQL usan runtime JS.
 */
export function useCodeExecution(
  options: UseCodeExecutionOptions = {}
): UseCodeExecutionReturn {
  const {
    language = "python",
    timeout = DEFAULT_EXECUTION_TIMEOUT,
    capturePlots = true,
  } = options;

  const {
    status: pyodideStatus,
    pyodide,
    error: pyodideError,
    load: loadPyodide,
  } = usePyodide({
    autoLoad: language === "python",
  });

  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Ref para cancelar ejecución
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeCode = useCallback(
    async (code: string): Promise<ExecutionResult> => {
      setIsExecuting(true);
      const startTime = performance.now();
      abortControllerRef.current = new AbortController();

      try {
        let executionResult: ExecutionResult;

        switch (language) {
          case "python":
            executionResult = await executePython({
              pyodide,
              loadPyodide,
              timeout,
              capturePlots,
              code,
              abortController: abortControllerRef.current,
            });
            break;
          case "javascript":
            executionResult = await executeJavaScript(code, timeout);
            break;
          case "typescript":
            executionResult = await executeTypeScript(code, timeout);
            break;
          case "sql":
            executionResult = await executeSql(code);
            break;
          case "clojure":
            executionResult = await executeWasmBackedLanguage({
              language: "clojure",
              code,
              timeout,
              startTime,
            });
            break;
          case "go":
            executionResult = await executeWasmBackedLanguage({
              language: "go",
              code,
              timeout,
              startTime,
            });
            break;
          case "rust":
            executionResult = await executeWasmBackedLanguage({
              language: "rust",
              code,
              timeout,
              startTime,
            });
            break;
          case "bash":
            executionResult = await executeWasmBackedLanguage({
              language: "bash",
              code,
              timeout,
              startTime,
            });
            break;
          default:
            executionResult = {
              stdout: "",
              stderr: "",
              error: "Lenguaje no soportado.",
              plots: [],
              executionTime: Math.round(performance.now() - startTime),
            };
        }

        setResult(executionResult);
        return executionResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const executionResult: ExecutionResult = {
          stdout: "",
          stderr: "",
          error:
            language === "python" ? cleanPythonError(errorMessage) : errorMessage.trim(),
          plots: [],
          executionTime: Math.round(performance.now() - startTime),
        };
        setResult(executionResult);
        return executionResult;
      } finally {
        setIsExecuting(false);
        abortControllerRef.current = null;
      }
    },
    [language, pyodide, loadPyodide, timeout, capturePlots]
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

function inferPythonRuntimeNeeds(code: string, capturePlots: boolean): PythonRuntimeNeeds {
  return {
    needsPandas: PANDAS_IMPORT_PATTERN.test(code),
    needsMatplotlib:
      capturePlots &&
      (MATPLOTLIB_IMPORT_PATTERN.test(code) || MATPLOTLIB_USAGE_PATTERN.test(code)),
  };
}

function readCachedPackageAvailability(
  pyodide: PyodideInterface,
  moduleName: PythonOptionalPackage
): boolean | undefined {
  return pythonRuntimeAvailabilityCache.get(pyodide)?.[moduleName];
}

function writeCachedPackageAvailability(
  pyodide: PyodideInterface,
  moduleName: PythonOptionalPackage,
  isAvailable: boolean
) {
  const cached = pythonRuntimeAvailabilityCache.get(pyodide) ?? {};
  cached[moduleName] = isAvailable;
  pythonRuntimeAvailabilityCache.set(pyodide, cached);
}

function detectPythonModuleAvailability(
  pyodide: PyodideInterface,
  moduleName: PythonOptionalPackage
): boolean {
  try {
    const imported = pyodide.pyimport(moduleName);
    if (
      imported &&
      typeof imported === "object" &&
      "destroy" in imported &&
      typeof (imported as { destroy?: () => void }).destroy === "function"
    ) {
      (imported as { destroy: () => void }).destroy();
    }
    return true;
  } catch {
    return false;
  }
}

async function ensurePythonModuleAvailability(
  pyodide: PyodideInterface,
  moduleName: PythonOptionalPackage
): Promise<boolean> {
  const cached = readCachedPackageAvailability(pyodide, moduleName);
  if (typeof cached === "boolean") {
    return cached;
  }

  let isAvailable = detectPythonModuleAvailability(pyodide, moduleName);
  if (!isAvailable) {
    try {
      await pyodide.loadPackage(moduleName);
    } catch {
      // Si falla la carga, dejamos que el guardrail muestre fallback claro.
    }
    isAvailable = detectPythonModuleAvailability(pyodide, moduleName);
  }

  writeCachedPackageAvailability(pyodide, moduleName, isAvailable);
  return isAvailable;
}

async function resolvePythonRuntimeGuardrail({
  pyodide,
  code,
  capturePlots,
}: {
  pyodide: PyodideInterface;
  code: string;
  capturePlots: boolean;
}) {
  const warnings: string[] = [];
  const needs = inferPythonRuntimeNeeds(code, capturePlots);

  if (needs.needsPandas) {
    const pandasAvailable = await ensurePythonModuleAvailability(pyodide, "pandas");
    if (!pandasAvailable) {
      warnings.push(
        "Pandas no esta disponible en este runtime browser. Fallback: usa listas/diccionarios nativos o un entorno Python completo para DataFrames."
      );
    }
  }

  let matplotlibAvailable = true;
  if (needs.needsMatplotlib) {
    matplotlibAvailable = await ensurePythonModuleAvailability(pyodide, "matplotlib");
    if (!matplotlibAvailable) {
      warnings.push(
        "Matplotlib no esta disponible en este runtime browser. Fallback: imprime resultados tabulares o usa un entorno con soporte grafico completo."
      );
    }
  }

  return {
    canRun: warnings.length === 0,
    warnings,
    shouldCapturePlots: needs.needsMatplotlib && matplotlibAvailable,
  };
}

async function executePython({
  pyodide,
  loadPyodide,
  timeout,
  capturePlots,
  code,
  abortController,
}: {
  pyodide: import("pyodide").PyodideInterface | null;
  loadPyodide: () => Promise<import("pyodide").PyodideInterface>;
  timeout: number;
  capturePlots: boolean;
  code: string;
  abortController: AbortController;
}): Promise<ExecutionResult> {
  const startTime = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const plots: string[] = [];

  const pyodideInstance = pyodide ?? (await loadPyodide());
  if (!pyodideInstance) {
    throw new Error("Pyodide no pudo cargarse");
  }

  const guardrail = await resolvePythonRuntimeGuardrail({
    pyodide: pyodideInstance,
    code,
    capturePlots,
  });
  if (!guardrail.canRun) {
    return {
      stdout: "",
      stderr: guardrail.warnings.join("\n"),
      error: "Dependencias de Python no disponibles en este navegador.",
      plots: [],
      executionTime: Math.round(performance.now() - startTime),
    };
  }

  pyodideInstance.setStdout({ batched: (text: string) => stdout.push(text) });
  pyodideInstance.setStderr({ batched: (text: string) => stderr.push(text) });

  let codeWithPlotCapture = code;
  if (guardrail.shouldCapturePlots) {
    codeWithPlotCapture = `
import matplotlib.pyplot as plt

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

${code}

if _original_show:
    plt.show = _original_show
`;
  }

  try {
    const executionPromise = pyodideInstance.runPythonAsync(codeWithPlotCapture);
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout: La ejecución excedió ${timeout}ms`));
      }, timeout);

      abortController.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new Error("Ejecución cancelada"));
      });
    });

    await Promise.race([executionPromise, timeoutPromise]);
  } finally {
    pyodideInstance.setStdout({});
    pyodideInstance.setStderr({});
  }

  const fullStdout = stdout.join("");
  const plotRegex = /__PLOT__:([A-Za-z0-9+/=]+)/g;
  let match: RegExpExecArray | null;
  const cleanedStdout: string[] = [];
  let lastIndex = 0;

  while ((match = plotRegex.exec(fullStdout)) !== null) {
    if (match.index > lastIndex) {
      cleanedStdout.push(fullStdout.slice(lastIndex, match.index));
    }
    plots.push(match[1]);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < fullStdout.length) {
    cleanedStdout.push(fullStdout.slice(lastIndex));
  }

  return {
    stdout: cleanedStdout.join(""),
    stderr: stderr.join(""),
    plots,
    executionTime: Math.round(performance.now() - startTime),
  };
}

async function executeJavaScript(code: string, timeout: number): Promise<ExecutionResult> {
  const startTime = performance.now();

  const workerScript = `
    self.onmessage = async (event) => {
      const logs = [];
      const errors = [];
      const originalConsole = console.log;

      console.log = (...args) => {
        logs.push(args.map((arg) => {
          try {
            return typeof arg === "string" ? arg : JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        }).join(" "));
      };

      try {
        const fn = new Function(event.data.code);
        const maybePromise = fn();
        if (maybePromise && typeof maybePromise.then === "function") {
          await maybePromise;
        }
        self.postMessage({ stdout: logs.join("\\n"), stderr: errors.join("\\n") });
      } catch (error) {
        self.postMessage({
          stdout: logs.join("\\n"),
          stderr: errors.join("\\n"),
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        console.log = originalConsole;
      }
    };
  `;

  const blob = new Blob([workerScript], { type: "application/javascript" });
  const worker = new Worker(URL.createObjectURL(blob));

  try {
    const response = await new Promise<{ stdout: string; stderr: string; error?: string }>(
      (resolve, reject) => {
        const timer = setTimeout(() => {
          worker.terminate();
          reject(new Error(`Timeout: La ejecución excedió ${timeout}ms`));
        }, timeout);

        worker.onmessage = (event) => {
          clearTimeout(timer);
          resolve(event.data as { stdout: string; stderr: string; error?: string });
        };

        worker.onerror = (event) => {
          clearTimeout(timer);
          reject(new Error(event.message || "Error en Worker de JavaScript"));
        };

        worker.postMessage({ code });
      }
    );

    return {
      stdout: response.stdout || "",
      stderr: response.stderr || "",
      error: response.error,
      plots: [],
      executionTime: Math.round(performance.now() - startTime),
    };
  } finally {
    worker.terminate();
  }
}

async function executeTypeScript(code: string, timeout: number): Promise<ExecutionResult> {
  const ts = await import("typescript");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      strict: false,
      skipLibCheck: true,
    },
  });

  return executeJavaScript(transpiled.outputText, timeout);
}

async function executeSql(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  const statements = code
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  if (statements.length === 0) {
    return {
      stdout: "",
      stderr: "",
      plots: [],
      executionTime: Math.round(performance.now() - startTime),
    };
  }
  const outputs: string[] = [];

  for (const statement of statements) {
    const rows = evaluateSqlStatement(statement);
    outputs.push(JSON.stringify(rows, null, 2));
  }

  return {
    stdout: outputs.join("\n"),
    stderr: "",
    plots: [],
    executionTime: Math.round(performance.now() - startTime),
  };
}

function evaluateSqlStatement(statement: string): Array<Record<string, unknown>> {
  const trimmed = statement.trim();
  if (!/^select\s+/i.test(trimmed)) {
    throw new Error("Solo se soportan sentencias SELECT en modo browser-only.");
  }

  const selectBody = trimmed.replace(/^select\s+/i, "");
  const expressions = splitSqlExpressions(selectBody);
  if (expressions.length === 0) {
    throw new Error("SELECT inválido: no hay columnas para evaluar.");
  }

  const row: Record<string, unknown> = {};
  expressions.forEach((expression, index) => {
    const aliasMatch = expression.match(/^(.*?)(?:\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*))$/i);
    const rawExpression = aliasMatch?.[1]?.trim() ?? expression.trim();
    const alias = aliasMatch?.[2] ?? `column_${index + 1}`;
    row[alias] = evaluateSqlExpression(rawExpression);
  });

  return [row];
}

function splitSqlExpressions(selectBody: string): string[] {
  const expressions: string[] = [];
  let current = "";
  let inSingleQuote = false;

  for (const char of selectBody) {
    if (char === "'") {
      inSingleQuote = !inSingleQuote;
      current += char;
      continue;
    }
    if (char === "," && !inSingleQuote) {
      if (current.trim()) expressions.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) expressions.push(current.trim());
  return expressions;
}

function evaluateSqlExpression(expression: string): string | number {
  if (/^'.*'$/.test(expression)) {
    return expression.slice(1, -1).replace(/''/g, "'");
  }

  if (/^-?\d+(\.\d+)?$/.test(expression)) {
    return Number(expression);
  }

  const binaryOperationMatch = expression.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)\s*$/
  );
  if (binaryOperationMatch) {
    const left = Number(binaryOperationMatch[1]);
    const operator = binaryOperationMatch[2];
    const right = Number(binaryOperationMatch[3]);

    switch (operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        if (right === 0) {
          throw new Error("División por cero en expresión SQL.");
        }
        return left / right;
      default:
        break;
    }
  }

  throw new Error(
    `Expresión SQL no soportada en browser-only: "${expression}".`
  );
}

async function executeWasmBackedLanguage({
  language,
  code,
  timeout,
  startTime,
}: {
  language: "clojure" | "go" | "rust" | "bash";
  code: string;
  timeout: number;
  startTime: number;
}): Promise<ExecutionResult> {
  const minimumTimeoutByLanguage: Record<
    "clojure" | "go" | "rust" | "bash",
    number
  > = {
    clojure: 30000,
    go: 120000,
    rust: 30000,
    bash: 20000,
  };
  const wasmTimeout = Math.max(timeout, minimumTimeoutByLanguage[language]);
  const output = await executeWasmLanguage({
    language,
    code,
    timeout: wasmTimeout,
  });

  return {
    stdout: output.stdout,
    stderr: output.stderr,
    error: output.error,
    plots: [],
    executionTime: Math.round(performance.now() - startTime),
  };
}

/**
 * Limpia mensajes de error de Python para hacerlos más amigables
 */
function cleanPythonError(error: string): string {
  let cleaned = error
    .replace(/File "[^"]*pyodide[^"]*", line \d+, in [^\n]*\n/g, "")
    .replace(/\s*at [^\n]*\n/g, "");

  const userErrorMatch = cleaned.match(/File "<exec>", line (\d+)[^:]*:?(.*)/);
  if (userErrorMatch) {
    const lineNum = userErrorMatch[1];
    const rest = userErrorMatch[2] || cleaned.split("\n").pop() || "";
    cleaned = `Error en línea ${lineNum}:\n${rest.trim()}`;
  }

  const translations: Record<string, string> = {
    SyntaxError: "Error de Sintaxis",
    NameError: "Nombre no definido",
    TypeError: "Error de Tipo",
    ValueError: "Error de Valor",
    IndexError: "Índice fuera de rango",
    KeyError: "Clave no encontrada",
    AttributeError: "Atributo no encontrado",
    ZeroDivisionError: "División por cero",
    ImportError: "Error de importación",
    ModuleNotFoundError: "Módulo no encontrado",
  };

  for (const [original, translated] of Object.entries(translations)) {
    cleaned = cleaned.replace(new RegExp(`\\b${original}\\b`, "g"), translated);
  }

  return cleaned.trim();
}

export default useCodeExecution;
