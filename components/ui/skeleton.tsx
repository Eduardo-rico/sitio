"use client";

import * as React from "react";
import { cn } from "./utils";

/**
 * Skeleton loading component with pulse animation
 * 
 * @example
 * // Text skeleton (default)
 * <Skeleton className="h-4 w-48" />
 * 
 * // Circle skeleton (for avatars)
 * <Skeleton variant="circle" className="h-10 w-10" />
 * 
 * // Rectangle skeleton
 * <Skeleton variant="rectangle" className="h-32 w-full" />
 * 
 * // Card loading state
 * <div className="space-y-3">
 *   <Skeleton variant="circle" className="h-12 w-12" />
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton className="h-3 w-full" />
 *   <Skeleton className="h-3 w-3/4" />
 * </div>
 */

const skeletonVariants = {
  variant: {
    text: "rounded",
    circle: "rounded-full",
    rectangle: "rounded-lg",
  },
};

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: keyof typeof skeletonVariants.variant;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "animate-pulse bg-gray-200 dark:bg-gray-800",
          // Shimmer effect overlay
          "relative overflow-hidden",
          "after:absolute after:inset-0",
          "after:-translate-x-full",
          "after:animate-[shimmer_2s_infinite]",
          "after:bg-gradient-to-r",
          "after:from-transparent after:via-gray-300/50 after:to-transparent",
          "dark:after:via-gray-700/50",
          // Variant styles
          skeletonVariants.variant[variant],
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
