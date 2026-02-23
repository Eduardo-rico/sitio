"use client";

import { motion } from "framer-motion";
import { transitions } from "@/lib/animations";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({
  className = "",
  width,
  height,
  circle = false,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`animate-skeleton ${circle ? "rounded-full" : "rounded-md"} ${className}`}
      style={style}
    />
  );
}

// Text skeleton with multiple lines
interface TextSkeletonProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export function TextSkeleton({
  lines = 3,
  className = "",
  lastLineWidth = "60%",
}: TextSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "" : "w-full"}`}
        />
      ))}
    </div>
  );
}

// Card skeleton
interface CardSkeletonProps {
  className?: string;
  hasImage?: boolean;
  lines?: number;
}

export function CardSkeleton({
  className = "",
  hasImage = true,
  lines = 3,
}: CardSkeletonProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 ${className}`}
    >
      {hasImage && <Skeleton className="h-40 w-full rounded-lg mb-4" />}
      <Skeleton className="h-6 w-3/4 mb-3" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 w-full"

          />
        ))}
      </div>
    </div>
  );
}

// Avatar skeleton
interface AvatarSkeletonProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AvatarSkeleton({
  size = "md",
  className = "",
}: AvatarSkeletonProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return <Skeleton circle className={`${sizes[size]} ${className}`} />;
}

// List skeleton
interface ListSkeletonProps {
  items?: number;
  className?: string;
  itemHeight?: number;
}

export function ListSkeleton({
  items = 5,
  className = "",
  itemHeight = 60,
}: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"

        >
          <AvatarSkeleton size="sm" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard stats skeleton
export function StatsSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
        >
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

// Table skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = "",
}: TableSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Pulse wrapper for loading states
export function PulseWrapper({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) {
  if (!isLoading) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 0.8,
      }}
      className="pointer-events-none"
    >
      {children}
    </motion.div>
  );
}
