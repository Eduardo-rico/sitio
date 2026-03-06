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
  "clojure-desde-cero": [
    {
      title: "Getting Started with Clojure",
      url: "https://clojure.org/guides/getting_started",
      note: "Arranque oficial con REPL, expresiones y primeras formas.",
    },
    {
      title: "Clojure for the Brave and True",
      url: "https://www.braveclojure.com/",
      note: "Recurso practico ideal para consolidar fundamentos y sintaxis.",
    },
    {
      title: "Clojure Cheatsheet",
      url: "https://clojure.org/api/cheatsheet",
      note: "Referencia rapida para colecciones, funciones y formas comunes.",
    },
  ],
  "clojure-intermedio": [
    {
      title: "The Joy of Clojure",
      url: "https://www.manning.com/books/the-joy-of-clojure-second-edition",
      note: "Texto de referencia para secuencias, recursion y pensamiento idiomatico.",
    },
    {
      title: "Sequences",
      url: "https://clojure.org/reference/sequences",
      note: "Documentacion oficial sobre la abstraccion de secuencias y su evaluacion.",
    },
    {
      title: "Clojure Patterns - Functional Composition",
      url: "https://clojurepatterns.com/",
      note: "Patrones practicos para composicion, pipelines y reutilizacion funcional.",
    },
  ],
  "clojure-datos-y-transformacion": [
    {
      title: "Threading Macros Guide",
      url: "https://clojure.org/guides/threading_macros",
      note: "Referencia oficial para escribir pipelines claros con -> y ->>.",
    },
    {
      title: "Clojure Data Structures and Transforms",
      url: "https://clojure.org/reference/data_structures",
      note: "Base tecnica para trabajar mapas, vectores y transformacion de datos anidados.",
    },
    {
      title: "Practicalli Clojure Data Transformation",
      url: "https://practical.li/clojure/",
      note: "Material practico orientado a pipelines, reporting y modelado de datos.",
    },
  ],
  "clojure-macros-estado-y-arquitectura": [
    {
      title: "Atoms",
      url: "https://clojure.org/reference/atoms",
      note: "Documentacion oficial sobre estado local coordinado con atoms.",
    },
    {
      title: "Refs and Transactions",
      url: "https://clojure.org/reference/refs",
      note: "Marco conceptual para entender estado coordinado y STM en Clojure.",
    },
    {
      title: "Macros",
      url: "https://clojure.org/reference/macros",
      note: "Guia oficial para expansion de codigo, metaprogramacion y buenas practicas.",
    },
    {
      title: "Elements of Clojure",
      url: "https://elementsofclojure.com/",
      note: "Enfoque de diseño y arquitectura para escribir sistemas Clojure mantenibles.",
    },
  ],
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
  "python-forecasting-ab-testing": [
    {
      title: "Forecasting: Principles and Practice (3rd ed.)",
      url: "https://otexts.com/fpp3/",
      note: "Libro academico-practico de referencia para series temporales y forecasting.",
    },
    {
      title: "Time Series Analysis and Its Applications",
      url: "https://link.springer.com/book/10.1007/978-3-319-52452-8",
      note: "Texto academico sobre modelado de series temporales y metodos estadisticos.",
    },
    {
      title: "Trustworthy Online Controlled Experiments",
      url: "https://experimentguide.com/",
      note: "Libro clave para diseno, analisis e interpretacion de A/B tests en producto.",
    },
    {
      title: "Improving the Sensitivity of Online Controlled Experiments (CUPED)",
      url: "https://exp-platform.com/Documents/2013-02-CUPED-ImprovingSensitivityOfControlledExperiments.pdf",
      note: "Paper clasico de ajuste pre-experimento para reducir varianza en experimentos.",
    },
    {
      title: "Seven Rules of Thumb for Web Site Experimenters",
      url: "https://exp-platform.com/Documents/2014%20experimentersRulesOfThumb.pdf",
      note: "Paper practico con recomendaciones estadisticas para evaluacion de experimentos.",
    },
  ],
};

export function getCourseBibliography(
  slug: string,
  language: CourseLanguage
): CourseBibliographyItem[] {
  return COURSE_SPECIFIC_BIBLIOGRAPHY[slug] ?? LANGUAGE_BASE_BIBLIOGRAPHY[language] ?? [];
}
