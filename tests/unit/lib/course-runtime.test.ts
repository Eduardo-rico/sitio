import { describe, expect, it } from "vitest";
import {
  COURSE_LANGUAGES,
  RUNTIME_TYPES,
  getDefaultRuntimeForLanguage,
  getDefaultStarterCode,
  getMonacoLanguage,
  isCourseLanguage,
  isRuntimeType,
} from "@/lib/course-runtime";

describe("course-runtime", () => {
  it("valida lenguajes y runtimes soportados", () => {
    for (const language of COURSE_LANGUAGES) {
      expect(isCourseLanguage(language)).toBe(true);
    }

    for (const runtime of RUNTIME_TYPES) {
      expect(isRuntimeType(runtime)).toBe(true);
    }

    expect(isCourseLanguage("swift")).toBe(false);
    expect(isRuntimeType("browser_swift")).toBe(false);
  });

  it("resuelve runtime por defecto por lenguaje", () => {
    expect(getDefaultRuntimeForLanguage("python")).toBe("browser_pyodide");
    expect(getDefaultRuntimeForLanguage("clojure")).toBe("browser_clojure");
    expect(getDefaultRuntimeForLanguage("javascript")).toBe("browser_javascript");
    expect(getDefaultRuntimeForLanguage("typescript")).toBe("browser_typescript");
    expect(getDefaultRuntimeForLanguage("sql")).toBe("browser_sql");
    expect(getDefaultRuntimeForLanguage("go")).toBe("browser_go");
    expect(getDefaultRuntimeForLanguage("rust")).toBe("browser_rust");
    expect(getDefaultRuntimeForLanguage("bash")).toBe("browser_bash");
  });

  it("resuelve lenguaje de Monaco por lenguaje de curso", () => {
    expect(getMonacoLanguage("python")).toBe("python");
    expect(getMonacoLanguage("clojure")).toBe("clojure");
    expect(getMonacoLanguage("javascript")).toBe("javascript");
    expect(getMonacoLanguage("typescript")).toBe("typescript");
    expect(getMonacoLanguage("sql")).toBe("sql");
    expect(getMonacoLanguage("go")).toBe("go");
    expect(getMonacoLanguage("rust")).toBe("rust");
    expect(getMonacoLanguage("bash")).toBe("shell");
  });

  it("genera starter code por lenguaje", () => {
    expect(getDefaultStarterCode("python")).toContain("Hola desde Python");
    expect(getDefaultStarterCode("clojure")).toContain("Hola desde Clojure");
    expect(getDefaultStarterCode("javascript")).toContain("Hola desde JavaScript");
    expect(getDefaultStarterCode("typescript")).toContain("Hola desde TypeScript");
    expect(getDefaultStarterCode("sql")).toContain("Hola desde SQL");
    expect(getDefaultStarterCode("go")).toContain("Hola desde Go");
    expect(getDefaultStarterCode("rust")).toContain("Hola desde Rust");
    expect(getDefaultStarterCode("bash")).toContain("Hola desde Bash");
  });
});
