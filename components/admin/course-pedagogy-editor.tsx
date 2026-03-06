"use client";

import { useEffect, useMemo, useState } from "react";
import { BookCopy, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  resolveCoursePedagogy,
  supportsEditableCoursePedagogy,
} from "@/lib/course-pedagogy-registry";
import type { CoursePedagogy, CoursePedagogyInput } from "@/lib/course-pedagogy";

interface LessonStageDraft {
  fromOrder: number;
  toOrder: number;
  label: string;
  objective: string;
  feedbackFocus: string;
  reflectionPrompt: string;
}

interface PedagogyDraft {
  learnerProfile: string;
  timeCommitment: string;
  prerequisites: string;
  learningOutcomes: string;
  assessmentDiagnostic: string;
  assessmentFormative: string;
  assessmentSummative: string;
  rubricDimensions: string;
  masteryCriteria: string;
  bibliographyGuidance: string;
  lessonStages: LessonStageDraft[];
}

interface CoursePedagogyEditorProps {
  courseId: string;
  courseSlug: string;
  language: string;
  initialPedagogy?: unknown;
}

function listToMultiline(values: string[]) {
  return values.join("\n");
}

function multilineToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDraft(pedagogy: CoursePedagogy): PedagogyDraft {
  return {
    learnerProfile: pedagogy.learnerProfile,
    timeCommitment: pedagogy.timeCommitment,
    prerequisites: listToMultiline(pedagogy.prerequisites),
    learningOutcomes: listToMultiline(pedagogy.learningOutcomes),
    assessmentDiagnostic: pedagogy.assessmentPlan.diagnostic,
    assessmentFormative: listToMultiline(pedagogy.assessmentPlan.formative),
    assessmentSummative: pedagogy.assessmentPlan.summative,
    rubricDimensions: listToMultiline(pedagogy.rubricDimensions),
    masteryCriteria: listToMultiline(pedagogy.masteryCriteria),
    bibliographyGuidance: pedagogy.bibliographyGuidance,
    lessonStages: pedagogy.lessonStages.map((stage) => ({ ...stage })),
  };
}

function toPayload(draft: PedagogyDraft): CoursePedagogyInput {
  return {
    learnerProfile: draft.learnerProfile.trim(),
    timeCommitment: draft.timeCommitment.trim(),
    prerequisites: multilineToList(draft.prerequisites),
    learningOutcomes: multilineToList(draft.learningOutcomes),
    assessmentPlan: {
      diagnostic: draft.assessmentDiagnostic.trim(),
      formative: multilineToList(draft.assessmentFormative),
      summative: draft.assessmentSummative.trim(),
    },
    rubricDimensions: multilineToList(draft.rubricDimensions),
    masteryCriteria: multilineToList(draft.masteryCriteria),
    bibliographyGuidance: draft.bibliographyGuidance.trim(),
    lessonStages: draft.lessonStages.map((stage) => ({
      fromOrder: Number(stage.fromOrder) || 1,
      toOrder: Number(stage.toOrder) || 1,
      label: stage.label.trim(),
      objective: stage.objective.trim(),
      feedbackFocus: stage.feedbackFocus.trim(),
      reflectionPrompt: stage.reflectionPrompt.trim(),
    })),
  };
}

export function CoursePedagogyEditor({
  courseId,
  courseSlug,
  language,
  initialPedagogy,
}: CoursePedagogyEditorProps) {
  const editableLanguage = supportsEditableCoursePedagogy(language) ? language : null;
  const resolvedInitialPedagogy = useMemo(
    () => (editableLanguage ? resolveCoursePedagogy(editableLanguage, courseSlug, initialPedagogy) : null),
    [courseSlug, editableLanguage, initialPedagogy]
  );
  const [basePedagogy, setBasePedagogy] = useState<CoursePedagogy | null>(resolvedInitialPedagogy);
  const [draft, setDraft] = useState<PedagogyDraft | null>(
    resolvedInitialPedagogy ? toDraft(resolvedInitialPedagogy) : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setBasePedagogy(resolvedInitialPedagogy);
    setDraft(resolvedInitialPedagogy ? toDraft(resolvedInitialPedagogy) : null);
  }, [resolvedInitialPedagogy]);

  if (!editableLanguage || !basePedagogy || !draft) {
    return null;
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch(`/api/admin/courses/${courseId}/pedagogy`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toPayload(draft)),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "No se pudo guardar la pedagogia");
      }
      const nextBase = resolveCoursePedagogy(editableLanguage, courseSlug, payload.data);
      if (nextBase) {
        setBasePedagogy(nextBase);
        setDraft(toDraft(nextBase));
      }
      setSuccessMessage("Pedagogia actualizada");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Error al guardar la pedagogia");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(toDraft(basePedagogy));
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <section
      data-testid="course-pedagogy-editor"
      className="border-t border-gray-200 dark:border-gray-700 pt-8 space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookCopy className="w-5 h-5" />
            Pedagogia del curso
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Perfil, outcomes, evaluacion, criterios de dominio y etapas de aprendizaje.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar base
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            data-testid="pedagogy-save-button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar pedagogia
          </button>
        </div>
      </div>

      {error && (
        <div
          data-testid="course-pedagogy-error"
          className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      )}
      {successMessage && (
        <div
          data-testid="course-pedagogy-success"
          className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Perfil objetivo</span>
          <textarea
            data-testid="pedagogy-learner-profile"
            rows={3}
            value={draft.learnerProfile}
            onChange={(event) =>
              setDraft((current) => (current ? { ...current, learnerProfile: event.target.value } : current))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dedicacion sugerida</span>
          <input
            data-testid="pedagogy-time-commitment"
            value={draft.timeCommitment}
            onChange={(event) =>
              setDraft((current) => (current ? { ...current, timeCommitment: event.target.value } : current))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prerequisitos</span>
          <textarea
            data-testid="pedagogy-prerequisites"
            rows={5}
            value={draft.prerequisites}
            onChange={(event) =>
              setDraft((current) => (current ? { ...current, prerequisites: event.target.value } : current))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Un item por linea.</p>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning outcomes</span>
          <textarea
            data-testid="pedagogy-learning-outcomes"
            rows={5}
            value={draft.learningOutcomes}
            onChange={(event) =>
              setDraft((current) => (current ? { ...current, learningOutcomes: event.target.value } : current))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Un outcome por linea.</p>
        </label>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnostica</span>
          <textarea
            data-testid="pedagogy-assessment-diagnostic"
            rows={4}
            value={draft.assessmentDiagnostic}
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, assessmentDiagnostic: event.target.value } : current
              )
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Formativa</span>
          <textarea
            data-testid="pedagogy-assessment-formative"
            rows={4}
            value={draft.assessmentFormative}
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, assessmentFormative: event.target.value } : current
              )
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sumativa</span>
          <textarea
            data-testid="pedagogy-assessment-summative"
            rows={4}
            value={draft.assessmentSummative}
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, assessmentSummative: event.target.value } : current
              )
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </label>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dimensiones de rubrica</span>
          <textarea
            data-testid="pedagogy-rubric-dimensions"
            rows={4}
            value={draft.rubricDimensions}
            onChange={(event) =>
              setDraft((current) => (current ? { ...current, rubricDimensions: event.target.value } : current))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Criterios de dominio</span>
          <textarea
            data-testid="pedagogy-mastery-criteria"
            rows={4}
            value={draft.masteryCriteria}
            onChange={(event) =>
              setDraft((current) => (current ? { ...current, masteryCriteria: event.target.value } : current))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Guia bibliografica</span>
          <textarea
            data-testid="pedagogy-bibliography-guidance"
            rows={4}
            value={draft.bibliographyGuidance}
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, bibliographyGuidance: event.target.value } : current
              )
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Etapas de aprendizaje</h3>
          <button
            type="button"
            data-testid="pedagogy-add-stage"
            onClick={() =>
              setDraft((current) =>
                current
                  ? {
                      ...current,
                      lessonStages: [
                        ...current.lessonStages,
                        {
                          fromOrder: current.lessonStages.length + 1,
                          toOrder: current.lessonStages.length + 1,
                          label: "",
                          objective: "",
                          feedbackFocus: "",
                          reflectionPrompt: "",
                        },
                      ],
                    }
                  : current
              )
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar etapa
          </button>
        </div>

        <div className="space-y-3">
          {draft.lessonStages.map((stage, index) => (
            <div
              key={`${index}-${stage.label}`}
              data-testid={`pedagogy-stage-${index}`}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Etapa {index + 1}</p>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            lessonStages: current.lessonStages.filter((_, stageIndex) => stageIndex !== index),
                          }
                        : current
                    )
                  }
                  disabled={draft.lessonStages.length <= 1}
                  className="inline-flex items-center gap-1 text-sm text-red-600 disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>

              <div className="grid md:grid-cols-[120px_120px_1fr] gap-3">
                <input
                  type="number"
                  min={1}
                  value={stage.fromOrder}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            lessonStages: current.lessonStages.map((currentStage, stageIndex) =>
                              stageIndex === index
                                ? { ...currentStage, fromOrder: Number(event.target.value) || 1 }
                                : currentStage
                            ),
                          }
                        : current
                    )
                  }
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                />
                <input
                  type="number"
                  min={1}
                  value={stage.toOrder}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            lessonStages: current.lessonStages.map((currentStage, stageIndex) =>
                              stageIndex === index
                                ? { ...currentStage, toOrder: Number(event.target.value) || 1 }
                                : currentStage
                            ),
                          }
                        : current
                    )
                  }
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                />
                <input
                  data-testid={`pedagogy-stage-label-${index}`}
                  value={stage.label}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            lessonStages: current.lessonStages.map((currentStage, stageIndex) =>
                              stageIndex === index
                                ? { ...currentStage, label: event.target.value }
                                : currentStage
                            ),
                          }
                        : current
                    )
                  }
                  placeholder="Nombre de la etapa"
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-3">
                <textarea
                  rows={3}
                  value={stage.objective}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            lessonStages: current.lessonStages.map((currentStage, stageIndex) =>
                              stageIndex === index
                                ? { ...currentStage, objective: event.target.value }
                                : currentStage
                            ),
                          }
                        : current
                    )
                  }
                  placeholder="Objetivo"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                />
                <textarea
                  rows={3}
                  value={stage.feedbackFocus}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            lessonStages: current.lessonStages.map((currentStage, stageIndex) =>
                              stageIndex === index
                                ? { ...currentStage, feedbackFocus: event.target.value }
                                : currentStage
                            ),
                          }
                        : current
                    )
                  }
                  placeholder="Foco de feedback"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                />
                <textarea
                  rows={3}
                  value={stage.reflectionPrompt}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            lessonStages: current.lessonStages.map((currentStage, stageIndex) =>
                              stageIndex === index
                                ? { ...currentStage, reflectionPrompt: event.target.value }
                                : currentStage
                            ),
                          }
                        : current
                    )
                  }
                  placeholder="Pregunta de reflexion"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
