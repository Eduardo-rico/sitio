"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseBottomSheetOptions {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  snapPoints?: number[]; // Percentages of screen height
  initialSnap?: number; // Index of initial snap point
}

interface BottomSheetState {
  isOpen: boolean;
  snapIndex: number;
  isDragging: boolean;
}

/**
 * Hook for managing bottom sheet state and interactions
 */
export function useBottomSheet(options: UseBottomSheetOptions = {}) {
  const {
    defaultOpen = false,
    onOpen,
    onClose,
    snapPoints = [25, 50, 85],
    initialSnap = 0,
  } = options;

  const [state, setState] = useState<BottomSheetState>({
    isOpen: defaultOpen,
    snapIndex: initialSnap,
    isDragging: false,
  });

  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  const open = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true, snapIndex: initialSnap }));
    onOpen?.();
  }, [initialSnap, onOpen]);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
    onClose?.();
  }, [onClose]);

  const snapTo = useCallback((index: number) => {
    if (index >= 0 && index < snapPoints.length) {
      setState((prev) => ({ ...prev, snapIndex: index }));
    }
  }, [snapPoints.length]);

  const expand = useCallback(() => {
    snapTo(snapPoints.length - 1);
  }, [snapTo, snapPoints.length]);

  const collapse = useCallback(() => {
    snapTo(0);
  }, [snapTo]);

  // Touch handlers for dragging
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    setState((prev) => ({ ...prev, isDragging: true }));
    
    if (sheetRef.current) {
      startHeightRef.current = sheetRef.current.getBoundingClientRect().height;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!state.isDragging) return;
    
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startYRef.current - clientY;
    currentYRef.current = deltaY;
  }, [state.isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!state.isDragging) return;
    
    setState((prev) => ({ ...prev, isDragging: false }));
    
    // Determine closest snap point based on drag direction and distance
    const dragThreshold = 50;
    if (currentYRef.current < -dragThreshold) {
      // Dragged up - expand
      snapTo(Math.min(state.snapIndex + 1, snapPoints.length - 1));
    } else if (currentYRef.current > dragThreshold) {
      // Dragged down - collapse or close
      if (state.snapIndex === 0) {
        close();
      } else {
        snapTo(Math.max(state.snapIndex - 1, 0));
      }
    }
    
    currentYRef.current = 0;
  }, [state.isDragging, state.snapIndex, snapPoints.length, snapTo, close]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close();
    }
  }, [close]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.isOpen) {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [state.isOpen, close]);

  // Prevent body scroll when open
  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [state.isOpen]);

  const currentSnapPoint = snapPoints[state.snapIndex];

  return {
    ...state,
    snapPoints,
    currentSnapPoint,
    sheetRef,
    open,
    close,
    snapTo,
    expand,
    collapse,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleBackdropClick,
  };
}

export type UseBottomSheetReturn = ReturnType<typeof useBottomSheet>;
