"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { transitions } from "@/lib/animations";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  mode?: "wait" | "sync" | "popLayout";
}

export function PageTransition({
  children,
  className = "",
  mode = "wait",
}: PageTransitionProps) {
  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={typeof window !== "undefined" ? window.location.pathname : "key"}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={transitions.ease}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Simple fade transition
export function FadeTransition({
  children,
  className = "",
}: Omit<PageTransitionProps, "mode">) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Scale transition
export function ScaleTransition({
  children,
  className = "",
}: Omit<PageTransitionProps, "mode">) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={transitions.springSoft}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Slide transition
interface SlideTransitionProps extends PageTransitionProps {
  direction?: "left" | "right" | "up" | "down";
}

export function SlideTransition({
  children,
  className = "",
  direction = "up",
}: SlideTransitionProps) {
  const directions = {
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    up: { x: 0, y: 30 },
    down: { x: 0, y: -30 },
  };

  const offset = directions[direction];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, ...offset }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, ...offset }}
        transition={transitions.ease}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Layout animation wrapper
export function LayoutTransition({
  children,
  className = "",
}: Omit<PageTransitionProps, "mode">) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      layout
      className={className}
    >
      {children}
    </motion.div>
  );
}
