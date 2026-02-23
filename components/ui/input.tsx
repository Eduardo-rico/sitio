"use client";

import * as React from "react";
import { cn } from "./utils";

/**
 * Input component with icon support, states, and animations
 * 
 * @example
 * // Basic usage
 * <Input placeholder="Enter your email" />
 * 
 * // With label and helper text
 * <Input 
 *   label="Email" 
 *   placeholder="Enter your email"
 *   helperText="We'll never share your email"
 * />
 * 
 * // With error state
 * <Input error="Email is required" />
 * 
 * // With icons
 * <Input leftIcon={<Mail size={16} />} rightIcon={<Check size={16} />} />
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message - triggers error state when provided */
  error?: string;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
  /** Full width input */
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hasError = !!error;
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium text-gray-700 dark:text-gray-300",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {hasLeftIcon && (
            <div
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
                "transition-colors duration-200",
                "peer-focus:text-blue-500"
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            className={cn(
              // Base styles
              "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm",
              "transition-all duration-200 ease-out",
              "placeholder:text-gray-400",
              "dark:bg-gray-900 dark:text-gray-100",
              // Focus styles
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
              "dark:focus:ring-blue-400/20 dark:focus:border-blue-400",
              // Disabled styles
              "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
              "dark:disabled:bg-gray-800 dark:disabled:text-gray-600",
              // Error styles
              hasError && [
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                "dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20",
              ],
              // Icon padding
              hasLeftIcon && "pl-10",
              hasRightIcon && "pr-10",
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
          {hasRightIcon && (
            <div
              className={cn(
                "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",
                "transition-colors duration-200"
              )}
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-500 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
