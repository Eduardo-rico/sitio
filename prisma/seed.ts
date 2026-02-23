/**
 * Seed principal:
 * - Usuario admin
 * - 2 cursos de Python (basico e intermedio)
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
  lessons: SeedLesson[];
}

const PYTHON_COURSES: SeedCourse[] = [
  {
    slug: 'python-basico',
    title: 'Python Basico: fundamentos y practica',
    description:
      'Empieza desde cero con Python y resuelve retos interactivos estilo DataCamp con consola y tests.',
    order: 1,
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
    title: 'Python Intermedio: retos tipo DataCamp',
    description:
      'Sube de nivel con comprehensions, manejo de errores, parsing y mini proyectos con tests.',
    order: 2,
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

Haras un cierre tipo DataCamp: combinar logica, estructuras y salida limpia.
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
];

async function upsertCourse(courseData: SeedCourse) {
  const course = await prisma.course.upsert({
    where: { slug: courseData.slug },
    update: {
      title: courseData.title,
      description: courseData.description,
      order: courseData.order,
      isPublished: true,
    },
    create: {
      slug: courseData.slug,
      title: courseData.title,
      description: courseData.description,
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
          isPublished: true,
        },
      });
    }
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'Charalo123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin',
      role: 'admin',
      passwordHash: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: 'Admin',
      role: 'admin',
      passwordHash: hashedPassword,
    },
  });

  console.log(`✅ Admin user ready: ${adminUser.email}`);

  // Hide old legacy course if present
  await prisma.course.updateMany({
    where: { slug: 'python-desde-cero' },
    data: { isPublished: false },
  });

  // Upsert new Python paths
  for (const courseData of PYTHON_COURSES) {
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
          'Ya tienes disponibles rutas de Python Basico e Intermedio con retos interactivos y tests.',
        type: 'info',
        priority: 'normal',
        displayType: 'banner',
        audience: 'all',
        specificUserIds: [],
        isActive: true,
        dismissible: true,
        createdBy: adminUser.id,
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
