import type { ZodTypeAny } from "zod";
import type { CourseLanguage } from "@/lib/course-runtime";
import type { CoursePedagogy } from "@/lib/course-pedagogy";
import {
  clojureCoursePedagogyInputSchema,
  resolveClojureCoursePedagogy,
} from "@/lib/clojure-course-pedagogy";
import {
  pythonCoursePedagogyInputSchema,
  resolvePythonCoursePedagogy,
} from "@/lib/python-course-pedagogy";

export const EDITABLE_COURSE_PEDAGOGY_LANGUAGES = ["python", "clojure"] as const;

export type EditableCoursePedagogyLanguage =
  (typeof EDITABLE_COURSE_PEDAGOGY_LANGUAGES)[number];

export function supportsEditableCoursePedagogy(
  language: string
): language is EditableCoursePedagogyLanguage {
  return EDITABLE_COURSE_PEDAGOGY_LANGUAGES.includes(
    language as EditableCoursePedagogyLanguage
  );
}

export function isEditableCoursePedagogyLanguage(
  language: CourseLanguage
): language is EditableCoursePedagogyLanguage {
  return supportsEditableCoursePedagogy(language);
}

export function getCoursePedagogyInputSchema(language: string): ZodTypeAny | null {
  if (!supportsEditableCoursePedagogy(language)) {
    return null;
  }

  switch (language) {
    case "python":
      return pythonCoursePedagogyInputSchema;
    case "clojure":
      return clojureCoursePedagogyInputSchema;
  }
}

export function resolveCoursePedagogy(
  language: string,
  slug: string,
  rawPedagogy?: unknown
): CoursePedagogy | null {
  if (!supportsEditableCoursePedagogy(language)) {
    return null;
  }

  switch (language) {
    case "python":
      return resolvePythonCoursePedagogy(slug, rawPedagogy);
    case "clojure":
      return resolveClojureCoursePedagogy(slug, rawPedagogy);
  }
}
