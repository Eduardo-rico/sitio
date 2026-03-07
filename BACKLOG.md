# Backlog de Testing

## Resumen de Tests Creados

Se crearon **556 tests unitarios** con **99.73% de cobertura** de líneas.

### Archivos de Tests Creados

#### Lib (16 archivos)
- `tests/unit/lib/animations.test.ts` - 69 tests
- `tests/unit/lib/auth.config.test.ts` - 11 tests
- `tests/unit/lib/clojure-course-pedagogy.test.ts` - 21 tests
- `tests/unit/lib/course-bibliography.test.ts` - 10 tests
- `tests/unit/lib/course-pedagogy.test.ts` - 23 tests
- `tests/unit/lib/course-pedagogy-registry.test.ts` - 13 tests
- `tests/unit/lib/course-runtime.test.ts` - 4 tests
- `tests/unit/lib/exercise-language-presets.test.ts` - 5 tests
- `tests/unit/lib/exercise-submission-output.test.ts` - 8 tests
- `tests/unit/lib/getFormattedDate.test.ts` - 11 tests
- `tests/unit/lib/issue-tickets.test.ts` - 2 tests
- `tests/unit/lib/learning-events.test.ts` - 10 tests
- `tests/unit/lib/normalize-auth-url-env.test.ts` - 22 tests
- `tests/unit/lib/password.test.ts` - 9 tests
- `tests/unit/lib/prisma.test.ts` - 6 tests
- `tests/unit/lib/python-course-pedagogy.test.ts` - 18 tests
- `tests/unit/lib/site-url.test.ts` - 30 tests
- `tests/unit/lib/utils.test.ts` - 23 tests
- `tests/unit/lib/validations.test.ts` - 24 tests

#### Hooks (6 archivos)
- `tests/unit/hooks/use-bottom-sheet.test.ts` - 40 tests
- `tests/unit/hooks/use-code-execution.test.ts` - 2 tests
- `tests/unit/hooks/use-debounce.test.ts` - 13 tests
- `tests/unit/hooks/use-local-storage.test.ts` - 19 tests
- `tests/unit/hooks/use-media-query.test.ts` - 13 tests
- `tests/unit/hooks/use-toast.test.ts` - 18 tests

#### Components (6 archivos)
- `tests/unit/components/avatar.test.tsx` - 25 tests
- `tests/unit/components/badge.test.tsx` - 24 tests
- `tests/unit/components/ui/button.test.tsx` - 19 tests
- `tests/unit/components/ui/card.test.tsx` - 24 tests
- `tests/unit/components/ui/input.test.tsx` - 26 tests
- `tests/unit/components/ui/toast.test.tsx` - 14 tests

---

## Áreas para Mejorar Cobertura

### 1. Hooks con casos SSR no cubiertos

**Archivo:** `hooks/use-local-storage.ts` (95.87%)
- Líneas 24-25: Early return cuando `window` es undefined (SSR)
- Líneas 86-87: Early return en `useRemoveLocalStorage` cuando `window` es undefined

**Archivo:** `hooks/use-media-query.ts` (94.28%)
- Líneas 24-25: Early return cuando `window` es undefined (SSR)
- Líneas 53-54: Early return en `useIsTouchDevice` cuando `window` es undefined

**Nota:** Estos casos son difíciles de testear porque requieren simular un entorno SSR donde `window` no está disponible. Vitest/jsdom siempre tiene `window` definido.

### 2. Callbacks de manejo de errores

**Archivo:** `hooks/use-bottom-sheet.ts` (98.73%)
- Líneas 93-94: Callback `onOpen` y `onClose` llamados después de setState

**Archivo:** `components/ui/avatar.tsx` (83.33% funciones)
- Líneas 107, 113: Funciones de manejo de eventos onError/onLoad de imagen

### 3. Funciones complejas que requieren mocks avanzados

**Archivo:** `components/python-editor/useCodeExecution.ts`
- Tests existentes cubren casos básicos de Python
- Faltan tests para: JavaScript, TypeScript, SQL, Clojure, Go, Rust, Bash
- Requiere mockear Workers, TypeScript compiler, y runtime WASM

**Archivo:** `components/python-editor/usePyodide.ts`
- Tests existentes cubren carga de Pyodide
- Faltan tests para casos de error de carga, timeouts, y reintentos

**Archivo:** `components/python-editor/wasm-language-runtime.ts`
- No tiene tests propios
- Se testea indirectamente a través de useCodeExecution
- Requiere mockear carga de scripts externos (CDN) y runtime Wasmer

---

## Decisiones de Testing

### 1. No testear `lib/auth.ts`
**Razón:** El archivo `lib/auth.ts` inicializa NextAuth con PrismaAdapter y credenciales. Testearlo requeriría:
- Mockear completamente NextAuth
- Mockear PrismaAdapter
- Mockear bcrypt para verificación de passwords
- La lógica principal ya está testeada en `auth.config.test.ts` y `password.test.ts`

### 2. No testear funciones de runtime WASM completo
**Razón:** Las funciones en `wasm-language-runtime.ts` cargan scripts externos desde CDN y ejecutan código WebAssembly. Testearlas requeriría:
- Mockear la carga dinámica de scripts
- Mockear el runtime de Wasmer
- Mockear evaluadores de Clojure/Go/Rust/Bash
- Estas son más apropiadas para tests de integración/E2E

---

## Recomendaciones para el Futuro

1. **Tests de Integración para Runtimes:** Crear tests de integración con Playwright que ejecuten código real en cada lenguaje soportado.

2. **Tests E2E para Editor:** Crear flujos E2E que validen la ejecución de código en el editor de cada lenguaje.

3. **Cobertura de Casos Edge:** Agregar tests para manejo de errores de red cuando falla la carga de Pyodide o scripts WASM.

4. **Tests de Performance:** Considerar tests de rendimiento para la ejecución de código, especialmente para Python con pandas/matplotlib.

---

## Estado Actual

```
Test Files  31 passed (31)
Tests       556 passed (556)
Duration    ~9s

Coverage:
- Statements: 99.73%
- Branches:   97.94%
- Functions:  98.57%
- Lines:      99.73%
```

Todos los tests pasan y la cobertura supera los umbrales configurados (80%).
