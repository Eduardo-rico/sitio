import type { CourseLanguage } from "@/lib/course-runtime";
import { LANGUAGE_LABELS } from "@/lib/course-runtime";

const WASMER_SDK_URL = "https://unpkg.com/@wasmer/sdk@0.10.0/dist/index.mjs";

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
const LANGUAGE_PACKAGE_OVERRIDES: {
  clojure: string | null;
  rust: string | null;
} = {
  // Define aquí el paquete Wasmer cuando tengas un runtime real para cada lenguaje.
  clojure: null,
  rust: null,
};

let sdkPromise: Promise<WasmerSDK> | null = null;
let runtimePromise: Promise<WasmerRuntime> | null = null;
const packageCache = new Map<string, Promise<WasmerPackage>>();

function normalizePackageValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getConfiguredPackage(language: "clojure" | "rust"): string | null {
  return normalizePackageValue(LANGUAGE_PACKAGE_OVERRIDES[language]);
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
    case "clojure": {
      const packageName = getConfiguredPackage("clojure");
      if (!packageName) {
        throw new Error(
          "Runtime WASM de Clojure no configurado. Define LANGUAGE_PACKAGE_OVERRIDES.clojure en wasm-language-runtime.ts."
        );
      }

      return {
        packageSpecifiers: [packageName],
        args: ["/workspace/main.clj"],
        cwd: "/workspace",
        mount: {
          "/workspace": {
            "main.clj": code,
          },
        },
      };
    }
    case "rust": {
      const packageName = getConfiguredPackage("rust");
      if (!packageName) {
        throw new Error(
          "Runtime WASM de Rust no configurado. Define LANGUAGE_PACKAGE_OVERRIDES.rust en wasm-language-runtime.ts."
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

export async function executeWasmLanguage({
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
