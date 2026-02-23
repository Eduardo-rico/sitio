"use client";

import * as React from "react";
import { cn, getGradientFromString, getInitials } from "./utils";

/**
 * Avatar component with image, fallback initials, and status indicator
 * 
 * @example
 * // With image
 * <Avatar src="/avatar.jpg" alt="John Doe" name="John Doe" />
 * 
 * // With fallback initials
 * <Avatar name="John Doe" />
 * 
 * // With status indicator
 * <Avatar name="John Doe" status="online" />
 * <Avatar name="John Doe" status="away" />
 * <Avatar name="John Doe" status="offline" />
 * 
 * // Different sizes
 * <Avatar size="sm" name="John Doe" />
 * <Avatar size="md" name="John Doe" />
 * <Avatar size="lg" name="John Doe" />
 * <Avatar size="xl" name="John Doe" />
 */

const avatarSizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const statusSizes = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
  xl: "h-4 w-4",
};

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
};

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URL for the avatar */
  src?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Name to display as fallback initials */
  name?: string;
  /** Size of the avatar */
  size?: keyof typeof avatarSizes;
  /** Status indicator */
  status?: keyof typeof statusColors;
  /** Custom fallback content (overrides initials) */
  fallback?: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      name,
      size = "md",
      status,
      fallback,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const showImage = src && !imageError;
    const showFallback = !showImage || !imageLoaded;
    const fallbackInitials = name ? getInitials(name) : "";
    const gradientClass = name ? getGradientFromString(name) : "";

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex shrink-0", className)}
        {...props}
      >
        <div
          className={cn(
            // Base styles
            "relative flex items-center justify-center overflow-hidden",
            "rounded-full bg-gray-200 dark:bg-gray-800",
            // Size styles
            avatarSizes[size],
            // Gradient background for fallback
            !showImage && gradientClass && `bg-gradient-to-br ${gradientClass}`
          )}
        >
          {showImage && (
            <img
              src={src}
              alt={alt || name || "Avatar"}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "h-full w-full object-cover",
                "transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          )}
          {showFallback && (
            <span
              className={cn(
                "font-semibold text-white",
                // Ensure text is visible when image is loading
                !showImage && "relative z-10"
              )}
              aria-hidden="true"
            >
              {fallback || fallbackInitials || "?"}
            </span>
          )}
        </div>

        {/* Status Indicator */}
        {status && (
          <span
            className={cn(
              // Position - bottom right
              "absolute bottom-0 right-0",
              // Base styles
              "rounded-full border-2 border-white dark:border-gray-900",
              // Size
              statusSizes[size],
              // Color
              statusColors[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// Avatar Group component for displaying multiple avatars
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars to display */
  max?: number;
  /** Spacing between avatars */
  spacing?: "tight" | "normal" | "loose";
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max, spacing = "tight", ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const displayCount = max ? Math.min(childrenArray.length, max) : childrenArray.length;
    const remainingCount = max ? childrenArray.length - max : 0;

    const spacingClasses = {
      tight: "-space-x-2",
      normal: "-space-x-1",
      loose: "space-x-1",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center", spacingClasses[spacing], className)}
        {...props}
      >
        {childrenArray.slice(0, displayCount).map((child, index) => (
          <div key={index} className="relative inline-block">
            {child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              "relative inline-flex items-center justify-center rounded-full",
              "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
              "text-xs font-medium",
              "border-2 border-white dark:border-gray-900",
              avatarSizes.md
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };
