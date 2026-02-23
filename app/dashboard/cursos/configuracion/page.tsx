"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Eye,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface NotificationSettings {
  emailUpdates: boolean;
  courseProgress: boolean;
  newCourses: boolean;
  exerciseReminders: boolean;
}

interface PrivacySettings {
  publicProfile: boolean;
  showProgress: boolean;
}

export default function CourseSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailUpdates: true,
    courseProgress: true,
    newCourses: false,
    exerciseReminders: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    publicProfile: false,
    showProgress: true,
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call - in production, save to user preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: "success", text: "Preferencias guardadas correctamente" });
    } catch {
      setMessage({ type: "error", text: "Error al guardar las preferencias" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/cursos"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis cursos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Preferencias de Cursos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Personaliza tu experiencia de aprendizaje
        </p>
      </div>

      {/* Notification Settings */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Controla qué notificaciones recibes
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <ToggleItem
            label="Actualizaciones por email"
            description="Recibe emails sobre nuevas funciones y actualizaciones"
            checked={notifications.emailUpdates}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailUpdates: checked }))
            }
          />
          <ToggleItem
            label="Progreso del curso"
            description="Notificaciones cuando completes lecciones o ejercicios"
            checked={notifications.courseProgress}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, courseProgress: checked }))
            }
          />
          <ToggleItem
            label="Nuevos cursos"
            description="Sé el primero en saber cuando publiquemos nuevos cursos"
            checked={notifications.newCourses}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, newCourses: checked }))
            }
          />
          <ToggleItem
            label="Recordatorios de ejercicios"
            description="Recibe recordatorios para practicar ejercicios pendientes"
            checked={notifications.exerciseReminders}
            onChange={(checked) =>
              setNotifications((prev) => ({
                ...prev,
                exerciseReminders: checked,
              }))
            }
          />
        </div>
      </section>

      {/* Privacy Settings */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Privacidad
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Controla la visibilidad de tu perfil
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <ToggleItem
            label="Perfil público"
            description="Permite que otros usuarios vean tu perfil"
            checked={privacy.publicProfile}
            onChange={(checked) =>
              setPrivacy((prev) => ({ ...prev, publicProfile: checked }))
            }
          />
          <ToggleItem
            label="Mostrar progreso"
            description="Muestra tu progreso en los cursos públicamente"
            checked={privacy.showProgress}
            onChange={(checked) =>
              setPrivacy((prev) => ({ ...prev, showProgress: checked }))
            }
          />
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {message && (
          <div
            className={`flex items-center gap-2 ${
              message.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}
        <div className="ml-auto">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar preferencias
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked
            ? "bg-blue-600 dark:bg-blue-500"
            : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
