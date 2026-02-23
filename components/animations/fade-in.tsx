"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { fadeIn, fadeInUp, fadeInDown, transitions } from "@/lib/animations";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "none";
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

export function FadeIn({
  children,
  className = "",
  direction = "none",
  delay = 0,
  duration = 0.3,
  once = true,
  amount = 0.3,
}: FadeInProps) {
  const getVariants = (): Variants => {
    const baseVariants =
      direction === "up"
        ? fadeInUp
        : direction === "down"
        ? fadeInDown
        : fadeIn;

    return {
      hidden: baseVariants.hidden,
      visible: {
        ...baseVariants.visible,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        },
      },
    };
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Simple fade in wrapper without scroll trigger
export function FadeInSimple({
  children,
  className = "",
  delay = 0,
  duration = 0.3,
}: Omit<FadeInProps, "direction" | "once" | "amount">) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in on hover
export function FadeInHover({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      whileHover={{ opacity: 1 }}
      transition={transitions.fast}
      className={className}
    >
      {children}
    </motion.div>
  );
}
