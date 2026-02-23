# Diseño: Tutorial Interactivo de Python

## Resumen Ejecutivo

Sistema de tutoriales interactivos de Python integrado en el blog existente, con:
- Curso estructurado de 10-15 lecciones progresivas
- Editor de código con ejecución en navegador (Pyodide/WebAssembly)
- Capacidad de insertar código interactivo en cualquier post del blog
- Panel de administración para gestionar lecciones y ejercicios
- Preparado para monetización futura (tracking de progreso, sistema de usuarios)

---

## Arquitectura Tecnológica

### Stack Tecnológico

| Componente | Tecnología | Justificación |
|------------|-----------|---------------|
| Framework | Next.js 13+ (App Router) | Ya en uso, SSR/SSG nativo |
| Database | Neon Postgres | Proporcionada, serverless, relacional |
| ORM | Prisma | Type-safe, migraciones automáticas, integración Next.js |
| Auth | NextAuth.js v5 (Auth.js) | Estándar Next.js, múltiples providers, sesiones JWT |
| Python Runtime | Pyodide (WebAssembly) | Ejecución cliente-side, sin costo servidor, sandbox nativo |
| Editor de Código | Monaco Editor (@monaco-editor/react) | Editor VS Code en navegador, autocompletado Python |
| UI Components | shadcn/ui + Tailwind | Consistente con proyecto existente |
| State Management | Zustand + TanStack Query | Estado global simple, cacheo de datos servidor |

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (Navegador)                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐  │
│  │   Monaco Editor │───▶│    Pyodide      │───▶│   Output/Visualización  │  │
│  │   (Código)      │    │  (WebAssembly)  │    │   (stdout, plots, etc)  │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────┘  │
│           │                      │                                          │
│           ▼                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                     Zustand Store (Estado Local)                        ││
│  │  • Código actual  • Resultados  • Progreso de lección                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     ▼ API Routes (Next.js)
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVIDOR (Next.js)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ /api/auth/* │  │ /api/lessons│  │/api/progress│  │   /api/admin/*      │ │
│  │  NextAuth   │  │    CRUD     │  │   Tracking  │  │   (protegido)       │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │               │                │               │                  │
│         └───────────────┴────────────────┴───────────────┘                  │
│                                     │                                        │
│                                     ▼ Prisma ORM                            │
│                          ┌─────────────────────┐                            │
│                          │    Neon Postgres    │                            │
│                          │  (ep-small-cloud...)│                            │
│                          └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Base de Datos (Prisma Schema)

```prisma
// User (gestionado por NextAuth)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relaciones
  progress      Progress[]
  codeSubmissions CodeSubmission[]
  subscriptions Subscription[]
  
  @@map("users")
}

// Cursos/Categorías de tutoriales
model Course {
  id          String   @id @default(cuid())
  slug        String   @unique  // "python-basico", "python-avanzado"
  title       String
  description String?
  order       Int      @default(0)
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  lessons     Lesson[]
  
  @@map("courses")
}

// Lecciones individuales
model Lesson {
  id          String   @id @default(cuid())
  courseId    String
  slug        String   @unique
  title       String
  content     String   // Markdown/HTML con bloques interactivos
  order       Int      @default(0)
  isPublished Boolean  @default(false)
  estimatedMinutes Int @default(10)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  exercises   Exercise[]
  progress    Progress[]
  
  @@map("lessons")
}

// Ejercicios dentro de cada lección
model Exercise {
  id              String   @id @default(cuid())
  lessonId        String
  order           Int      @default(0)
  title           String
  instructions    String   // Markdown con enunciado
  starterCode     String   // Código inicial en el editor
  solutionCode    String   // Código solución (para validación)
  testCases       Json?    // Casos de prueba: [{input: "...", expected: "..."}]
  validationType  String   @default("exact") // "exact", "contains", "regex", "custom"
  hints           String[] // Array de pistas progresivas
  isPublished     Boolean  @default(false)
  
  // Relaciones
  lesson          Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  submissions     CodeSubmission[]
  
  @@map("exercises")
}

// Progreso del usuario en lecciones
model Progress {
  id          String    @id @default(cuid())
  userId      String
  lessonId    String
  status      String    // "not_started", "in_progress", "completed"
  completedAt DateTime?
  lastAccessedAt DateTime @default(now())
  
  // Relaciones
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson      Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  @@unique([userId, lessonId])
  @@map("progress")
}

// Envíos de código de los usuarios
model CodeSubmission {
  id          String   @id @default(cuid())
  userId      String
  exerciseId  String
  code        String   // Código enviado
  output      String?  // Salida de la ejecución
  isCorrect   Boolean?
  error       String?  // Error si lo hubo
  attempts    Int      @default(1)
  createdAt   DateTime @default(now())
  
  // Relaciones
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercise    Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  
  @@map("code_submissions")
}

// Preparación para monetización (suscripciones)
model Subscription {
  id              String    @id @default(cuid())
  userId          String
  stripeCustomerId String?
  stripeSubscriptionId String?
  status          String    // "active", "canceled", "past_due", etc.
  plan            String    // "free", "premium", "pro"
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relaciones
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("subscriptions")
}

// Contenido interactivo embebido en posts del blog
model InteractiveSnippet {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  code        String
  description String?
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  @@map("interactive_snippets")
}
```

---

## Estructura de Carpetas

```
app/
├── (main)/                    # Grupo de rutas públicas
│   ├── page.tsx               # Home actual
│   ├── posts/
│   ├── tutoriales/            # 🔥 NUEVO
│   │   ├── page.tsx           # Listado de cursos
│   │   ├── [courseSlug]/      # Curso específico
│   │   │   ├── page.tsx       # Vista del curso
│   │   │   └── [lessonSlug]/  # Lección específica
│   │   │       └── page.tsx   # Vista de lección con editor
│   │   └── layout.tsx
│   └── layout.tsx
├── api/                       # API Routes
│   ├── auth/[...nextauth]/    # NextAuth.js
│   │   └── route.ts
│   ├── lessons/               # CRUD de lecciones
│   ├── exercises/             # CRUD de ejercicios
│   ├── progress/              # Tracking de progreso
│   └── admin/                 # Rutas protegidas para admin
│       └── ...
├── admin/                     # 🔥 Panel de Administración
│   ├── layout.tsx             # Layout con sidebar
│   ├── page.tsx               # Dashboard admin
│   ├── cursos/
│   │   ├── page.tsx           # Listar cursos
│   │   ├── nuevo/page.tsx     # Crear curso
│   │   └── [id]/
│   │       ├── page.tsx       # Editar curso
│   │       └── lecciones/
│   │           ├── page.tsx
│   │           └── [lessonId]/
│   │               └── page.tsx
│   ├── ejercicios/
│   └── snippets/              # Snippets interactivos para blog
├── components/                # Componentes reutilizables
│   ├── ui/                    # shadcn/ui components
│   ├── python-editor/         # 🔥 Editor Python interactivo
│   │   ├── PythonEditor.tsx   # Componente principal
│   │   ├── CodeRunner.tsx     # Ejecución Pyodide
│   │   ├── OutputPanel.tsx    # Panel de resultados
│   │   ├── ExerciseValidator.tsx
│   │   └── hooks/
│   │       ├── usePyodide.ts
│   │       └── useCodeExecution.ts
│   ├── lessons/               # Componentes de lecciones
│   │   ├── LessonContent.tsx
│   │   ├── LessonNavigation.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ExerciseCard.tsx
│   └── blog/                  # Componentes del blog existente
│       └── InteractiveCode.tsx # 🔥 Nuevo: código interactivo en posts
├── lib/
│   ├── auth.ts                # Configuración NextAuth
│   ├── prisma.ts              # Cliente Prisma
│   ├── pyodide/               # 🔥 Configuración Pyodide
│   │   ├── loader.ts
│   │   └── stdlib.ts
│   └── utils.ts
└── types/
    └── index.ts               # Tipos TypeScript

components/ui/                 # shadcn/ui (instalado vía CLI)

prisma/
├── schema.prisma              # Esquema de base de datos
└── migrations/                # Migraciones generadas

public/
├── pyodide/                   # 🔥 Archivos Pyodide (CDN fallback)
└── ...

lib/                           # Utilidades existentes
├── posts.tsx
└── getFormattedDate.ts

docs/
└── plans/
    └── 2025-02-22-python-tutorial-design.md  # Este documento
```

---

## Componentes Clave

### 1. PythonEditor Component

Editor de código con Monaco + ejecución Pyodide.

```typescript
interface PythonEditorProps {
  initialCode?: string;
  exerciseId?: string;           // Si es ejercicio, validar solución
  onSuccess?: () => void;        // Callback al completar ejercicio
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
  showSolution?: boolean;
  height?: string;
  validation?: {
    type: 'exact' | 'contains' | 'regex' | 'custom';
    expected?: string;
    testCases?: TestCase[];
  };
}
```

### 2. LessonContent Component

Renderiza contenido Markdown con bloques interactivos especiales.

```typescript
interface LessonContentProps {
  content: string;  // Markdown con sintaxis especial:
                   // ```python-interactive
                   // print("Hola")
                   // ```
                   // 
                   // <Exercise id="ex-123" />
}
```

### 3. InteractiveCode (para blog posts)

Permite insertar código ejecutable en cualquier post de blog.

```typescript
interface InteractiveCodeProps {
  code: string;
  title?: string;
  description?: string;
  editable?: boolean;
  collapsible?: boolean;
}
```

**Uso en Markdown:**
```markdown
## Introducción a Python

Python es un lenguaje versátil. Prueba este código:

<InteractiveCode 
  code="print('Hola Mundo')"
  description="Ejecuta tu primer programa Python"
/>
```

---

## Flujo de Datos

### Ejecución de Código (Cliente-side con Pyodide)

```
1. Usuario escribe código en Monaco Editor
         │
         ▼
2. Click "Ejecutar" / Ctrl+Enter
         │
         ▼
3. usePyodide hook carga Pyodide (lazy load)
         │
         ▼
4. Código se ejecuta en WebAssembly sandbox
         │
         ▼
5. Captura stdout/stderr + cualquier excepción
         │
         ▼
6. Muestra resultado en OutputPanel
         │
         ▼
7. Si es ejercicio: valida contra solución/test cases
         │
         ▼
8. Si es correcto: 
   - Muestra mensaje de éxito
   - Llama API para guardar progreso
   - Habilita "Siguiente lección"
```

### Guardado de Progreso (Servidor)

```
Usuario completa ejercicio/lección
         │
         ▼
POST /api/progress
{
  lessonId: "...",
  exerciseId: "...",
  status: "completed"
}
         │
         ▼
Server: Verifica autenticación (NextAuth session)
         │
         ▼
Server: Upsert en tabla Progress
         │
         ▼
Response: { success: true, nextLesson: {...} }
```

---

## Curso Python Inicial (10-15 Lecciones)

### Estructura Propuesta

```
📚 Python desde Cero
├── Módulo 1: Fundamentos
│   ├── Lección 1: Tu primer programa (print, comentarios)
│   ├── Lección 2: Variables y tipos de datos
│   ├── Lección 3: Operadores (aritméticos, comparación)
│   └── Lección 4: Input del usuario
├── Módulo 2: Control de Flujo
│   ├── Lección 5: Condicionales (if/elif/else)
│   ├── Lección 6: Bucles for
│   ├── Lección 7: Bucles while
│   └── Lección 8: Ejercicios prácticos
├── Módulo 3: Estructuras de Datos
│   ├── Lección 9: Listas
│   ├── Lección 10: Diccionarios
│   ├── Lección 11: Tuplas y Sets
│   └── Lección 12: Comprensiones de listas
└── Módulo 4: Funciones
    ├── Lección 13: Definir y llamar funciones
    ├── Lección 14: Parámetros y retorno
    └── Lección 15: Ejercicio final integrador
```

### Ejemplo de Ejercicio (Lección 2 - Variables)

```yaml
lesson: "Variables y tipos de datos"
exercise:
  title: "Calcula el área de un rectángulo"
  instructions: |
    Crea dos variables: `base` con valor 10 y `altura` con valor 5.
    Luego calcula el área multiplicando base * altura.
    Finalmente, imprime el resultado con el mensaje:
    "El área es: {resultado}"
  starter_code: |
    # Define las variables aquí
    base = 
    altura = 
    
    # Calcula el área
    
    # Imprime el resultado
  solution: |
    base = 10
    altura = 5
    area = base * altura
    print(f"El área es: {area}")
  validation:
    type: "contains"
    expected: "El área es: 50"
  hints:
    - "Recuerda usar el operador * para multiplicar"
    - "Usa print() para mostrar el resultado"
    - "Puedes usar f-strings: print(f'El área es: {area}')"
```

---

## Sistema de Autenticación

### Configuración NextAuth.js

```typescript
// app/lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    GitHub,
    Credentials({
      // Para desarrollo/testing
    })
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    }
  }
});
```

### Middleware de Protección

```typescript
// middleware.ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  // Proteger rutas /admin y /tutoriales/progreso
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!req.auth || req.auth.user.role !== "admin") {
      return Response.redirect(new URL("/", req.url));
    }
  }
});
```

---

## Panel de Administración

### Características

1. **Dashboard**
   - Estadísticas: usuarios activos, lecciones completadas, ejercicios resueltos
   - Gráficos de progreso

2. **Gestión de Cursos**
   - Crear/editar/eliminar cursos
   - Ordenar lecciones (drag & drop)
   - Publicar/despublicar

3. **Gestión de Lecciones**
   - Editor Markdown con preview en vivo
   - Insertar bloques de código interactivo
   - Configurar ejercicios asociados

4. **Gestión de Ejercicios**
   - Editor de código con test cases
   - Validación de soluciones
   - Gestión de pistas

5. **Snippets Interactivos**
   - Crear snippets reutilizables para posts del blog
   - Generar código de inserción

---

## Preparación para Monetización

### Estructura de Planes (Futuro)

```typescript
// Configuración de planes
const PLANS = {
  free: {
    name: "Gratis",
    features: [
      "Acceso a primeras 5 lecciones",
      "Ejercicios básicos",
      "Comunidad Discord"
    ],
    maxLessons: 5
  },
  premium: {
    name: "Premium",
    price: 9.99,
    features: [
      "Acceso completo a todos los cursos",
      "Proyectos prácticos",
      "Certificado de finalización",
      "Soporte prioritario"
    ],
    stripePriceId: "price_xxx"
  },
  pro: {
    name: "Pro",
    price: 19.99,
    features: [
      "Todo lo de Premium",
      "Mentorías 1:1 mensuales",
      "Proyectos revisados",
      "Acceso a contenido beta"
    ],
    stripePriceId: "price_yyy"
  }
};
```

### Preparación Técnica

- Modelo `Subscription` ya incluido en schema
- Middleware para verificar suscripción activa
- API routes listos para webhooks de Stripe
- Campos `plan` y `stripeCustomerId` en modelo User

---

## Instalación y Configuración

### Dependencias Necesarias

```bash
# Core
npm install next-auth@beta @auth/prisma-adapter
npm install prisma @prisma/client

# Editor Python
npm install @monaco-editor/react monaco-editor

# Pyodide
npm install pyodide

# UI y Estado
npm install @tanstack/react-query zustand
npm install lucide-react

# Markdown procesamiento (para lecciones)
npm install react-markdown remark-gfm rehype-highlight

# Formularios
npm install react-hook-form zod @hookform/resolvers

# Drag & drop (admin)
npm install @dnd-kit/core @dnd-kit/sortable
```

### Variables de Entorno (.env)

```env
# Database (ya configurada)
DATABASE_URL=postgresql://neondb_owner:npg_b4lvgNQs9Pmr@ep-small-cloud-aikm4utt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_seguro_generar_con_openssl

# OAuth Providers
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GITHUB_ID=tu_github_id
GITHUB_SECRET=tu_github_secret

# Stripe (futuro)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Plan de Implementación

### Fase 1: Fundamentos (Semana 1)
- [ ] Setup Prisma + migraciones iniciales
- [ ] Configurar NextAuth.js
- [ ] Crear layout base de tutoriales
- [ ] Implementar carga de Pyodide

### Fase 2: Editor Python (Semana 1-2)
- [ ] Componente Monaco Editor
- [ ] Hook usePyodide con lazy loading
- [ ] Panel de output con stdout/stderr
- [ ] Sistema de validación de ejercicios

### Fase 3: Contenido y Lecciones (Semana 2)
- [ ] Crear curso "Python desde Cero"
- [ ] Escribir 15 lecciones con contenido
- [ ] Crear 30+ ejercicios
- [ ] Implementar sistema de progreso

### Fase 4: Admin Panel (Semana 3)
- [ ] Layout de administración
- [ ] CRUD de cursos/lecciones/ejercicios
- [ ] Editor de contenido Markdown
- [ ] Dashboard con estadísticas

### Fase 5: Blog Integration (Semana 3)
- [ ] Componente InteractiveCode para posts
- [ ] Sistema de snippets reutilizables
- [ ] Documentación de uso

### Fase 6: Testing & Deploy (Semana 4)
- [ ] Tests unitarios y E2E
- [ ] Optimización de performance
- [ ] Deploy a Vercel
- [ ] Documentación final

---

## Consideraciones de UX/UI

### Diseño de Lecciones

- **Layout dividido**: Contenido a la izquierda (60%), editor a la derecha (40%)
- **Barra de progreso**: Visible siempre, muestra % del curso completado
- **Navegación**: Botones "Anterior/Siguiente" prominentes
- **Feedback inmediato**: Animaciones al completar ejercicios
- **Modo oscuro**: Heredar del tema del sitio

### Accesibilidad

- Navegación por teclado (Ctrl+Enter para ejecutar)
- ARIA labels en todos los controles
- Contraste adecuado
- Soporte para screen readers en output

### Performance

- Lazy loading de Pyodide (solo cuando se necesita)
- Caché de paquetes Python en localStorage
- Splitting de módulos de lecciones
- Prefetch de siguiente lección

---

## Tests

### Estrategia de Testing

```typescript
// Tests unitarios
- PythonEditor.tsx
- usePyodide hook
- Validación de ejercicios
- Utilidades de Markdown

// Tests de integración
- Flujo completo de lección
- Guardado de progreso
- Autenticación

// Tests E2E (Playwright)
- Usuario completa una lección
- Admin crea nuevo ejercicio
- Código interactivo en blog post
```

---

## Métricas de Éxito

- **Tiempo de carga de Pyodide**: < 3s en conexión promedio
- **Tiempo de ejecución de código**: < 500ms
- **Tasa de finalización de lecciones**: > 60%
- **NPS de usuarios**: > 50

---

## Documentación Adicional

### Para Desarrolladores
- API Reference
- Guía de contribución de lecciones
- Cómo agregar nuevos validadores de ejercicios

### Para Usuarios
- FAQ sobre Pyodide (limitaciones vs Python nativo)
- Atajos de teclado
- Guía de resolución de problemas comunes

---

## Conclusión

Este diseño proporciona una base sólida y escalable para el tutorial interactivo de Python, con:

✅ Arquitectura limpia y mantenible  
✅ Ejecución cliente-side sin costo de servidor  
✅ Panel de admin completo para gestión de contenido  
✅ Integración fluida con el blog existente  
✅ Preparado para monetización futura  
✅ Experiencia de usuario tipo DataCamp  

---

**Aprobado por:** [Usuario]  
**Fecha:** 2025-02-22  
**Versión:** 1.0
