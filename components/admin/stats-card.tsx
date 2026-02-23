"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange" | "pink" | "cyan";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  description?: string;
  previousValue?: number;
  animate?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    iconBg: "bg-blue-500",
    iconBgGradient: "from-blue-400 to-blue-600",
    text: "text-blue-900 dark:text-blue-100",
    subtext: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    shadow: "shadow-blue-200/50 dark:shadow-blue-900/20",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    iconBg: "bg-green-500",
    iconBgGradient: "from-green-400 to-green-600",
    text: "text-green-900 dark:text-green-100",
    subtext: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    shadow: "shadow-green-200/50 dark:shadow-green-900/20",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    iconBg: "bg-purple-500",
    iconBgGradient: "from-purple-400 to-purple-600",
    text: "text-purple-900 dark:text-purple-100",
    subtext: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    shadow: "shadow-purple-200/50 dark:shadow-purple-900/20",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    iconBg: "bg-orange-500",
    iconBgGradient: "from-orange-400 to-orange-600",
    text: "text-orange-900 dark:text-orange-100",
    subtext: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    shadow: "shadow-orange-200/50 dark:shadow-orange-900/20",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    iconBg: "bg-pink-500",
    iconBgGradient: "from-pink-400 to-pink-600",
    text: "text-pink-900 dark:text-pink-100",
    subtext: "text-pink-600 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
    shadow: "shadow-pink-200/50 dark:shadow-pink-900/20",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    iconBg: "bg-cyan-500",
    iconBgGradient: "from-cyan-400 to-cyan-600",
    text: "text-cyan-900 dark:text-cyan-100",
    subtext: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800",
    shadow: "shadow-cyan-200/50 dark:shadow-cyan-900/20",
  },
};

function useAnimatedNumber(
  end: number,
  duration: number = 1500,
  start: number = 0
) {
  const [value, setValue] = useState(start);
  const frameRef = useRef<number>();

  useEffect(() => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutExpo
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setValue(Math.floor(start + (end - start) * easeOutExpo));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, start]);

  return value;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  trend = "neutral",
  trendValue,
  description,
  previousValue,
  animate = true,
}: StatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const animatedValue = useAnimatedNumber(value, 1500);
  const displayValue = animate ? animatedValue : value;

  // Calculate trend percentage if previous value is provided
  const calculatedTrend =
    previousValue !== undefined && previousValue !== 0
      ? ((value - previousValue) / previousValue) * 100
      : null;

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-green-600 dark:text-green-400"
      : trend === "down"
      ? "text-red-600 dark:text-red-400"
      : "text-gray-500 dark:text-gray-400";

  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all duration-300",
        "bg-white dark:bg-gray-800",
        colors.border,
        "hover:shadow-lg hover:-translate-y-1",
        colors.shadow,
        isHovered && "scale-[1.02]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient animation */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br",
          colors.iconBgGradient,
          isHovered && "opacity-5"
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium", colors.subtext)}>{label}</p>

          <p
            className={cn(
              "text-3xl font-bold mt-2 tracking-tight",
              colors.text,
              "tabular-nums"
            )}
          >
            {displayValue.toLocaleString()}
          </p>

          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {description}
            </p>
          )}

          {(trendValue || calculatedTrend !== null) && (
            <div className={cn("flex items-center gap-1.5 mt-3", trendColor)}>
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  trend === "up" && "bg-green-100 dark:bg-green-900/30",
                  trend === "down" && "bg-red-100 dark:bg-red-900/30",
                  trend === "neutral" && "bg-gray-100 dark:bg-gray-700"
                )}
              >
                <TrendIcon className="w-3 h-3" />
                <span>
                  {calculatedTrend !== null
                    ? `${calculatedTrend > 0 ? "+" : ""}${calculatedTrend.toFixed(1)}%`
                    : trendValue}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                vs last period
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br",
            colors.iconBgGradient,
            "shadow-lg transition-transform duration-300",
            isHovered && "scale-110 rotate-3"
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Decorative corner accent */}
      <div
        className={cn(
          "absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10",
          "bg-gradient-to-br",
          colors.iconBgGradient,
          "transition-transform duration-500",
          isHovered && "scale-150"
        )}
      />
    </div>
  );
}

// Loading skeleton for stats card
export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

export default StatsCard;
