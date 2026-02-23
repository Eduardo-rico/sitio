"use client";

import * as React from "react";
import { cn } from "./utils";

/**
 * Tabs component with animated indicator and content transitions
 * 
 * @example
 * // Horizontal tabs (default)
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *     <TabsTrigger value="tab3">Tab 3</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 *   <TabsContent value="tab3">Content 3</TabsContent>
 * </Tabs>
 * 
 * // Vertical tabs
 * <Tabs orientation="vertical" defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 */

// Context for sharing state between tabs components
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation: "horizontal" | "vertical";
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

// Main Tabs container
export interface TabsProps {
  /** Currently active tab value (controlled) */
  value?: string;
  /** Default active tab value (uncontrolled) */
  defaultValue?: string;
  /** Callback when tab changes */
  onValueChange?: (value: string) => void;
  /** Tab orientation */
  orientation?: "horizontal" | "vertical";
  /** Tab content */
  children: React.ReactNode;
  /** Additional classes */
  className?: string;
}

function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  children,
  className,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider
      value={{ value: value || "", onValueChange: handleValueChange, orientation }}
    >
      <div
        className={cn(
          orientation === "horizontal" ? "flex flex-col" : "flex flex-row",
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// TabsList - container for tab triggers
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes */
  className?: string;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = useTabs();

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center",
          "bg-gray-100 dark:bg-gray-800",
          "p-1 rounded-lg",
          // Orientation specific
          orientation === "horizontal"
            ? "flex-row w-full"
            : "flex-col h-full",
          className
        )}
        role="tablist"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

// TabsTrigger - individual tab button
export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Unique value for this tab */
  value: string;
  /** Whether this tab is disabled */
  disabled?: boolean;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange, orientation } = useTabs();
    const isSelected = selectedValue === value;
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    // Forward ref
    React.useImperativeHandle(ref, () => triggerRef.current!);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      const triggers = Array.from(
        triggerRef.current?.parentElement?.querySelectorAll(
          '[role="tab"]'
        ) || []
      ) as HTMLElement[];
      const currentIndex = triggers.findIndex((t) => t === triggerRef.current);

      let nextIndex: number;
      switch (e.key) {
        case orientation === "horizontal" ? "ArrowRight" : "ArrowDown":
          nextIndex = currentIndex + 1;
          if (nextIndex >= triggers.length) nextIndex = 0;
          triggers[nextIndex]?.focus();
          triggers[nextIndex]?.click();
          e.preventDefault();
          break;
        case orientation === "horizontal" ? "ArrowLeft" : "ArrowUp":
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) nextIndex = triggers.length - 1;
          triggers[nextIndex]?.focus();
          triggers[nextIndex]?.click();
          e.preventDefault();
          break;
        case "Home":
          triggers[0]?.focus();
          triggers[0]?.click();
          e.preventDefault();
          break;
        case "End":
          triggers[triggers.length - 1]?.focus();
          triggers[triggers.length - 1]?.click();
          e.preventDefault();
          break;
      }
    };

    return (
      <button
        ref={triggerRef}
        role="tab"
        aria-selected={isSelected}
        aria-disabled={disabled}
        tabIndex={isSelected ? 0 : -1}
        disabled={disabled}
        onClick={() => onValueChange(value)}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base styles
          "relative flex-1 inline-flex items-center justify-center",
          "px-3 py-1.5 text-sm font-medium",
          "rounded-md transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          "disabled:pointer-events-none disabled:opacity-50",
          // Selected vs unselected
          isSelected
            ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

// TabsContent - content panel for each tab
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Value matching the corresponding TabsTrigger */
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, orientation } = useTabs();
    const isSelected = selectedValue === value;

    if (!isSelected) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn(
          // Base styles
          "mt-2 ring-offset-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          // Orientation specific
          orientation === "horizontal" ? "" : "ml-2 flex-1",
          // Animation
          "animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
          className
        )}
        tabIndex={0}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
