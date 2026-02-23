"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  X, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Megaphone,
  Loader2
} from "lucide-react";
import { cn } from "@/components/ui/utils";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  priority: "normal" | "high";
  displayType: "banner" | "toast" | "modal";
  dismissible: boolean;
}

const typeConfig = {
  info: {
    icon: Info,
    styles: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200",
    iconColor: "text-blue-500 dark:text-blue-400",
    progressColor: "bg-blue-500",
  },
  success: {
    icon: CheckCircle,
    styles: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200",
    iconColor: "text-green-500 dark:text-green-400",
    progressColor: "bg-green-500",
  },
  warning: {
    icon: AlertTriangle,
    styles: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200",
    iconColor: "text-yellow-500 dark:text-yellow-400",
    progressColor: "bg-yellow-500",
  },
  error: {
    icon: AlertCircle,
    styles: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200",
    iconColor: "text-red-500 dark:text-red-400",
    progressColor: "bg-red-500",
  },
};

interface AnnouncementBannerProps {
  className?: string;
}

export function AnnouncementBanner({ className }: AnnouncementBannerProps) {
  const { data: session, status } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch announcements on mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements");
        const data = await response.json();
        
        if (data.success) {
          // Filter only banner type announcements
          const banners = data.data.filter(
            (a: Announcement) => a.displayType === "banner"
          );
          setAnnouncements(banners);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    // Don't fetch until session is loaded
    if (status !== "loading") {
      fetchAnnouncements();
    }
  }, [status]);

  // Handle dismissal
  const handleDismiss = useCallback(async (announcementId: string) => {
    setDismissedIds((prev) => new Set(Array.from(prev).concat(announcementId)));
    
    // Call API to persist dismissal if user is logged in
    if (session?.user) {
      try {
        await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ announcementId }),
        });
      } catch (error) {
        console.error("Error dismissing announcement:", error);
      }
    } else {
      // Store in localStorage for anonymous users
      const dismissed = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
      dismissed.push(announcementId);
      localStorage.setItem("dismissedAnnouncements", JSON.stringify(dismissed));
    }
  }, [session]);

  // Check localStorage for anonymous dismissed announcements
  useEffect(() => {
    if (!session?.user) {
      const dismissed = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
      setDismissedIds(new Set(dismissed));
    }
  }, [session]);

  // Rotate through multiple announcements
  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedIds.has(a.id)
  );

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  // Show only the current announcement if multiple
  const currentAnnouncement = visibleAnnouncements[currentIndex % visibleAnnouncements.length];
  const config = typeConfig[currentAnnouncement.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative w-full border-b animate-in slide-in-from-top-full duration-300",
        config.styles,
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Icon and content */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />
            <div className="flex-1 min-w-0">
              {currentAnnouncement.title && (
                <p className="font-semibold text-sm mb-0.5 truncate">
                  {currentAnnouncement.title}
                </p>
              )}
              <p className="text-sm opacity-90 leading-relaxed line-clamp-2">
                {currentAnnouncement.message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Counter for multiple announcements */}
            {visibleAnnouncements.length > 1 && (
              <div className="flex items-center gap-1 text-xs opacity-70">
                <span>{currentIndex + 1}</span>
                <span>/</span>
                <span>{visibleAnnouncements.length}</span>
              </div>
            )}

            {/* Dismiss button */}
            {currentAnnouncement.dismissible && (
              <button
                onClick={() => handleDismiss(currentAnnouncement.id)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  "hover:bg-black/5 dark:hover:bg-white/10",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  currentAnnouncement.type === "info" && "focus:ring-blue-500",
                  currentAnnouncement.type === "success" && "focus:ring-green-500",
                  currentAnnouncement.type === "warning" && "focus:ring-yellow-500",
                  currentAnnouncement.type === "error" && "focus:ring-red-500"
                )}
                aria-label="Cerrar anuncio"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar for auto-rotation */}
      {visibleAnnouncements.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5">
          <div
            className={cn("h-full animate-[progress_10s_linear]", config.progressColor)}
            style={{
              animation: "progress 10s linear infinite",
            }}
          />
        </div>
      )}

      {/* Keyframes for progress bar */}
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// Toast notifications component
export function AnnouncementToasts() {
  const { data: session, status } = useSession();
  const [toasts, setToasts] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchToasts = async () => {
      try {
        const response = await fetch("/api/announcements");
        const data = await response.json();
        
        if (data.success) {
          // Filter only toast type announcements
          const toastAnnouncements = data.data.filter(
            (a: Announcement) => a.displayType === "toast"
          );
          setToasts(toastAnnouncements);
        }
      } catch (error) {
        console.error("Error fetching toasts:", error);
      }
    };

    if (status !== "loading") {
      fetchToasts();
    }
  }, [status]);

  const dismissToast = async (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    
    if (session?.user) {
      try {
        await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ announcementId: id }),
        });
      } catch (error) {
        console.error("Error dismissing toast:", error);
      }
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg shadow-lg",
              "animate-in slide-in-from-right-full duration-300",
              "bg-white dark:bg-gray-800 border",
              toast.type === "info" && "border-blue-200 dark:border-blue-800",
              toast.type === "success" && "border-green-200 dark:border-green-800",
              toast.type === "warning" && "border-yellow-200 dark:border-yellow-800",
              toast.type === "error" && "border-red-200 dark:border-red-800"
            )}
          >
            <Icon className={cn("w-5 h-5 flex-shrink-0", config.iconColor)} />
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                  {toast.title}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {toast.message}
              </p>
            </div>
            {toast.dismissible && (
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Modal announcements component
export function AnnouncementModals() {
  const { data: session, status } = useSession();
  const [modals, setModals] = useState<Announcement[]>([]);
  const [currentModal, setCurrentModal] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchModals = async () => {
      try {
        const response = await fetch("/api/announcements");
        const data = await response.json();
        
        if (data.success) {
          // Filter only modal type announcements with high priority
          const modalAnnouncements = data.data.filter(
            (a: Announcement) => a.displayType === "modal" && a.priority === "high"
          );
          setModals(modalAnnouncements);
          if (modalAnnouncements.length > 0) {
            setCurrentModal(modalAnnouncements[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching modals:", error);
      }
    };

    if (status !== "loading") {
      fetchModals();
    }
  }, [status]);

  const dismissModal = async () => {
    if (!currentModal) return;
    
    const dismissedId = currentModal.id;
    setCurrentModal(null);
    
    if (session?.user) {
      try {
        await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ announcementId: dismissedId }),
        });
      } catch (error) {
        console.error("Error dismissing modal:", error);
      }
    }

    // Show next modal if available
    const remaining = modals.filter((m) => m.id !== dismissedId);
    if (remaining.length > 0) {
      setTimeout(() => setCurrentModal(remaining[0]), 300);
    }
  };

  if (!currentModal) return null;

  const config = typeConfig[currentModal.type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={currentModal.dismissible ? dismissModal : undefined}
      />
      
      {/* Modal */}
      <div
        className={cn(
          "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden",
          "animate-in zoom-in-95 duration-300"
        )}
      >
        {/* Header with colored background */}
        <div className={cn("flex items-center justify-center py-8", config.styles)}>
          <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
            <Icon className={cn("w-10 h-10", config.iconColor)} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {currentModal.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            {currentModal.message}
          </p>
          
          <button
            onClick={dismissModal}
            className={cn(
              "w-full py-3 px-6 rounded-xl font-semibold text-white transition-all",
              "hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
              currentModal.type === "info" && "bg-blue-600",
              currentModal.type === "success" && "bg-green-600",
              currentModal.type === "warning" && "bg-yellow-500",
              currentModal.type === "error" && "bg-red-600"
            )}
          >
            Entendido
          </button>
        </div>

        {/* Close button */}
        {currentModal.dismissible && (
          <button
            onClick={dismissModal}
            className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Progress dots for multiple modals */}
        {modals.length > 1 && (
          <div className="flex items-center justify-center gap-2 pb-4">
            {modals.map((modal, index) => (
              <div
                key={modal.id}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  modal.id === currentModal.id
                    ? config.progressColor
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Combined component for easy use
export function AnnouncementSystem() {
  return (
    <>
      <AnnouncementBanner />
      <AnnouncementToasts />
      <AnnouncementModals />
    </>
  );
}
