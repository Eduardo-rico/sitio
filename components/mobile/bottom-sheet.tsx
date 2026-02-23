"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useRef } from "react";
import { X, GripHorizontal } from "lucide-react";
import { useBottomSheet } from "@/hooks/use-bottom-sheet";
import { transitions } from "@/lib/animations";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
  showHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
  backdropClassName?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [25, 50, 85],
  initialSnap = 0,
  showHandle = true,
  showCloseButton = true,
  className = "",
  backdropClassName = "",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const currentSnap = snapPoints[initialSnap];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 ${backdropClassName}`}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: `${100 - currentSnap}%` }}
            exit={{ y: "100%" }}
            transition={transitions.springSoft}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            style={{
              height: "85vh",
              touchAction: "none",
            }}
            className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl z-50 overflow-hidden ${className}`}
            role="dialog"
            aria-modal="true"
          >
            {/* Handle bar */}
            {showHandle && (
              <div className="flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                {title ? (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                ) : (
                  <div />
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto custom-scrollbar" style={{ height: "calc(100% - 60px)" }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simple bottom sheet with just content
export function SimpleBottomSheet({
  isOpen,
  onClose,
  children,
  className = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      showHandle={true}
      showCloseButton={false}
      snapPoints={[40]}
      className={className}
    >
      {children}
    </BottomSheet>
  );
}

// Bottom sheet with form
interface BottomSheetFormProps extends Omit<BottomSheetProps, "children"> {
  onSubmit: () => void;
  submitLabel?: string;
  children: ReactNode;
}

export function BottomSheetForm({
  onSubmit,
  submitLabel = "Guardar",
  children,
  ...props
}: BottomSheetFormProps) {
  return (
    <BottomSheet {...props}>
      <div className="p-4 space-y-4">
        {children}
        <div className="flex gap-3 pt-2">
          <button
            onClick={props.onClose}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
