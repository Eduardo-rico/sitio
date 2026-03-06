# Combined Clojure Pedagogy and Spec/Tooling Release Design

## Scope

Release one combined block that:

1. Commits the pending local foundation work already validated in unit tests.
2. Extends the Clojure route with a fifth course focused on `spec`, testing and tooling.
3. Generalizes editable pedagogy from Python-only to a language-aware system for Python and Clojure.

## Product Decisions

- Preserve the existing Clojure route and append a fifth course instead of restructuring URLs.
- Keep a single admin pedagogy editor with the same UX, backed by a shared pedagogy contract.
- Support editable pedagogy only for languages that already have curated learning paths with measurable scaffolding: Python and Clojure.
- Keep browser-only execution constraints in mind for Clojure content. Prefer executable examples that work with the current runtime instead of assuming full JVM tooling support.

## Architecture

### Shared Pedagogy Contract

- Introduce a shared pedagogy model with:
  - learner profile
  - time commitment
  - prerequisites
  - learning outcomes
  - assessment plan
  - rubric dimensions
  - mastery criteria
  - bibliography guidance
  - lesson stages
- Keep language-specific defaults in dedicated files and resolve them through a small registry.

### Editable Pedagogy Flow

- Admin course page keeps the same editor component.
- The editor resolves defaults by `course.language` and `course.slug`.
- The admin API accepts updates only for supported languages and validates against the shared pedagogy schema.
- Public course and lesson pages resolve pedagogy through the registry, so Python and Clojure share the same rendering path.

### Clojure Route Extension

Add a fifth course:

- `clojure-spec-testing-y-tooling`

Sequence:

1. Spec basics and predicate-driven validation
2. Explaining, conforming and validating nested data
3. Idiomatic testing with `deftest` / `is` patterns
4. REPL workflow, namespaces, debugging and delivery habits

## Error Handling

- Unsupported languages return a clear admin API error instead of silently accepting payloads.
- Invalid stored pedagogy falls back to curated in-code defaults.
- Public pages remain resilient: if no pedagogy exists for a course, the page still renders normally.

## Testing

- Add unit coverage for:
  - shared pedagogy registry behavior
  - Clojure pedagogy defaults and fallback rules
  - bibliography coverage for the fifth Clojure course
- Re-run `tsc` and `vitest`.
- Do not run Playwright in this release unless explicitly requested.
