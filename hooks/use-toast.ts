"use client";

import { useCallback, useState, useEffect, useRef } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  duration?: number;
  id?: string;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  createdAt: number;
}

type ToastListener = (toasts: Toast[]) => void;

// Global state for toasts (outside React component tree)
let globalToasts: Toast[] = [];
const listeners: Set<ToastListener> = new Set();

// Reset function for testing
export const resetToastState = () => {
  globalToasts = [];
  listeners.clear();
};

// Generate unique ID
const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// Notify all listeners of state change
const notifyListeners = () => {
  listeners.forEach((listener) => listener([...globalToasts]));
};

// Add toast to global state
const addToast = (message: string, variant: ToastVariant, options: ToastOptions = {}): string => {
  const id = options.id || generateId();
  const duration = options.duration ?? 5000;
  
  const toast: Toast = {
    id,
    message,
    variant,
    duration,
    createdAt: Date.now(),
  };

  // Remove existing toast with same ID if exists
  globalToasts = globalToasts.filter((t) => t.id !== id);
  
  // Add new toast at the beginning
  globalToasts = [toast, ...globalToasts];
  
  notifyListeners();
  return id;
};

// Remove toast from global state
const removeToast = (id: string) => {
  globalToasts = globalToasts.filter((t) => t.id !== id);
  notifyListeners();
};

// Hook to subscribe to toast state
export const useToastState = () => {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return toasts;
};

// Toast API
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return addToast(message, "success", options);
  },
  
  error: (message: string, options?: ToastOptions) => {
    return addToast(message, "error", options);
  },
  
  warning: (message: string, options?: ToastOptions) => {
    return addToast(message, "warning", options);
  },
  
  info: (message: string, options?: ToastOptions) => {
    return addToast(message, "info", options);
  },
  
  dismiss: (id: string) => {
    removeToast(id);
  },
  
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ): Promise<T> => {
    const id = addToast(messages.loading, "info", { ...options, duration: Infinity });
    
    try {
      const result = await promise;
      removeToast(id);
      addToast(messages.success, "success", options);
      return result;
    } catch (error) {
      removeToast(id);
      addToast(messages.error, "error", options);
      throw error;
    }
  },
};

// Hook for using toast in components (returns toast API)
export const useToast = () => {
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    removeToast(id);
  }, []);

  const startTimer = useCallback((id: string, duration: number) => {
    // Clear existing timer if any
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      dismiss(id);
    }, duration);

    timersRef.current.set(id, timer);
  }, [dismiss]);

  return {
    ...toast,
    dismiss,
    startTimer,
  };
};

export default useToast;
