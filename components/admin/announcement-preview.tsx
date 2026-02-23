"use client";

import { useState } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Megaphone } from "lucide-react";
import { cn } from "@/components/ui/utils";

type AnnouncementType = "info" | "success" | "warning" | "error";
type DisplayType = "banner" | "toast" | "modal";

interface AnnouncementPreviewProps {
  title: string;
  message: string;
  type: AnnouncementType;
  displayType: DisplayType;
  dismissible?: boolean;
}

const typeConfig = {
  info: {
    icon: Info,
    colors: {
      banner: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
      toast: "bg-blue-600 text-white",
      modal: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    },
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  success: {
    icon: CheckCircle,
    colors: {
      banner: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
      toast: "bg-green-600 text-white",
      modal: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    },
    iconColor: "text-green-500 dark:text-green-400",
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      banner: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
      toast: "bg-yellow-500 text-white",
      modal: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
    },
    iconColor: "text-yellow-500 dark:text-yellow-400",
  },
  error: {
    icon: AlertCircle,
    colors: {
      banner: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
      toast: "bg-red-600 text-white",
      modal: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    },
    iconColor: "text-red-500 dark:text-red-400",
  },
};

export function AnnouncementPreview({
  title,
  message,
  type,
  displayType,
  dismissible = true,
}: AnnouncementPreviewProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = typeConfig[type];
  const Icon = config.icon;

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        <button
          onClick={() => setIsVisible(true)}
          className="text-sm hover:text-gray-600 dark:hover:text-gray-300 underline"
        >
          Mostrar preview nuevamente
        </button>
      </div>
    );
  }

  // Banner Style
  if (displayType === "banner") {
    return (
      <div
        className={cn(
          "relative w-full border px-4 py-3 pr-10 rounded-lg shadow-sm",
          "animate-in slide-in-from-top-2 duration-300",
          config.colors.banner
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />
          <div className="flex-1 min-w-0">
            {title && (
              <p className="font-semibold text-sm mb-1">
                {title || "Título del anuncio"}
              </p>
            )}
            <p className="text-sm opacity-90 leading-relaxed">
              {message || "Mensaje del anuncio..."}
            </p>
          </div>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 opacity-60" />
          </button>
        )}
      </div>
    );
  }

  // Toast Style
  if (displayType === "toast") {
    return (
      <div
        className={cn(
          "relative w-full max-w-sm mx-auto rounded-lg shadow-lg overflow-hidden",
          "animate-in slide-in-from-right-4 duration-300",
          config.colors.toast
        )}
      >
        <div className="flex items-start gap-3 p-4 pr-10">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && (
              <p className="font-semibold text-sm mb-1">
                {title || "Título del anuncio"}
              </p>
            )}
            <p className="text-sm opacity-90 leading-relaxed">
              {message || "Mensaje del anuncio..."}
            </p>
          </div>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-2 p-1 rounded-md hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {/* Progress bar animation */}
        <div className="h-1 bg-white/20">
          <div className="h-full bg-white/40 animate-[shrink_5s_linear_forwards]" />
        </div>
      </div>
    );
  }

  // Modal Style
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 rounded-xl -z-10" />
      
      {/* Modal */}
      <div
        className={cn(
          "relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 overflow-hidden",
          "animate-in zoom-in-95 duration-300",
          type === "info" && "border-blue-500",
          type === "success" && "border-green-500",
          type === "warning" && "border-yellow-500",
          type === "error" && "border-red-500"
        )}
      >
        {/* Header with icon */}
        <div
          className={cn(
            "flex items-center justify-center py-6",
            config.colors.modal
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-white dark:bg-gray-800 shadow-lg"
            )}
          >
            <Icon className={cn("w-8 h-8", config.iconColor)} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title || "Título del anuncio"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
            {message || "Mensaje del anuncio..."}
          </p>
          
          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsVisible(false)}
              className={cn(
                "px-6 py-2 rounded-lg font-medium text-sm transition-colors",
                type === "info" && "bg-blue-600 hover:bg-blue-700 text-white",
                type === "success" && "bg-green-600 hover:bg-green-700 text-white",
                type === "warning" && "bg-yellow-500 hover:bg-yellow-600 text-white",
                type === "error" && "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              Entendido
            </button>
          </div>
        </div>

        {/* Close button */}
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-3 top-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Tabbed preview showing all display types
export function AnnouncementPreviewAll({
  title,
  message,
  type,
  dismissible,
}: Omit<AnnouncementPreviewProps, "displayType">) {
  const [activeTab, setActiveTab] = useState<DisplayType>("banner");

  const tabs: { id: DisplayType; label: string; icon: typeof Megaphone }[] = [
    { id: "banner", label: "Banner", icon: Megaphone },
    { id: "toast", label: "Toast", icon: Info },
    { id: "modal", label: "Modal", icon: AlertCircle },
  ];

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preview area */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 min-h-[200px] flex items-center justify-center">
        <AnnouncementPreview
          title={title}
          message={message}
          type={type}
          displayType={activeTab}
          dismissible={dismissible}
        />
      </div>
    </div>
  );
}
