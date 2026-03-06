import { z } from "zod";
import {
  cloneCoursePedagogy,
  coursePedagogyInputSchema,
  getLessonStageFromPedagogy,
  type CourseLessonStage,
  type CoursePedagogy,
} from "@/lib/course-pedagogy";

export const CLOJURE_COURSE_SLUGS = [
  "clojure-desde-cero",
  "clojure-intermedio",
  "clojure-datos-y-transformacion",
  "clojure-macros-estado-y-arquitectura",
  "clojure-spec-testing-y-tooling",
] as const;

export type ClojureCourseSlug = (typeof CLOJURE_COURSE_SLUGS)[number];

export interface ClojureCoursePedagogy extends CoursePedagogy {
  slug: ClojureCourseSlug;
}

export const clojureCoursePedagogyInputSchema = coursePedagogyInputSchema;

export type ClojureCoursePedagogyInput = z.infer<typeof clojureCoursePedagogyInputSchema>;

const CLOJURE_COURSE_PEDAGOGY: Record<ClojureCourseSlug, ClojureCoursePedagogy> = {
  "clojure-desde-cero": {
    slug: "clojure-desde-cero",
    learnerProfile: "Principiante que quiere aprender programacion funcional desde expresiones y datos.",
    timeCommitment: "2-3 horas por semana durante 2 semanas.",
    prerequisites: [
      "Uso basico de navegador y teclado",
      "Curiosidad por programacion funcional",
      "Disposicion para iterar en el REPL",
    ],
    learningOutcomes: [
      "Leer y evaluar expresiones prefijas con confianza",
      "Trabajar con vectores, listas y mapas inmutables",
      "Crear funciones puras simples y transformaciones con map/filter/reduce",
    ],
    assessmentPlan: {
      diagnostic: "Comprobar comprension de expresiones, salida esperada y lectura de colecciones.",
      formative: [
        "Retos cortos de REPL con salida exacta",
        "Checkpoints sobre lectura de mapas y vectores",
        "Ejercicios guiados de funciones puras",
      ],
      summative:
        "Mini practica integradora donde se transforma una coleccion y se explica la decision funcional tomada.",
    },
    rubricDimensions: ["Correctness", "Method", "Clarity", "Functional Thinking"],
    masteryCriteria: [
      "Resolver ejercicios sin depender de mutacion",
      "Explicar por que una transformacion es pura o derivada de datos",
      "Leer colecciones y funciones idiomaticas sin perderse en la sintaxis",
    ],
    bibliographyGuidance:
      "Priorizar docs oficiales, cheatsheet y un recurso practico de introduccion al pensamiento funcional.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Fundamentos del REPL",
        objective: "Entender expresiones, resultados y estructuras de datos base.",
        feedbackFocus: "Errores de sintaxis prefija y lectura de salida.",
        reflectionPrompt: "Que cambia cuando piensas primero en valores y no en pasos?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Transformaciones Basicas",
        objective: "Pasar de datos inmutables a pipelines funcionales simples.",
        feedbackFocus: "Seleccion de funciones de secuencia y claridad del pipeline.",
        reflectionPrompt: "Que transformacion te parecio mas natural y por que?",
      },
    ],
  },
  "clojure-intermedio": {
    slug: "clojure-intermedio",
    learnerProfile: "Persona que ya domina lo basico y necesita modelar logica con mas criterio funcional.",
    timeCommitment: "3-4 horas por semana durante 2 semanas.",
    prerequisites: [
      "Completar clojure-desde-cero o equivalente",
      "Lectura fluida de colecciones y funciones puras",
      "Comodidad con el REPL",
    ],
    learningOutcomes: [
      "Explicar y usar secuencias lazy con intencion",
      "Resolver iteraciones con recursion, loop/recur y composicion",
      "Modelar funciones pequenas y reutilizables con namespaces claros",
    ],
    assessmentPlan: {
      diagnostic: "Verificar dominio de colecciones, higher-order functions y flujos de salida.",
      formative: [
        "Ventanas y transformaciones sobre secuencias lazy",
        "Katas de recursion y acumulacion",
        "Ejercicios de composicion y reuso funcional",
      ],
      summative:
        "Mini caso donde se procesa una fuente de datos con recursion/composicion y se justifica la estrategia.",
    },
    rubricDimensions: ["Correctness", "Method", "Clarity", "Abstraction"],
    masteryCriteria: [
      "Elegir entre recursion, map o reduce con criterio claro",
      "Separar pasos intermedios sin romper el flujo funcional",
      "Explicar el impacto de laziness y composicion en el resultado",
    ],
    bibliographyGuidance:
      "Combinar referencia oficial de secuencias con material avanzado de diseño idiomatico.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Secuencias y Recursion",
        objective: "Razonar sobre evaluacion lazy y control explicito de iteracion.",
        feedbackFocus: "Confusiones entre coleccion materializada y secuencia diferida.",
        reflectionPrompt: "Cuando conviene hacer explicita la recursion en lugar de usar map?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Modelado Funcional",
        objective: "Construir piezas reusables con mejores fronteras funcionales.",
        feedbackFocus: "Granularidad de funciones y naming de transformaciones.",
        reflectionPrompt: "Que decision de modelado hizo mas claro el pipeline final?",
      },
    ],
  },
  "clojure-datos-y-transformacion": {
    slug: "clojure-datos-y-transformacion",
    learnerProfile: "Analista o desarrollador que quiere usar Clojure para transformar datos con pipelines claros.",
    timeCommitment: "3-4 horas por semana durante 2 semanas.",
    prerequisites: [
      "Bases de Clojure y colecciones inmutables",
      "Lectura de mapas anidados",
      "Interes por analisis y reporting",
    ],
    learningOutcomes: [
      "Navegar y actualizar mapas anidados con get-in y update-in",
      "Diseñar pipelines con threading macros",
      "Construir reportes simples con agrupaciones y agregaciones reproducibles",
    ],
    assessmentPlan: {
      diagnostic: "Confirmar lectura de mapas, vectores y operaciones agregadas basicas.",
      formative: [
        "Retos de normalizacion de datos",
        "Pipelines guiados con -> y ->>",
        "Ejercicios de agrupacion y reporting",
      ],
      summative:
        "Caso final de transformacion y reporte donde se entrega salida consistente y conclusion breve.",
    },
    rubricDimensions: ["Correctness", "Method", "Clarity", "Data Reasoning"],
    masteryCriteria: [
      "Transformar datos sin introducir pasos imperativos innecesarios",
      "Explicar cada etapa del pipeline con vocabulario funcional",
      "Entregar salidas legibles y verificables para analisis simple",
    ],
    bibliographyGuidance:
      "Priorizar threading macros, estructuras de datos y referencias practicas de transformacion funcional.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Lectura y Normalizacion",
        objective: "Limpiar y reorganizar estructuras anidadas para analisis posterior.",
        feedbackFocus: "Errores al navegar llaves anidadas y actualizaciones derivadas.",
        reflectionPrompt: "Que estructura te costo mas leer y como la hiciste mas clara?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Pipelines y Reportes",
        objective: "Convertir datos en resumenes y decisiones con pipelines expresivos.",
        feedbackFocus: "Orden de las etapas y claridad de salida final.",
        reflectionPrompt: "Que parte del pipeline comunica mejor la historia de los datos?",
      },
    ],
  },
  "clojure-macros-estado-y-arquitectura": {
    slug: "clojure-macros-estado-y-arquitectura",
    learnerProfile: "Desarrollador que ya piensa funcionalmente y necesita coordinar estado y metaprogramacion con criterio.",
    timeCommitment: "4-5 horas por semana durante 2 semanas.",
    prerequisites: [
      "Dominar funciones puras y colecciones",
      "Conocer pipelines y modelado funcional",
      "Interes en arquitectura de sistemas pequenos",
    ],
    learningOutcomes: [
      "Usar atoms para estado local controlado sin perder previsibilidad",
      "Distinguir funciones de macros y escribir macros pequenas con intencion",
      "Modelar reducers/eventos para organizar sistemas funcionales",
    ],
    assessmentPlan: {
      diagnostic: "Revisar dominio de funciones puras, update y flujos de datos.",
      formative: [
        "Ejercicios de atoms y estado coordinado",
        "Retos de macros simples con expansion entendible",
        "Katas de reducers y eventos",
      ],
      summative:
        "Proyecto corto donde se separa core puro y shell impuro con un reducer o atom controlado.",
    },
    rubricDimensions: ["Correctness", "Method", "Clarity", "Architecture"],
    masteryCriteria: [
      "Mantener el estado aislado y justificable",
      "Usar macros solo cuando realmente transforman codigo con valor",
      "Separar logica pura, efectos y eventos con fronteras entendibles",
    ],
    bibliographyGuidance:
      "Combinar referencias de atoms, macros y arquitectura funcional mantenible.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Estado Controlado",
        objective: "Coordinar cambios de estado sin diluir la logica funcional.",
        feedbackFocus: "Diferencia entre update puro y mutacion coordinada.",
        reflectionPrompt: "Que parte del problema debe seguir siendo completamente pura?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Metaprogramacion y Arquitectura",
        objective: "Entender cuando las macros y reducers simplifican un sistema.",
        feedbackFocus: "Sobreuso de macros y acoplamiento innecesario.",
        reflectionPrompt: "Que costo agrega una macro y cuando vale pagarlo?",
      },
    ],
  },
  "clojure-spec-testing-y-tooling": {
    slug: "clojure-spec-testing-y-tooling",
    learnerProfile: "Persona que ya programa en Clojure y quiere subir el rigor con validacion, pruebas y flujo REPL.",
    timeCommitment: "4-5 horas por semana durante 2 semanas.",
    prerequisites: [
      "Completar la ruta Clojure previa o experiencia equivalente",
      "Dominar funciones, colecciones y pipelines",
      "Leer codigo idiomatico en REPL sin dificultad",
    ],
    learningOutcomes: [
      "Definir validaciones de datos con predicados y contratos simples estilo spec",
      "Diseñar pruebas legibles para funciones puras y reglas de negocio",
      "Aplicar un workflow de REPL, namespaces y debugging mas disciplinado",
      "Explicar como validacion, pruebas y tooling reducen riesgo en un sistema funcional",
    ],
    assessmentPlan: {
      diagnostic: "Comprobar lectura de funciones puras, validacion booleana y casos de borde.",
      formative: [
        "Retos de validacion declarativa sobre mapas y colecciones",
        "Ejercicios de aserciones tipo deftest/is adaptadas al runtime del curso",
        "Checkpoints de workflow REPL y organizacion de namespaces",
      ],
      summative:
        "Caso final donde se valida entrada, se prueban reglas clave y se documenta un flujo de trabajo reproducible.",
    },
    rubricDimensions: ["Correctness", "Validation", "Testing Discipline", "Tooling Clarity"],
    masteryCriteria: [
      "Expresar reglas de validacion como contratos claros y verificables",
      "Diseñar pruebas que capturen comportamiento y casos borde relevantes",
      "Usar un workflow de REPL y tooling para iterar sin perder trazabilidad",
    ],
    bibliographyGuidance:
      "Combinar referencia oficial de spec, pruebas idiomaticas y practicas de REPL-driven development.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Contratos y Validacion",
        objective: "Convertir reglas de negocio en contratos de datos legibles y comprobables.",
        feedbackFocus: "Predicados poco precisos y validacion incompleta.",
        reflectionPrompt: "Que regla de negocio merece un contrato explicito y por que?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Testing y Workflow",
        objective: "Asegurar el comportamiento con pruebas pequenas y flujo REPL disciplinado.",
        feedbackFocus: "Cobertura insuficiente de casos borde y pasos manuales ambiguos.",
        reflectionPrompt: "Que parte del workflow te ayudo mas a detectar errores temprano?",
      },
    ],
  },
};

export function isClojureCourseSlug(slug: string): slug is ClojureCourseSlug {
  return CLOJURE_COURSE_SLUGS.includes(slug as ClojureCourseSlug);
}

function clonePedagogy(pedagogy: ClojureCoursePedagogy): ClojureCoursePedagogy {
  return cloneCoursePedagogy(pedagogy);
}

export function getClojureCoursePedagogy(slug: string): ClojureCoursePedagogy | null {
  if (!isClojureCourseSlug(slug)) {
    return null;
  }

  return clonePedagogy(CLOJURE_COURSE_PEDAGOGY[slug]);
}

export function getClojureLessonStageFromPedagogy(
  pedagogy: Pick<ClojureCoursePedagogy, "lessonStages"> | null,
  lessonOrder: number
): CourseLessonStage | null {
  return getLessonStageFromPedagogy(pedagogy, lessonOrder);
}

export function resolveClojureCoursePedagogy(
  slug: string,
  rawPedagogy?: unknown
): ClojureCoursePedagogy | null {
  const fallback = getClojureCoursePedagogy(slug);
  if (!fallback) {
    return null;
  }

  const parsed = clojureCoursePedagogyInputSchema.safeParse(rawPedagogy);
  if (!parsed.success) {
    return fallback;
  }

  return {
    ...parsed.data,
    slug: fallback.slug,
  };
}

export function getClojureLessonStage(
  slug: string,
  lessonOrder: number
): CourseLessonStage | null {
  return getClojureLessonStageFromPedagogy(getClojureCoursePedagogy(slug), lessonOrder);
}
