import { z } from "zod";
import {
  cloneCoursePedagogy,
  coursePedagogyInputSchema,
  getLessonStageFromPedagogy,
  type CourseLessonStage,
  type CoursePedagogy,
} from "@/lib/course-pedagogy";

export const PYTHON_COURSE_SLUGS = [
  "python-basico",
  "python-intermedio",
  "python-analisis-datos",
  "python-analisis-negocio",
  "python-forecasting-ab-testing",
] as const;

export type PythonCourseSlug = (typeof PYTHON_COURSE_SLUGS)[number];

export interface PythonCoursePedagogy extends CoursePedagogy {
  slug: PythonCourseSlug;
}

export const pythonCoursePedagogyInputSchema = coursePedagogyInputSchema;

export type PythonCoursePedagogyInput = z.infer<typeof pythonCoursePedagogyInputSchema>;

const PYTHON_COURSE_PEDAGOGY: Record<PythonCourseSlug, PythonCoursePedagogy> = {
  "python-basico": {
    slug: "python-basico",
    learnerProfile: "Principiante sin experiencia previa en programacion.",
    timeCommitment: "2-3 horas por semana durante 2 semanas.",
    prerequisites: [
      "Uso basico de navegador y teclado",
      "Aritmetica elemental",
      "Motivacion para resolver ejercicios paso a paso",
    ],
    learningOutcomes: [
      "Escribir scripts simples con variables, condicionales y bucles",
      "Crear funciones reutilizables con parametros y retorno",
      "Manipular listas y diccionarios para resolver mini casos",
      "Validar salida esperada con ejercicios guiados",
    ],
    assessmentPlan: {
      diagnostic: "Verificar comprension de operaciones basicas y lectura de enunciados.",
      formative: [
        "Checks por ejercicio con salida exacta o contiene",
        "Hints progresivos por intentos",
        "Preguntas de reflexion al cierre de cada bloque",
      ],
      summative:
        "Mini reto integrador donde el alumno combina control de flujo, funciones y estructuras.",
    },
    rubricDimensions: ["Correctness", "Method", "Clarity", "Robustness"],
    masteryCriteria: [
      "Resolver al menos 80% de ejercicios sin ayuda final",
      "Explicar verbalmente la logica de su solucion",
      "Modificar ejemplos base para un caso nuevo",
    ],
    bibliographyGuidance:
      "Priorizar documentacion oficial y una fuente practica de ejercicios incrementales.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Fundamentos",
        objective: "Comprender sintaxis, tipos basicos y salida por consola.",
        feedbackFocus: "Errores de sintaxis y formato de salida.",
        reflectionPrompt: "Que patron de codigo repetiste y por que?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Control de Flujo",
        objective: "Tomar decisiones con condiciones y automatizar tareas con bucles.",
        feedbackFocus: "Condiciones incompletas y rangos incorrectos en iteraciones.",
        reflectionPrompt: "Cuando conviene usar if y cuando usar bucle?",
      },
      {
        fromOrder: 5,
        toOrder: 6,
        label: "Abstraccion de Soluciones",
        objective: "Encapsular logica y trabajar colecciones de datos.",
        feedbackFocus: "Parametros mal usados y confusion entre lista y diccionario.",
        reflectionPrompt: "Como reusarias esta solucion en otro problema?",
      },
    ],
  },
  "python-intermedio": {
    slug: "python-intermedio",
    learnerProfile: "Alumno con fundamentos de Python que busca fluidez tecnica.",
    timeCommitment: "3-4 horas por semana durante 2-3 semanas.",
    prerequisites: [
      "Dominar variables, condicionales, bucles y funciones",
      "Entender listas y diccionarios",
      "Comodidad ejecutando y depurando scripts cortos",
    ],
    learningOutcomes: [
      "Aplicar comprehensions y funciones de orden superior con criterio",
      "Manejar excepciones de forma segura",
      "Procesar texto estructurado y datos tabulares simples",
      "Resolver mini proyectos con codigo mantenible",
    ],
    assessmentPlan: {
      diagnostic: "Reto rapido para confirmar dominio de fundamentos y lectura de datos.",
      formative: [
        "Evaluacion por caso de prueba en cada ejercicio",
        "Comparacion de enfoque imperativo vs funcional",
        "Autoevaluacion de legibilidad al final de cada leccion",
      ],
      summative:
        "Mini proyecto de analisis de ventas con metricas y recomendaciones.",
    },
    rubricDimensions: ["Correctness", "Method", "Clarity", "Robustness"],
    masteryCriteria: [
      "Seleccionar estructuras de datos adecuadas en cada reto",
      "Manejar excepciones sin ocultar errores importantes",
      "Entregar soluciones legibles y con resultados verificables",
    ],
    bibliographyGuidance:
      "Combinar referencia de libreria estandar con libros de buenas practicas Python.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Productividad de Codigo",
        objective: "Reducir codigo repetitivo con patrones intermedios.",
        feedbackFocus: "Uso excesivo de lambda o comprensiones poco legibles.",
        reflectionPrompt: "Tu solucion es mas corta y tambien mas clara?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Transformacion de Datos",
        objective: "Convertir entradas textuales en estructuras listas para analisis.",
        feedbackFocus: "Errores en parsing y normalizacion.",
        reflectionPrompt: "Que validaciones agregarias para datos sucios?",
      },
      {
        fromOrder: 5,
        toOrder: 6,
        label: "Integracion",
        objective: "Integrar tecnicas en una solucion de negocio end-to-end.",
        feedbackFocus: "Consistencia de salida y flujo logico general.",
        reflectionPrompt: "Que parte de tu pipeline es mas fragil y como la reforzarias?",
      },
    ],
  },
  "python-analisis-datos": {
    slug: "python-analisis-datos",
    learnerProfile: "Alumno que quiere hacer analisis aplicado y visualizacion de datos.",
    timeCommitment: "3-4 horas por semana durante 2 semanas.",
    prerequisites: [
      "Python basico/intermedio",
      "Conceptos de promedio, porcentaje y agregacion",
      "Interes en analisis orientado a decisiones",
    ],
    learningOutcomes: [
      "Limpiar y transformar datasets pequenos y medianos",
      "Calcular KPIs de negocio desde registros crudos",
      "Construir visualizaciones basicas para comunicar hallazgos",
      "Redactar un resumen ejecutivo accionable",
    ],
    assessmentPlan: {
      diagnostic: "Comprobar lectura de tablas y calculo de metricas base.",
      formative: [
        "Tareas de limpieza y estandarizacion por bloques",
        "Checkpoints de KPI con salidas verificables",
        "Ejercicios de interpretacion de tendencia",
      ],
      summative:
        "Mini caso de analisis con metricas, grafica y recomendacion ejecutiva.",
    },
    rubricDimensions: ["Correctness", "Method", "Clarity", "Robustness"],
    masteryCriteria: [
      "Producir metricas consistentes sin errores de transformacion",
      "Explicar supuestos del analisis",
      "Presentar recomendacion con evidencia cuantitativa",
    ],
    bibliographyGuidance:
      "Incluir pandas/matplotlib y una referencia integral de ciencia de datos en Python.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Preparacion de Datos",
        objective: "Transformar datos sucios en una base analizable.",
        feedbackFocus: "Tratamiento de nulos, tipado y deduplicacion.",
        reflectionPrompt: "Que regla de limpieza impacto mas en el resultado final?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Analisis y Comunicacion",
        objective: "Pasar de metricas a decisiones con narrativa ejecutiva.",
        feedbackFocus: "Interpretacion de KPI y claridad del mensaje final.",
        reflectionPrompt: "Que decision recomendarias y que riesgo acompanaria?",
      },
    ],
  },
  "python-analisis-negocio": {
    slug: "python-analisis-negocio",
    learnerProfile: "Analista funcional o de producto que requiere medir impacto.",
    timeCommitment: "3-4 horas por semana durante 2 semanas.",
    prerequisites: [
      "Python basico",
      "Conocer conceptos de embudo, conversion y churn",
      "Lectura de indicadores empresariales",
    ],
    learningOutcomes: [
      "Calcular metricas clave como margen, ARPU y conversion",
      "Identificar etapas debiles en funnel comercial",
      "Segmentar clientes para priorizacion",
      "Traducir resultados en plan de accion de negocio",
    ],
    assessmentPlan: {
      diagnostic: "Revisar comprension de tasas y proporciones de negocio.",
      formative: [
        "Calculo guiado de metricas por leccion",
        "Comparacion entre segmentos y escenarios",
        "Validacion de decision final por reglas de negocio",
      ],
      summative:
        "Caso de cierre con pronostico simple y recomendacion priorizada.",
    },
    rubricDimensions: ["Correctness", "Method", "Clarity", "Robustness"],
    masteryCriteria: [
      "Sustentar decisiones con metricas y no solo intuicion",
      "Distinguir entre mejora relativa y absoluta",
      "Proponer acciones medibles para siguiente iteracion",
    ],
    bibliographyGuidance:
      "Combinar analitica de negocio, storytelling y frameworks de decision.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Metricas y Funnel",
        objective: "Medir salud de negocio y detectar cuellos de botella.",
        feedbackFocus: "Errores de formula y lectura de conversion.",
        reflectionPrompt: "Que etapa del funnel atacarias primero y por que?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Priorizacion y Plan",
        objective: "Priorizar segmentos y acciones segun impacto esperado.",
        feedbackFocus: "Coherencia entre hallazgo y recomendacion.",
        reflectionPrompt: "Que experimento correrias para validar tu plan?",
      },
    ],
  },
  "python-forecasting-ab-testing": {
    slug: "python-forecasting-ab-testing",
    learnerProfile: "Analista de datos/producto que necesita pronosticar y experimentar.",
    timeCommitment: "4-5 horas por semana durante 2 semanas.",
    prerequisites: [
      "Python intermedio",
      "Manejo de porcentajes y estadistica descriptiva",
      "Conocer conceptos basicos de conversion y guardrails",
    ],
    learningOutcomes: [
      "Construir pronosticos baseline y evaluarlos con MAPE",
      "Calcular lift y tasas de conversion en experimentos A/B",
      "Aplicar criterio de significancia para toma de decisiones",
      "Integrar estadistica y riesgo de negocio en recomendacion final",
    ],
    assessmentPlan: {
      diagnostic: "Comprobar dominio de proporciones, promedio movil y lectura de series.",
      formative: [
        "Forecast checkpoints por bloque con dataset simulado",
        "Calculo de lift y ajuste de metrica previa",
        "Interpretacion de z-score y decisiones por guardrail",
      ],
      summative:
        "Caso final donde se decide lanzamiento con evidencia estadistica y de negocio.",
    },
    rubricDimensions: ["Correctness", "Method", "Clarity", "Robustness"],
    masteryCriteria: [
      "Explicar supuestos estadisticos usados",
      "Reportar limites de interpretacion de resultados",
      "Emitir recomendacion accionable con riesgo explicitado",
    ],
    bibliographyGuidance:
      "Priorizar libros/papers de forecasting y experimentacion online controlada.",
    lessonStages: [
      {
        fromOrder: 1,
        toOrder: 2,
        label: "Forecasting",
        objective: "Estimar demanda/metricas y medir error de pronostico.",
        feedbackFocus: "Eleccion del baseline y consistencia en metricas de error.",
        reflectionPrompt: "Que tipo de error de forecast impacta mas al negocio?",
      },
      {
        fromOrder: 3,
        toOrder: 4,
        label: "Experimentacion",
        objective: "Evaluar si una variante mejora el KPI sin romper guardrails.",
        feedbackFocus: "Confusion entre significancia estadistica e impacto real.",
        reflectionPrompt: "Aprobarias rollout total? Bajo que condiciones?",
      },
    ],
  },
};

export function isPythonCourseSlug(slug: string): slug is PythonCourseSlug {
  return PYTHON_COURSE_SLUGS.includes(slug as PythonCourseSlug);
}

function clonePedagogy(pedagogy: PythonCoursePedagogy): PythonCoursePedagogy {
  return cloneCoursePedagogy(pedagogy);
}

export function getPythonCoursePedagogy(slug: string): PythonCoursePedagogy | null {
  if (!isPythonCourseSlug(slug)) return null;
  return clonePedagogy(PYTHON_COURSE_PEDAGOGY[slug]);
}

export function getPythonLessonStageFromPedagogy(
  pedagogy: Pick<PythonCoursePedagogy, "lessonStages"> | null,
  lessonOrder: number
): CourseLessonStage | null {
  return getLessonStageFromPedagogy(pedagogy, lessonOrder);
}

export function resolvePythonCoursePedagogy(
  slug: string,
  rawPedagogy?: unknown
): PythonCoursePedagogy | null {
  const fallback = getPythonCoursePedagogy(slug);
  if (!fallback) return null;

  const parsed = pythonCoursePedagogyInputSchema.safeParse(rawPedagogy);
  if (!parsed.success) {
    return fallback;
  }

  return {
    ...parsed.data,
    slug: fallback.slug,
  };
}

export function getPythonLessonStage(
  slug: string,
  lessonOrder: number
): CourseLessonStage | null {
  return getPythonLessonStageFromPedagogy(getPythonCoursePedagogy(slug), lessonOrder);
}
