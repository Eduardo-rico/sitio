"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  X, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Users,
  UserPlus,
  Target,
  Megaphone,
  Bell,
  LayoutTemplate,
  Calendar,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { AnnouncementPreviewAll } from "./announcement-preview";

export type AnnouncementType = "info" | "success" | "warning" | "error";
export type DisplayType = "banner" | "toast" | "modal";
export type AudienceType = "all" | "new_users" | "specific_users";
export type PriorityType = "normal" | "high";

export interface AnnouncementFormData {
  title: string;
  message: string;
  type: AnnouncementType;
  priority: PriorityType;
  displayType: DisplayType;
  audience: AudienceType;
  specificUserIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  dismissible: boolean;
}

interface AnnouncementFormProps {
  initialData?: Partial<AnnouncementFormData>;
  onSubmit: (data: AnnouncementFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const typeOptions: { value: AnnouncementType; label: string; icon: typeof Info; color: string }[] = [
  { value: "info", label: "Información", icon: Info, color: "text-blue-500 bg-blue-50 border-blue-200" },
  { value: "success", label: "Éxito", icon: CheckCircle, color: "text-green-500 bg-green-50 border-green-200" },
  { value: "warning", label: "Advertencia", icon: AlertTriangle, color: "text-yellow-500 bg-yellow-50 border-yellow-200" },
  { value: "error", label: "Error", icon: AlertCircle, color: "text-red-500 bg-red-50 border-red-200" },
];

const displayTypeOptions: { value: DisplayType; label: string; description: string; icon: typeof Megaphone }[] = [
  { value: "banner", label: "Banner", description: "Barra fija en la parte superior", icon: Megaphone },
  { value: "toast", label: "Toast", description: "Notificación temporal emergente", icon: Bell },
  { value: "modal", label: "Modal", description: "Ventana emergente centrada", icon: LayoutTemplate },
];

const audienceOptions: { value: AudienceType; label: string; description: string; icon: typeof Users }[] = [
  { value: "all", label: "Todos los usuarios", description: "Visible para cualquier persona", icon: Users },
  { value: "new_users", label: "Nuevos usuarios", description: "Solo usuarios de los últimos 7 días", icon: UserPlus },
  { value: "specific_users", label: "Usuarios específicos", description: "Seleccionar usuarios manualmente", icon: Target },
];

export function AnnouncementForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: AnnouncementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: initialData?.title || "",
    message: initialData?.message || "",
    type: initialData?.type || "info",
    priority: initialData?.priority || "normal",
    displayType: initialData?.displayType || "banner",
    audience: initialData?.audience || "all",
    specificUserIds: initialData?.specificUserIds || [],
    startDate: initialData?.startDate || new Date().toISOString().split("T")[0],
    endDate: initialData?.endDate || "",
    isActive: initialData?.isActive ?? true,
    dismissible: initialData?.dismissible ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof AnnouncementFormData>(
    field: K,
    value: AnnouncementFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left column - Form fields */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Ej: Nuevas funciones disponibles"
              className={cn(
                "w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800",
                "text-gray-900 dark:text-gray-100",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-all duration-200"
              )}
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mensaje <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Escribe el contenido del anuncio..."
              rows={5}
              className={cn(
                "w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800",
                "text-gray-900 dark:text-gray-100",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-all duration-200 resize-y"
              )}
              required
            />
            <p className="text-xs text-gray-500">
              Soporta texto plano. Se renderizará como HTML seguro.
            </p>
          </div>

          {/* Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de anuncio
            </label>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("type", option.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                      "hover:shadow-md",
                      isSelected
                        ? option.color
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isSelected ? option.color.split(" ")[0] : "text-gray-400")} />
                    <span className={cn("font-medium", isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400")}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mostrar como
            </label>
            <div className="space-y-2">
              {displayTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.displayType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("displayType", option.value)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                      "hover:shadow-md text-left",
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
                    )}>
                      <Icon className={cn("w-5 h-5", isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-400")} />
                    </div>
                    <div>
                      <p className={cn("font-medium", isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400")}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Audiencia
            </label>
            <div className="space-y-2">
              {audienceOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.audience === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("audience", option.value)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                      "hover:shadow-md text-left",
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-purple-100 dark:bg-purple-800" : "bg-gray-100 dark:bg-gray-700"
                    )}>
                      <Icon className={cn("w-5 h-5", isSelected ? "text-purple-600 dark:text-purple-400" : "text-gray-400")} />
                    </div>
                    <div>
                      <p className={cn("font-medium", isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400")}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fechas de visualización
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Inicio</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800",
                    "text-gray-900 dark:text-gray-100",
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Fin (opcional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800",
                    "text-gray-900 dark:text-gray-100",
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Priority & Options */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prioridad alta
                </label>
                <p className="text-xs text-gray-500">
                  Se mostrará primero y destacado
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateField("priority", formData.priority === "high" ? "normal" : "high")}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  formData.priority === "high" ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                    formData.priority === "high" && "translate-x-6"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Se puede cerrar
                </label>
                <p className="text-xs text-gray-500">
                  Los usuarios pueden descartar el anuncio
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateField("dismissible", !formData.dismissible)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  formData.dismissible ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                    formData.dismissible && "translate-x-6"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Activo
                </label>
                <p className="text-xs text-gray-500">
                  Visible inmediatamente al guardar
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateField("isActive", !formData.isActive)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  formData.isActive ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                    formData.isActive && "translate-x-6"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right column - Preview */}
        <div className="lg:sticky lg:top-24 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Vista previa
            </h3>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {showPreview ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          
          {showPreview && (
            <AnnouncementPreviewAll
              title={formData.title || "Título de ejemplo"}
              message={formData.message || "Este es un mensaje de ejemplo para mostrar cómo se verá el anuncio."}
              type={formData.type}
              dismissible={formData.dismissible}
            />
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Consejos
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Mantén los títulos cortos y descriptivos</li>
              <li>Usa el tipo &quot;error&quot; solo para problemas críticos</li>
              <li>Los banners son ideales para anuncios importantes</li>
              <li>Los toasts funcionan mejor para notificaciones temporales</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          leftIcon={<X className="w-4 h-4" />}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isEditing ? "Guardar cambios" : "Crear anuncio"}
        </Button>
      </div>
    </form>
  );
}
