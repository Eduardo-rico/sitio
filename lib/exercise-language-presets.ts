import type { CourseLanguage } from "@/lib/course-runtime";
import { LANGUAGE_LABELS } from "@/lib/course-runtime";

export interface ExerciseLanguagePreset {
  starterCode: string;
  solutionCode: string;
  hints: string[];
  testHints: string[];
  testInputPlaceholder: string;
  testExpectedPlaceholder: string;
}

const PRESETS: Record<CourseLanguage, ExerciseLanguagePreset> = {
  python: {
    starterCode: 'nombre = "Ada"\n# Escribe tu codigo aqui\n',
    solutionCode: 'nombre = "Ada"\nprint(f"Hola, {nombre}")\n',
    hints: [
      "Usa print(...) para mostrar el resultado.",
      "Si ya tienes variables, aprovecha f-strings para formatear el texto.",
    ],
    testHints: [
      "Compara salida exacta cuando el ejercicio pida formato estricto.",
      "Si hay variaciones validas, usa contains o regex para flexibilidad.",
    ],
    testInputPlaceholder: "Input opcional para Python...",
    testExpectedPlaceholder: "Salida esperada de Python...",
  },
  clojure: {
    starterCode: '(def nombre "Ada")\n;; Escribe tu codigo aqui\n',
    solutionCode: '(def nombre "Ada")\n(println (str "Hola, " nombre))\n',
    hints: [
      "Usa (println ...) para mostrar salida.",
      "Para concatenar texto, usa str.",
    ],
    testHints: [
      "Evita espacios extra en la salida final de println.",
      "Prefiere validacion exacta cuando la salida es deterministica.",
    ],
    testInputPlaceholder: "Input opcional para Clojure...",
    testExpectedPlaceholder: "Salida esperada de Clojure...",
  },
  javascript: {
    starterCode: 'const nombre = "Ada";\n// Escribe tu codigo aqui\n',
    solutionCode: 'const nombre = "Ada";\nconsole.log(`Hola, ${nombre}`);\n',
    hints: [
      "Usa console.log(...) para mostrar salida.",
      "Template literals (`...`) simplifican el formateo.",
    ],
    testHints: [
      "Si serializas objetos, define claramente el formato esperado.",
      "Usa regex cuando existan diferencias menores de espacios.",
    ],
    testInputPlaceholder: "Input opcional para JavaScript...",
    testExpectedPlaceholder: "Salida esperada de JavaScript...",
  },
  typescript: {
    starterCode: 'const nombre: string = "Ada";\n// Escribe tu codigo aqui\n',
    solutionCode: 'const nombre: string = "Ada";\nconsole.log(`Hola, ${nombre}`);\n',
    hints: [
      "Declara tipos explicitos para guiar al estudiante.",
      "Usa console.log(...) para validar salida en runtime.",
    ],
    testHints: [
      "Valida salida final, no tipos en tiempo de compilacion.",
      "Mantener mensajes consistentes facilita casos exactos.",
    ],
    testInputPlaceholder: "Input opcional para TypeScript...",
    testExpectedPlaceholder: "Salida esperada de TypeScript...",
  },
  sql: {
    starterCode: "SELECT 'Hola SQL' AS mensaje;\n",
    solutionCode: "SELECT 'Hola SQL' AS mensaje;\n",
    hints: [
      "Usa alias con AS para nombres de columna legibles.",
      "Recuerda terminar sentencias con ;",
    ],
    testHints: [
      "Define claramente columnas esperadas y su orden.",
      "Evita depender de mayusculas/minusculas si no es requisito.",
    ],
    testInputPlaceholder: "Input SQL (opcional)...",
    testExpectedPlaceholder: "Resultado esperado SQL (JSON o texto)...",
  },
  go: {
    starterCode:
      'package main\n\nimport "fmt"\n\nfunc main() {\n\t// Escribe tu codigo aqui\n}\n',
    solutionCode:
      'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hola, Ada")\n}\n',
    hints: [
      "Go requiere package main y funcion main para ejecutar.",
      "Usa fmt.Println para salida con salto de linea.",
    ],
    testHints: [
      "Incluye newline en expected cuando el formato lo requiera.",
      "Mantener imports minimos evita errores innecesarios.",
    ],
    testInputPlaceholder: "Input opcional para Go...",
    testExpectedPlaceholder: "Salida esperada de Go...",
  },
  rust: {
    starterCode: 'fn main() {\n    // Escribe tu codigo aqui\n}\n',
    solutionCode: 'fn main() {\n    println!("Hola, Ada");\n}\n',
    hints: [
      "Rust requiere fn main() como punto de entrada.",
      "Usa println! para salida a stdout.",
    ],
    testHints: [
      "Define salida exacta cuando no haya variacion semantica.",
      "Si hay varias soluciones, usa regex para tolerancia controlada.",
    ],
    testInputPlaceholder: "Input opcional para Rust...",
    testExpectedPlaceholder: "Salida esperada de Rust...",
  },
  bash: {
    starterCode: '#!/usr/bin/env bash\n\n# Escribe tu script aqui\n',
    solutionCode: '#!/usr/bin/env bash\n\necho "Hola, Ada"\n',
    hints: [
      "Usa echo para imprimir en stdout.",
      "Mantener scripts simples mejora debuggabilidad.",
    ],
    testHints: [
      "Considera saltos de linea al definir expected.",
      "Valida texto minimo con contains para scripts flexibles.",
    ],
    testInputPlaceholder: "Input opcional para Bash...",
    testExpectedPlaceholder: "Salida esperada de Bash...",
  },
};

export function getExercisePreset(language: CourseLanguage): ExerciseLanguagePreset {
  return PRESETS[language];
}

export function getExerciseLanguageBadge(language: CourseLanguage): string {
  return LANGUAGE_LABELS[language];
}
