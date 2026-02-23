# Blog de Eduardo Rico con Tutoriales Interactivos de Python

Sitio personal de Eduardo Rico (Químico, Data Scientist y AI Researcher) con un sistema de tutoriales interactivos de Python integrado.

## 🚀 Características

- **Blog personal**: Posts sobre Data Science, NLP y PyTorch
- **Tutoriales interactivos de Python**: Editor de código con ejecución en el navegador
- **Ejercicios prácticos**: Validación automática de soluciones
- **Panel de administración**: Gestión de cursos, lecciones y ejercicios
- **Autenticación**: NextAuth.js con Google y GitHub
- **Base de datos**: PostgreSQL con Prisma ORM

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 13+ (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Python Runtime**: Pyodide (WebAssembly)
- **Editor**: Monaco Editor
- **Estilos**: Tailwind CSS
- **Deployment**: Vercel

## 📦 Instalación

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd blog
```

2. Instalar dependencias:
```bash
npm install
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

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Build de producción
npm run start            # Iniciar servidor de producción

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Poblar base de datos
npm run db:studio        # Abrir Prisma Studio

# Testing
npm run test             # Tests unitarios (Vitest)
npm run test:e2e         # Tests E2E (Playwright)
```

## 📝 Panel de Administración

Accede a `/admin` para gestionar:
- Cursos (crear, editar, publicar)
- Lecciones con contenido Markdown
- Ejercicios con código inicial y soluciones
- Estadísticas de uso

## 🔐 Variables de Entorno

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
```

## 🚀 Deploy en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Agregar `DATABASE_URL` en Vercel
4. Ejecutar migraciones: `npx prisma migrate deploy`

## 🧪 Testing

### Unit tests con Vitest:
```bash
npm run test
```

### E2E tests con Playwright:
```bash
npx playwright install
npm run test:e2e
```

## 📄 Licencia

MIT - Eduardo Rico

---

Desarrollado con ❤️ y ☕ por Eduardo Rico
