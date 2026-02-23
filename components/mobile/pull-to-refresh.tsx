"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ReactNode, useState, useCallback, useRef } from "react";
import { Loader2, Check } from "lucide-react";
import { useIsTouchDevice } from "@/hooks/use-media-query";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  pullThreshold?: number;
  refreshIndicator?: ReactNode;
}

export function PullToRefresh({
  children,
  onRefresh,
  className = "",
  pullThreshold = 100,
  refreshIndicator,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const isTouchDevice = useIsTouchDevice();

  // Calculate rotation based on pull distance
  const rotate = useTransform(y, [0, pullThreshold], [0, 360]);
  const opacity = useTransform(y, [0, pullThreshold * 0.5], [0.5, 1]);
  const scale = useTransform(y, [0, pullThreshold], [0.8, 1]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Only trigger if at top of scroll
      if (containerRef.current && containerRef.current.scrollTop === 0) {
        // Continue with pull detection
      }
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        containerRef.current &&
        containerRef.current.scrollTop === 0 &&
        !isRefreshing
      ) {
        const touchY = e.touches[0].clientY;
        const startY = (e.target as HTMLElement).dataset.touchStart
          ? parseInt((e.target as HTMLElement).dataset.touchStart, 10)
          : touchY;

        const pullDistance = Math.max(0, (touchY - startY) * 0.5);
        y.set(Math.min(pullDistance, pullThreshold * 1.5));
      }
    },
    [isRefreshing, pullThreshold, y]
  );

  const handleTouchEnd = useCallback(async () => {
    const currentY = y.get();

    if (currentY >= pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      animate(y, pullThreshold * 0.6, { type: "spring", stiffness: 300 });

      try {
        await onRefresh();
        setIsComplete(true);
        setTimeout(() => {
          setIsComplete(false);
          setIsRefreshing(false);
          animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
        }, 500);
      } catch {
        setIsRefreshing(false);
        animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
      }
    } else {
      animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }, [onRefresh, isRefreshing, pullThreshold, y]);

  // Desktop fallback - show refresh button
  if (!isTouchDevice) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700"
            aria-label="Actualizar"
          >
            <Loader2
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <motion.div
        style={{ opacity, scale }}
        className="absolute top-0 left-0 right-0 flex items-center justify-center pt-4 z-10 pointer-events-none"
      >
        {refreshIndicator || (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            {isRefreshing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Actualizando...</span>
              </>
            ) : isComplete ? (
              <>
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-500">Actualizado</span>
              </>
            ) : (
              <>
                <motion.div style={{ rotate }}>
                  <Loader2 className="w-5 h-5" />
                </motion.div>
                <span className="text-sm">Desliza para actualizar</span>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Scrollable content */}
      <motion.div
        ref={containerRef}
        style={{ y }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-full overflow-y-auto custom-scrollbar bg-white dark:bg-gray-950"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Simple pull to refresh for lists
interface PullToRefreshListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  keyExtractor: (item: T) => string;
}

export function PullToRefreshList<T>({
  items,
  renderItem,
  onRefresh,
  className = "",
  keyExtractor,
}: PullToRefreshListProps<T>) {
  return (
    <PullToRefresh onRefresh={onRefresh} className={className}>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {items.map((item, index) => (
          <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
        ))}
      </div>
    </PullToRefresh>
  );
}

// Hook for programmatic pull to refresh
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return { isRefreshing, refresh };
}
