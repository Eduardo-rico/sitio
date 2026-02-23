# Blog de Eduardo Rico con Tutoriales Interactivos de Python

Sitio personal de Eduardo Rico (Químico, Data Scientist y AI Researcher) con un sistema de tutoriales interactivos de Python integrado.

## 🚀 Características

- **Blog personal**: Posts sobre Data Science, NLP y PyTorch
- **Tutoriales interactivos de Python**: Editor de código con ejecución en el navegador
- **Ejercicios prácticos**: Validación automática de soluciones
- **Panel de administración**: Gestión de cursos, lecciones y ejercicios
- **Autenticación**: NextAuth.js con Google y GitHub
- **Base de datos**: PostgreSQL con Prisma ORM
- **Dashboard con Analytics**: Visualización de datos con Recharts
- **Formularios avanzados**: React Hook Form con validación Zod
- **Drag & Drop**: Ordenamiento de elementos con @dnd-kit
- **Animaciones fluidas**: Transiciones con Framer Motion

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Python Runtime**: Pyodide (WebAssembly)
- **Editor**: Monaco Editor
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Drag & Drop**: @dnd-kit
- **Testing**: Vitest + React Testing Library + Playwright
- **Deployment**: Vercel

## 📦 Instalación

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd blog
```

2. Instalar dependencias:
```bash
# Usando pnpm (recomendado)
pnpm install

# O usando npm
npm install

# O usando yarn
yarn install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

4. Generar cliente Prisma y ejecutar migraciones:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Poblar la base de datos con contenido inicial:
```bash
npx prisma db seed
```

6. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🗄️ Estructura de la Base de Datos

### Modelos principales:

- **User**: Usuarios (con NextAuth)
- **Course**: Cursos de tutoriales
- **Lesson**: Lecciones dentro de cursos
- **Exercise**: Ejercicios prácticos
- **Progress**: Progreso de usuarios
- **CodeSubmission**: Envíos de código
- **Subscription**: Suscripciones (preparado para monetización)

## 🎓 Contenido del Curso Python

El curso "Python desde Cero" incluye:

1. **Tu primer programa** - print, comentarios
2. **Variables y tipos de datos** - int, float, str, bool
3. **Operadores aritméticos** - +, -, *, /, //, %, **
4. **Condicionales** - if, elif, else
5. **Bucles for** - Iteración y range()

## 🔧 Scripts disponibles

### Desarrollo
```bash
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Build de producción
npm run start            # Iniciar servidor de producción
npm run lint             # Ejecutar ESLint
```

### Base de datos
```bash
npm run db:generate      # Generar cliente Prisma
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Poblar base de datos
npm run db:studio        # Abrir Prisma Studio
```

### Testing
```bash
# Tests unitarios e integración (Vitest)
npm run test             # Ejecutar tests en modo watch
npm run test:ui          # Ejecutar tests con UI de Vitest
npm run test:coverage    # Generar reporte de cobertura

# Tests E2E (Playwright)
npm run test:e2e         # Ejecutar tests E2E
npm run test:e2e:ui      # Ejecutar tests E2E con UI
```

## 🧪 Testing

### Tests Unitarios y de Integración (Vitest)

Los tests están ubicados en la carpeta `tests/`. Utilizamos:
- **Vitest**: Framework de testing
- **React Testing Library**: Tests de componentes React
- **jsdom**: Entorno de navegador simulado
- **@testing-library/jest-dom**: Matchers adicionales

Ejemplo de test:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MiComponente from '@/components/MiComponente'

describe('MiComponente', () => {
  it('debería renderizar correctamente', () => {
    render(<MiComponente />)
    expect(screen.getByText('Hola Mundo')).toBeInTheDocument()
  })
})
```

### Tests E2E (Playwright)

Los tests E2E están en la carpeta `tests/e2e/`. Configurados para:
- Ejecutar en múltiples navegadores (Chromium, Firefox, WebKit)
- Modo headless y con UI
- Screenshots automáticos en fallos

## 🎨 Sistema de Diseño (Sileo Theme)

### Colores principales
- **Primary (Sileo)**: Azul cian (`sileo-500: #0ea5e9`)
- **Accent**: Naranja (`accent-500: #f97316`)
- **Success**: Verde (`success: #22c55e`)
- **Warning**: Amarillo (`warning: #eab308`)
- **Error**: Rojo (`error: #ef4444`)

### Animaciones disponibles
- `animate-fade-in` / `animate-fade-out`
- `animate-slide-up` / `animate-slide-down`
- `animate-bounce-in`
- `animate-scale-in`
- `animate-float`
- `animate-shimmer`

## 📝 Panel de Administración

Accede a `/admin` para gestionar:
- Cursos (crear, editar, publicar)
- Lecciones con contenido Markdown
- Ejercicios con código inicial y soluciones
- Estadísticas de uso con gráficos interactivos

## 🔐 Variables de Entorno

Ver `.env.example` para todas las variables disponibles:

```env
# Database
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...

# Stripe (opcional)
STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# App
NODE_ENV=development
PORT=3000
```

## 🚀 Deploy en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno en el dashboard de Vercel
3. Agregar `DATABASE_URL` en Vercel
4. Ejecutar migraciones: `npx prisma migrate deploy`
5. ¡Listo! La app se desplegará automáticamente con cada push a `main`

## 📁 Estructura del Proyecto

```
.
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel de administración
│   ├── api/               # API Routes
│   ├── courses/           # Páginas de cursos
│   └── ...
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, etc.)
│   └── ...
├── lib/                   # Utilidades y helpers
├── prisma/               # Schema y migraciones de Prisma
├── tests/                # Tests unitarios y de integración
├── tests/e2e/           # Tests E2E con Playwright
├── types/               # Tipos TypeScript globales
└── public/              # Archivos estáticos
```

## 📄 Licencia

MIT - Eduardo Rico

---

Desarrollado con ❤️ y ☕ por Eduardo Rico
