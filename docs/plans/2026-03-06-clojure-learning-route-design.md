# Clojure Learning Route Design

Date: 2026-03-06
Status: approved

## Goal
Expand the current single-entry Clojure course into a scalable four-course route while preserving the existing `clojure-desde-cero` slug and browser-only runtime.

## Recommended approach
Keep `clojure-desde-cero` as the onboarding course and add three progressively advanced courses above it.

## Route structure
1. `clojure-desde-cero`
- REPL mindset
- expressions and collections
- pure functions
- `map` / `filter` / `reduce`
- destructuring

2. `clojure-intermedio`
- sequences and laziness
- recursion and `loop/recur`
- namespaces and reusable functions
- functional data modeling

3. `clojure-datos-y-transformacion`
- nested maps and vectors
- threading macros
- transformation pipelines
- aggregation and reporting use cases

4. `clojure-macros-estado-y-arquitectura`
- atoms and controlled state
- macro fundamentals
- architecture patterns for small systems
- separation between pure logic and effects

## Pedagogical principles
- Each lesson must include: concept brief, worked example, guided exercise, independent exercise, reflection prompt.
- Each course should have measurable outcomes and objective validations.
- Difficulty should ramp gradually with no macro/state content before the learner has sequence fluency.
- Bibliography should mix official docs, one practical resource, and one advanced source.

## Technical constraints
- Browser-only runtime.
- Use the existing Clojure runtime path based on Scittle.
- Prefer Clojure core forms and functions to reduce browser runtime compatibility risk.
- Avoid external dependencies that are not guaranteed in the browser runtime.

## Implementation scope
- Replace the placeholder Clojure seed content with a complete four-course route.
- Add course-specific bibliography entries for all Clojure course slugs.
- Keep URL stability for `clojure-desde-cero`.
- Reorder language foundation courses so the Clojure route appears grouped in the catalog.
- Verify with `tsc` and `vitest`.

## Risks and controls
- Risk: over-indexing on Lisp theory.
  Control: every lesson ends in concrete output-producing exercises.
- Risk: unsupported runtime features.
  Control: stay within core language constructs and simple macros.
- Risk: weak progression.
  Control: explicit path from expressions -> sequences -> data pipelines -> macros/state.
