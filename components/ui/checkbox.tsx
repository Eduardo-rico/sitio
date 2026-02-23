"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "./utils";

/**
 * Checkbox component with indeterminate state support
 * 
 * @example
 * // Basic usage
 * <Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
 * 
 * // With label
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" />
 *   <label htmlFor="terms">Accept terms</label>
 * </div>
 * 
 * // Indeterminate state (for parent checkboxes)
 * <Checkbox checked="indeterminate" />
 */

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "checked"> {
  /** Checked state - boolean or 'indeterminate' */
  checked?: boolean | "indeterminate";
  /** Called when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null);
    const isIndeterminate = checked === "indeterminate";
    const isChecked = checked === true;

    // Sync indeterminate state
    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate]);

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      (props as React.InputHTMLAttributes<HTMLInputElement>).onChange?.(e);
    };

    // Forward ref
    React.useImperativeHandle(ref, () => internalRef.current!);

    return (
      <div className="relative inline-flex items-center">
        <input
          ref={internalRef}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            // Base styles
            "h-4 w-4 rounded border transition-all duration-200",
            "flex items-center justify-center",
            // Unchecked state
            "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900",
            // Hover state
            "peer-hover:border-gray-400 dark:peer-hover:border-gray-500",
            // Focus state
            "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2",
            "dark:peer-focus-visible:ring-offset-gray-900",
            // Checked state
            (isChecked || isIndeterminate) && [
              "border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500",
            ],
            // Disabled state
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}
          aria-hidden="true"
        >
          {/* Check icon */}
          <Check
            className={cn(
              "h-3 w-3 text-white transition-transform duration-200",
              isChecked ? "scale-100" : "scale-0"
            )}
          />
          {/* Indeterminate icon */}
          <Minus
            className={cn(
              "absolute h-3 w-3 text-white transition-transform duration-200",
              isIndeterminate ? "scale-100" : "scale-0"
            )}
          />
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
