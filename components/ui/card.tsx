"use client";

import * as React from "react";
import { cn } from "./utils";

/**
 * Card component with variants, sections, and hover animations
 * 
 * @example
 * // Basic usage
 * <Card>
 *   <CardContent>Card content here</CardContent>
 * </Card>
 * 
 * // With header and footer
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 *   <CardFooter>Footer actions</CardFooter>
 * </Card>
 * 
 * // Interactive variant with hover animation
 * <Card variant="interactive" onClick={handleClick}>
 *   <CardContent>Clickable card</CardContent>
 * </Card>
 */

const cardVariants = {
  variant: {
    default: "bg-white dark:bg-gray-900 shadow-sm",
    interactive: [
      "bg-white dark:bg-gray-900 shadow-sm cursor-pointer",
      "hover:shadow-lg hover:-translate-y-1",
      "active:scale-[0.98]",
    ],
    outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
  },
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: keyof typeof cardVariants.variant;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base styles
        "rounded-xl border border-gray-200 dark:border-gray-800",
        "transition-all duration-300 ease-out",
        // Variant styles
        cardVariants.variant[variant],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-gray-500 dark:text-gray-400",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-6 pt-0",
      // When there's no header, remove top padding
      "first:pt-6",
      className
    )}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-6 pt-0",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
