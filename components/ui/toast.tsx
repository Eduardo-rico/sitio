"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from "lucide-react";
import { Toast as ToastType, ToastVariant } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
  index: number;
}

const variantConfig: Record<ToastVariant, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
  progressBg: string;
}> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-white dark:bg-slate-800",
    border: "border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-500",
    progressBg: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-white dark:bg-slate-800",
    border: "border-red-200 dark:border-red-800",
    iconColor: "text-red-500",
    progressBg: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-white dark:bg-slate-800",
    border: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-500",
    progressBg: "bg-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-white dark:bg-slate-800",
    border: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500",
    progressBg: "bg-blue-500",
  },
};

// Animation variants for Framer Motion
const toastVariants = {
  initial: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    filter: "blur(4px)",
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1], // ease-out-expo
    },
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1], // ease-in
    },
  },
};

export function Toast({ toast, onRemove, index }: ToastProps) {
  const { startTimer } = useToast();
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  // Start auto-hide timer
  useEffect(() => {
    if (toast.duration > 0 && toast.duration !== Infinity) {
      startTimer(toast.id, toast.duration);
    }
  }, [toast.id, toast.duration, startTimer]);

  const handleClose = useCallback(() => {
    onRemove(toast.id);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ 
        zIndex: 50 - index,
      }}
      className={`
        relative w-full sm:w-auto sm:min-w-[320px] sm:max-w-[420px]
        pointer-events-auto
        overflow-hidden
        rounded-xl
        border
        shadow-lg shadow-black/5 dark:shadow-black/20
        ${config.bg}
        ${config.border}
      `}
    >
      {/* Main content */}
      <div className="flex items-start gap-3 p-4 pr-10">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={`w-5 h-5 ${config.iconColor}`} strokeWidth={2} />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="
            absolute top-3 right-3
            flex items-center justify-center
            w-6 h-6
            rounded-full
            text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-slate-700
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600
          "
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      {toast.duration > 0 && toast.duration !== Infinity && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-slate-700">
          <motion.div
            className={`h-full ${config.progressBg}`}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{
              duration: toast.duration / 1000,
              ease: "linear",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default Toast;
