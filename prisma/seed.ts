/**
 * Seed principal:
 * - Usuario admin
 * - 5 cursos de Python (basico, intermedio, datos, negocio y forecasting/ab testing)
 * - Lecciones + retos interactivos con tests
 * - Anuncio inicial
 */

import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type ValidationType = 'exact' | 'contains' | 'regex' | 'custom';

interface SeedTestCase {
  description: string;
  expected?: string;
  pattern?: string;
}

interface SeedExercise {
  id: string;
  order: number;
  title: string;
  instructions: string;
  starterCode: string;
  solutionCode: string;
  validationType: ValidationType;
  testCases: SeedTestCase[];
  rubric?: Array<{
    title: string;
    description: string;
    weight: number;
  }>;
  hints: string[];
}

interface SeedLesson {
  slug: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  content: string;
  exercises: SeedExercise[];
}

interface SeedCourse {
  slug: string;
  title: string;
  description: string;
  order: number;
  language?: string;
  runtimeType?: string;
  lessons: SeedLesson[];
}

const DEFAULT_EXERCISE_RUBRIC = [
  {
    title: "Correctness",
    description: "El resultado cumple con los casos esperados del ejercicio.",
    weight: 50,
  },
  {
    title: "Method",
    description: "La estrategia seleccionada es adecuada para el problema.",
    weight: 20,
  },
  {
    title: "Clarity",
    description: "El codigo es legible, consistente y facil de mantener.",
    weight: 15,
  },
  {
    title: "Robustness",
    description: "La solucion contempla casos borde razonables.",
    weight: 15,
  },
] as const;

const PYTHON_COURSES: SeedCourse[] = [
  {
    slug: 'python-basico',
    title: 'Python Basico: fundamentos y practica',
    description:
      'Empieza desde cero con Python y resuelve retos interactivos con consola y tests.',
    order: 1,
    language: 'python',
    runtimeType: 'browser_pyodide',
    lessons: [
      {
        slug: 'basico-hola-variables',
        title: 'Hola Python y variables',
        order: 1,
        estimatedMinutes: 14,
        content: `
# Hola Python y variables

En esta leccion vas a:
- imprimir datos en consola con \`print\`
- crear variables
- combinar texto y valores

El objetivo es que escribas codigo y veas el resultado al instante.
        `,
        exercises: [
          {
            id: 'pyb-l1-e1',
            order: 1,
            title: 'Tu primer output',
            instructions:
              'Usa la variable \`nombre\` y muestra exactamente: \`Hola, Ada\`.',
            starterCode: `nombre = "Ada"\n# Escribe tu codigo aqui\n`,
            solutionCode: `nombre = "Ada"\nprint(f"Hola, {nombre}")`,
            validationType: 'exact',
            testCases: [
              {
                description: 'Debe imprimir el saludo exacto',
                expected: 'Hola, Ada',
              },
            ],
            hints: [
              'Usa print(...)',
              'Puedes usar f-strings: f"Hola, {nombre}"',
            ],
          },
          {
            id: 'pyb-l1-e2',
            order: 2,
            title: 'Calculo simple con variables',
            instructions:
              'Teniendo \`edad_actual = 24\`, calcula e imprime la edad en 2030.',
            starterCode:
              'edad_actual = 24\nanio_actual = 2024\nanio_objetivo = 2030\n# Calcula e imprime la edad en 2030\n',
            solutionCode:
              'edad_actual = 24\nanio_actual = 2024\nanio_objetivo = 2030\nedad_2030 = edad_actual + (anio_objetivo - anio_actual)\nprint(edad_2030)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Resultado esperado',
                expected: '30',
              },
            ],
            hints: [
              'Primero calcula cuantos anios faltan',
              'Luego sumalos a edad_actual',
            ],
          },
        ],
      },
      {
        slug: 'basico-strings-operaciones',
        title: 'Strings, numeros y formato',
        order: 2,
        estimatedMinutes: 18,
        content: `
# Strings, numeros y formato

Ahora vas a practicar:
- operaciones numericas
- redondeo
- formateo de texto para reportes
        `,
        exercises: [
          {
            id: 'pyb-l2-e1',
            order: 1,
            title: 'Precio con descuento',
            instructions:
              'Calcula el precio final de 49.9 con 15% de descuento e imprime el resultado redondeado a 2 decimales.',
            starterCode:
              'precio = 49.9\ndescuento = 0.15\n# Calcula e imprime el precio final\n',
            solutionCode:
              'precio = 49.9\ndescuento = 0.15\nfinal = round(precio * (1 - descuento), 2)\nprint(final)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Precio final correcto',
                expected: '42.42',
              },
            ],
            hints: ['Usa 1 - descuento', 'Usa round(valor, 2)'],
          },
          {
            id: 'pyb-l2-e2',
            order: 2,
            title: 'Mini reporte con f-string',
            instructions:
              'Imprime exactamente: \`Lalo - Python - 35%\` usando variables y f-string.',
            starterCode:
              'nombre = "Lalo"\ncurso = "Python"\nprogreso = 35\n# Imprime el reporte\n',
            solutionCode:
              'nombre = "Lalo"\ncurso = "Python"\nprogreso = 35\nprint(f"{nombre} - {curso} - {progreso}%")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Formato esperado',
                expected: 'Lalo - Python - 35%',
              },
            ],
            hints: ['Usa la variable progreso con % al final'],
          },
        ],
      },
      {
        slug: 'basico-condicionales',
        title: 'Condicionales y logica',
        order: 3,
        estimatedMinutes: 20,
        content: `
# Condicionales y logica

Con \`if / elif / else\` puedes tomar decisiones en tiempo de ejecucion.
Tambien usaras operadores logicos (\`and\`, \`or\`).
        `,
        exercises: [
          {
            id: 'pyb-l3-e1',
            order: 1,
            title: 'Aprobado o reprobado',
            instructions:
              'Si \`puntaje\` es mayor o igual a 70 imprime \`aprobado\`, si no imprime \`reprobado\`.',
            starterCode: 'puntaje = 78\n# Escribe la condicion\n',
            solutionCode:
              'puntaje = 78\nif puntaje >= 70:\n    print("aprobado")\nelse:\n    print("reprobado")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Resultado del caso actual',
                expected: 'aprobado',
              },
            ],
            hints: ['La comparacion clave es >= 70'],
          },
          {
            id: 'pyb-l3-e2',
            order: 2,
            title: 'Envio gratis',
            instructions:
              'Con \`subtotal = 120\` y \`es_vip = True\`: si subtotal >= 100 o es_vip, imprime 0; si no, 9.99.',
            starterCode:
              'subtotal = 120\nes_vip = True\n# Calcula el costo de envio e imprimelo\n',
            solutionCode:
              'subtotal = 120\nes_vip = True\nif subtotal >= 100 or es_vip:\n    envio = 0\nelse:\n    envio = 9.99\nprint(envio)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Costo de envio esperado',
                expected: '0',
              },
            ],
            hints: ['Usa or para combinar condiciones'],
          },
        ],
      },
      {
        slug: 'basico-bucles',
        title: 'Bucles for y while',
        order: 4,
        estimatedMinutes: 22,
        content: `
# Bucles for y while

Los bucles te permiten automatizar tareas repetitivas:
- sumar secuencias
- recorrer listas
- generar salidas por linea
        `,
        exercises: [
          {
            id: 'pyb-l4-e1',
            order: 1,
            title: 'Suma del 1 al 100',
            instructions: 'Usa un bucle para calcular e imprimir la suma de 1 a 100.',
            starterCode: 'total = 0\n# Completa aqui\nprint(total)\n',
            solutionCode:
              'total = 0\nfor n in range(1, 101):\n    total += n\nprint(total)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Total esperado',
                expected: '5050',
              },
            ],
            hints: ['range(1, 101) llega hasta 100'],
          },
          {
            id: 'pyb-l4-e2',
            order: 2,
            title: 'Multiplos de 3',
            instructions:
              'Imprime los multiplos de 3 entre 3 y 15, uno por linea.',
            starterCode: '# Imprime 3, 6, 9, 12 y 15\n',
            solutionCode:
              'for n in range(3, 16, 3):\n    print(n)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Secuencia exacta',
                expected: '3\\n6\\n9\\n12\\n15',
              },
            ],
            hints: ['Puedes usar range(inicio, fin, paso)'],
          },
        ],
      },
      {
        slug: 'basico-funciones',
        title: 'Funciones y reutilizacion',
        order: 5,
        estimatedMinutes: 24,
        content: `
# Funciones y reutilizacion

Las funciones permiten encapsular logica para reutilizarla:
- parametros
- retorno
- llamadas limpias y legibles
        `,
        exercises: [
          {
            id: 'pyb-l5-e1',
            order: 1,
            title: 'Funcion saludar',
            instructions:
              'Crea una funcion \`saludar(nombre)\` que retorne \`Hola, <nombre>!\` e imprime el resultado con "Lalo".',
            starterCode:
              '# Define saludar(nombre)\n\n# Imprime saludar("Lalo")\n',
            solutionCode:
              'def saludar(nombre):\n    return f"Hola, {nombre}!"\n\nprint(saludar("Lalo"))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Salida esperada',
                expected: 'Hola, Lalo!',
              },
            ],
            hints: ['No olvides return dentro de la funcion'],
          },
          {
            id: 'pyb-l5-e2',
            order: 2,
            title: 'Area de rectangulo',
            instructions:
              'Crea \`area_rectangulo(base, altura)\` y usa base=7, altura=4. Imprime el resultado.',
            starterCode:
              '# Define area_rectangulo(base, altura)\n\nbase = 7\naltura = 4\n# Imprime el area\n',
            solutionCode:
              'def area_rectangulo(base, altura):\n    return base * altura\n\nbase = 7\naltura = 4\nprint(area_rectangulo(base, altura))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Area correcta',
                expected: '28',
              },
            ],
            hints: ['Formula: base * altura'],
          },
        ],
      },
      {
        slug: 'basico-listas-diccionarios',
        title: 'Listas y diccionarios',
        order: 6,
        estimatedMinutes: 26,
        content: `
# Listas y diccionarios

Vas a trabajar con colecciones:
- listas para secuencias ordenadas
- diccionarios para pares clave-valor
- ejercicios mini de analisis de datos
        `,
        exercises: [
          {
            id: 'pyb-l6-e1',
            order: 1,
            title: 'Promedio de notas',
            instructions:
              'Con la lista \`notas = [15, 18, 20, 19]\`, calcula e imprime el promedio.',
            starterCode: 'notas = [15, 18, 20, 19]\n# Calcula promedio e imprimelo\n',
            solutionCode:
              'notas = [15, 18, 20, 19]\npromedio = sum(notas) / len(notas)\nprint(promedio)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Promedio esperado',
                expected: '18.0',
              },
            ],
            hints: ['sum(lista) y len(lista)'],
          },
          {
            id: 'pyb-l6-e2',
            order: 2,
            title: 'Conteo de palabras',
            instructions:
              'Cuenta cuantas veces aparecen "python" y "api". Imprime primero el conteo de python y luego el de api.',
            starterCode:
              'palabras = ["python", "api", "python", "datos", "api", "python"]\n# Construye el conteo e imprime python y api\n',
            solutionCode:
              'palabras = ["python", "api", "python", "datos", "api", "python"]\nconteo = {}\nfor p in palabras:\n    conteo[p] = conteo.get(p, 0) + 1\nprint(conteo["python"])\nprint(conteo["api"])',
            validationType: 'exact',
            testCases: [
              {
                description: 'Conteo de python y api',
                expected: '3\\n2',
              },
            ],
            hints: ['dic.get(clave, valor_por_defecto) te ayuda mucho'],
          },
        ],
      },
    ],
  },
  {
    slug: 'python-intermedio',
    title: 'Python Intermedio: retos practicos',
    description:
      'Sube de nivel con comprehensions, manejo de errores, parsing y mini proyectos con tests.',
    order: 2,
    language: 'python',
    runtimeType: 'browser_pyodide',
    lessons: [
      {
        slug: 'intermedio-comprehensions',
        title: 'List comprehensions y lambda',
        order: 1,
        estimatedMinutes: 22,
        content: `
# List comprehensions y lambda

En esta leccion optimizaras codigo:
- comprehensions para transformar listas rapido
- funciones lambda para expresiones cortas
        `,
        exercises: [
          {
            id: 'pyi-l1-e1',
            order: 1,
            title: 'Cuadrados pares',
            instructions:
              'Genera una lista con el cuadrado de los numeros pares del 1 al 10 e imprimela.',
            starterCode: '# Imprime: [4, 16, 36, 64, 100]\n',
            solutionCode:
              'resultado = [n**2 for n in range(1, 11) if n % 2 == 0]\nprint(resultado)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Lista objetivo',
                expected: '[4, 16, 36, 64, 100]',
              },
            ],
            hints: ['Usa if dentro de la comprehension'],
          },
          {
            id: 'pyi-l1-e2',
            order: 2,
            title: 'Ordenar por puntaje',
            instructions:
              'Ordena los alumnos por puntaje descendente y muestra solo el nombre del primero.',
            starterCode:
              'datos = [("Ana", 88), ("Luis", 95), ("Mia", 91)]\n# Ordena e imprime el nombre top\n',
            solutionCode:
              'datos = [("Ana", 88), ("Luis", 95), ("Mia", 91)]\nordenado = sorted(datos, key=lambda x: x[1], reverse=True)\nprint(ordenado[0][0])',
            validationType: 'exact',
            testCases: [
              {
                description: 'Top alumno',
                expected: 'Luis',
              },
            ],
            hints: ['sorted(..., key=lambda x: x[1], reverse=True)'],
          },
        ],
      },
      {
        slug: 'intermedio-excepciones',
        title: 'Manejo de errores y excepciones',
        order: 2,
        estimatedMinutes: 20,
        content: `
# Manejo de errores

El codigo robusto maneja fallos de forma elegante con \`try/except\`.
        `,
        exercises: [
          {
            id: 'pyi-l2-e1',
            order: 1,
            title: 'Division segura',
            instructions:
              'Maneja la division entre cero e imprime: "No se puede dividir entre cero".',
            starterCode: 'a = 10\nb = 0\n# Maneja la excepcion\n',
            solutionCode:
              'a = 10\nb = 0\ntry:\n    print(a / b)\nexcept ZeroDivisionError:\n    print("No se puede dividir entre cero")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Mensaje controlado',
                expected: 'No se puede dividir entre cero',
              },
            ],
            hints: ['Captura ZeroDivisionError'],
          },
          {
            id: 'pyi-l2-e2',
            order: 2,
            title: 'Validar entrada numerica',
            instructions:
              'Convierte "42x" a entero. Si falla, imprime "entrada invalida".',
            starterCode: 'valor = "42x"\n# Intenta convertir a int\n',
            solutionCode:
              'valor = "42x"\ntry:\n    numero = int(valor)\n    print(numero)\nexcept ValueError:\n    print("entrada invalida")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Manejo de ValueError',
                expected: 'entrada invalida',
              },
            ],
            hints: ['Captura ValueError en except'],
          },
        ],
      },
      {
        slug: 'intermedio-texto-archivos',
        title: 'Procesamiento de texto tipo archivos',
        order: 3,
        estimatedMinutes: 24,
        content: `
# Procesamiento de texto

Simularas lectura de archivos con strings multilinea para practicar parsing:
- dividir lineas
- transformar tipos
- agregar resultados
        `,
        exercises: [
          {
            id: 'pyi-l3-e1',
            order: 1,
            title: 'Sumar ventas CSV',
            instructions:
              'Parsea el CSV y calcula el total de ventas. Debe imprimirse 355.',
            starterCode:
              'csv_data = "enero,120\\nfebrero,95\\nmarzo,140"\n# Calcula total de la segunda columna\n',
            solutionCode:
              'csv_data = "enero,120\\nfebrero,95\\nmarzo,140"\ntotal = 0\nfor linea in csv_data.split("\\n"):\n    _, valor = linea.split(",")\n    total += int(valor)\nprint(total)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Total de ventas',
                expected: '355',
              },
            ],
            hints: ['split("\\n") y luego split(",")'],
          },
          {
            id: 'pyi-l3-e2',
            order: 2,
            title: 'Contar palabras',
            instructions:
              'Cuenta cuantas palabras hay en el texto e imprime el total.',
            starterCode:
              'texto = "python es genial y python es rapido"\n# Cuenta palabras e imprime\n',
            solutionCode:
              'texto = "python es genial y python es rapido"\npalabras = texto.split()\nprint(len(palabras))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Numero total de palabras',
                expected: '7',
              },
            ],
            hints: ['split() sin parametros divide por espacios'],
          },
        ],
      },
      {
        slug: 'intermedio-sets-dicts',
        title: 'Sets, tuplas y diccionarios avanzados',
        order: 4,
        estimatedMinutes: 24,
        content: `
# Sets, tuplas y dicts avanzados

Aplicaras estructuras utiles para limpieza y transformacion de datos.
        `,
        exercises: [
          {
            id: 'pyi-l4-e1',
            order: 1,
            title: 'Unicos y ordenados',
            instructions:
              'Elimina duplicados con set y muestra la lista ordenada.',
            starterCode: 'nums = [3, 1, 2, 3, 2, 5]\n# Imprime [1, 2, 3, 5]\n',
            solutionCode: 'nums = [3, 1, 2, 3, 2, 5]\nprint(sorted(set(nums)))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Lista limpia y ordenada',
                expected: '[1, 2, 3, 5]',
              },
            ],
            hints: ['set(...) elimina duplicados'],
          },
          {
            id: 'pyi-l4-e2',
            order: 2,
            title: 'Invertir diccionario',
            instructions:
              'Invierte {"a":1, "b":2} y luego imprime el valor asociado a la clave 1.',
            starterCode:
              'original = {"a": 1, "b": 2}\n# Crea invertido e imprime invertido[1]\n',
            solutionCode:
              'original = {"a": 1, "b": 2}\ninvertido = {v: k for k, v in original.items()}\nprint(invertido[1])',
            validationType: 'exact',
            testCases: [
              {
                description: 'Clave invertida correcta',
                expected: 'a',
              },
            ],
            hints: ['Recorre original.items()'],
          },
        ],
      },
      {
        slug: 'intermedio-map-filter-reduce',
        title: 'Map, filter y reduce',
        order: 5,
        estimatedMinutes: 26,
        content: `
# Map, filter y reduce

Patrones funcionales para transformaciones compactas en pipelines.
        `,
        exercises: [
          {
            id: 'pyi-l5-e1',
            order: 1,
            title: 'Filtrar pares y sumar',
            instructions:
              'Filtra los pares de [5, 8, 13, 21, 34] y luego imprime su suma.',
            starterCode:
              'nums = [5, 8, 13, 21, 34]\n# Filtra pares e imprime la suma\n',
            solutionCode:
              'nums = [5, 8, 13, 21, 34]\npares = list(filter(lambda n: n % 2 == 0, nums))\nprint(sum(pares))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Suma de pares',
                expected: '42',
              },
            ],
            hints: ['filter(...) + sum(...)'],
          },
          {
            id: 'pyi-l5-e2',
            order: 2,
            title: 'Producto acumulado',
            instructions:
              'Usa reduce para calcular el producto de [1, 2, 3, 4] e imprime el resultado.',
            starterCode:
              'from functools import reduce\nnums = [1, 2, 3, 4]\n# Calcula el producto total\n',
            solutionCode:
              'from functools import reduce\nnums = [1, 2, 3, 4]\nproducto = reduce(lambda acc, x: acc * x, nums, 1)\nprint(producto)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Producto esperado',
                expected: '24',
              },
            ],
            hints: ['reduce(func, lista, valor_inicial)'],
          },
        ],
      },
      {
        slug: 'intermedio-mini-proyecto',
        title: 'Mini proyecto: analizador de ventas',
        order: 6,
        estimatedMinutes: 30,
        content: `
# Mini proyecto: analizador de ventas

Haras un cierre practico: combinar logica, estructuras y salida limpia.
        `,
        exercises: [
          {
            id: 'pyi-l6-e1',
            order: 1,
            title: 'Total y promedio mensual',
            instructions:
              'Calcula total y promedio de ventas e imprime dos lineas con este formato: "Total: <valor>" y "Promedio: <valor>".',
            starterCode:
              'ventas = [250, 310, 420, 280]\n# Imprime total y promedio\n',
            solutionCode:
              'ventas = [250, 310, 420, 280]\ntotal = sum(ventas)\npromedio = total / len(ventas)\nprint(f"Total: {total}")\nprint(f"Promedio: {promedio}")',
            validationType: 'contains',
            testCases: [
              {
                description: 'Linea de total',
                expected: 'Total: 1260',
              },
              {
                description: 'Linea de promedio',
                expected: 'Promedio: 315.0',
              },
            ],
            hints: ['Total con sum()', 'Promedio = total / cantidad'],
          },
          {
            id: 'pyi-l6-e2',
            order: 2,
            title: 'Mes con mejor venta',
            instructions:
              'Con el diccionario de ventas, imprime "Mes top: marzo".',
            starterCode:
              'ventas_mes = {"enero": 250, "febrero": 310, "marzo": 420, "abril": 280}\n# Detecta e imprime el mes con mayor venta\n',
            solutionCode:
              'ventas_mes = {"enero": 250, "febrero": 310, "marzo": 420, "abril": 280}\nmes_top = max(ventas_mes, key=ventas_mes.get)\nprint(f"Mes top: {mes_top}")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Mes correcto',
                expected: 'Mes top: marzo',
              },
            ],
            hints: ['max(diccionario, key=diccionario.get)'],
          },
        ],
      },
    ],
  },
  {
    slug: 'python-analisis-datos',
    title: 'Python para Analisis de Datos',
    description:
      'Ruta aplicada de analisis de datos con tablas, limpieza, KPIs y reportes accionables.',
    order: 3,
    language: 'python',
    runtimeType: 'browser_pyodide',
    lessons: [
      {
        slug: 'datos-tablas-y-series',
        title: 'Tablas, series y lectura de datos',
        order: 1,
        estimatedMinutes: 24,
        content: `
# Tablas y series para analisis

En esta leccion convertiras datos crudos en estructuras utiles para analisis.
Trabajaras con listas, diccionarios y, cuando este disponible, pandas.
        `,
        exercises: [
          {
            id: 'pyd-l1-e1',
            order: 1,
            title: 'Total de ventas mensuales',
            instructions:
              'Calcula el total de ventas e imprime exactamente \`355\`.',
            starterCode:
              'ventas = [120, 95, 140]\n# Si tienes pandas disponible puedes usar DataFrame, pero la salida final debe ser 355\n',
            solutionCode:
              'try:\n    import pandas as pd\nexcept Exception:\n    pd = None\n\nventas = [120, 95, 140]\nif pd:\n    df = pd.DataFrame({"monto": ventas})\n    print(int(df["monto"].sum()))\nelse:\n    print(sum(ventas))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Suma total correcta',
                expected: '355',
              },
            ],
            hints: ['Puedes usar sum(ventas)', 'Si usas pandas, df["monto"].sum()'],
          },
          {
            id: 'pyd-l1-e2',
            order: 2,
            title: 'Mes con mayor venta',
            instructions:
              'Con el diccionario dado, imprime exactamente \`marzo\`.',
            starterCode:
              'ventas = {"enero": 120, "febrero": 95, "marzo": 140}\n# Imprime el mes con mayor monto\n',
            solutionCode:
              'ventas = {"enero": 120, "febrero": 95, "marzo": 140}\nprint(max(ventas, key=ventas.get))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Mes top correcto',
                expected: 'marzo',
              },
            ],
            hints: ['Usa max(diccionario, key=diccionario.get)'],
          },
        ],
      },
      {
        slug: 'datos-limpieza-y-calidad',
        title: 'Limpieza y calidad de datos',
        order: 2,
        estimatedMinutes: 24,
        content: `
# Limpieza de datos

La calidad de datos es clave para cualquier analisis confiable.
Aqui practicaras valores nulos, normalizacion y deduplicacion.
        `,
        exercises: [
          {
            id: 'pyd-l2-e1',
            order: 1,
            title: 'Rellenar valores faltantes',
            instructions:
              'Completa los valores \`None\` con \`0\` e imprime la suma final.',
            starterCode:
              'datos = [10, None, 5, None, 20]\n# Rellena faltantes con 0 y luego imprime la suma total\n',
            solutionCode:
              'datos = [10, None, 5, None, 20]\nlimpios = [0 if d is None else d for d in datos]\nprint(sum(limpios))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Suma limpia esperada',
                expected: '35',
              },
            ],
            hints: ['Puedes usar list comprehension con condicion'],
          },
          {
            id: 'pyd-l2-e2',
            order: 2,
            title: 'Categorias normalizadas',
            instructions:
              'Normaliza el texto (trim + lowercase), elimina duplicados y luego imprime la cantidad de categorias unicas.',
            starterCode:
              'categorias = [" Ventas", "marketing ", "VENTAS", "Producto", "producto "]\n# Normaliza y cuenta categorias unicas\n',
            solutionCode:
              'categorias = [" Ventas", "marketing ", "VENTAS", "Producto", "producto "]\nnormalizadas = [c.strip().lower() for c in categorias]\nprint(len(set(normalizadas)))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Conteo de categorias unicas',
                expected: '3',
              },
            ],
            hints: ['Usa strip() y lower()', 'set(...) elimina duplicados'],
          },
        ],
      },
      {
        slug: 'datos-kpis-y-agregaciones',
        title: 'KPIs y agregaciones',
        order: 3,
        estimatedMinutes: 26,
        content: `
# KPIs y agregaciones

Haras agregaciones para convertir eventos en indicadores de negocio.
        `,
        exercises: [
          {
            id: 'pyd-l3-e1',
            order: 1,
            title: 'Ingreso total por canal',
            instructions:
              'Suma los ingresos del canal \`ads\` e imprime el resultado.',
            starterCode:
              'registros = [("ads", 120), ("organico", 80), ("ads", 230), ("referidos", 50), ("ads", 150)]\n# Imprime el total del canal ads\n',
            solutionCode:
              'registros = [("ads", 120), ("organico", 80), ("ads", 230), ("referidos", 50), ("ads", 150)]\ntotal_ads = sum(valor for canal, valor in registros if canal == "ads")\nprint(total_ads)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Total ads correcto',
                expected: '500',
              },
            ],
            hints: ['Filtra por canal == "ads"'],
          },
          {
            id: 'pyd-l3-e2',
            order: 2,
            title: 'Tasa de conversion',
            instructions:
              'Con \`leads = 240\` y \`clientes = 36\`, imprime la tasa de conversion porcentual con 1 decimal.',
            starterCode:
              'leads = 240\nclientes = 36\n# Imprime la conversion en porcentaje con 1 decimal\n',
            solutionCode:
              'leads = 240\nclientes = 36\nconversion = round((clientes / leads) * 100, 1)\nprint(conversion)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Conversion correcta',
                expected: '15.0',
              },
            ],
            hints: ['Formula: clientes / leads * 100', 'Usa round(valor, 1)'],
          },
        ],
      },
      {
        slug: 'datos-visualizacion-y-storytelling',
        title: 'Visualizacion y storytelling',
        order: 4,
        estimatedMinutes: 24,
        content: `
# Visualizacion de datos

La visualizacion transforma analisis en decisiones.
Usaras matplotlib si esta disponible y dejaras una salida verificable.
        `,
        exercises: [
          {
            id: 'pyd-l4-e1',
            order: 1,
            title: 'Grafica de tendencia',
            instructions:
              'Genera una grafica simple de tendencia (si matplotlib esta disponible) e imprime exactamente \`grafica lista\`.',
            starterCode:
              'meses = ["ene", "feb", "mar", "abr"]\nventas = [30, 45, 40, 55]\n# Crea la grafica de linea y termina imprimiendo "grafica lista"\n',
            solutionCode:
              'meses = ["ene", "feb", "mar", "abr"]\nventas = [30, 45, 40, 55]\ntry:\n    import matplotlib.pyplot as plt\n    plt.plot(meses, ventas)\n    plt.title("Tendencia mensual")\nexcept Exception:\n    pass\nprint("grafica lista")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Confirmacion de grafica',
                expected: 'grafica lista',
              },
            ],
            hints: ['Si falla matplotlib, captura la excepcion y continua'],
          },
          {
            id: 'pyd-l4-e2',
            order: 2,
            title: 'Resumen ejecutivo',
            instructions:
              'Imprime dos lineas: \`KPI principal: ingresos\` y \`Decision: invertir en ads\`.',
            starterCode:
              '# Imprime las dos lineas solicitadas para un resumen ejecutivo\n',
            solutionCode:
              'print("KPI principal: ingresos")\nprint("Decision: invertir en ads")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Linea KPI',
                expected: 'KPI principal: ingresos\nDecision: invertir en ads',
              },
            ],
            hints: ['Respeta mayusculas y texto exacto'],
          },
        ],
      },
    ],
  },
  {
    slug: 'python-analisis-negocio',
    title: 'Python para Analisis de Negocio',
    description:
      'Curso aplicado para analistas de negocio: metricas, embudos, segmentacion y pronostico.',
    order: 4,
    language: 'python',
    runtimeType: 'browser_pyodide',
    lessons: [
      {
        slug: 'negocio-metricas-esenciales',
        title: 'Metricas esenciales de negocio',
        order: 1,
        estimatedMinutes: 24,
        content: `
# Metricas esenciales

Aprenderas a traducir datos operativos en metricas de negocio utiles.
        `,
        exercises: [
          {
            id: 'pyba-l1-e1',
            order: 1,
            title: 'Margen bruto',
            instructions:
              'Con \`ingresos = 1800\` y \`costos = 1170\`, imprime el margen bruto porcentual con 1 decimal.',
            starterCode:
              'ingresos = 1800\ncostos = 1170\n# Calcula e imprime el margen bruto en porcentaje\n',
            solutionCode:
              'ingresos = 1800\ncostos = 1170\nmargen = round(((ingresos - costos) / ingresos) * 100, 1)\nprint(margen)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Margen correcto',
                expected: '35.0',
              },
            ],
            hints: ['(ingresos - costos) / ingresos * 100'],
          },
          {
            id: 'pyba-l1-e2',
            order: 2,
            title: 'ARPU mensual',
            instructions:
              'Con \`ingresos = 2250\` y \`clientes = 60\`, imprime el ARPU.',
            starterCode:
              'ingresos = 2250\nclientes = 60\n# Imprime ARPU\n',
            solutionCode:
              'ingresos = 2250\nclientes = 60\nprint(ingresos / clientes)',
            validationType: 'exact',
            testCases: [
              {
                description: 'ARPU esperado',
                expected: '37.5',
              },
            ],
            hints: ['ARPU = ingresos / clientes'],
          },
        ],
      },
      {
        slug: 'negocio-embudo-conversion',
        title: 'Embudo de conversion',
        order: 2,
        estimatedMinutes: 26,
        content: `
# Embudo de conversion

Modelaras cada etapa del funnel para detectar perdidas y oportunidades.
        `,
        exercises: [
          {
            id: 'pyba-l2-e1',
            order: 1,
            title: 'Conversion visita a lead',
            instructions:
              'Con \`visitas = 1200\` y \`leads = 96\`, imprime la conversion en porcentaje con 1 decimal.',
            starterCode:
              'visitas = 1200\nleads = 96\n# Imprime conversion visita->lead\n',
            solutionCode:
              'visitas = 1200\nleads = 96\nprint(round((leads / visitas) * 100, 1))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Conversion visita-lead',
                expected: '8.0',
              },
            ],
            hints: ['leads / visitas * 100'],
          },
          {
            id: 'pyba-l2-e2',
            order: 2,
            title: 'Etapa mas debil',
            instructions:
              'Detecta la etapa con menor tasa en el diccionario e imprime su nombre.',
            starterCode:
              'tasas = {"visita_lead": 8.0, "lead_demo": 42.0, "demo_cierre": 18.5}\n# Imprime la etapa con menor valor\n',
            solutionCode:
              'tasas = {"visita_lead": 8.0, "lead_demo": 42.0, "demo_cierre": 18.5}\nprint(min(tasas, key=tasas.get))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Etapa mas debil',
                expected: 'visita_lead',
              },
            ],
            hints: ['Usa min(diccionario, key=diccionario.get)'],
          },
        ],
      },
      {
        slug: 'negocio-segmentacion-y-priorizacion',
        title: 'Segmentacion y priorizacion',
        order: 3,
        estimatedMinutes: 24,
        content: `
# Segmentacion de clientes

Segmentar permite priorizar cuentas de mayor impacto comercial.
        `,
        exercises: [
          {
            id: 'pyba-l3-e1',
            order: 1,
            title: 'Clientes premium',
            instructions:
              'Cuenta cuantos clientes tienen MRR mayor o igual a 100 e imprime el total.',
            starterCode:
              'mrr = [40, 120, 85, 300, 110, 60]\n# Imprime cantidad de clientes premium (>=100)\n',
            solutionCode:
              'mrr = [40, 120, 85, 300, 110, 60]\npremium = [x for x in mrr if x >= 100]\nprint(len(premium))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Conteo premium',
                expected: '3',
              },
            ],
            hints: ['Filtra con >= 100'],
          },
          {
            id: 'pyba-l3-e2',
            order: 2,
            title: 'Ticket promedio por segmento',
            instructions:
              'Calcula ticket promedio del segmento enterprise e imprime el valor.',
            starterCode:
              'ventas = [("smb", 300), ("enterprise", 1200), ("enterprise", 900), ("smb", 250)]\n# Imprime promedio de enterprise\n',
            solutionCode:
              'ventas = [("smb", 300), ("enterprise", 1200), ("enterprise", 900), ("smb", 250)]\nenterprise = [monto for segmento, monto in ventas if segmento == "enterprise"]\nprint(sum(enterprise) / len(enterprise))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Promedio enterprise',
                expected: '1050.0',
              },
            ],
            hints: ['Filtra enterprise y luego promedio'],
          },
        ],
      },
      {
        slug: 'negocio-pronostico-y-plan',
        title: 'Pronostico y plan de accion',
        order: 4,
        estimatedMinutes: 24,
        content: `
# Pronostico y plan

Cerraras con un mini caso para proyectar ingresos y definir accion.
        `,
        exercises: [
          {
            id: 'pyba-l4-e1',
            order: 1,
            title: 'Pronostico lineal simple',
            instructions:
              'Con crecimiento mensual del 12% sobre 5000, calcula e imprime ingreso proyectado del siguiente mes redondeado a 2 decimales.',
            starterCode:
              'ingreso_actual = 5000\ngrowth = 0.12\n# Imprime pronostico del siguiente mes\n',
            solutionCode:
              'ingreso_actual = 5000\ngrowth = 0.12\nprint(round(ingreso_actual * (1 + growth), 2))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Pronostico correcto',
                expected: '5600.0',
              },
            ],
            hints: ['Multiplica por (1 + growth)'],
          },
          {
            id: 'pyba-l4-e2',
            order: 2,
            title: 'Decision de negocio',
            instructions:
              'Si churn es mayor a 5 imprime \`priorizar retencion\`; de lo contrario imprime \`acelerar adquisicion\`.',
            starterCode:
              'churn = 6.2\n# Imprime la decision correspondiente\n',
            solutionCode:
              'churn = 6.2\nif churn > 5:\n    print("priorizar retencion")\nelse:\n    print("acelerar adquisicion")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Decision correcta',
                expected: 'priorizar retencion',
              },
            ],
            hints: ['Compara churn > 5'],
          },
        ],
      },
    ],
  },
  {
    slug: 'python-forecasting-ab-testing',
    title: 'Python para Forecasting y A/B Testing',
    description:
      'Ruta aplicada para pronosticar metricas y evaluar experimentos A/B con criterio estadistico.',
    order: 5,
    language: 'python',
    runtimeType: 'browser_pyodide',
    lessons: [
      {
        slug: 'forecasting-series-temporales',
        title: 'Series temporales y pronostico base',
        order: 1,
        estimatedMinutes: 26,
        content: `
# Forecasting con series temporales

Aprenderas a construir pronosticos iniciales con moving average y estacionalidad simple.
Todo con datasets simulados para enfocarte en la logica analitica.
        `,
        exercises: [
          {
            id: 'pyfa-l1-e1',
            order: 1,
            title: 'Moving average de 3 periodos',
            instructions:
              'Calcula el forecast del siguiente periodo usando el promedio de los ultimos 3 valores e imprime el resultado con 1 decimal.',
            starterCode:
              'serie = [120, 128, 133, 141, 150, 158]\n# Imprime el forecast usando moving average de 3 periodos\n',
            solutionCode:
              'serie = [120, 128, 133, 141, 150, 158]\nforecast = round(sum(serie[-3:]) / 3, 1)\nprint(forecast)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Forecast esperado',
                expected: '149.7',
              },
            ],
            hints: ['Usa serie[-3:] para tomar los ultimos 3', 'Redondea con round(valor, 1)'],
          },
          {
            id: 'pyfa-l1-e2',
            order: 2,
            title: 'Ajuste estacional simple',
            instructions:
              'Con el valor del Q1 anterior y crecimiento esperado de 8%, proyecta Q1 siguiente e imprime el valor.',
            starterCode:
              'q1_anterior = 200\ngrowth = 0.08\n# Imprime proyeccion de Q1 siguiente\n',
            solutionCode:
              'q1_anterior = 200\ngrowth = 0.08\nprint(round(q1_anterior * (1 + growth), 1))',
            validationType: 'exact',
            testCases: [
              {
                description: 'Proyeccion Q1',
                expected: '216.0',
              },
            ],
            hints: ['Multiplica por (1 + growth)'],
          },
        ],
      },
      {
        slug: 'forecasting-evaluacion-modelo',
        title: 'Evaluacion de pronosticos',
        order: 2,
        estimatedMinutes: 26,
        content: `
# Evaluacion de modelos de forecast

Un pronostico util no solo predice: tambien se evalua con metricas claras como MAPE.
        `,
        exercises: [
          {
            id: 'pyfa-l2-e1',
            order: 1,
            title: 'Tendencia lineal simple',
            instructions:
              'Usa una pendiente constante para proyectar el mes 7 e imprime el valor estimado.',
            starterCode:
              'meses = [1, 2, 3, 4, 5, 6]\nventas = [100, 108, 116, 124, 132, 140]\n# Proyecta el mes 7 e imprime el valor\n',
            solutionCode:
              'meses = [1, 2, 3, 4, 5, 6]\nventas = [100, 108, 116, 124, 132, 140]\npendiente = ventas[1] - ventas[0]\nforecast_mes7 = ventas[-1] + pendiente\nprint(forecast_mes7)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Proyeccion mes 7',
                expected: '148',
              },
            ],
            hints: ['Calcula la diferencia entre puntos consecutivos'],
          },
          {
            id: 'pyfa-l2-e2',
            order: 2,
            title: 'MAPE del pronostico',
            instructions:
              'Calcula el MAPE para actual y forecast dados e imprime el porcentaje con 2 decimales.',
            starterCode:
              'actual = [130, 150, 170]\nforecast = [125, 152, 168]\n# Calcula e imprime MAPE en porcentaje\n',
            solutionCode:
              'actual = [130, 150, 170]\nforecast = [125, 152, 168]\nape = [abs(a - f) / a for a, f in zip(actual, forecast)]\nmape = round((sum(ape) / len(ape)) * 100, 2)\nprint(mape)',
            validationType: 'exact',
            testCases: [
              {
                description: 'MAPE esperado',
                expected: '2.12',
              },
            ],
            hints: ['APE = abs(actual - forecast) / actual'],
          },
        ],
      },
      {
        slug: 'ab-testing-diseno',
        title: 'Diseno de experimentos A/B',
        order: 3,
        estimatedMinutes: 28,
        content: `
# Diseno A/B testing

Aqui pasaras de intuicion a experimentacion: conversion rates, lift y ajustes pre-experimento.
        `,
        exercises: [
          {
            id: 'pyfa-l3-e1',
            order: 1,
            title: 'Lift de conversion',
            instructions:
              'Calcula tasa control, tasa variante y lift porcentual. Imprime 3 lineas con formato exacto.',
            starterCode:
              'control_conv = 480\ncontrol_visits = 4000\nvariant_conv = 552\nvariant_visits = 4000\n# Imprime:\n# Control: <tasa>\n# Variante: <tasa>\n# Lift: <porcentaje>\n',
            solutionCode:
              'control_conv = 480\ncontrol_visits = 4000\nvariant_conv = 552\nvariant_visits = 4000\ncontrol_rate = control_conv / control_visits\nvariant_rate = variant_conv / variant_visits\nlift = ((variant_rate - control_rate) / control_rate) * 100\nprint(f"Control: {round(control_rate, 3)}")\nprint(f"Variante: {round(variant_rate, 3)}")\nprint(f"Lift: {round(lift, 1)}")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Salida de tasas y lift',
                expected: 'Control: 0.12\nVariante: 0.138\nLift: 15.0',
              },
            ],
            hints: ['Lift relativo: (variante-control)/control * 100'],
          },
          {
            id: 'pyfa-l3-e2',
            order: 2,
            title: 'Ajuste tipo CUPED simplificado',
            instructions:
              'Aplica ajuste lineal con theta=0.4 y covariables dadas. Imprime el promedio ajustado con 2 decimales.',
            starterCode:
              'metricas = [15.2, 14.8, 16.0, 15.5]\ncovariable = [14.0, 14.2, 15.1, 14.7]\ntheta = 0.4\n# Ajusta cada metrica: y_adj = y - theta * (x - mean(x))\n# Imprime promedio ajustado\n',
            solutionCode:
              'metricas = [15.2, 14.8, 16.0, 15.5]\ncovariable = [14.0, 14.2, 15.1, 14.7]\ntheta = 0.4\nmean_x = sum(covariable) / len(covariable)\najustadas = [y - theta * (x - mean_x) for y, x in zip(metricas, covariable)]\npromedio_ajustado = round(sum(ajustadas) / len(ajustadas), 2)\nprint(promedio_ajustado)',
            validationType: 'exact',
            testCases: [
              {
                description: 'Promedio ajustado',
                expected: '15.38',
              },
            ],
            hints: ['Primero calcula mean_x', 'Luego ajusta cada observacion'],
          },
        ],
      },
      {
        slug: 'ab-testing-significancia-decision',
        title: 'Significancia y decision de negocio',
        order: 4,
        estimatedMinutes: 30,
        content: `
# Significancia y decision

Cierre del curso: combinar evidencia estadistica con guardrails de negocio para decidir lanzamiento.
        `,
        exercises: [
          {
            id: 'pyfa-l4-e1',
            order: 1,
            title: 'Z-test de dos proporciones',
            instructions:
              'Calcula z-score y decision para control/variante. Imprime 2 lineas: "Z: <valor>" y "Decision: <significativo|no significativo>".',
            starterCode:
              'from math import sqrt\ncontrol_conv = 480\ncontrol_n = 4000\nvariant_conv = 560\nvariant_n = 4000\n# alpha=0.05 bilateral, umbral z=1.96\n# Imprime z con 2 decimales y decision\n',
            solutionCode:
              'from math import sqrt\ncontrol_conv = 480\ncontrol_n = 4000\nvariant_conv = 560\nvariant_n = 4000\np1 = control_conv / control_n\np2 = variant_conv / variant_n\npooled = (control_conv + variant_conv) / (control_n + variant_n)\nse = sqrt(pooled * (1 - pooled) * (1 / control_n + 1 / variant_n))\nz = (p2 - p1) / se\ndecision = "significativo" if abs(z) >= 1.96 else "no significativo"\nprint(f"Z: {round(z, 2)}")\nprint(f"Decision: {decision}")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Z y decision esperados',
                expected: 'Z: 2.66\nDecision: significativo',
              },
            ],
            hints: ['Usa proporcion combinada para el error estandar'],
          },
          {
            id: 'pyfa-l4-e2',
            order: 2,
            title: 'Guardrail de churn',
            instructions:
              'Si el aumento de churn supera 1.0 punto porcentual, imprime "rechazar lanzamiento"; si no, "aprobar lanzamiento".',
            starterCode:
              'baseline_churn = 3.2\nexperiment_churn = 4.5\n# Imprime la decision final\n',
            solutionCode:
              'baseline_churn = 3.2\nexperiment_churn = 4.5\naumento = experiment_churn - baseline_churn\nif aumento > 1.0:\n    print("rechazar lanzamiento")\nelse:\n    print("aprobar lanzamiento")',
            validationType: 'exact',
            testCases: [
              {
                description: 'Decision guardrail',
                expected: 'rechazar lanzamiento',
              },
            ],
            hints: ['Calcula aumento = experiment_churn - baseline_churn'],
          },
        ],
      },
    ],
  },
];

const LANGUAGE_FOUNDATION_COURSES: SeedCourse[] = [
  {
    slug: "clojure-desde-cero",
    title: "Clojure desde Cero",
    description: "Curso base de Clojure con enfoque funcional y REPL en navegador.",
    order: 6,
    language: "clojure",
    runtimeType: "browser_clojure",
    lessons: [
      {
        slug: "clojure-intro-repl",
        title: "Introducción al REPL de Clojure",
        order: 1,
        estimatedMinutes: 18,
        content: `
# Clojure desde Cero

Este curso está listo para que cargues contenido y ejercicios.
Sugerencia: inicia con expresiones, colecciones y funciones puras.
        `,
        exercises: [
          {
            id: "clj-l1-e1",
            order: 1,
            title: "Primer output en Clojure",
            instructions:
              "Ejecuta el código y asegúrate de imprimir exactamente `Hola Clojure`.",
            starterCode: '(println "Hola Clojure")\n',
            solutionCode: '(println "Hola Clojure")\n',
            validationType: "exact",
            testCases: [
              {
                description: "Salida esperada",
                expected: "Hola Clojure",
              },
            ],
            hints: [
              "Usa println para imprimir en consola",
              "Respeta mayúsculas y espacios",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "javascript-desde-cero",
    title: "JavaScript desde Cero",
    description: "Fundamentos de JavaScript moderno con práctica interactiva.",
    order: 7,
    language: "javascript",
    runtimeType: "browser_javascript",
    lessons: [
      {
        slug: "javascript-intro",
        title: "Introducción a JavaScript",
        order: 1,
        estimatedMinutes: 15,
        content: `
# JavaScript desde Cero

Curso base creado. Puedes agregar retos de variables, funciones y objetos.
        `,
        exercises: [
          {
            id: "js-l1-e1",
            order: 1,
            title: "Primer output en JavaScript",
            instructions:
              "Ejecuta el código y muestra exactamente `Hola JavaScript` con `console.log`.",
            starterCode: 'console.log("Hola JavaScript");\n',
            solutionCode: 'console.log("Hola JavaScript");\n',
            validationType: "exact",
            testCases: [
              {
                description: "Salida esperada",
                expected: "Hola JavaScript",
              },
            ],
            hints: [
              "Usa console.log(...)",
              "Evita texto adicional en la salida",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "typescript-desde-cero",
    title: "TypeScript desde Cero",
    description: "TypeScript con tipado estático para apps frontend/backend.",
    order: 8,
    language: "typescript",
    runtimeType: "browser_typescript",
    lessons: [
      {
        slug: "typescript-intro",
        title: "Introducción a TypeScript",
        order: 1,
        estimatedMinutes: 15,
        content: `
# TypeScript desde Cero

Curso base creado. Recomendado: tipos primitivos, funciones y interfaces.
        `,
        exercises: [
          {
            id: "ts-l1-e1",
            order: 1,
            title: "Primer output en TypeScript",
            instructions:
              "Usa una variable tipada y muestra `Hola TypeScript` en consola.",
            starterCode:
              'const language: string = "TypeScript";\nconsole.log(`Hola ${language}`);\n',
            solutionCode:
              'const language: string = "TypeScript";\nconsole.log(`Hola ${language}`);\n',
            validationType: "exact",
            testCases: [
              {
                description: "Salida esperada",
                expected: "Hola TypeScript",
              },
            ],
            hints: [
              "Declara la variable con tipo string",
              "Puedes usar template literals",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-desde-cero",
    title: "SQL desde Cero",
    description: "Consultas SQL prácticas para análisis y producto.",
    order: 9,
    language: "sql",
    runtimeType: "browser_sql",
    lessons: [
      {
        slug: "sql-intro-select",
        title: "Introducción a SELECT",
        order: 1,
        estimatedMinutes: 15,
        content: `
# SQL desde Cero

Curso base creado. Recomendado: SELECT, WHERE, ORDER BY y agregaciones.
        `,
        exercises: [
          {
            id: "sql-l1-e1",
            order: 1,
            title: "Primer SELECT",
            instructions:
              "Ejecuta un SELECT que retorne el texto `Hola SQL`.",
            starterCode: "SELECT 'Hola SQL' AS message;\n",
            solutionCode: "SELECT 'Hola SQL' AS message;\n",
            validationType: "contains",
            testCases: [
              {
                description: "La salida incluye el mensaje esperado",
                expected: "Hola SQL",
              },
            ],
            hints: [
              "Usa un SELECT literal",
              "Puedes asignar alias con AS message",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "go-desde-cero",
    title: "Go desde Cero",
    description: "Fundamentos de Go para backend y herramientas CLI.",
    order: 10,
    language: "go",
    runtimeType: "browser_go",
    lessons: [
      {
        slug: "go-intro-main",
        title: "Introducción a Go",
        order: 1,
        estimatedMinutes: 15,
        content: `
# Go desde Cero

Curso base creado. Agrega ejercicios de funciones, slices y structs.
        `,
        exercises: [
          {
            id: "go-l1-e1",
            order: 1,
            title: "Primer output en Go",
            instructions:
              "Imprime `Hola Go` dentro de `main` usando `fmt.Println`.",
            starterCode:
              'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hola Go")\n}\n',
            solutionCode:
              'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hola Go")\n}\n',
            validationType: "exact",
            testCases: [
              {
                description: "Salida esperada",
                expected: "Hola Go",
              },
            ],
            hints: [
              "Importa el paquete fmt",
              "Imprime dentro de func main()",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "rust-desde-cero",
    title: "Rust desde Cero",
    description: "Rust para programación segura y de alto rendimiento.",
    order: 11,
    language: "rust",
    runtimeType: "browser_rust",
    lessons: [
      {
        slug: "rust-intro-main",
        title: "Introducción a Rust",
        order: 1,
        estimatedMinutes: 15,
        content: `
# Rust desde Cero

Curso base creado. Recomendado: ownership, borrowing y pattern matching.
        `,
        exercises: [
          {
            id: "rust-l1-e1",
            order: 1,
            title: "Primer output en Rust",
            instructions:
              "Imprime exactamente `Hola Rust` usando `println!`.",
            starterCode: 'fn main() {\n    println!("Hola Rust");\n}\n',
            solutionCode: 'fn main() {\n    println!("Hola Rust");\n}\n',
            validationType: "exact",
            testCases: [
              {
                description: "Salida esperada",
                expected: "Hola Rust",
              },
            ],
            hints: [
              "Recuerda el macro println!",
              "Incluye punto y coma al final de la línea",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "bash-desde-cero",
    title: "Bash desde Cero",
    description: "Automatización y scripting en Bash desde fundamentos.",
    order: 12,
    language: "bash",
    runtimeType: "browser_bash",
    lessons: [
      {
        slug: "bash-intro-cli",
        title: "Introducción a Bash",
        order: 1,
        estimatedMinutes: 15,
        content: `
# Bash desde Cero

Curso base creado. Recomendado: variables, pipes, redirecciones y scripts.
        `,
        exercises: [
          {
            id: "bash-l1-e1",
            order: 1,
            title: "Primer output en Bash",
            instructions:
              "Imprime exactamente `Hola Bash` usando `echo`.",
            starterCode: 'echo "Hola Bash"\n',
            solutionCode: 'echo "Hola Bash"\n',
            validationType: "exact",
            testCases: [
              {
                description: "Salida esperada",
                expected: "Hola Bash",
              },
            ],
            hints: [
              "Usa echo para mostrar texto",
              "No agregues comandos extra",
            ],
          },
        ],
      },
    ],
  },
];

async function upsertCourse(courseData: SeedCourse) {
  const course = await prisma.course.upsert({
    where: { slug: courseData.slug },
    update: {
      title: courseData.title,
      description: courseData.description,
      language: courseData.language ?? "python",
      runtimeType: courseData.runtimeType ?? "browser_pyodide",
      order: courseData.order,
      isPublished: true,
    },
    create: {
      slug: courseData.slug,
      title: courseData.title,
      description: courseData.description,
      language: courseData.language ?? "python",
      runtimeType: courseData.runtimeType ?? "browser_pyodide",
      order: courseData.order,
      isPublished: true,
    },
  });

  for (const lessonData of courseData.lessons) {
    const lesson = await prisma.lesson.upsert({
      where: { slug: lessonData.slug },
      update: {
        courseId: course.id,
        title: lessonData.title,
        content: lessonData.content,
        order: lessonData.order,
        estimatedMinutes: lessonData.estimatedMinutes,
        isPublished: true,
      },
      create: {
        courseId: course.id,
        slug: lessonData.slug,
        title: lessonData.title,
        content: lessonData.content,
        order: lessonData.order,
        estimatedMinutes: lessonData.estimatedMinutes,
        isPublished: true,
      },
    });

    for (const exerciseData of lessonData.exercises) {
      await prisma.exercise.upsert({
        where: { id: exerciseData.id },
        update: {
          lessonId: lesson.id,
          order: exerciseData.order,
          title: exerciseData.title,
          instructions: exerciseData.instructions,
          starterCode: exerciseData.starterCode,
          solutionCode: exerciseData.solutionCode,
          testCases: exerciseData.testCases as unknown as Prisma.InputJsonValue,
          validationType: exerciseData.validationType,
          hints: exerciseData.hints,
          rubric: (exerciseData.rubric ?? DEFAULT_EXERCISE_RUBRIC) as unknown as Prisma.InputJsonValue,
          isPublished: true,
        },
        create: {
          id: exerciseData.id,
          lessonId: lesson.id,
          order: exerciseData.order,
          title: exerciseData.title,
          instructions: exerciseData.instructions,
          starterCode: exerciseData.starterCode,
          solutionCode: exerciseData.solutionCode,
          testCases: exerciseData.testCases as unknown as Prisma.InputJsonValue,
          validationType: exerciseData.validationType,
          hints: exerciseData.hints,
          rubric: (exerciseData.rubric ?? DEFAULT_EXERCISE_RUBRIC) as unknown as Prisma.InputJsonValue,
          isPublished: true,
        },
      });
    }
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // Admin users
  const adminUsersConfig = [
    {
      email: 'emrs94@gmail.com',
      password: 'Charalo4!',
      name: 'Eduardo Rico',
    },
    {
      email: 'admin@example.com',
      password: 'Charalo123',
      name: 'Admin',
    },
  ] as const;

  const seededAdmins: { id: string; email: string }[] = [];

  for (const adminConfig of adminUsersConfig) {
    const hashedPassword = await bcrypt.hash(adminConfig.password, 10);
    const adminUser = await prisma.user.upsert({
      where: { email: adminConfig.email },
      update: {
        name: adminConfig.name,
        role: 'admin',
        passwordHash: hashedPassword,
      },
      create: {
        email: adminConfig.email,
        name: adminConfig.name,
        role: 'admin',
        passwordHash: hashedPassword,
      },
    });

    seededAdmins.push(adminUser);
    console.log(`✅ Admin user ready: ${adminUser.email}`);
  }

  const primaryAdmin = seededAdmins[0];

  // Hide old legacy course if present
  await prisma.course.updateMany({
    where: { slug: 'python-desde-cero' },
    data: { isPublished: false },
  });

  // Upsert learning paths
  const allCourses = [...PYTHON_COURSES, ...LANGUAGE_FOUNDATION_COURSES];
  for (const courseData of allCourses) {
    await upsertCourse(courseData);
    console.log(`✅ Curso listo: ${courseData.title}`);
  }

  // Seed an initial announcement
  const existingAnnouncement = await prisma.announcement.findFirst({
    where: { title: 'Anuncio inicial' },
    select: { id: true },
  });

  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        title: 'Anuncio inicial',
        message:
          'Ya tienes disponibles rutas de Python Basico, Intermedio, Analisis de Datos, Analisis de Negocio y Forecasting/A-B Testing.',
        type: 'info',
        priority: 'normal',
        displayType: 'banner',
        audience: 'all',
        specificUserIds: [],
        isActive: true,
        dismissible: true,
        createdBy: primaryAdmin.id,
      },
    });
    console.log('✅ Anuncio inicial creado');
  }

  console.log('✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
