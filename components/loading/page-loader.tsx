"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { transitions } from "@/lib/animations";
import { AnimatedLogo } from "@/components/animations/animated-logo";

interface PageLoaderProps {
  isLoading: boolean;
  children?: React.ReactNode;
  fullScreen?: boolean;
  className?: string;
  minDisplayTime?: number;
}

export function PageLoader({
  isLoading,
  children,
  fullScreen = true,
  className = "",
  minDisplayTime = 500,
}: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(isLoading);
  const [canHide, setCanHide] = useState(false);

  // Minimum display time to prevent flash
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      setShowLoader(true);
      setCanHide(false);
      timer = setTimeout(() => {
        setCanHide(true);
      }, minDisplayTime);
    }

    return () => clearTimeout(timer);
  }, [isLoading, minDisplayTime]);

  // Hide loader when loading is done and min time has passed
  useEffect(() => {
    if (!isLoading && canHide) {
      setShowLoader(false);
    }
  }, [isLoading, canHide]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`${fullScreen
                ? "fixed inset-0 z-50"
                : "absolute inset-0 z-10"
              } flex items-center justify-center bg-white dark:bg-gray-950 ${className}`}
          >
            {children || <DefaultLoader />}
          </motion.div>
        )}
      </AnimatePresence>

      {!showLoader && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}

// Default animated loader
function DefaultLoader() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo animation */}
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl z-10 relative"
        >
          <AnimatedLogo className="w-10 h-10 text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Pulse rings */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1.8],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 bg-blue-500 rounded-3xl z-0"
        />
      </div>

      {/* Loading text */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-gray-500 dark:text-gray-400 text-sm font-medium"
      >
        Cargando...
      </motion.div>
    </div>
  );
}

// Loading overlay (for partial page loading)
export function LoadingOverlay({
  isLoading,
  message = "Cargando...",
  className = "",
}: {
  isLoading: boolean;
  message?: string;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 ${className}`}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full"
          />
          {message && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Content loader (shows skeleton while loading)
interface ContentLoaderProps<T> {
  data: T | null | undefined;
  isLoading: boolean;
  error?: Error | null;
  render: (data: T) => React.ReactNode;
  renderSkeleton: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  className?: string;
}

export function ContentLoader<T>({
  data,
  isLoading,
  error,
  render,
  renderSkeleton,
  renderError,
  renderEmpty,
  className = "",
}: ContentLoaderProps<T>) {
  if (isLoading) {
    return (
      <div className={className}>
        {renderSkeleton()}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {renderError ? (
          renderError(error)
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">
              Error al cargar los datos
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className={className}>
        {renderEmpty ? (
          renderEmpty()
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
          </div>
        )}
      </div>
    );
  }

  return <div className={className}>{render(data)}</div>;
}

// Route loader (top progress bar)
export function RouteLoader({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 origin-left z-[100]"
        />
      )}
    </AnimatePresence>
  );
}
