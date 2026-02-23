# Rediseño Completo de la Plataforma - Design Doc

## Aprobado por: Eduardo Rico
## Fecha: 2025-02-22
## Enfoque: Mobile-First, Animaciones fluidas, UX/UI Premium

---

## 1. Sistema de Notificaciones con Sileo

### Componentes:
- `ToastProvider` - Wrapper global
- `toast()` API para success/error/warning/info
- Animaciones: slide-in desde arriba, fade-out
- Posición: top-center en móvil, top-right en desktop
- Acciones dentro del toast (undo, ver más)

### Animaciones CSS:
```css
@keyframes slideIn {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes fadeOut {
  to { opacity: 0; transform: translateY(-20px); }
}
```

---

## 2. Panel de Admin Completo

### 2.1 CMS - Gestión de Contenido

#### Cursos:
- Lista con filtros (estado, fecha, búsqueda)
- Formulario: título, slug, descripción, orden, publicado
- Preview en tiempo real
- Estadísticas rápidas (usuarios inscritos, progreso promedio)

#### Lecciones:
- Organización drag & drop
- Editor Markdown con toolbar
- Preview lado a lado
- Campos: título, slug, contenido, orden, estimación

#### Ejercicios:
- Tipos de validación: exact, contains, regex, custom
- Editor de casos de prueba
- Código inicial y solución
- Pistas progresivas

### 2.2 Dashboard Analítico

#### Gráficos (usando Recharts):
- Línea: Usuarios nuevos por día/semana/mes
- Barras: Cursos más populares
- Heatmap: Actividad por hora/día
- Circular: Tasa de completitud
- Tabla: Ejercicios más difíciles

#### Filtros de fecha:
- Hoy, 7 días, 30 días, 3 meses, 1 año, Custom

### 2.3 Gestión Avanzada de Usuarios

#### Lista de usuarios:
- Búsqueda por nombre/email
- Filtros: rol, estado, última actividad
- Ordenamiento: fecha, nombre, progreso
- Paginación server-side

#### Perfil detallado:
- Info básica + avatar
- Progreso visual por curso (barras circulares)
- Historial de actividad (timeline)
- Ejercicios resueltos/fallidos
- Acciones: suspender, resetear progreso, eliminar

### 2.4 Sistema de Anuncios

#### Tipos:
- Banner fijo en dashboard
- Toast de anuncio importante
- Modal de bienvenida

#### Campos:
- Título, mensaje, tipo (info, success, warning, error)
- Fecha inicio/fin
- Audiencia (todos, usuarios específicos, nuevos)
- Activo/inactivo

---

## 3. Animaciones CSS Globales

### Transiciones de página:
- Fade in suave (300ms ease-out)
- Slide up en cards (stagger 50ms)

### Micro-interacciones:
- Hover en botones: scale(1.02) + shadow
- Input focus: border animation
- Loading states: pulse + skeleton screens
- Success: confetti option

### Scroll animations:
- Fade in up al entrar en viewport
- Parallax suave en hero sections
- Sticky headers con blur

---

## 4. Mobile-First UX/UI

### Breakpoints:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

### Patrones mobile:
- Bottom sheet para acciones
- Swipe gestures donde aplique
- Touch targets mínimo 44px
- Simplified nav (hamburger)
- Pull-to-refresh

### Layouts:
- Single column en móvil
- Sidebar colapsable en tablet
- Full layout en desktop

---

## 5. Tests Completos

### Tests E2E (Playwright):
1. **Auth flow**: register → login → logout
2. **Curso flow**: ver curso → iniciar lección → completar ejercicio
3. **Admin flow**: crear curso → añadir lección → crear ejercicio → publicar
4. **User management**: ver usuarios → filtrar → ver perfil → suspender
5. **Analytics**: ver dashboard → cambiar filtros → exportar

### Tests Unitarios (Vitest):
- Utilidades: formatDate, validateEmail, etc.
- Componentes: renderizado, interacciones, estados
- Hooks: useAuth, useProgress, etc.
- API routes: handlers, responses, errores

### Tests de integración:
- Flujo completo de compra (futuro)
- Sincronización de progreso
- Notificaciones en tiempo real

---

## 6. Componentes UI Nuevos

### Sistema de Diseño:
- `Button` - Variantes: primary, secondary, ghost, danger
- `Input` - Con iconos, estados, validación
- `Select` - Custom dropdown
- `Modal` - Con animaciones
- `Card` - Variantes: default, hover, interactive
- `Skeleton` - Loading states
- `Badge` - Estados y categorías
- `Avatar` - Con fallback e iniciales
- `Tooltip` - Info on hover
- `Tabs` - Navegación por secciones
- `Accordion` - Contenido colapsable
- `Table` - Con sorting, filtering, pagination
- `Chart` - Wrapper de Recharts
- `DatePicker` - Selector de fechas
- `Search` - Con autocomplete
- `FileUpload` - Drag & drop

---

## 7. Estructura de Archivos Propuesta

```
app/
  admin/
    page.tsx                    # Dashboard analítico
    cursos/
      page.tsx                  # Lista de cursos
      [id]/
        page.tsx               # Editar curso
      nuevo/
        page.tsx               # Crear curso
    lecciones/
      page.tsx                  # Lista de lecciones
      [id]/
        page.tsx               # Editar lección
    ejercicios/
      page.tsx                  # Lista de ejercicios
      [id]/
        page.tsx               # Editar ejercicio
    usuarios/
      page.tsx                  # Lista de usuarios
      [id]/
        page.tsx               # Perfil detallado
    anuncios/
      page.tsx                  # Gestión de anuncios
components/
  ui/                          # Componentes base (shadcn/sileo style)
    button.tsx
    input.tsx
    card.tsx
    modal.tsx
    toast.tsx
    skeleton.tsx
    badge.tsx
    avatar.tsx
    tooltip.tsx
    tabs.tsx
    accordion.tsx
    table.tsx
    chart.tsx
    date-picker.tsx
    search.tsx
    file-upload.tsx
  admin/
    analytics-dashboard.tsx
    course-form.tsx
    lesson-editor.tsx
    exercise-builder.tsx
    user-detail-modal.tsx
    announcement-manager.tsx
    data-table.tsx
    stats-card.tsx
  hooks/
    use-toast.ts
    use-analytics.ts
    use-debounce.ts
    use-local-storage.ts
lib/
  animations.ts               # Utilidades de animación CSS
  utils.ts                    # Helpers generales
  validations.ts              # Esquemas de validación
```

---

## 8. Dependencias Nuevas

```json
{
  "sileo": "^latest",
  "recharts": "^2.x",
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "framer-motion": "^11.x",
  "date-fns": "^3.x",
  "zod": "^3.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x"
}
```

---

## 9. Métricas de Éxito

- [ ] Tiempo de carga < 2s
- [ ] Lighthouse score > 90
- [ ] 100% de cobertura de tests E2E críticos
- [ ] 80% de cobertura de tests unitarios
- [ ] Mobile responsiveness en todos los componentes
- [ ] Animaciones a 60fps
- [ ] Accesibilidad WCAG 2.1 AA

---

## Aprobación

✅ **Aprobado para implementación**
