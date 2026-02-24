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
  packageName: string;
  args: string[];
  cwd?: string;
  mount?: Record<string, Record<string, string>>;
};

let sdkPromise: Promise<WasmerSDK> | null = null;
let runtimePromise: Promise<WasmerRuntime> | null = null;
const packageCache = new Map<string, Promise<WasmerPackage>>();

function getConfiguredPackage(language: "clojure" | "rust"): string | null {
  if (language === "clojure") {
    return process.env.NEXT_PUBLIC_WASMER_CLOJURE_PACKAGE ?? null;
  }

  return process.env.NEXT_PUBLIC_WASMER_RUST_PACKAGE ?? null;
}

function getRuntimePlan(
  language: WasmExecutionInput["language"],
  code: string
): RuntimePlan {
  switch (language) {
    case "bash":
      return {
        packageName: "wasmer/bash",
        args: ["-lc", code],
      };
    case "go":
      return {
        packageName: "golang/go",
        args: ["run", "/workspace/main.go"],
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
          "Runtime WASM de Clojure no configurado. Define NEXT_PUBLIC_WASMER_CLOJURE_PACKAGE."
        );
      }

      return {
        packageName,
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
          "Runtime WASM de Rust no configurado. Define NEXT_PUBLIC_WASMER_RUST_PACKAGE."
        );
      }

      return {
        packageName,
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

export async function executeWasmLanguage({
  language,
  code,
  timeout,
}: WasmExecutionInput): Promise<WasmExecutionOutput> {
  const plan = getRuntimePlan(language, code);
  const pkg = await getPackage(plan.packageName);
  const command = pkg.entrypoint ?? Object.values(pkg.commands)[0];

  if (!command) {
    throw new Error(`El paquete ${plan.packageName} no expone un comando ejecutable.`);
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
    error: output.ok ? undefined : output.stderr || `Exit code ${output.code}`,
  };
}
