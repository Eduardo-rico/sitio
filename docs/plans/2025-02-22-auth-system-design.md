# Sistema de Autenticación con Email/Password - Design Doc

## Aprobado por: Eduardo Rico
## Fecha: 2025-02-22

---

## 1. Resumen

Implementar sistema completo de autenticación que permita a usuarios registrarse y loguearse con email/password, además del OAuth existente (Google/GitHub). Incluir panel de admin con estadísticas y dashboard de usuario con progreso.

## 2. Cambios en Base de Datos

### 2.1 Schema Modifications

```prisma
// User model additions
model User {
  // ... existing fields ...
  passwordHash    String?   // Opcional para OAuth users
  emailVerified   DateTime?
  // ...
}

// New table for password reset tokens
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  @@unique([email, token])
  @@map("password_reset_tokens")
}
```

### 2.2 Seed Data

Admin user pre-creado:
- Email: `emrs94@gmail.com`
- Password: `Xaralit4!` (bcrypt hashed)
- Role: `admin`

## 3. Flujo de Autenticación

### 3.1 Login con Credentials

Provider: `CredentialsProvider` de NextAuth v5

```typescript
CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    // Validate credentials
    // Compare password with bcrypt
    // Return user object or null
  }
})
```

### 3.2 Registro

Endpoint: `POST /api/auth/register`

Flow:
1. Validate unique email
2. Hash password with bcrypt (10 rounds)
3. Create user with role="user"
4. Return success, redirect to login

### 3.3 Cambio de Password

Endpoint: `POST /api/user/change-password`

Flow:
1. Verify session
2. Validate currentPassword with bcrypt
3. Hash and save newPassword

### 3.4 Seguridad de Roles

- Solo admins pueden cambiar roles a admin
- Middleware protege rutas /admin
- Role check en API routes sensibles

## 4. UI Components

### 4.1 Auth Pages

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/auth/signin` | `SignInPage` | Login form + OAuth buttons |
| `/auth/signup` | `SignUpPage` | Registration form |

### 4.2 User Dashboard (`/dashboard`)

Components:
- `ProgressOverview`: Stats cards (courses %, lessons completed)
- `MyCourses`: Course list with progress bars
- `RecentActivity`: Last accessed lessons/exercises
- `UserSettings`: Profile edit + password change

### 4.3 Admin Panel (`/admin`)

Components:
- `AdminStats`: Dashboard with site analytics
- `UserManagement`: Table with role editing (admin only)
- `CourseManager`: CRUD for courses/lessons/exercises

### 4.4 Protección de Rutas

- Middleware: Check session, redirect to /auth/signin
- Role guard: Check admin role for /admin routes

## 5. API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Create new user |
| `/api/user/change-password` | POST | Yes | Update password |
| `/api/user/profile` | GET/PUT | Yes | Get/update profile |
| `/api/admin/users` | GET | Admin | List all users |
| `/api/admin/users/[id]` | PUT | Admin | Update user role |
| `/api/user/progress` | GET | Yes | Get user progress stats |

## 6. Dependencias

```json
{
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.6"
}
```

## 7. Estructura de Archivos

```
lib/
  auth.ts              # NextAuth config + CredentialsProvider
  password.ts          # bcrypt helpers
  user.ts              # User CRUD operations

app/
  api/
    auth/
      register/route.ts
    user/
      change-password/route.ts
      profile/route.ts
      progress/route.ts
    admin/
      users/route.ts
      users/[id]/route.ts
      stats/route.ts
  auth/
    signin/page.tsx
    signup/page.tsx
  dashboard/
    page.tsx
    layout.tsx
  admin/
    page.tsx
    layout.tsx
    users/page.tsx

components/
  auth/
    SignInForm.tsx
    SignUpForm.tsx
  dashboard/
    ProgressOverview.tsx
    MyCourses.tsx
    RecentActivity.tsx
    UserSettings.tsx
  admin/
    AdminStats.tsx
    UserTable.tsx
    RoleEditor.tsx
```

## 8. Notas de Implementación

- Usar `bcryptjs` en lugar de `bcrypt` para evitar dependencias nativas
- Password hash siempre con salt rounds = 10
- Email siempre único (ya está en schema)
- OAuth users pueden agregar password después desde settings
- Sanitizar inputs en todos los forms
- Rate limiting en endpoints de auth (opcional futuro)
