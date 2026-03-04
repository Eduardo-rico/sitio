/**
 * Seed script para crear cursos de Python interactivos
 * Curso Básico y Curso Intermedio con ejercicios interactivos guiados
 */

import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedExercise = {
  title: string;
  instructions: string;
  starterCode: string;
  solutionCode: string;
  validationType: string;
  testCases: Prisma.InputJsonValue;
  hints: string[];
  order: number;
};

type SeedLesson = {
  slug: string;
  title: string;
  estimatedMinutes: number;
  content: string;
  exercises: SeedExercise[];
  order: number;
};

type SeedCourse = {
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  language?: string;
  runtimeType?: string;
  lessons: SeedLesson[];
};

// Curso Python Básico
const pythonBasico = {
  slug: 'python-basico',
  title: 'Python desde Cero',
  description: 'Aprende Python desde lo más básico. Variables, tipos de datos, estructuras de control, funciones y más. Con ejercicios interactivos y práctica en tiempo real.',
  order: 1,
  isPublished: true,
  language: 'python',
  runtimeType: 'browser_pyodide',
  lessons: [
    {
      slug: 'introduccion-python',
      title: 'Introducción a Python',
      estimatedMinutes: 15,
      content: `# ¡Bienvenido a Python!

Python es uno de los lenguajes de programación más populares y versátiles del mundo. Es conocido por su sintaxis clara y legible, lo que lo hace perfecto para principiantes.

## ¿Por qué aprender Python?

- **Fácil de aprender**: Sintaxis simple y legible
- **Versátil**: Desde web hasta inteligencia artificial
- **Comunidad grande**: Miles de librerías y recursos
- **Demanda laboral**: Altamente solicitado en la industria

## Tu primer programa

En Python, el clásico "Hola Mundo" es muy simple:

\`\`\`python
print("¡Hola, Mundo!")
\`\`\`

## El interprete de Python

Python se ejecuta línea por línea, lo que permite probar código rápidamente. En este curso, tendrás un editor interactivo donde podrás escribir y ejecutar código en tiempo real.

## Ejercicio

Escribe tu primer programa que imprima tu nombre.`,
      exercises: [
        {
          title: '¡Hola, Mundo!',
          instructions: 'Escribe un programa que imprima "¡Hola, Mundo!" usando la función print().',
          starterCode: '# Escribe tu código aquí\n',
          solutionCode: 'print("¡Hola, Mundo!")',
          validationType: 'exact',
          testCases: [{ expected: '¡Hola, Mundo!' }],
          hints: ['Usa la función print()', 'No olvides las comillas'],
          order: 1,
        },
        {
          title: 'Saludo personalizado',
          instructions: 'Escribe un programa que imprima "Me llamo [tu nombre]". Por ejemplo: "Me llamo Ana"',
          starterCode: '# Escribe tu saludo aquí\n',
          solutionCode: 'print("Me llamo Python")',
          validationType: 'contains',
          testCases: [{ expected: 'Me llamo' }],
          hints: ['Usa print() con tu nombre', 'El texto debe contener "Me llamo"'],
          order: 2,
        },
      ],
      order: 1,
    },
    {
      slug: 'variables-tipos-datos',
      title: 'Variables y Tipos de Datos',
      estimatedMinutes: 20,
      content: `# Variables y Tipos de Datos

Las variables son contenedores para almacenar datos. En Python, no necesitas declarar el tipo de variable, Python lo infiere automáticamente.

## Creando variables

\`\`\`python
nombre = "Ana"
edad = 25
altura = 1.65
es_estudiante = True
\`\`\`

## Tipos de datos principales

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| str | Texto (string) | "Hola" |
| int | Entero | 42 |
| float | Decimal | 3.14 |
| bool | Booleano | True/False |

## La función type()

Puedes verificar el tipo de una variable:

\`\`\`python
type(nombre)  # <class 'str'>
type(edad)    # <class 'int'>
\`\`\`

## Reglas para nombres de variables

- Deben comenzar con letra o guión bajo
- No pueden comenzar con número
- Solo letras, números y guiones bajos
- Son case-sensitive (edad ≠ Edad)

## Ejercicios

Practica creando diferentes tipos de variables.`,
      exercises: [
        {
          title: 'Variables numéricas',
          instructions: 'Crea una variable llamada "edad" con el valor 25 y otra llamada "pi" con el valor 3.14159. Luego imprime ambas.',
          starterCode: '# Crea las variables aquí\n',
          solutionCode: 'edad = 25\npi = 3.14159\nprint(edad)\nprint(pi)',
          validationType: 'contains',
          testCases: [
            { description: 'Imprime el valor de edad', expected: '25' },
            { description: 'Imprime el valor de pi', expected: '3.14159' },
          ],
          hints: ['Usa = para asignar valores', 'Usa print() para mostrar'],
          order: 1,
        },
        {
          title: 'Variables de texto',
          instructions: 'Crea una variable "ciudad" con tu ciudad favorita y muéstrala con un mensaje: "Mi ciudad favorita es: [ciudad]"',
          starterCode: '# Crea la variable ciudad\n# Imprime el mensaje\n',
          solutionCode: 'ciudad = "Madrid"\nprint("Mi ciudad favorita es: " + ciudad)',
          validationType: 'contains',
          testCases: [{ description: 'Muestra mensaje con ciudad', expected: 'Mi ciudad favorita es:' }],
          hints: ['Concatena strings con +', 'Las variables string van entre comillas'],
          order: 2,
        },
      ],
      order: 2,
    },
    {
      slug: 'operadores-basicos',
      title: 'Operadores Básicos',
      estimatedMinutes: 20,
      content: `# Operadores en Python

Python soporta operadores matemáticos y de comparación para trabajar con datos.

## Operadores aritméticos

\`\`\`python
a = 10
b = 3

suma = a + b        # 13
resta = a - b       # 7
multiplicacion = a * b  # 30
division = a / b    # 3.333...
division_entera = a // b  # 3
modulo = a % b      # 1 (resto)
potencia = a ** b   # 1000 (10³)
\`\`\`

## Operadores de comparación

\`\`\`python
a == b  # Igual a (False)
a != b  # Diferente de (True)
a > b   # Mayor que (True)
a < b   # Menor que (False)
a >= b  # Mayor o igual (True)
a <= b  # Menor o igual (False)
\`\`\`

## Operadores de asignación

\`\`\`python
x = 10
x += 5   # x = x + 5 → 15
x -= 3   # x = x - 3 → 12
x *= 2   # x = x * 2 → 24
\`\`\`

## Ejercicios

Practica operaciones matemáticas básicas.`,
      exercises: [
        {
          title: 'Calculadora básica',
          instructions: 'Crea dos variables a=15 y b=4. Calcula y muestra: suma, resta, multiplicación, división, división entera y módulo.',
          starterCode: 'a = 15\nb = 4\n# Calcula y muestra los resultados\n',
          solutionCode: 'a = 15\nb = 4\nprint(a + b)\nprint(a - b)\nprint(a * b)\nprint(a / b)\nprint(a // b)\nprint(a % b)',
          validationType: 'contains',
          testCases: [
            { expected: '19' },
            { expected: '11' },
            { expected: '60' },
          ],
          hints: ['Usa los operadores + - * / // %', 'Imprime cada resultado'],
          order: 1,
        },
        {
          title: 'Área de un círculo',
          instructions: 'Calcula el área de un círculo con radio = 5. Fórmula: área = π × r². Usa pi = 3.14159',
          starterCode: 'radio = 5\npi = 3.14159\n# Calcula el área\n',
          solutionCode: 'radio = 5\npi = 3.14159\narea = pi * radio ** 2\nprint(area)',
          validationType: 'contains',
          testCases: [{ description: 'Muestra el área calculada', expected: '78.53975' }],
          hints: ['Usa ** para la potencia', 'Fórmula: pi * radio al cuadrado'],
          order: 2,
        },
      ],
      order: 3,
    },
    {
      slug: 'strings-formateo',
      title: 'Strings y Formateo',
      estimatedMinutes: 25,
      content: `# Trabajando con Strings

Los strings (cadenas de texto) son fundamentales en Python. Permiten almacenar y manipular texto.

## Creando strings

\`\`\`python
texto1 = 'Comillas simples'
texto2 = "Comillas dobles"
texto3 = '''Texto
multilinea'''  # Triple comilla
\`\`\`

## Métodos útiles de strings

\`\`\`python
texto = "  Python es Genial  "

texto.upper()        # "  PYTHON ES GENIAL  "
texto.lower()        # "  python es genial  "
texto.strip()        # "Python es Genial" (sin espacios)
texto.replace("Genial", "Increíble")
len(texto)           # Longitud del string
\`\`\`

## Indexación y slicing

\`\`\`python
texto = "Python"
texto[0]     # 'P' (primer carácter)
texto[-1]    # 'n' (último carácter)
texto[0:3]   # 'Pyt' (índices 0, 1, 2)
texto[2:]    # 'thon' (desde índice 2)
\`\`\`

## Formateo de strings

### Método f-string (recomendado)
\`\`\`python
nombre = "Ana"
edad = 25
print(f"Me llamo {nombre} y tengo {edad} años")
\`\`\`

### Método format()
\`\`\`python
print("Me llamo {} y tengo {} años".format(nombre, edad))
\`\`\`

## Ejercicios

Practica manipulación y formateo de strings.`,
      exercises: [
        {
          title: 'Manipulación de texto',
          instructions: 'Dado el texto "  python programming  ", conviértelo a mayúsculas, quita los espacios al inicio y final, y muestra la longitud.',
          starterCode: 'texto = "  python programming  "\n# Tu código aquí\n',
          solutionCode: 'texto = "  python programming  "\nprint(texto.upper())\nprint(texto.strip())\nprint(len(texto))',
          validationType: 'contains',
          testCases: [
            { expected: 'PYTHON PROGRAMMING' },
            { expected: 'python programming' },
          ],
          hints: ['Usa .upper() para mayúsculas', 'Usa .strip() para quitar espacios'],
          order: 1,
        },
        {
          title: 'F-strings',
          instructions: 'Crea variables nombre="Carlos" y edad=30. Usa un f-string para imprimir: "Hola, soy Carlos y tengo 30 años"',
          starterCode: 'nombre = "Carlos"\nedad = 30\n# Usa f-string aquí\n',
          solutionCode: 'nombre = "Carlos"\nedad = 30\nprint(f"Hola, soy {nombre} y tengo {edad} años")',
          validationType: 'exact',
          testCases: [{ expected: 'Hola, soy Carlos y tengo 30 años' }],
          hints: ['Usa f antes de las comillas', 'Las variables van entre { }'],
          order: 2,
        },
        {
          title: 'Slicing de strings',
          instructions: 'Dado palabra="Programación", extrae: los primeros 4 caracteres, los últimos 3, y del índice 4 al 8.',
          starterCode: 'palabra = "Programación"\n# Extrae las partes solicitadas\n',
          solutionCode: 'palabra = "Programación"\nprint(palabra[:4])\nprint(palabra[-3:])\nprint(palabra[4:8])',
          validationType: 'contains',
          testCases: [
            { expected: 'Prog' },
            { expected: 'ión' },
            { expected: 'rama' },
          ],
          hints: ['Usa [:4] para primeros 4', 'Usa [-3:] para últimos 3', 'Usa [4:8] para rango'],
          order: 3,
        },
      ],
      order: 4,
    },
    {
      slug: 'listas-basicas',
      title: 'Listas: El Contenedor Universal',
      estimatedMinutes: 25,
      content: `# Listas en Python

Las listas son colecciones ordenadas y modificables que permiten almacenar múltiples elementos.

## Creando listas

\`\`\`python
frutas = ["manzana", "plátano", "cereza"]
numeros = [1, 2, 3, 4, 5]
mixta = ["texto", 42, 3.14, True]  # Python permite mezclar tipos
\`\`\`

## Accediendo a elementos

\`\`\`python
frutas[0]      # "manzana" (primer elemento)
frutas[-1]     # "cereza" (último elemento)
frutas[1:3]    # ["plátano", "cereza"] (slice)
\`\`\`

## Métodos de listas

\`\`\`python
frutas.append("naranja")     # Agrega al final
frutas.insert(1, "uva")      # Inserta en posición
frutas.remove("plátano")     # Elimina por valor
frutas.pop()                 # Elimina y retorna último
frutas.sort()                # Ordena la lista
len(frutas)                  # Cantidad de elementos
\`\`\`

## List comprehensions

Forma concisa de crear listas:

\`\`\`python
cuadrados = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]
pares = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]
\`\`\`

## Ejercicios

Practica manipulación de listas.`,
      exercises: [
        {
          title: 'Creando y accediendo a listas',
          instructions: 'Crea una lista "colores" con: "rojo", "verde", "azul". Muestra el primer color, el último, y la longitud de la lista.',
          starterCode: '# Crea la lista de colores\n',
          solutionCode: 'colores = ["rojo", "verde", "azul"]\nprint(colores[0])\nprint(colores[-1])\nprint(len(colores))',
          validationType: 'contains',
          testCases: [
            { expected: 'rojo' },
            { expected: 'azul' },
            { expected: '3' },
          ],
          hints: ['Índice 0 es el primero', 'Índice -1 es el último'],
          order: 1,
        },
        {
          title: 'Modificando listas',
          instructions: 'Crea una lista vacía "numeros", agrega 10, 20, 30 con append(), inserta 15 en la posición 1, y muestra la lista.',
          starterCode: 'numeros = []\n# Agrega los elementos\n',
          solutionCode: 'numeros = []\nnumeros.append(10)\nnumeros.append(20)\nnumeros.append(30)\nnumeros.insert(1, 15)\nprint(numeros)',
          validationType: 'contains',
          testCases: [{ expected: '[10, 15, 20, 30]' }],
          hints: ['Usa .append() para agregar al final', 'Usa .insert(posición, valor)'],
          order: 2,
        },
        {
          title: 'Suma de lista',
          instructions: 'Crea una lista con los números [5, 10, 15, 20, 25]. Calcula y muestra la suma de todos los elementos.',
          starterCode: 'numeros = [5, 10, 15, 20, 25]\n# Calcula la suma\n',
          solutionCode: 'numeros = [5, 10, 15, 20, 25]\ntotal = sum(numeros)\nprint(total)',
          validationType: 'exact',
          testCases: [{ expected: '75' }],
          hints: ['Usa la función sum() para sumar todos los elementos'],
          order: 3,
        },
      ],
      order: 5,
    },
    {
      slug: 'condicionales-if',
      title: 'Estructuras Condicionales',
      estimatedMinutes: 25,
      content: `# Condicionales: if, elif, else

Las estructuras condicionales permiten ejecutar código basado en condiciones.

## La estructura if

\`\`\`python
edad = 18

if edad >= 18:
    print("Eres mayor de edad")
\`\`\`

> **Importante**: Python usa indentación (4 espacios) para definir bloques de código.

## if-else

\`\`\`python
edad = 16

if edad >= 18:
    print("Mayor de edad")
else:
    print("Menor de edad")
\`\`\`

## if-elif-else

\`\`\`python
nota = 85

if nota >= 90:
    print("A - Excelente")
elif nota >= 80:
    print("B - Muy bien")
elif nota >= 70:
    print("C - Bien")
else:
    print("Necesitas practicar más")
\`\`\`

## Operadores lógicos

\`\`\`python
edad = 25
tiene_licencia = True

if edad >= 18 and tiene_licencia:
    print("Puede conducir")

if edad < 13 or edad > 65:
    print("Descuento especial")
\`\`\`

## Condicionales anidados

\`\`\`python
clima = "soleado"
temperatura = 28

if clima == "soleado":
    if temperatura > 25:
        print("¡Día perfecto para la playa!")
    else:
        print("Lindo día, no hace tanto calor")
else:
    print("Mejor quedarse en casa")
\`\`\``,
      exercises: [
        {
          title: 'Mayor de edad',
          instructions: 'Crea una variable edad=20. Usa if-else para imprimir "Mayor de edad" si es >= 18, o "Menor de edad" si no.',
          starterCode: 'edad = 20\n# Escribe el condicional\n',
          solutionCode: 'edad = 20\nif edad >= 18:\n    print("Mayor de edad")\nelse:\n    print("Menor de edad")',
          validationType: 'exact',
          testCases: [{ expected: 'Mayor de edad' }],
          hints: ['Usa >= para comparar', 'No olvides los dos puntos :'],
          order: 1,
        },
        {
          title: 'Clasificación de notas',
          instructions: 'Dada nota=75, usa if-elif-else para imprimir: "A" si >=90, "B" si >=80, "C" si >=70, "D" si <70.',
          starterCode: 'nota = 75\n# Clasifica la nota\n',
          solutionCode: 'nota = 75\nif nota >= 90:\n    print("A")\nelif nota >= 80:\n    print("B")\nelif nota >= 70:\n    print("C")\nelse:\n    print("D")',
          validationType: 'exact',
          testCases: [{ expected: 'C' }],
          hints: ['Empieza con la condición más alta', 'elif significa "else if"'],
          order: 2,
        },
        {
          title: 'Número par o impar',
          instructions: 'Crea numero=42. Determina si es par o impar usando el operador módulo (%). Imprime "Par" o "Impar".',
          starterCode: 'numero = 42\n# Determina si es par o impar\n',
          solutionCode: 'numero = 42\nif numero % 2 == 0:\n    print("Par")\nelse:\n    print("Impar")',
          validationType: 'exact',
          testCases: [{ expected: 'Par' }],
          hints: ['Un número es par si numero % 2 == 0', 'El operador % da el resto'],
          order: 3,
        },
      ],
      order: 6,
    },
    {
      slug: 'bucles-for',
      title: 'Bucles: for',
      estimatedMinutes: 25,
      content: `# Bucles for

Los bucles permiten repetir código múltiples veces. El bucle \`for\` en Python es muy versátil.

## Iterando sobre listas

\`\`\`python
frutas = ["manzana", "plátano", "cereza"]

for fruta in frutas:
    print(f"Me gusta la {fruta}")
\`\`\`

## La función range()

\`\`\`python
# range(fin)
for i in range(5):  # 0, 1, 2, 3, 4
    print(i)

# range(inicio, fin)
for i in range(2, 6):  # 2, 3, 4, 5
    print(i)

# range(inicio, fin, paso)
for i in range(0, 10, 2):  # 0, 2, 4, 6, 8
    print(i)
\`\`\`

## Iterando sobre strings

\`\`\`python
texto = "Python"

for letra in texto:
    print(letra)
\`\`\`

## enumerate() - índice y valor

\`\`\`python
frutas = ["manzana", "plátano", "cereza"]

for indice, fruta in enumerate(frutas):
    print(f"{indice}: {fruta}")
# 0: manzana
# 1: plátano
# 2: cereza
\`\`\`

## zip() - iterar múltiples listas

\`\`\`python
nombres = ["Ana", "Luis", "María"]
edades = [25, 30, 28]

for nombre, edad in zip(nombres, edades):
    print(f"{nombre} tiene {edad} años")
\`\`\``,
      exercises: [
        {
          title: 'Contar del 1 al 10',
          instructions: 'Usa un bucle for con range() para imprimir los números del 1 al 10.',
          starterCode: '# Tu bucle for aquí\n',
          solutionCode: 'for i in range(1, 11):\n    print(i)',
          validationType: 'contains',
          testCases: [
            { expected: '1' },
            { expected: '10' },
          ],
          hints: ['range(1, 11) genera 1-10', 'El fin es exclusivo'],
          order: 1,
        },
        {
          title: 'Sumar lista con for',
          instructions: 'Dada lista=[4, 8, 15, 16, 23, 42], usa un bucle for para calcular la suma total.',
          starterCode: 'lista = [4, 8, 15, 16, 23, 42]\ntotal = 0\n# Calcula la suma con for\n',
          solutionCode: 'lista = [4, 8, 15, 16, 23, 42]\ntotal = 0\nfor num in lista:\n    total += num\nprint(total)',
          validationType: 'exact',
          testCases: [{ expected: '106' }],
          hints: ['Inicializa total en 0', 'Usa += para acumular'],
          order: 2,
        },
        {
          title: 'Tabla de multiplicar',
          instructions: 'Para numero=7, imprime su tabla de multiplicar del 1 al 10 (formato: "7 x 1 = 7").',
          starterCode: 'numero = 7\n# Genera la tabla de multiplicar\n',
          solutionCode: 'numero = 7\nfor i in range(1, 11):\n    print(f"{numero} x {i} = {numero * i}")',
          validationType: 'contains',
          testCases: [
            { expected: '7 x 1 = 7' },
            { expected: '7 x 10 = 70' },
          ],
          hints: ['Usa un f-string dentro del bucle', 'Multiplica numero * i'],
          order: 3,
        },
      ],
      order: 7,
    },
    {
      slug: 'bucles-while',
      title: 'Bucles: while',
      estimatedMinutes: 20,
      content: `# Bucles while

El bucle \`while\` repite código mientras una condición sea verdadera.

## Sintaxis básica

\`\`\`python
contador = 0

while contador < 5:
    print(contador)
    contador += 1  # ¡Importante! Evita bucles infinitos
\`\`\`

## Uso con input de usuario

\`\`\`python
# Este ejemplo es conceptual, no usar en el editor
# respuesta = ""
# while respuesta != "salir":
#     respuesta = input("Escribe algo (o 'salir' para terminar): ")
#     print(f"Escribiste: {respuesta}")
\`\`\`

## break y continue

\`\`\`python
# break - sale del bucle
for i in range(10):
    if i == 5:
        break  # Se detiene en 5
    print(i)

# continue - salta a la siguiente iteración
for i in range(10):
    if i % 2 == 0:
        continue  # Salta los pares
    print(i)  # Imprime solo impares
\`\`\`

## else en while

\`\`\`python
contador = 0

while contador < 3:
    print(contador)
    contador += 1
else:
    print("¡Bucle completado!")
\`\`\`

> El \`else\` se ejecuta cuando la condición del while deja de ser verdadera (no con break).`,
      exercises: [
        {
          title: 'Contador con while',
          instructions: 'Usa while para imprimir los números del 1 al 5.',
          starterCode: 'contador = 1\n# Tu bucle while aquí\n',
          solutionCode: 'contador = 1\nwhile contador <= 5:\n    print(contador)\n    contador += 1',
          validationType: 'contains',
          testCases: [
            { expected: '1' },
            { expected: '5' },
          ],
          hints: ['La condición es contador <= 5', 'No olvides incrementar'],
          order: 1,
        },
        {
          title: 'Suma hasta 100',
          instructions: 'Usa while para sumar números consecutivos (1+2+3+...) hasta que la suma sea >= 100. Muestra la suma final y cuántos números sumaste.',
          starterCode: 'suma = 0\nnumero = 1\ncontador = 0\n# Completa el while\n',
          solutionCode: 'suma = 0\nnumero = 1\ncontador = 0\nwhile suma < 100:\n    suma += numero\n    numero += 1\n    contador += 1\nprint(f"Suma: {suma}, Números: {contador}")',
          validationType: 'contains',
          testCases: [{ expected: 'Suma:' }],
          hints: ['Condición: suma < 100', 'Acumula en suma, incrementa numero'],
          order: 2,
        },
      ],
      order: 8,
    },
    {
      slug: 'funciones',
      title: 'Funciones: Definiendo tu Código',
      estimatedMinutes: 30,
      content: `# Funciones en Python

Las funciones son bloques de código reutilizables que realizan una tarea específica.

## Definiendo funciones

\`\`\`python
def saludar():
    print("¡Hola, bienvenido!")

# Llamar la función
saludar()
\`\`\`

## Parámetros y argumentos

\`\`\`python
def saludar_persona(nombre):
    print(f"¡Hola, {nombre}!")

saludar_persona("Ana")  # ¡Hola, Ana!
saludar_persona("Luis")  # ¡Hola, Luis!
\`\`\`

## Múltiples parámetros

\`\`\`python
def sumar(a, b):
    resultado = a + b
    print(f"{a} + {b} = {resultado}")

sumar(5, 3)  # 5 + 3 = 8
\`\`\`

## Retornando valores

\`\`\`python
def sumar(a, b):
    return a + b

resultado = sumar(10, 5)
print(resultado)  # 15
\`\`\`

## Parámetros por defecto

\`\`\`python
def potencia(base, exponente=2):
    return base ** exponente

print(potencia(3))      # 9 (3²)
print(potencia(2, 3))   # 8 (2³)
\`\`\`

## *args y **kwargs

\`\`\`python
# *args - número variable de argumentos
def sumar_todo(*numeros):
    return sum(numeros)

print(sumar_todo(1, 2, 3, 4))  # 10

# **kwargs - argumentos con nombre
def mostrar_info(**datos):
    for clave, valor in datos.items():
        print(f"{clave}: {valor}")

mostrar_info(nombre="Ana", edad=25)
\`\`\``,
      exercises: [
        {
          title: 'Función simple',
          instructions: 'Define una función saludar() que imprima "¡Hola, Python!". Luego llámala.',
          starterCode: '# Define la función\n# Llámala\n',
          solutionCode: 'def saludar():\n    print("¡Hola, Python!")\n\nsaludar()',
          validationType: 'exact',
          testCases: [{ expected: '¡Hola, Python!' }],
          hints: ['Usa def para definir', 'Usa () para llamar'],
          order: 1,
        },
        {
          title: 'Función con parámetros',
          instructions: 'Define una función multiplicar(a, b) que retorne el producto. Llámala con 7 y 8, e imprime el resultado.',
          starterCode: '# Define multiplicar\n# Llámala e imprime\n',
          solutionCode: 'def multiplicar(a, b):\n    return a * b\n\nresultado = multiplicar(7, 8)\nprint(resultado)',
          validationType: 'exact',
          testCases: [{ expected: '56' }],
          hints: ['Usa return para devolver el valor', 'Guarda el resultado en una variable'],
          order: 2,
        },
        {
          title: 'Función es_par',
          instructions: 'Crea una función es_par(numero) que retorne True si es par, False si es impar. Prueba con 10 y 7.',
          starterCode: 'def es_par(numero):\n    # Completa aquí\n\nprint(es_par(10))\nprint(es_par(7))',
          solutionCode: 'def es_par(numero):\n    return numero % 2 == 0\n\nprint(es_par(10))\nprint(es_par(7))',
          validationType: 'contains',
          testCases: [
            { expected: 'True' },
            { expected: 'False' },
          ],
          hints: ['Retorna el resultado de la comparación', 'numero % 2 == 0 para pares'],
          order: 3,
        },
      ],
      order: 9,
    },
    {
      slug: 'proyecto-final-basico',
      title: 'Proyecto: Calculadora',
      estimatedMinutes: 35,
      content: `# Proyecto Final: Calculadora

Vamos a crear una calculadora completa usando todo lo aprendido.

## Requisitos del proyecto

1. Función sumar(a, b)
2. Función restar(a, b)
3. Función multiplicar(a, b)
4. Función dividir(a, b) - manejar división por cero
5. Función calculadora() que use las anteriores

## Conceptos a aplicar

- Definición de funciones
- Parámetros y retorno de valores
- Condicionales (if/else)
- Manejo de errores básico

## Ejemplo de estructura

\`\`\`python
def sumar(a, b):
    return a + b

def restar(a, b):
    return a - b

def multiplicar(a, b):
    return a * b

def dividir(a, b):
    if b == 0:
        return "Error: No se puede dividir por cero"
    return a / b

# Prueba tus funciones
print(sumar(10, 5))
print(restar(10, 5))
print(multiplicar(10, 5))
print(dividir(10, 5))
print(dividir(10, 0))
\`\`\`

## Desafío adicional

Crea una función calculadora(operacion, a, b) que reciba la operación como string ("+", "-", "*", "/") y los dos números.`,
      exercises: [
        {
          title: 'Funciones de operaciones',
          instructions: 'Crea las funciones sumar, restar, multiplicar, dividir. Cada una recibe a y b y retorna el resultado. Maneja división por cero.',
          starterCode: '# Define las 4 funciones\n',
          solutionCode: 'def sumar(a, b):\n    return a + b\n\ndef restar(a, b):\n    return a - b\n\ndef multiplicar(a, b):\n    return a * b\n\ndef dividir(a, b):\n    if b == 0:\n        return "Error: División por cero"\n    return a / b\n\nprint(sumar(10, 5))\nprint(restar(10, 5))\nprint(multiplicar(10, 5))\nprint(dividir(10, 5))\nprint(dividir(10, 0))',
          validationType: 'contains',
          testCases: [
            { expected: '15' },
            { expected: '5' },
            { expected: '50' },
            { expected: '2.0' },
            { expected: 'Error' },
          ],
          hints: ['Usa return en cada función', 'Usa if para verificar b==0'],
          order: 1,
        },
        {
          title: 'Calculadora completa',
          instructions: 'Crea calculadora(operacion, a, b) que use if/elif para ejecutar la operación correspondiente ("+", "-", "*", "/").',
          starterCode: '# Usa las funciones anteriores\ndef calculadora(operacion, a, b):\n    # Completa aquí\n\nprint(calculadora("+", 10, 5))\nprint(calculadora("*", 4, 6))',
          solutionCode: 'def sumar(a, b):\n    return a + b\ndef restar(a, b):\n    return a - b\ndef multiplicar(a, b):\n    return a * b\ndef dividir(a, b):\n    if b == 0:\n        return "Error"\n    return a / b\n\ndef calculadora(operacion, a, b):\n    if operacion == "+":\n        return sumar(a, b)\n    elif operacion == "-":\n        return restar(a, b)\n    elif operacion == "*":\n        return multiplicar(a, b)\n    elif operacion == "/":\n        return dividir(a, b)\n    else:\n        return "Operación no válida"\n\nprint(calculadora("+", 10, 5))\nprint(calculadora("*", 4, 6))',
          validationType: 'contains',
          testCases: [
            { expected: '15' },
            { expected: '24' },
          ],
          hints: ['Usa if/elif para cada operación', 'Llama a la función correspondiente'],
          order: 2,
        },
      ],
      order: 10,
    },
  ],
};

// Curso Python Intermedio
const pythonIntermedio = {
  slug: 'python-intermedio',
  title: 'Python Intermedio: Domina el Lenguaje',
  description: 'Lleva tus habilidades de Python al siguiente nivel. Aprende estructuras de datos avanzadas, comprensiones, manejo de errores, programación funcional, clases y más.',
  order: 2,
  isPublished: true,
  language: 'python',
  runtimeType: 'browser_pyodide',
  lessons: [
    {
      slug: 'diccionarios',
      title: 'Diccionarios: Estructuras Clave-Valor',
      estimatedMinutes: 25,
      content: `# Diccionarios en Python

Los diccionarios son estructuras de datos que almacenan pares clave-valor. Son extremadamente útiles y eficientes.

## Creando diccionarios

\`\`\`python
# Diccionario vacío
vacio = {}

# Diccionario con datos
persona = {
    "nombre": "Ana",
    "edad": 25,
    "ciudad": "Madrid"
}
\`\`\`

## Accediendo a valores

\`\`\`python
persona = {"nombre": "Ana", "edad": 25}

# Acceder por clave
print(persona["nombre"])  # Ana

# Método get() (más seguro)
print(persona.get("nombre"))     # Ana
print(persona.get("telefono"))   # None (no error)
print(persona.get("telefono", "No disponible"))  # Valor por defecto
\`\`\`

## Modificando diccionarios

\`\`\`python
persona = {"nombre": "Ana", "edad": 25}

# Agregar/Modificar
persona["ciudad"] = "Barcelona"
persona["edad"] = 26

# Eliminar
del persona["edad"]
edad = persona.pop("edad")  # Elimina y retorna
\`\`\`

## Métodos útiles

\`\`\`python
persona = {"nombre": "Ana", "edad": 25, "ciudad": "Madrid"}

persona.keys()     # dict_keys(['nombre', 'edad', 'ciudad'])
persona.values()   # dict_values(['Ana', 25, 'Madrid'])
persona.items()    # dict_items([('nombre', 'Ana'), ...])
\`\`\`

## Iterando sobre diccionarios

\`\`\`python
# Por claves
for clave in persona:
    print(clave)

# Por clave-valor
for clave, valor in persona.items():
    print(f"{clave}: {valor}")
\`\`\`

## Diccionarios anidados

\`\`\`python
usuarios = {
    "user1": {"nombre": "Ana", "edad": 25},
    "user2": {"nombre": "Luis", "edad": 30}
}

print(usuarios["user1"]["nombre"])  # Ana
\`\`\``,
      exercises: [
        {
          title: 'Crear y acceder a diccionario',
          instructions: 'Crea un diccionario "libro" con: titulo="Python Avanzado", autor="Guido", año=2024. Imprime el título y el autor.',
          starterCode: '# Crea el diccionario libro\n',
          solutionCode: 'libro = {\n    "titulo": "Python Avanzado",\n    "autor": "Guido",\n    "año": 2024\n}\nprint(libro["titulo"])\nprint(libro["autor"])',
          validationType: 'contains',
          testCases: [
            { expected: 'Python Avanzado' },
            { expected: 'Guido' },
          ],
          hints: ['Usa { } para crear', 'Accede con ["clave"]'],
          order: 1,
        },
        {
          title: 'Agregar y modificar',
          instructions: 'Dado estudiante={"nombre": "María", "nota": 85}, agrega "curso": "Python" y cambia la nota a 90. Luego imprime el diccionario.',
          starterCode: 'estudiante = {"nombre": "María", "nota": 85}\n# Agrega curso y cambia nota\n',
          solutionCode: 'estudiante = {"nombre": "María", "nota": 85}\nestudiante["curso"] = "Python"\nestudiante["nota"] = 90\nprint(estudiante)',
          validationType: 'contains',
          testCases: [
            { expected: 'María' },
            { expected: '90' },
            { expected: 'Python' },
          ],
          hints: ['Asigna directamente para agregar/modificar', 'estudiante["clave"] = valor'],
          order: 2,
        },
        {
          title: 'Contador de palabras',
          instructions: 'Dada lista=["a", "b", "a", "c", "b", "a"], crea un diccionario que cuente cuántas veces aparece cada letra.',
          starterCode: 'lista = ["a", "b", "a", "c", "b", "a"]\ncontador = {}\n# Cuenta las ocurrencias\n',
          solutionCode: 'lista = ["a", "b", "a", "c", "b", "a"]\ncontador = {}\nfor letra in lista:\n    if letra in contador:\n        contador[letra] += 1\n    else:\n        contador[letra] = 1\nprint(contador)',
          validationType: 'contains',
          testCases: [{ expected: "'a': 3" }],
          hints: ['Verifica si la clave existe', 'Incrementa o inicializa'],
          order: 3,
        },
      ],
      order: 1,
    },
    {
      slug: 'sets-tuplas',
      title: 'Sets y Tuplas',
      estimatedMinutes: 25,
      content: `# Sets y Tuplas

## Tuplas

Las tuplas son colecciones ordenadas e **inmutables** (no se pueden modificar después de crearlas).

\`\`\`python
# Crear tuplas
coordenadas = (10, 20)
punto = 10, 20  # Paréntesis opcionales
tupla_unica = (42,)  # Coma necesaria para tupla de un elemento

# Desempaquetado
x, y = coordenadas
print(x)  # 10
print(y)  # 20

# Inmutabilidad
coordenadas[0] = 15  # ❌ Error! No se puede modificar
\`\`\`

## Sets (Conjuntos)

Los sets son colecciones **no ordenadas** de elementos **únicos**.

\`\`\`python
# Crear sets
numeros = {1, 2, 3, 4, 5}
vacio = set()  # {} crea un diccionario vacío

# Desde lista (elimina duplicados)
lista = [1, 2, 2, 3, 3, 3]
unicos = set(lista)  # {1, 2, 3}
\`\`\`

## Operaciones de conjuntos

\`\`\`python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a.union(b)           # {1, 2, 3, 4, 5, 6}
a.intersection(b)    # {3, 4}
a.difference(b)      # {1, 2}
a.symmetric_difference(b)  # {1, 2, 5, 6}

# Operadores
a | b  # Unión
a & b  # Intersección
a - b  # Diferencia
a ^ b  # Diferencia simétrica
\`\`\`

## Métodos de sets

\`\`\`python
s = {1, 2, 3}

s.add(4)        # Agregar elemento
s.remove(2)     # Eliminar (error si no existe)
s.discard(5)    # Eliminar (sin error si no existe)
s.pop()         # Eliminar y retornar uno arbitrario
2 in s          # Verificar membresía
\`\`\``,
      exercises: [
        {
          title: 'Trabajando con tuplas',
          instructions: 'Crea una tupla "fecha" con (15, "marzo", 2024). Usa desempaquetado para asignar a día, mes, año e imprímelos.',
          starterCode: '# Crea la tupla y desempaqueta\n',
          solutionCode: 'fecha = (15, "marzo", 2024)\ndia, mes, año = fecha\nprint(dia)\nprint(mes)\nprint(año)',
          validationType: 'contains',
          testCases: [
            { expected: '15' },
            { expected: 'marzo' },
            { expected: '2024' },
          ],
          hints: ['Usa paréntesis para la tupla', 'x, y, z = tupla para desempaquetar'],
          order: 1,
        },
        {
          title: 'Eliminar duplicados',
          instructions: 'Dada lista=[1, 2, 2, 3, 3, 3, 4, 4, 4, 4], conviértela a un set para eliminar duplicados, luego vuelve a convertir a lista.',
          starterCode: 'lista = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]\n# Elimina duplicados\n',
          solutionCode: 'lista = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]\nunicos = list(set(lista))\nprint(unicos)',
          validationType: 'contains',
          testCases: [{ expected: '[1, 2, 3, 4]' }],
          hints: ['set(lista) elimina duplicados', 'list() convierte de vuelta'],
          order: 2,
        },
        {
          title: 'Operaciones de conjuntos',
          instructions: 'Dados A={1,2,3,4,5} y B={4,5,6,7,8}, imprime: unión, intersección, diferencia A-B.',
          starterCode: 'A = {1, 2, 3, 4, 5}\nB = {4, 5, 6, 7, 8}\n# Calcula las operaciones\n',
          solutionCode: 'A = {1, 2, 3, 4, 5}\nB = {4, 5, 6, 7, 8}\nprint(A.union(B))\nprint(A.intersection(B))\nprint(A.difference(B))',
          validationType: 'contains',
          testCases: [
            { expected: '1, 2, 3, 4, 5, 6, 7, 8' },
            { expected: '4, 5' },
            { expected: '1, 2, 3' },
          ],
          hints: ['Usa .union(), .intersection(), .difference()', 'O los operadores | & -'],
          order: 3,
        },
      ],
      order: 2,
    },
    {
      slug: 'list-comprehensions',
      title: 'List Comprehensions Avanzadas',
      estimatedMinutes: 25,
      content: `# List Comprehensions Avanzadas

Las list comprehensions son una forma concisa y elegante de crear listas en Python.

## Sintaxis básica

\`\`\`python
# Forma tradicional
cuadrados = []
for x in range(10):
    cuadrados.append(x**2)

# List comprehension
cuadrados = [x**2 for x in range(10)]
\`\`\`

## Con condiciones

\`\`\`python
# Solo números pares
pares = [x for x in range(20) if x % 2 == 0]

# Números pares al cuadrado
pares_cuad = [x**2 for x in range(20) if x % 2 == 0]
\`\`\`

## Dict comprehensions

\`\`\`python
# Crear diccionario
cuadrados_dict = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Filtrar diccionario
precios = {"manzana": 2.5, "plátano": 1.8, "cereza": 5.0}
caros = {k: v for k, v in precios.items() if v > 2}
\`\`\`

## Set comprehensions

\`\`\`python
# Cuadrados únicos
cuadrados_set = {x**2 for x in range(20)}
\`\`\`

## Comprensiones anidadas

\`\`\`python
# Tabla de multiplicar
tabla = [[i * j for j in range(1, 6)] for i in range(1, 6)]

# Aplanar lista de listas
matriz = [[1, 2], [3, 4], [5, 6]]
plana = [x for fila in matriz for x in fila]
# [1, 2, 3, 4, 5, 6]
\`\`\`

## if-else en comprehensions

\`\`\`python
# Clasificar números
resultado = ["par" if x % 2 == 0 else "impar" for x in range(10)]
\`\`\``,
      exercises: [
        {
          title: 'Pares al cuadrado',
          instructions: 'Usa list comprehension para crear una lista con los cuadrados de los números pares del 1 al 20.',
          starterCode: '# List comprehension aquí\n',
          solutionCode: 'cuadrados = [x**2 for x in range(1, 21) if x % 2 == 0]\nprint(cuadrados)',
          validationType: 'contains',
          testCases: [
            { expected: '4' },
            { expected: '400' },
          ],
          hints: ['range(1, 21) para 1-20', 'if x % 2 == 0 para filtrar pares'],
          order: 1,
        },
        {
          title: 'Dict comprehension',
          instructions: 'Crea un diccionario donde las claves sean las letras de "python" y los valores la posición (empezando en 1).',
          starterCode: 'palabra = "python"\n# Dict comprehension aquí\n',
          solutionCode: 'palabra = "python"\nposiciones = {letra: i+1 for i, letra in enumerate(palabra)}\nprint(posiciones)',
          validationType: 'contains',
          testCases: [
            { expected: "'p': 1" },
            { expected: "'n': 6" },
          ],
          hints: ['enumerate() da índice y valor', 'i+1 para empezar en 1'],
          order: 2,
        },
        {
          title: 'Longitudes de palabras',
          instructions: 'Dada frases=["Hola mundo", "Python es genial", "Me encanta programar"], crea una lista con las longitudes de cada frase.',
          starterCode: 'frases = ["Hola mundo", "Python es genial", "Me encanta programar"]\n# Calcula longitudes\n',
          solutionCode: 'frases = ["Hola mundo", "Python es genial", "Me encanta programar"]\nlongitudes = [len(frase) for frase in frases]\nprint(longitudes)',
          validationType: 'contains',
          testCases: [
            { expected: '10' },
            { expected: '16' },
            { expected: '21' },
          ],
          hints: ['Usa len(frase) para longitud', 'Itera sobre cada frase'],
          order: 3,
        },
      ],
      order: 3,
    },
    {
      slug: 'manejo-errores',
      title: 'Manejo de Errores y Excepciones',
      estimatedMinutes: 30,
      content: `# Manejo de Errores

Los errores son inevitables en programación. Python proporciona mecanismos elegantes para manejarlos.

## try-except básico

\`\`\`python
try:
    resultado = 10 / 0
except:
    print("¡Error! División por cero")
\`\`\`

## Capturando tipos específicos

\`\`\`python
try:
    numero = int("no es un numero")
    resultado = 10 / numero
except ValueError:
    print("Error: No es un número válido")
except ZeroDivisionError:
    print("Error: No se puede dividir por cero")
\`\`\`

## else y finally

\`\`\`python
try:
    archivo = open("datos.txt", "r")
    contenido = archivo.read()
except FileNotFoundError:
    print("Archivo no encontrado")
else:
    # Se ejecuta si no hay error
    print("Lectura exitosa")
    print(contenido)
finally:
    # Se ejecuta siempre (con o sin error)
    archivo.close()
    print("Archivo cerrado")
\`\`\`

## raise - lanzar excepciones

\`\`\`python
def dividir(a, b):
    if b == 0:
        raise ValueError("El divisor no puede ser cero")
    return a / b

try:
    resultado = dividir(10, 0)
except ValueError as e:
    print(f"Error: {e}")
\`\`\`

## Excepciones personalizadas

\`\`\`python
class EdadInvalidaError(Exception):
    """Excepción para edades inválidas"""
    pass

def verificar_edad(edad):
    if edad < 0:
        raise EdadInvalidaError("La edad no puede ser negativa")
    if edad > 150:
        raise EdadInvalidaError("La edad parece incorrecta")
    return True
\`\`\``,
      exercises: [
        {
          title: 'Conversión segura',
          instructions: 'Usa try-except para convertir "abc" a int. Si falla, imprime "No es un número válido".',
          starterCode: 'texto = "abc"\n# Intenta convertir de forma segura\n',
          solutionCode: 'texto = "abc"\ntry:\n    numero = int(texto)\n    print(numero)\nexcept ValueError:\n    print("No es un número válido")',
          validationType: 'exact',
          testCases: [{ expected: 'No es un número válido' }],
          hints: ['Usa try-except ValueError', 'int() lanza ValueError si falla'],
          order: 1,
        },
        {
          title: 'División segura',
          instructions: 'Crea una función dividir_seguro(a, b) que retorne el resultado o "Error: división por cero" si b es 0.',
          starterCode: 'def dividir_seguro(a, b):\n    # Completa aquí\n\nprint(dividir_seguro(10, 2))\nprint(dividir_seguro(10, 0))',
          solutionCode: 'def dividir_seguro(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return "Error: división por cero"\n\nprint(dividir_seguro(10, 2))\nprint(dividir_seguro(10, 0))',
          validationType: 'contains',
          testCases: [
            { expected: '5.0' },
            { expected: 'Error' },
          ],
          hints: ['Usa try-except ZeroDivisionError', 'Retorna el resultado o mensaje'],
          order: 2,
        },
        {
          title: 'Validación con raise',
          instructions: 'Crea una función validar_positivo(n) que lance ValueError si n <= 0. Usa try-except al llamarla con -5 y 10.',
          starterCode: 'def validar_positivo(n):\n    # Lanza ValueError si n <= 0\n\n# Prueba con -5 y 10\n',
          solutionCode: 'def validar_positivo(n):\n    if n <= 0:\n        raise ValueError("El número debe ser positivo")\n    return n\n\ntry:\n    print(validar_positivo(-5))\nexcept ValueError as e:\n    print(f"Error: {e}")\n\ntry:\n    print(validar_positivo(10))\nexcept ValueError as e:\n    print(f"Error: {e}")',
          validationType: 'contains',
          testCases: [
            { expected: 'Error: El número debe ser positivo' },
            { expected: '10' },
          ],
          hints: ['Usa raise ValueError()', 'Captura con except ValueError as e'],
          order: 3,
        },
      ],
      order: 4,
    },
    {
      slug: 'funciones-lambda',
      title: 'Funciones Lambda y Programación Funcional',
      estimatedMinutes: 30,
      content: `# Funciones Lambda

Las funciones lambda son funciones anónimas de una sola línea, útiles para operaciones simples.

## Sintaxis básica

\`\`\`python
# Función tradicional
def cuadrado(x):
    return x ** 2

# Lambda equivalente
cuadrado = lambda x: x ** 2

print(cuadrado(5))  # 25
\`\`\`

## Múltiples parámetros

\`\`\`python
suma = lambda a, b: a + b
print(suma(3, 4))  # 7

# Con valor por defecto
saludar = lambda nombre, saludo="Hola": f"{saludo}, {nombre}!"
\`\`\`

## Funciones de orden superior

### map()
Aplica una función a cada elemento:
\`\`\`python
numeros = [1, 2, 3, 4, 5]
cuadrados = list(map(lambda x: x**2, numeros))
# [1, 4, 9, 16, 25]
\`\`\`

### filter()
Filtra elementos según condición:
\`\`\`python
numeros = [1, 2, 3, 4, 5, 6]
pares = list(filter(lambda x: x % 2 == 0, numeros))
# [2, 4, 6]
\`\`\`

### reduce()
Reduce a un solo valor:
\`\`\`python
from functools import reduce

numeros = [1, 2, 3, 4, 5]
producto = reduce(lambda a, b: a * b, numeros)
# 120 (1*2*3*4*5)
\`\`\`

## sorted() con key

\`\`\`python
# Ordenar por longitud
palabras = ["python", "es", "genial"]
ordenadas = sorted(palabras, key=lambda x: len(x))
# ["es", "genial", "python"]

# Ordenar diccionarios por valor
notas = [{"nombre": "Ana", "nota": 85}, {"nombre": "Luis", "nota": 92}]
mejores = sorted(notas, key=lambda x: x["nota"], reverse=True)
\`\`\``,
      exercises: [
        {
          title: 'Lambda simple',
          instructions: 'Crea una lambda que calcule el cubo de un número. Pruébala con 3.',
          starterCode: '# Crea la lambda\n# Pruébala con 3\n',
          solutionCode: 'cubo = lambda x: x ** 3\nprint(cubo(3))',
          validationType: 'exact',
          testCases: [{ expected: '27' }],
          hints: ['lambda x: expresión', 'x ** 3 para el cubo'],
          order: 1,
        },
        {
          title: 'Dobles con map',
          instructions: 'Usa map() con lambda para duplicar cada número en [2, 4, 6, 8]. Convierte a lista e imprime.',
          starterCode: 'numeros = [2, 4, 6, 8]\n# Usa map con lambda\n',
          solutionCode: 'numeros = [2, 4, 6, 8]\ndobles = list(map(lambda x: x * 2, numeros))\nprint(dobles)',
          validationType: 'contains',
          testCases: [{ expected: '[4, 8, 12, 16]' }],
          hints: ['map(lambda x: ..., lista)', 'list() para convertir'],
          order: 2,
        },
        {
          title: 'Filtrar mayores',
          instructions: 'Usa filter() con lambda para obtener solo los números > 50 de [10, 55, 30, 80, 25, 90].',
          starterCode: 'numeros = [10, 55, 30, 80, 25, 90]\n# Filtra los mayores a 50\n',
          solutionCode: 'numeros = [10, 55, 30, 80, 25, 90]\nmayores = list(filter(lambda x: x > 50, numeros))\nprint(mayores)',
          validationType: 'contains',
          testCases: [{ expected: '[55, 80, 90]' }],
          hints: ['filter(lambda x: x > 50, numeros)', 'Condición: x > 50'],
          order: 3,
        },
        {
          title: 'Ordenar por longitud',
          instructions: 'Ordena ["python", "es", "increíblemente", "genial"] por longitud de palabra (más corta primero).',
          starterCode: 'palabras = ["python", "es", "increíblemente", "genial"]\n# Ordena por longitud\n',
          solutionCode: 'palabras = ["python", "es", "increíblemente", "genial"]\nordenadas = sorted(palabras, key=lambda x: len(x))\nprint(ordenadas)',
          validationType: 'contains',
          testCases: [{ expected: "'es'" }],
          hints: ['sorted(lista, key=lambda)', 'len(x) para longitud'],
          order: 4,
        },
      ],
      order: 5,
    },
    {
      slug: 'modulos-librerias',
      title: 'Módulos y Librerías',
      estimatedMinutes: 25,
      content: `# Módulos y Librerías

Python tiene una vasta biblioteca estándar y miles de librerías de terceros.

## Importando módulos

\`\`\`python
# Importar todo el módulo
import math
print(math.sqrt(16))  # 4.0

# Importar con alias
import random as rnd
print(rnd.randint(1, 10))

# Importar funciones específicas
from datetime import datetime, timedelta
ahora = datetime.now()

# Importar todo (no recomendado en general)
from math import *
print(sin(pi/2))
\`\`\`

## Módulos útiles de la biblioteca estándar

### math
\`\`\`python
import math

math.pi           # 3.14159265359...
math.e            # 2.71828182846...
math.sqrt(16)     # 4.0
math.ceil(4.2)    # 5
math.floor(4.9)   # 4
math.pow(2, 3)    # 8.0
\`\`\`

### random
\`\`\`python
import random

random.random()           # Float entre 0 y 1
random.randint(1, 100)    # Entero entre 1 y 100
random.choice(["a", "b", "c"])  # Elemento aleatorio
random.shuffle(lista)     # Mezcla la lista
\`\`\`

### datetime
\`\`\`python
from datetime import datetime, timedelta

ahora = datetime.now()
fecha = datetime(2024, 3, 15)
diferencia = ahora - fecha

mañana = ahora + timedelta(days=1)
formateada = ahora.strftime("%Y-%m-%d")
\`\`\`

### statistics
\`\`\`python
import statistics

datos = [1, 2, 3, 4, 5]
statistics.mean(datos)    # 3.0 (promedio)
statistics.median(datos)  # 3 (mediana)
statistics.stdev(datos)   # Desviación estándar
\`\`\``,
      exercises: [
        {
          title: 'Cálculos con math',
          instructions: 'Usa el módulo math para calcular: raíz cuadrada de 144, pi redondeado a 2 decimales, y 2^10.',
          starterCode: 'import math\n# Calcula los valores\n',
          solutionCode: 'import math\nprint(math.sqrt(144))\nprint(round(math.pi, 2))\nprint(math.pow(2, 10))',
          validationType: 'contains',
          testCases: [
            { expected: '12.0' },
            { expected: '3.14' },
            { expected: '1024.0' },
          ],
          hints: ['math.sqrt() para raíz', 'round() para redondear', 'math.pow() para potencia'],
          order: 1,
        },
        {
          title: 'Números aleatorios',
          instructions: 'Usa random para generar: un entero entre 1-100, y elegir aleatoriamente de ["rojo", "verde", "azul"].',
          starterCode: 'import random\n# Genera los aleatorios\n',
          solutionCode: 'import random\nprint(random.randint(1, 100))\nprint(random.choice(["rojo", "verde", "azul"]))',
          validationType: 'regex',
          testCases: [
            { pattern: 'rojo|verde|azul' },
          ],
          hints: ['random.randint(a, b)', 'random.choice(lista)'],
          order: 2,
        },
        {
          title: 'Estadísticas básicas',
          instructions: 'Dada notas=[85, 90, 78, 92, 88], calcula el promedio y la mediana usando statistics.',
          starterCode: 'import statistics\nnotas = [85, 90, 78, 92, 88]\n# Calcula promedio y mediana\n',
          solutionCode: 'import statistics\nnotas = [85, 90, 78, 92, 88]\nprint(statistics.mean(notas))\nprint(statistics.median(notas))',
          validationType: 'contains',
          testCases: [
            { expected: '86.6' },
            { expected: '88' },
          ],
          hints: ['statistics.mean() para promedio', 'statistics.median() para mediana'],
          order: 3,
        },
      ],
      order: 6,
    },
    {
      slug: 'archivos-csv',
      title: 'Manejo de Archivos y CSV',
      estimatedMinutes: 30,
      content: `# Trabajando con Archivos

Python hace muy sencillo leer y escribir archivos.

## Leer archivos

\`\`\`python
# Leer todo el contenido
with open("archivo.txt", "r") as f:
    contenido = f.read()

# Leer línea por línea
with open("archivo.txt", "r") as f:
    for linea in f:
        print(linea.strip())

# Leer en lista
with open("archivo.txt", "r") as f:
    lineas = f.readlines()
\`\`\`

## Escribir archivos

\`\`\`python
# Sobreescribir (w)
with open("salida.txt", "w") as f:
    f.write("Hola, mundo!")

# Agregar (a - append)
with open("log.txt", "a") as f:
    f.write("Nueva línea\\n")

# Escribir múltiples líneas
lineas = ["Línea 1", "Línea 2", "Línea 3"]
with open("salida.txt", "w") as f:
    f.writelines([l + "\\n" for l in lineas])
\`\`\`

## Trabajando con CSV

\`\`\`python
import csv

# Leer CSV
with open("datos.csv", "r") as f:
    lector = csv.reader(f)
    for fila in lector:
        print(fila)  # Cada fila es una lista

# Leer como diccionario
with open("datos.csv", "r") as f:
    lector = csv.DictReader(f)
    for fila in lector:
        print(fila["nombre"])  # Acceso por nombre de columna

# Escribir CSV
with open("salida.csv", "w", newline="") as f:
    escritor = csv.writer(f)
    escritor.writerow(["nombre", "edad"])
    escritor.writerow(["Ana", 25])
    escritor.writerow(["Luis", 30])
\`\`\`

## Context manager (with)

El uso de \`with\` garantiza que el archivo se cierre correctamente, incluso si hay errores.`,
      exercises: [
        {
          title: 'Contar líneas',
          instructions: 'Simula contar líneas: crea una lista con 5 strings y cuenta cuántas "líneas" tiene.',
          starterCode: 'lineas = ["Primera", "Segunda", "Tercera", "Cuarta", "Quinta"]\n# Cuenta las líneas\n',
          solutionCode: 'lineas = ["Primera", "Segunda", "Tercera", "Cuarta", "Quinta"]\nprint(len(lineas))',
          validationType: 'exact',
          testCases: [{ expected: '5' }],
          hints: ['len() cuenta elementos', 'Simula la lectura de líneas'],
          order: 1,
        },
        {
          title: 'Procesar datos CSV simulados',
          instructions: 'Dado datos=[{"nombre": "Ana", "edad": 25}, {"nombre": "Luis", "edad": 30}], calcula el promedio de edades.',
          starterCode: 'datos = [{"nombre": "Ana", "edad": 25}, {"nombre": "Luis", "edad": 30}]\n# Calcula promedio de edades\n',
          solutionCode: 'datos = [{"nombre": "Ana", "edad": 25}, {"nombre": "Luis", "edad": 30}]\nedades = [persona["edad"] for persona in datos]\npromedio = sum(edades) / len(edades)\nprint(promedio)',
          validationType: 'exact',
          testCases: [{ expected: '27.5' }],
          hints: ['Extrae las edades con list comprehension', 'sum() / len() para promedio'],
          order: 2,
        },
        {
          title: 'Filtrar datos',
          instructions: 'Del mismo datos, crea una lista con solo los nombres de personas con edad >= 26.',
          starterCode: 'datos = [{"nombre": "Ana", "edad": 25}, {"nombre": "Luis", "edad": 30}, {"nombre": "María", "edad": 28}]\n# Filtra nombres con edad >= 26\n',
          solutionCode: 'datos = [{"nombre": "Ana", "edad": 25}, {"nombre": "Luis", "edad": 30}, {"nombre": "María", "edad": 28}]\nmayores = [p["nombre"] for p in datos if p["edad"] >= 26]\nprint(mayores)',
          validationType: 'contains',
          testCases: [
            { expected: 'Luis' },
            { expected: 'María' },
          ],
          hints: ['List comprehension con condición', 'if p["edad"] >= 26'],
          order: 3,
        },
      ],
      order: 7,
    },
    {
      slug: 'clases-objetos',
      title: 'Programación Orientada a Objetos',
      estimatedMinutes: 35,
      content: `# Clases y Objetos

Python soporta programación orientada a objetos (POO) con una sintaxis elegante.

## Definiendo clases

\`\`\`python
class Persona:
    # Atributo de clase (compartido)
    especie = "Homo sapiens"
    
    def __init__(self, nombre, edad):
        # Atributos de instancia
        self.nombre = nombre
        self.edad = edad
    
    def saludar(self):
        return f"Hola, soy {self.nombre}"
    
    def es_mayor(self):
        return self.edad >= 18

# Crear objetos
ana = Persona("Ana", 25)
print(ana.saludar())  # Hola, soy Ana
print(ana.es_mayor())  # True
\`\`\`

## Encapsulación

\`\`\`python
class CuentaBancaria:
    def __init__(self, titular, saldo):
        self.titular = titular
        self._saldo = saldo  # Convención: "privado"
    
    @property
    def saldo(self):
        return self._saldo
    
    def depositar(self, cantidad):
        if cantidad > 0:
            self._saldo += cantidad
            return True
        return False
    
    def retirar(self, cantidad):
        if 0 < cantidad <= self._saldo:
            self._saldo -= cantidad
            return True
        return False

cuenta = CuentaBancaria("Ana", 1000)
cuenta.depositar(500)
print(cuenta.saldo)  # 1500
\`\`\`

## Herencia

\`\`\`python
class Empleado(Persona):
    def __init__(self, nombre, edad, salario):
        super().__init__(nombre, edad)
        self.salario = salario
    
    def saludar(self):
        base = super().saludar()
        return f"{base} y trabajo aquí"

emp = Empleado("Luis", 30, 50000)
print(emp.saludar())
\`\`\``,
      exercises: [
        {
          title: 'Clase Rectángulo',
          instructions: 'Crea una clase Rectangulo con atributos ancho y alto. Métodos: area() y perimetro(). Crea uno de 5x3 y muestra área y perímetro.',
          starterCode: 'class Rectangulo:\n    # Completa aquí\n\n# Crea y prueba\n',
          solutionCode: 'class Rectangulo:\n    def __init__(self, ancho, alto):\n        self.ancho = ancho\n        self.alto = alto\n    \n    def area(self):\n        return self.ancho * self.alto\n    \n    def perimetro(self):\n        return 2 * (self.ancho + self.alto)\n\nr = Rectangulo(5, 3)\nprint(r.area())\nprint(r.perimetro())',
          validationType: 'contains',
          testCases: [
            { expected: '15' },
            { expected: '16' },
          ],
          hints: ['__init__ para constructor', 'self.atributo para atributos'],
          order: 1,
        },
        {
          title: 'Clase Estudiante',
          instructions: 'Crea Estudiante con nombre y lista de notas. Métodos: agregar_nota(nota), promedio().',
          starterCode: 'class Estudiante:\n    # Completa aquí\n\n# Prueba\nest = Estudiante("Ana")\nest.agregar_nota(85)\nest.agregar_nota(90)\nest.agregar_nota(78)\nprint(est.promedio())',
          solutionCode: 'class Estudiante:\n    def __init__(self, nombre):\n        self.nombre = nombre\n        self.notas = []\n    \n    def agregar_nota(self, nota):\n        self.notas.append(nota)\n    \n    def promedio(self):\n        if not self.notas:\n            return 0\n        return sum(self.notas) / len(self.notas)\n\nest = Estudiante("Ana")\nest.agregar_nota(85)\nest.agregar_nota(90)\nest.agregar_nota(78)\nprint(est.promedio())',
          validationType: 'contains',
          testCases: [{ expected: '84.333' }],
          hints: ['Inicializa notas como lista vacía', 'sum() / len() para promedio'],
          order: 2,
        },
      ],
      order: 8,
    },
    {
      slug: 'decoradores',
      title: 'Decoradores',
      estimatedMinutes: 25,
      content: `# Decoradores en Python

Los decoradores son funciones que modifican el comportamiento de otras funciones.

## Concepto básico

\`\`\`python
def mi_decorador(func):
    def wrapper():
        print("Antes de la función")
        func()
        print("Después de la función")
    return wrapper

@mi_decorador
def saludar():
    print("¡Hola!")

saludar()
# Antes de la función
# ¡Hola!
# Después de la función
\`\`\`

## Decoradores con argumentos

\`\`\`python
from functools import wraps

def log(func):
    @wraps(func)  # Preserva metadata
    def wrapper(*args, **kwargs):
        print(f"Llamando {func.__name__} con {args}")
        resultado = func(*args, **kwargs)
        print(f"Resultado: {resultado}")
        return resultado
    return wrapper

@log
def sumar(a, b):
    return a + b

sumar(3, 4)
\`\`\`

## Decoradores con parámetros

\`\`\`python
def repetir(veces):
    def decorador(func):
        def wrapper(*args, **kwargs):
            for _ in range(veces):
                resultado = func(*args, **kwargs)
            return resultado
        return wrapper
    return decorador

@repetir(3)
def saludar():
    print("¡Hola!")
\`\`\`

## Decoradores útiles incorporados

\`\`\`python
# @property - getter
# @staticmethod - método estático
# @classmethod - método de clase
\`\`\``,
      exercises: [
        {
          title: 'Decorador de tiempo',
          instructions: 'Crea un decorador medir_tiempo que imprima "Inicio", ejecute la función, e imprima "Fin". Aplícalo a una función contar() que sume del 1-1000.',
          starterCode: 'def medir_tiempo(func):\n    # Completa el decorador\n\n@medir_tiempo\ndef contar():\n    return sum(range(1, 1001))\n\ncontar()',
          solutionCode: 'def medir_tiempo(func):\n    def wrapper():\n        print("Inicio")\n        resultado = func()\n        print("Fin")\n        return resultado\n    return wrapper\n\n@medir_tiempo\ndef contar():\n    return sum(range(1, 1001))\n\ncontar()',
          validationType: 'exact',
          testCases: [
            { expected: 'Inicio' },
            { expected: 'Fin' },
          ],
          hints: ['El wrapper llama a func()', 'Retorna el resultado'],
          order: 1,
        },
        {
          title: 'Decorador de validación',
          instructions: 'Crea un decorador positivo_requerido que verifique que todos los args sean > 0, o lance ValueError. Aplícalo a multiplicar(a, b).',
          starterCode: 'def positivo_requerido(func):\n    # Completa aquí\n\n@positivo_requerido\ndef multiplicar(a, b):\n    return a * b\n\nprint(multiplicar(5, 3))\n',
          solutionCode: 'def positivo_requerido(func):\n    def wrapper(*args):\n        for arg in args:\n            if arg <= 0:\n                raise ValueError("Todos los argumentos deben ser positivos")\n        return func(*args)\n    return wrapper\n\n@positivo_requerido\ndef multiplicar(a, b):\n    return a * b\n\nprint(multiplicar(5, 3))',
          validationType: 'exact',
          testCases: [{ expected: '15' }],
          hints: ['Itera sobre args', 'raise ValueError si alguno <= 0'],
          order: 2,
        },
      ],
      order: 9,
    },
    {
      slug: 'proyecto-final-intermedio',
      title: 'Proyecto: Gestor de Tareas',
      estimatedMinutes: 45,
      content: `# Proyecto Final: Gestor de Tareas

Vamos a crear un gestor de tareas completo aplicando todo lo aprendido.

## Requisitos

1. **Clase Tarea**: Representa una tarea individual
   - título, descripción, prioridad, completada, fecha_creación

2. **Clase GestorTareas**: Administra múltiples tareas
   - agregar_tarea(), eliminar_tarea(), completar_tarea()
   - listar_tareas(), filtrar_por_prioridad()
   - guardar_en_archivo(), cargar_desde_archivo()

3. **Funcionalidades**
   - Validación de datos
   - Manejo de errores
   - Persistencia (simulada con listas)

## Estructura sugerida

\`\`\`python
from datetime import datetime

class Tarea:
    def __init__(self, titulo, descripcion, prioridad="media"):
        self.titulo = titulo
        self.descripcion = descripcion
        self.prioridad = prioridad  # baja, media, alta
        self.completada = False
        self.fecha_creacion = datetime.now()
    
    def completar(self):
        self.completada = True
    
    def __str__(self):
        estado = "✓" if self.completada else "○"
        return f"[{estado}] {self.titulo} ({self.prioridad})"

class GestorTareas:
    def __init__(self):
        self.tareas = []
    
    def agregar(self, titulo, descripcion, prioridad="media"):
        if not titulo:
            raise ValueError("El título es obligatorio")
        tarea = Tarea(titulo, descripcion, prioridad)
        self.tareas.append(tarea)
        return tarea
    
    def listar(self, solo_pendientes=False):
        if solo_pendientes:
            return [t for t in self.tareas if not t.completada]
        return self.tareas
    
    def completar(self, indice):
        if 0 <= indice < len(self.tareas):
            self.tareas[indice].completar()
\`\`\`

## Desafíos adicionales

1. Agregar fechas límite
2. Exportar a CSV
3. Estadísticas de productividad
4. Búsqueda por texto`,
      exercises: [
        {
          title: 'Clase Tarea básica',
          instructions: 'Implementa la clase Tarea con: __init__(titulo, descripcion, prioridad), completar(), y __str__ que muestre [✓] o [○].',
          starterCode: 'from datetime import datetime\n\nclass Tarea:\n    # Implementa aquí\n\n# Prueba\nt = Tarea("Estudiar", "Repasar Python", "alta")\nprint(t)\nt.completar()\nprint(t)',
          solutionCode: 'from datetime import datetime\n\nclass Tarea:\n    def __init__(self, titulo, descripcion, prioridad="media"):\n        self.titulo = titulo\n        self.descripcion = descripcion\n        self.prioridad = prioridad\n        self.completada = False\n        self.fecha_creacion = datetime.now()\n    \n    def completar(self):\n        self.completada = True\n    \n    def __str__(self):\n        estado = "✓" if self.completada else "○"\n        return f"[{estado}] {self.titulo} ({self.prioridad})"\n\nt = Tarea("Estudiar", "Repasar Python", "alta")\nprint(t)\nt.completar()\nprint(t)',
          validationType: 'contains',
          testCases: [
            { expected: '[○]' },
            { expected: '[✓]' },
            { expected: 'Estudiar' },
          ],
          hints: ['__str__ debe retornar string', 'estado condicional con if'],
          order: 1,
        },
        {
          title: 'Gestor de tareas',
          instructions: 'Implementa GestorTareas con: agregar(titulo, desc, prioridad), listar(), y completar(indice). Valida que el título no esté vacío.',
          starterCode: 'class GestorTareas:\n    # Implementa aquí\n\n# Prueba\ngestor = GestorTareas()\ngestor.agregar("Tarea 1", "Descripción", "alta")\ngestor.agregar("Tarea 2", "Otra", "baja")\nprint(len(gestor.listar()))\ngestor.completar(0)\nprint(gestor.tareas[0])',
          solutionCode: 'class Tarea:\n    def __init__(self, titulo, descripcion, prioridad="media"):\n        self.titulo = titulo\n        self.descripcion = descripcion\n        self.prioridad = prioridad\n        self.completada = False\n    def completar(self):\n        self.completada = True\n    def __str__(self):\n        estado = "✓" if self.completada else "○"\n        return f"[{estado}] {self.titulo}"\n\nclass GestorTareas:\n    def __init__(self):\n        self.tareas = []\n    \n    def agregar(self, titulo, descripcion, prioridad="media"):\n        if not titulo:\n            raise ValueError("El título es obligatorio")\n        tarea = Tarea(titulo, descripcion, prioridad)\n        self.tareas.append(tarea)\n        return tarea\n    \n    def listar(self):\n        return self.tareas\n    \n    def completar(self, indice):\n        if 0 <= indice < len(self.tareas):\n            self.tareas[indice].completar()\n\ngestor = GestorTareas()\ngestor.agregar("Tarea 1", "Descripción", "alta")\ngestor.agregar("Tarea 2", "Otra", "baja")\nprint(len(gestor.listar()))\ngestor.completar(0)\nprint(gestor.tareas[0])',
          validationType: 'contains',
          testCases: [
            { expected: '2' },
            { expected: '[✓]' },
          ],
          hints: ['Valida con if not titulo', 'Verifica índice antes de completar'],
          order: 2,
        },
      ],
      order: 10,
    },
  ],
};

// Función para crear el curso en la base de datos
async function createCourse(courseData: SeedCourse) {
  console.log(`Creando curso: ${courseData.title}`);
  
  // Crear el curso
  const course = await prisma.course.create({
    data: {
      slug: courseData.slug,
      title: courseData.title,
      description: courseData.description,
      language: courseData.language ?? 'python',
      runtimeType: courseData.runtimeType ?? 'browser_pyodide',
      order: courseData.order,
      isPublished: courseData.isPublished,
    },
  });

  // Crear lecciones y ejercicios
  for (const lessonData of courseData.lessons) {
    console.log(`  Creando lección: ${lessonData.title}`);
    
    const lesson = await prisma.lesson.create({
      data: {
        courseId: course.id,
        slug: lessonData.slug,
        title: lessonData.title,
        content: lessonData.content,
        order: lessonData.order,
        isPublished: true,
        estimatedMinutes: lessonData.estimatedMinutes,
      },
    });

    // Crear ejercicios
    for (const exerciseData of lessonData.exercises) {
      await prisma.exercise.create({
        data: {
          lessonId: lesson.id,
          title: exerciseData.title,
          instructions: exerciseData.instructions,
          starterCode: exerciseData.starterCode,
          solutionCode: exerciseData.solutionCode,
          validationType: exerciseData.validationType,
          testCases: exerciseData.testCases,
          hints: exerciseData.hints,
          order: exerciseData.order,
          isPublished: true,
        },
      });
    }
  }

  console.log(`✅ Curso "${courseData.title}" creado con éxito`);
  return course;
}

// Ejecutar el seed
async function main() {
  console.log('🌱 Iniciando seed de cursos de Python...\n');

  try {
    // Crear cursos
    await createCourse(pythonBasico);
    console.log();
    await createCourse(pythonIntermedio);

    console.log('\n✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
