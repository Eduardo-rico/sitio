"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { staggerContainer, staggerItem, transitions } from "@/lib/animations";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  delayChildren = 0.1,
  once = true,
  amount = 0.2,
}: StaggerContainerProps) {
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger item to be used inside StaggerContainer
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: transitions.ease.ease },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Grid stagger container with specific grid item animation
interface StaggerGridProps extends StaggerContainerProps {
  columns?: number;
}

export function StaggerGrid({
  children,
  className = "",
  columns = 3,
  ...props
}: StaggerGridProps) {
  return (
    <StaggerContainer className={className} {...props}>
      {children}
    </StaggerContainer>
  );
}

// Stagger list for list items
export function StaggerList({
  children,
  className = "",
  staggerDelay = 0.05,
  delayChildren = 0,
  once = true,
}: StaggerContainerProps) {
  return (
    <StaggerContainer
      className={className}
      staggerDelay={staggerDelay}
      delayChildren={delayChildren}
      once={once}
    >
      {children}
    </StaggerContainer>
  );
}

// Individual list item
export function StaggerListItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -10 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.2, ease: transitions.ease.ease },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
