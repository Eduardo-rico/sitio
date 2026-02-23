"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp, slideInLeft, slideInRight, transitions } from "@/lib/animations";

interface SlideUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  amount?: number;
}

export function SlideUp({
  children,
  className = "",
  delay = 0,
  duration = 0.4,
  distance = 20,
  once = true,
  amount = 0.3,
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from left
export function SlideInLeft({
  children,
  className = "",
  delay = 0,
  duration = 0.4,
  distance = 30,
  once = true,
  amount = 0.3,
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -distance }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from right
export function SlideInRight({
  children,
  className = "",
  delay = 0,
  duration = 0.4,
  distance = 30,
  once = true,
  amount = 0.3,
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: distance }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from bottom (alias for SlideUp)
export function SlideInBottom(props: SlideUpProps) {
  return <SlideUp {...props} />;
}
