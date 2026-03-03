import type { CourseLanguage } from "@/lib/course-runtime";
import { LANGUAGE_LABELS } from "@/lib/course-runtime";

const WASMER_SDK_URL = "https://unpkg.com/@wasmer/sdk@0.10.0/dist/index.mjs";
const SCITTLE_RUNTIME_URL = "https://cdn.jsdelivr.net/npm/scittle@0.8.31/dist/scittle.js";
const YAEGI_RUNTIME_URL = "https://cdn.jsdelivr.net/npm/yaegi-wasm@1.0.2/src/index.js";

type WasmerRunOutput = {
  stdout: string;
  stderr: string;
  code: number;
  ok: boolean;
};

type WasmerInstance = {
  wait: () => Promise<WasmerRunOutput>;
};

type WasmerCommand = {
  run: (options?: {
    args?: string[];
    cwd?: string;
    mount?: Record<string, Record<string, string>>;
  }) => Promise<WasmerInstance>;
};

type WasmerPackage = {
  entrypoint?: WasmerCommand;
  commands: Record<string, WasmerCommand>;
};

type WasmerRuntime = unknown;

type WasmerSDK = {
  init: () => Promise<unknown>;
  Runtime: new () => WasmerRuntime;
  Wasmer: {
    fromRegistry: (specifier: string, runtime?: WasmerRuntime) => Promise<WasmerPackage>;
  };
};

type ScittleGlobal = {
  core?: {
    eval_string?: (code: string) => unknown;
  };
};

type YaegiResult = {
  success?: boolean;
  output?: string;
  error?: string | null;
};

type YaegiGlobal = {
  eval: (code: string) => Promise<YaegiResult> | YaegiResult;
  reset?: () => void;
};

type RuntimeWindow = Window &
  typeof globalThis & {
    scittle?: ScittleGlobal;
    yaegi?: YaegiGlobal;
  };

interface WasmExecutionInput {
  language: Extract<CourseLanguage, "clojure" | "go" | "rust" | "bash">;
  code: string;
  timeout: number;
}

interface WasmExecutionOutput {
  stdout: string;
  stderr: string;
  error?: string;
}

type RuntimePlan = {
  packageSpecifiers: string[];
  args: string[];
  preferredCommands?: string[];
  cwd?: string;
  mount?: Record<string, Record<string, string>>;
};

const GO_PACKAGE_FALLBACKS = ["golang/go@1.25.5-wasix-1", "golang/go"] as const;
const BASH_PACKAGE_FALLBACKS = ["wasmer/bash@1.0.25", "wasmer/bash"] as const;
const RUST_PACKAGE_OVERRIDE: string | null = null;

let sdkPromise: Promise<WasmerSDK> | null = null;
let runtimePromise: Promise<WasmerRuntime> | null = null;
const packageCache = new Map<string, Promise<WasmerPackage>>();
let scittlePromise: Promise<ScittleGlobal> | null = null;
let yaegiPromise: Promise<YaegiGlobal> | null = null;

function normalizePackageValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function withConfiguredFirst(configured: string | null, fallbacks: readonly string[]): string[] {
  const candidates = configured ? [configured, ...fallbacks] : [...fallbacks];
  return Array.from(new Set(candidates));
}

function getRuntimePlan(
  language: WasmExecutionInput["language"],
  code: string
): RuntimePlan {
  switch (language) {
    case "bash":
      return {
        packageSpecifiers: [...BASH_PACKAGE_FALLBACKS],
        preferredCommands: ["sh", "bash"],
        args: ["-c", code],
      };
    case "go":
      return {
        packageSpecifiers: [...GO_PACKAGE_FALLBACKS],
        preferredCommands: ["go"],
        args: ["run", "main.go"],
        cwd: "/workspace",
        mount: {
          "/workspace": {
            "main.go": code,
          },
        },
      };
    case "clojure":
      throw new Error("El runtime de Clojure se ejecuta con Scittle en browser.");
    case "rust": {
      const packageName = normalizePackageValue(RUST_PACKAGE_OVERRIDE);
      if (!packageName) {
        throw new Error(
          "Runtime WASM de Rust no configurado. Define RUST_PACKAGE_OVERRIDE en wasm-language-runtime.ts."
        );
      }

      return {
        packageSpecifiers: [packageName],
        args: ["/workspace/main.rs"],
        cwd: "/workspace",
        mount: {
          "/workspace": {
            "main.rs": code,
          },
        },
      };
    }
  }
}

async function getSDK(): Promise<WasmerSDK> {
  if (!sdkPromise) {
    sdkPromise = (async () => {
      const sdk = (await import(
        /* webpackIgnore: true */
        WASMER_SDK_URL
      )) as unknown as WasmerSDK;
      await sdk.init();
      return sdk;
    })();
  }

  return sdkPromise;
}

async function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      const sdk = await getSDK();
      return new sdk.Runtime();
    })();
  }

  return runtimePromise;
}

async function getPackage(specifier: string) {
  if (!packageCache.has(specifier)) {
    packageCache.set(
      specifier,
      (async () => {
        const sdk = await getSDK();
        const runtime = await getRuntime();
        return sdk.Wasmer.fromRegistry(specifier, runtime);
      })()
    );
  }

  return packageCache.get(specifier)!;
}

async function resolvePackage(specifiers: string[]) {
  const errors: string[] = [];

  for (const specifier of specifiers) {
    try {
      const pkg = await getPackage(specifier);
      return { specifier, pkg };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${specifier}: ${message}`);
    }
  }

  throw new Error(
    `No se pudo cargar ningún runtime WASM. Intentos: ${errors.join(" | ")}`
  );
}

function resolveCommand(pkg: WasmerPackage, preferredCommands?: string[]): WasmerCommand | null {
  if (preferredCommands?.length) {
    for (const commandName of preferredCommands) {
      const command = pkg.commands[commandName];
      if (command) {
        return command;
      }
    }
  }

  return pkg.entrypoint ?? Object.values(pkg.commands)[0] ?? null;
}

function withTimeout<T>(promise: Promise<T>, timeout: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeout);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function getRuntimeWindow(): RuntimeWindow {
  return window as RuntimeWindow;
}

function formatCapturedValues(values: unknown[]): string {
  return values
    .map((value) => {
      if (typeof value === "string") {
        return value;
      }

      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    })
    .join(" ");
}

function normalizeUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function injectScriptOnce(src: string): Promise<void> {
  const runtimeWindow = getRuntimeWindow();

  const existing = runtimeWindow.document.querySelector<HTMLScriptElement>(
    `script[src="${src}"]`
  );

  if (existing?.getAttribute("data-loaded") === "true") {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = existing ?? runtimeWindow.document.createElement("script");
    script.src = src;
    script.async = true;

    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`No se pudo cargar el script externo: ${src}`));
    };

    if (!existing) {
      runtimeWindow.document.head.appendChild(script);
    }
  });
}

async function getScittleRuntime(): Promise<ScittleGlobal> {
  if (!scittlePromise) {
    scittlePromise = (async () => {
      const runtimeWindow = getRuntimeWindow();

      if (!runtimeWindow.scittle?.core?.eval_string) {
        await injectScriptOnce(SCITTLE_RUNTIME_URL);
      }

      const evaluator = runtimeWindow.scittle?.core?.eval_string;

      if (typeof evaluator !== "function") {
        throw new Error("No se pudo inicializar Scittle para ejecutar Clojure.");
      }

      const scittleRuntime = runtimeWindow.scittle;

      if (!scittleRuntime) {
        throw new Error("Scittle no quedó disponible en window.scittle.");
      }

      return scittleRuntime;
    })();
  }

  return scittlePromise!;
}

async function getYaegiRuntime(): Promise<YaegiGlobal> {
  if (!yaegiPromise) {
    yaegiPromise = (async () => {
      const module = (await import(
        /* webpackIgnore: true */
        YAEGI_RUNTIME_URL
      )) as {
        createYaegiRunner?: () => Promise<unknown>;
      };

      if (typeof module.createYaegiRunner !== "function") {
        throw new Error("El runtime de Go (Yaegi) no expone createYaegiRunner.");
      }

      await module.createYaegiRunner();

      const runtimeWindow = getRuntimeWindow();

      if (!runtimeWindow.yaegi || typeof runtimeWindow.yaegi.eval !== "function") {
        throw new Error("El runtime de Go (Yaegi) no quedó disponible en window.yaegi.");
      }

      return runtimeWindow.yaegi;
    })();
  }

  return yaegiPromise;
}

async function executeClojureViaScittle({
  code,
  timeout,
}: Pick<WasmExecutionInput, "code" | "timeout">): Promise<WasmExecutionOutput> {
  const runtimeWindow = getRuntimeWindow();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const stdoutKey = `__clj_stdout_${Math.random().toString(36).slice(2)}`;
  const stderrKey = `__clj_stderr_${Math.random().toString(36).slice(2)}`;
  const dynamicWindow = runtimeWindow as RuntimeWindow & Record<string, (...values: unknown[]) => void>;

  dynamicWindow[stdoutKey] = (...values: unknown[]) => {
    stdout.push(formatCapturedValues(values));
  };
  dynamicWindow[stderrKey] = (...values: unknown[]) => {
    stderr.push(formatCapturedValues(values));
  };

  try {
    const scittle = await withTimeout(
      getScittleRuntime(),
      timeout,
      `Timeout cargando runtime Clojure (${timeout}ms).`
    );
    const evalString = scittle.core?.eval_string;

    if (typeof evalString !== "function") {
      throw new Error("Scittle no expone eval_string.");
    }

    const wrappedCode = `
      (binding [*print-fn* (fn [& xs] (apply js/${stdoutKey} xs))
                *print-err-fn* (fn [& xs] (apply js/${stderrKey} xs))]
        ${code}
      )
    `;

    await withTimeout(
      Promise.resolve(evalString(wrappedCode)),
      timeout,
      `Timeout ejecutando Clojure (${timeout}ms).`
    );

    return {
      stdout: stdout.join("\n").trim(),
      stderr: stderr.join("\n").trim(),
      error: stderr.length ? stderr.join("\n").trim() : undefined,
    };
  } catch (error) {
    const errorMessage = normalizeUnknownError(error);

    return {
      stdout: stdout.join("\n").trim(),
      stderr: stderr.join("\n").trim(),
      error: errorMessage,
    };
  } finally {
    delete dynamicWindow[stdoutKey];
    delete dynamicWindow[stderrKey];
  }
}

function normalizeYaegiResult(value: unknown): YaegiResult {
  if (!value || typeof value !== "object") {
    return { success: true, output: "", error: null };
  }

  const maybeResult = value as YaegiResult;
  return {
    success: maybeResult.success ?? true,
    output: maybeResult.output ?? "",
    error: maybeResult.error ?? null,
  };
}

async function executeGoViaYaegi({
  code,
  timeout,
}: Pick<WasmExecutionInput, "code" | "timeout">): Promise<WasmExecutionOutput> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const runtime = await withTimeout(
    getYaegiRuntime(),
    timeout,
    `Timeout cargando runtime Go (${timeout}ms).`
  );

  runtime.reset?.();

  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...values: unknown[]) => {
    stdout.push(formatCapturedValues(values));
  };
  console.error = (...values: unknown[]) => {
    stderr.push(formatCapturedValues(values));
  };

  try {
    const rawResult = await withTimeout(
      Promise.resolve(runtime.eval(code)),
      timeout,
      `Timeout ejecutando Go (${timeout}ms).`
    );
    const result = normalizeYaegiResult(rawResult);

    if (result.output?.trim()) {
      stdout.push(result.output.trim());
    }

    if (result.error?.trim()) {
      stderr.push(result.error.trim());
    }

    return {
      stdout: stdout.join("\n").trim(),
      stderr: stderr.join("\n").trim(),
      error: result.success ? undefined : result.error?.trim() || stderr.join("\n").trim(),
    };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

function normalizeRuntimeError(
  language: WasmExecutionInput["language"],
  output: WasmerRunOutput
): string | undefined {
  if (output.ok) {
    return undefined;
  }

  const stderr = output.stderr?.trim() ?? "";
  const lowerStderr = stderr.toLowerCase();

  if (language === "bash" && output.code === 45 && !stderr) {
    return "Runtime Bash no pudo ejecutar el script en este entorno (exit code 45).";
  }

  if (
    language === "go" &&
    (lowerStderr.includes("bad file number") ||
      lowerStderr.includes("cannot determine current directory") ||
      lowerStderr.includes("file name too long"))
  ) {
    return "Runtime Go no pudo inicializar el filesystem WASM en este entorno.";
  }

  return stderr || `Exit code ${output.code}`;
}

async function executeViaWasmer({
  language,
  code,
  timeout,
}: WasmExecutionInput): Promise<WasmExecutionOutput> {
  const plan = getRuntimePlan(language, code);
  const loadTimeoutMessage =
    language === "go"
      ? `Timeout cargando runtime Go (${timeout}ms). El runtime base de Go tardó demasiado en inicializarse.`
      : `Timeout cargando runtime ${LANGUAGE_LABELS[language]} (${timeout}ms).`;
  const { specifier, pkg } = await withTimeout(
    resolvePackage(plan.packageSpecifiers),
    timeout,
    loadTimeoutMessage
  );
  const command = resolveCommand(pkg, plan.preferredCommands);

  if (!command) {
    throw new Error(`El paquete ${specifier} no expone un comando ejecutable.`);
  }

  const instance = await withTimeout(
    command.run({
      args: plan.args,
      cwd: plan.cwd,
      mount: plan.mount,
    }),
    timeout,
    `Timeout inicializando runtime ${LANGUAGE_LABELS[language]} (${timeout}ms).`
  );

  const output = await withTimeout(
    instance.wait(),
    timeout,
    `Timeout ejecutando ${LANGUAGE_LABELS[language]} (${timeout}ms).`
  );

  return {
    stdout: output.stdout,
    stderr: output.stderr,
    error: normalizeRuntimeError(language, output),
  };
}

export async function executeWasmLanguage({
  language,
  code,
  timeout,
}: WasmExecutionInput): Promise<WasmExecutionOutput> {
  if (language === "clojure") {
    return executeClojureViaScittle({ code, timeout });
  }

  if (language === "go") {
    try {
      return await executeGoViaYaegi({ code, timeout });
    } catch (error) {
      const fallback = await executeViaWasmer({
        language,
        code,
        timeout,
      });
      const fallbackReason = normalizeUnknownError(error);
      const fallbackStderr = [fallback.stderr, `Fallback Yaegi: ${fallbackReason}`]
        .filter(Boolean)
        .join("\n");

      return {
        ...fallback,
        stderr: fallbackStderr,
      };
    }
  }

  return executeViaWasmer({
    language,
    code,
    timeout,
  });
}
