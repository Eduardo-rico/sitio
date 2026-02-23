"use client";

import * as React from "react";
import { cn } from "./utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";
  /** Size of the badge */
  size?: "sm" | "md";
}

const variantClasses = {
  default: [
    "bg-gray-100 text-gray-800",
    "dark:bg-gray-800 dark:text-gray-200",
  ],
  primary: [
    "bg-blue-100 text-blue-800",
    "dark:bg-blue-900/30 dark:text-blue-300",
  ],
  secondary: [
    "bg-purple-100 text-purple-800",
    "dark:bg-purple-900/30 dark:text-purple-300",
  ],
  success: [
    "bg-green-100 text-green-800",
    "dark:bg-green-900/30 dark:text-green-300",
  ],
  warning: [
    "bg-amber-100 text-amber-800",
    "dark:bg-amber-900/30 dark:text-amber-300",
  ],
  error: [
    "bg-red-100 text-red-800",
    "dark:bg-red-900/30 dark:text-red-300",
  ],
  info: [
    "bg-cyan-100 text-cyan-800",
    "dark:bg-cyan-900/30 dark:text-cyan-300",
  ],
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
};

/**
 * Badge component for displaying status, labels, or counts
 * 
 * @example
 * // Default badge
 * <Badge>New</Badge>
 * 
 * // With variant
 * <Badge variant="success">Active</Badge>
 * 
 * // With size
 * <Badge size="sm">Small</Badge>
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center",
          "rounded-full font-medium",
          "transition-colors duration-200",
          // Size styles
          sizeClasses[size],
          // Variant styles
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
