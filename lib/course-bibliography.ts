import type { CourseLanguage } from "@/lib/course-runtime";

export interface CourseBibliographyItem {
  title: string;
  url: string;
  note: string;
}

const LANGUAGE_BASE_BIBLIOGRAPHY: Record<CourseLanguage, CourseBibliographyItem[]> = {
  python: [
    {
      title: "Python Official Documentation",
      url: "https://docs.python.org/3/",
      note: "Referencia oficial del lenguaje y libreria estandar.",
    },
    {
      title: "Automate the Boring Stuff with Python",
      url: "https://automatetheboringstuff.com/",
      note: "Practica aplicada con scripts y automatizacion.",
    },
    {
      title: "Real Python Tutorials",
      url: "https://realpython.com/",
      note: "Guias practicas para subir de nivel en Python.",
    },
  ],
  clojure: [
    {
      title: "Clojure Docs",
      url: "https://clojure.org/guides/getting_started",
      note: "Guia oficial para iniciar con REPL y expresiones.",
    },
    {
      title: "Clojure Cheatsheet",
      url: "https://clojure.org/api/cheatsheet",
      note: "Resumen rapido de funciones y formas comunes.",
    },
    {
      title: "Brave Clojure",
      url: "https://www.braveclojure.com/",
      note: "Libro practico para aprender Clojure paso a paso.",
    },
  ],
  javascript: [
    {
      title: "MDN JavaScript Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      note: "Guia completa de JavaScript moderno.",
    },
    {
      title: "Eloquent JavaScript",
      url: "https://eloquentjavascript.net/",
      note: "Libro interactivo con fundamentos y ejercicios.",
    },
    {
      title: "You Don't Know JS (book series)",
      url: "https://github.com/getify/You-Dont-Know-JS",
      note: "Profundiza en conceptos avanzados del lenguaje.",
    },
  ],
  typescript: [
    {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/handbook/intro.html",
      note: "Referencia oficial para tipos, interfaces y generics.",
    },
    {
      title: "TypeScript Deep Dive",
      url: "https://basarat.gitbook.io/typescript/",
      note: "Guia extensa orientada a proyectos reales.",
    },
    {
      title: "Total TypeScript",
      url: "https://www.totaltypescript.com/",
      note: "Recursos practicos para dominar TypeScript en frontend/backend.",
    },
  ],
  sql: [
    {
      title: "SQLBolt",
      url: "https://sqlbolt.com/",
      note: "Lecciones breves con ejercicios de SQL.",
    },
    {
      title: "Mode SQL Tutorial",
      url: "https://mode.com/sql-tutorial/",
      note: "Tutorial aplicado a analisis y reporting.",
    },
    {
      title: "PostgreSQL Documentation",
      url: "https://www.postgresql.org/docs/current/sql.html",
      note: "Referencia tecnica de sintaxis SQL y funciones.",
    },
  ],
  go: [
    {
      title: "A Tour of Go",
      url: "https://go.dev/tour/welcome/1",
      note: "Recorrido interactivo oficial de Go.",
    },
    {
      title: "Go by Example",
      url: "https://gobyexample.com/",
      note: "Snippets practicos para casos comunes.",
    },
    {
      title: "Effective Go",
      url: "https://go.dev/doc/effective_go",
      note: "Buenas practicas de estilo y diseno en Go.",
    },
  ],
  rust: [
    {
      title: "The Rust Programming Language",
      url: "https://doc.rust-lang.org/book/",
      note: "Libro oficial de Rust.",
    },
    {
      title: "Rust By Example",
      url: "https://doc.rust-lang.org/rust-by-example/",
      note: "Aprendizaje guiado con ejemplos ejecutables.",
    },
    {
      title: "Rustlings",
      url: "https://github.com/rust-lang/rustlings",
      note: "Ejercicios para practicar ownership y borrowing.",
    },
  ],
  bash: [
    {
      title: "The Bash Guide",
      url: "https://mywiki.wooledge.org/BashGuide",
      note: "Guia practica de scripting y CLI en Bash.",
    },
    {
      title: "GNU Bash Manual",
      url: "https://www.gnu.org/software/bash/manual/",
      note: "Referencia oficial de comandos y comportamiento del shell.",
    },
    {
      title: "ShellCheck Wiki",
      url: "https://github.com/koalaman/shellcheck/wiki",
      note: "Buenas practicas y errores frecuentes en scripts.",
    },
  ],
};

const COURSE_SPECIFIC_BIBLIOGRAPHY: Record<string, CourseBibliographyItem[]> = {
  "python-basico": [
    {
      title: "Python Tutorial (Official)",
      url: "https://docs.python.org/3/tutorial/",
      note: "Sintaxis base: variables, condicionales, loops y funciones.",
    },
    {
      title: "Think Python (2nd Edition)",
      url: "https://greenteapress.com/wp/think-python-2e/",
      note: "Libro abierto para consolidar fundamentos.",
    },
    {
      title: "Exercism Python Track",
      url: "https://exercism.org/tracks/python",
      note: "Ejercicios guiados para practica incremental.",
    },
  ],
  "python-intermedio": [
    {
      title: "Python Standard Library",
      url: "https://docs.python.org/3/library/index.html",
      note: "Dominio de modulos clave para resolver retos intermedios.",
    },
    {
      title: "Effective Python",
      url: "https://effectivepython.com/",
      note: "Patrones para escribir codigo mas robusto y mantenible.",
    },
    {
      title: "Python Koans",
      url: "https://github.com/gregmalcolm/python_koans",
      note: "Retos para reforzar pensamiento idiomatico en Python.",
    },
  ],
  "python-analisis-datos": [
    {
      title: "pandas User Guide",
      url: "https://pandas.pydata.org/docs/user_guide/index.html",
      note: "Manipulacion tabular, limpieza y agregaciones.",
    },
    {
      title: "Matplotlib Tutorials",
      url: "https://matplotlib.org/stable/tutorials/index",
      note: "Fundamentos de visualizacion para reportes.",
    },
    {
      title: "Python Data Science Handbook",
      url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
      note: "Referencia integral de flujo analitico en Python.",
    },
    {
      title: "NumPy Documentation",
      url: "https://numpy.org/doc/stable/",
      note: "Arreglos y operaciones numericas para analitica.",
    },
  ],
  "python-analisis-negocio": [
    {
      title: "Storytelling with Data",
      url: "https://www.storytellingwithdata.com/",
      note: "Comunicacion de hallazgos para perfiles de negocio.",
    },
    {
      title: "Harvard Business Review - Data & Analytics",
      url: "https://hbr.org/topic/subject/analytics-and-data-science",
      note: "Casos de uso y decision making basado en datos.",
    },
    {
      title: "Google Looker - Data Analytics Guides",
      url: "https://cloud.google.com/looker/docs/best-practices",
      note: "Practicas para medir KPIs y performance empresarial.",
    },
    {
      title: "KDnuggets - Business Analytics",
      url: "https://www.kdnuggets.com/tag/business-analytics",
      note: "Articulos tecnicos aplicados a analisis de negocio.",
    },
  ],
};

export function getCourseBibliography(
  slug: string,
  language: CourseLanguage
): CourseBibliographyItem[] {
  return COURSE_SPECIFIC_BIBLIOGRAPHY[slug] ?? LANGUAGE_BASE_BIBLIOGRAPHY[language] ?? [];
}
