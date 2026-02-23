/**
 * Seed script para poblar la base de datos con contenido inicial
 * Ejecutar con: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
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

  console.log(`✅ Admin user created: ${adminUser.email}`);

  // Crear curso de Python
  const pythonCourse = await prisma.course.upsert({
    where: { slug: 'python-desde-cero' },
    update: {},
    create: {
      title: 'Python desde Cero',
      slug: 'python-desde-cero',
      description: 'Aprende Python desde los fundamentos hasta conceptos intermedios. Curso práctico con ejercicios interactivos.',
      order: 1,
      isPublished: true,
    },
  });

  console.log(`✅ Curso creado: ${pythonCourse.title}`);

  // Lecciones del curso
  const lessons = [
    {
      title: 'Tu primer programa en Python',
      slug: 'primer-programa',
      order: 1,
      estimatedMinutes: 10,
      content: `
# Tu primer programa en Python

¡Bienvenido a Python! En esta primera lección vas a escribir tu primer programa.

## ¿Qué es Python?

Python es un lenguaje de programación:
- **Fácil de aprender**: Sintaxis clara y legible
- **Versátil**: Desde web hasta inteligencia artificial
- **Popular**: El lenguaje más usado en data science

## La función print()

La función \`print()\` muestra texto en la pantalla:

\`\`\`python
print("¡Hola, mundo!")
\`\`\`

## Tu primer ejercicio

En el editor de la derecha, escribe un programa que imprima tu nombre.
      `,
      exercises: [
        {
          title: 'Saluda al mundo',
          order: 1,
          instructions: 'Escribe un programa que imprima "Hola, mundo!"',
          starterCode: '# Escribe tu código aquí\n',
          solutionCode: 'print("Hola, mundo!")',
          validationType: 'exact',
          testCases: { expected: 'Hola, mundo!' },
          hints: ['Usa la función print()', 'No olvides las comillas'],
          isPublished: true,
        },
      ],
    },
    {
      title: 'Variables y tipos de datos',
      slug: 'variables-tipos',
      order: 2,
      estimatedMinutes: 15,
      content: `
# Variables y tipos de datos

Las variables son contenedores para almacenar datos.

## Crear variables

\`\`\`python
nombre = "Ana"
edad = 25
altura = 1.65
\`\`\`

## Tipos de datos básicos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| \`str\` | Texto (string) | \`"Hola"\` |
| \`int\` | Números enteros | \`42\` |
| \`float\` | Decimales | \`3.14\` |
| \`bool\` | Booleanos | \`True\`, \`False\` |

## La función type()

Puedes verificar el tipo de una variable:

\`\`\`python
type("Hola")  # <class 'str'>
type(42)      # <class 'int'>
\`\`\`
      `,
      exercises: [
        {
          title: 'Calcula el área',
          order: 1,
          instructions: 'Crea dos variables: base con valor 10 y altura con valor 5. Calcula el área y muestra el resultado.',
          starterCode: '# Define las variables\nbase = \naltura = \n\n# Calcula el área\narea = \n\n# Muestra el resultado\n',
          solutionCode: 'base = 10\naltura = 5\narea = base * altura\nprint(area)',
          validationType: 'contains',
          testCases: { expected: '50' },
          hints: ['Usa el operador * para multiplicar', 'El resultado debe ser 50'],
          isPublished: true,
        },
      ],
    },
    {
      title: 'Operadores aritméticos',
      slug: 'operadores-aritmeticos',
      order: 3,
      estimatedMinutes: 12,
      content: `
# Operadores aritméticos

Python puede realizar operaciones matemáticas.

## Operadores básicos

| Operador | Operación | Ejemplo | Resultado |
|----------|-----------|---------|-----------|
| \`+\` | Suma | \`5 + 3\` | \`8\` |
| \`-\` | Resta | \`5 - 3\` | \`2\` |
| \`*\` | Multiplicación | \`5 * 3\` | \`15\` |
| \`/\` | División | \`5 / 2\` | \`2.5\` |
| \`//\` | División entera | \`5 // 2\` | \`2\` |
| \`%\` | Módulo (resto) | \`5 % 2\` | \`1\` |
| \`**\` | Potencia | \`2 ** 3\` | \`8\` |

## Orden de operaciones

Python sigue el orden PEMDAS:
1. Paréntesis
2. Exponentes
3. Multiplicación/División
4. Suma/Resta
      `,
      exercises: [
        {
          title: 'Calculadora de propina',
          order: 1,
          instructions: 'Calcula el 15% de propina de una cuenta de $100. Muestra el resultado.',
          starterCode: 'cuenta = 100\nporcentaje = 0.15\n\n# Calcula la propina\n\n\n# Muestra el resultado\n',
          solutionCode: 'cuenta = 100\nporcentaje = 0.15\npropina = cuenta * porcentaje\nprint(propina)',
          validationType: 'contains',
          testCases: { expected: '15.0' },
          hints: ['Multiplica cuenta por porcentaje', 'El resultado es 15.0'],
          isPublished: true,
        },
      ],
    },
    {
      title: 'Condicionales: if, elif, else',
      slug: 'condicionales',
      order: 4,
      estimatedMinutes: 20,
      content: `
# Condicionales

Los condicionales permiten que tu programa tome decisiones.

## La estructura if

\`\`\`python
edad = 18

if edad >= 18:
    print("Eres mayor de edad")
\`\`\`

> **Importante**: Python usa indentación (4 espacios) para definir bloques de código.

## if-else

\`\`\`python
if edad >= 18:
    print("Mayor de edad")
else:
    print("Menor de edad")
\`\`\`

## if-elif-else

\`\`\`python
nota = 85

if nota >= 90:
    print("A")
elif nota >= 80:
    print("B")
elif nota >= 70:
    print("C")
else:
    print("Reprobado")
\`\`\`

## Operadores de comparación

| Operador | Significado |
|----------|-------------|
| \`==\` | Igual a |
| \`!=\` | Diferente de |
| \`<\` | Menor que |
| \`>\` | Mayor que |
| \`<=\` | Menor o igual |
| \`>=\` | Mayor o igual |
      `,
      exercises: [
        {
          title: 'Clasificador de números',
          order: 1,
          instructions: 'Dado el número 15, imprime "positivo" si es mayor que 0, "negativo" si es menor, o "cero" si es igual a 0.',
          starterCode: 'numero = 15\n\n# Escribe tu condicional aquí\n',
          solutionCode: 'numero = 15\n\nif numero > 0:\n    print("positivo")\nelif numero < 0:\n    print("negativo")\nelse:\n    print("cero")',
          validationType: 'contains',
          testCases: { expected: 'positivo' },
          hints: ['Usa if-elif-else', 'Recuerda los dos puntos (:) y la indentación'],
          isPublished: true,
        },
      ],
    },
    {
      title: 'Bucles: for',
      slug: 'bucles-for',
      order: 5,
      estimatedMinutes: 18,
      content: `
# Bucles for

Los bucles permiten repetir código múltiples veces.

## Iterar sobre una lista

\`\`\`python
frutas = ["manzana", "plátano", "naranja"]

for fruta in frutas:
    print(fruta)
\`\`\`

## La función range()

\`\`\`python
# De 0 a 4
for i in range(5):
    print(i)

# De 1 a 5
for i in range(1, 6):
    print(i)

# De 0 a 10, de 2 en 2
for i in range(0, 11, 2):
    print(i)
\`\`\`

## Sumar números

\`\`\`python
total = 0

for num in range(1, 6):
    total = total + num

print(total)  # 15
\`\`\`
      `,
      exercises: [
        {
          title: 'Suma del 1 al 10',
          order: 1,
          instructions: 'Calcula la suma de los números del 1 al 10 usando un bucle for.',
          starterCode: 'total = 0\n\n# Usa un bucle for para sumar\n\n\nprint(total)',
          solutionCode: 'total = 0\n\nfor i in range(1, 11):\n    total = total + i\n\nprint(total)',
          validationType: 'contains',
          testCases: { expected: '55' },
          hints: ['Usa range(1, 11)', 'Acumula la suma en total'],
          isPublished: true,
        },
      ],
    },
  ];

  // Crear lecciones y ejercicios
  for (const lessonData of lessons) {
    const { exercises, ...lessonInfo } = lessonData;
    
    const lesson = await prisma.lesson.upsert({
      where: { slug: lessonInfo.slug },
      update: {},
      create: {
        ...lessonInfo,
        courseId: pythonCourse.id,
        isPublished: true,
      },
    });

    console.log(`✅ Lección creada: ${lesson.title}`);

    // Crear ejercicios
    for (const exerciseData of exercises) {
      await prisma.exercise.upsert({
        where: { 
          id: `${lesson.id}-${exerciseData.order}` 
        },
        update: {},
        create: {
          ...exerciseData,
          lessonId: lesson.id,
        },
      });

      console.log(`  ✅ Ejercicio: ${exerciseData.title}`);
    }
  }

  // Seed at least one active announcement for admin/e2e flows
  const existingAnnouncement = await prisma.announcement.findFirst({
    where: { title: 'Anuncio inicial' },
    select: { id: true },
  });

  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        title: 'Anuncio inicial',
        message: 'Este es un anuncio de prueba inicial para validar el panel de administración.',
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

  console.log('\n✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
