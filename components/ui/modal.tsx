"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

/**
 * Modal/Dialog component with responsive design and animations
 * 
 * Mobile: Slides up from bottom (sheet style)
 * Desktop: Centered modal with blur backdrop
 * 
 * @example
 * // Basic usage
 * <Modal open={isOpen} onClose={handleClose} title="Modal Title">
 *   <p>Modal content here</p>
 * </Modal>
 * 
 * // With custom footer
 * <Modal
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>Are you sure?</p>
 * </Modal>
 */

export interface ModalProps {
  /** Controls modal visibility */
  open: boolean;
  /** Called when modal should close (overlay click, X button, Escape key) */
  onClose: () => void;
  /** Modal title displayed in header */
  title?: React.ReactNode;
  /** Modal description/subtitle */
  description?: React.ReactNode;
  /** Content of the modal */
  children: React.ReactNode;
  /** Custom footer content */
  footer?: React.ReactNode;
  /** Additional classes for the modal content */
  className?: string;
  /** Prevent closing on overlay click */
  preventOverlayClose?: boolean;
  /** Hide the close button in header */
  hideCloseButton?: boolean;
  /** Maximum width of the modal */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
};

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  preventOverlayClose = false,
  hideCloseButton = false,
  maxWidth = "md",
}: ModalProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Handle Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current && !preventOverlayClose) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        // Overlay styles
        "fixed inset-0 z-50 flex items-end justify-center",
        // Mobile: items-end for bottom sheet, Desktop: items-center
        "sm:items-center",
        // Backdrop with blur
        "bg-black/50 backdrop-blur-sm",
        // Animation
        "animate-in fade-in duration-200"
      )}
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Content */}
      <div
        className={cn(
          // Base styles
          "relative w-full bg-white dark:bg-gray-900",
          "flex flex-col",
          // Mobile: rounded top corners (sheet style)
          "rounded-t-2xl",
          // Desktop: fully rounded
          "sm:rounded-2xl",
          // Max width
          maxWidthClasses[maxWidth],
          // Shadow
          "shadow-2xl",
          // Animation
          "animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95",
          "duration-300 ease-out",
          // Mobile height constraints
          "max-h-[90vh]",
          className
        )}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex-1 pr-4">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 rounded-full p-0"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export { Modal };
