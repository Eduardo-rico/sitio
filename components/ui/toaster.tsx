"use client";

import { AnimatePresence } from "framer-motion";
import { useToastState, useToast } from "@/hooks/use-toast";
import { Toast } from "./toast";

export function Toaster() {
  const toasts = useToastState();
  const { dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="
        fixed top-0 left-0 right-0 z-[100]
        flex flex-col items-center justify-start
        p-4 gap-3
        pointer-events-none
        sm:top-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2
        sm:p-0
      "
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={dismiss}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Toaster;
