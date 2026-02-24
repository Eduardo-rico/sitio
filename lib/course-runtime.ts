export const COURSE_LANGUAGES = [
  "python",
  "clojure",
  "javascript",
  "typescript",
  "sql",
  "go",
  "rust",
  "bash",
] as const;

export type CourseLanguage = (typeof COURSE_LANGUAGES)[number];

export const RUNTIME_TYPES = [
  "browser_pyodide",
  "browser_clojure",
  "browser_javascript",
  "browser_typescript",
  "browser_sql",
  "browser_go",
  "browser_rust",
  "browser_bash",
] as const;

export type RuntimeType = (typeof RUNTIME_TYPES)[number];

export const LANGUAGE_LABELS: Record<CourseLanguage, string> = {
  python: "Python",
  clojure: "Clojure",
  javascript: "JavaScript",
  typescript: "TypeScript",
  sql: "SQL",
  go: "Go",
  rust: "Rust",
  bash: "Bash",
};

export const RUNTIME_LABELS: Record<RuntimeType, string> = {
  browser_pyodide: "Browser (Pyodide)",
  browser_clojure: "Browser (Clojure Runtime)",
  browser_javascript: "Browser (JavaScript VM)",
  browser_typescript: "Browser (TypeScript Transpile + JS VM)",
  browser_sql: "Browser (SQL Engine)",
  browser_go: "Browser (Go Runtime)",
  browser_rust: "Browser (Rust Runtime)",
  browser_bash: "Browser (Shell Runtime)",
};

export function isCourseLanguage(value: string): value is CourseLanguage {
  return COURSE_LANGUAGES.includes(value as CourseLanguage);
}

export function isRuntimeType(value: string): value is RuntimeType {
  return RUNTIME_TYPES.includes(value as RuntimeType);
}

export function getDefaultRuntimeForLanguage(language: CourseLanguage): RuntimeType {
  switch (language) {
    case "python":
      return "browser_pyodide";
    case "clojure":
      return "browser_clojure";
    case "javascript":
      return "browser_javascript";
    case "typescript":
      return "browser_typescript";
    case "sql":
      return "browser_sql";
    case "go":
      return "browser_go";
    case "rust":
      return "browser_rust";
    case "bash":
      return "browser_bash";
  }
}

export function getMonacoLanguage(language: CourseLanguage): string {
  switch (language) {
    case "python":
      return "python";
    case "javascript":
      return "javascript";
    case "typescript":
      return "typescript";
    case "sql":
      return "sql";
    case "go":
      return "go";
    case "rust":
      return "rust";
    case "bash":
      return "shell";
    case "clojure":
      return "clojure";
  }
}

export function getDefaultStarterCode(language: CourseLanguage): string {
  switch (language) {
    case "python":
      return 'print("Hola desde Python")\n';
    case "clojure":
      return '(println "Hola desde Clojure")\n';
    case "javascript":
      return 'console.log("Hola desde JavaScript");\n';
    case "typescript":
      return 'const message: string = "Hola desde TypeScript";\nconsole.log(message);\n';
    case "sql":
      return "SELECT 'Hola desde SQL' AS message;\n";
    case "go":
      return 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hola desde Go")\n}\n';
    case "rust":
      return 'fn main() {\n    println!("Hola desde Rust");\n}\n';
    case "bash":
      return 'echo "Hola desde Bash"\n';
  }
}

