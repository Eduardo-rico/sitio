"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ReactNode, useState } from "react";
import { transitions } from "@/lib/animations";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  snapBack?: boolean;
  className?: string;
  leftAction?: {
    icon: ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: ReactNode;
    label: string;
    color: string;
  };
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 100,
  snapBack = true,
  className = "",
  leftAction,
  rightAction,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  // Background opacity based on swipe
  const leftOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);
  const rightOpacity = useTransform(x, [0, -swipeThreshold], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const { offset, velocity } = info;
    const velocityThreshold = 500;

    // Check horizontal swipes
    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Check vertical swipes
    if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > velocityThreshold) {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background actions */}
      {(leftAction || rightAction) && (
        <div className="absolute inset-0 flex">
          {leftAction && (
            <motion.div
              style={{ opacity: leftOpacity }}
              className={`flex-1 flex items-center justify-start pl-6 ${leftAction.color}`}
            >
              <div className="flex items-center gap-2 text-white">
                {leftAction.icon}
                <span className="font-medium">{leftAction.label}</span>
              </div>
            </motion.div>
          )}
          {rightAction && (
            <motion.div
              style={{ opacity: rightOpacity }}
              className={`flex-1 flex items-center justify-end pr-6 ${rightAction.color}`}
            >
              <div className="flex items-center gap-2 text-white">
                <span className="font-medium">{rightAction.label}</span>
                {rightAction.icon}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Card content */}
      <motion.div
        style={{ x, y }}
        drag
        dragConstraints={snapBack ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined}
        dragElastic={0.7}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        transition={transitions.spring}
        className={`relative bg-white dark:bg-gray-800 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Simpler version for list items
interface SwipeableListItemProps {
  children: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function SwipeableListItem({
  children,
  onDelete,
  onEdit,
  className = "",
}: SwipeableListItemProps) {
  return (
    <SwipeableCard
      onSwipeLeft={onDelete}
      onSwipeRight={onEdit}
      swipeThreshold={80}
      className={className}
      leftAction={
        onEdit
          ? {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ),
              label: "Editar",
              color: "bg-blue-500",
            }
          : undefined
      }
      rightAction={
        onDelete
          ? {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ),
              label: "Eliminar",
              color: "bg-red-500",
            }
          : undefined
      }
    >
      {children}
    </SwipeableCard>
  );
}

// Deck-style swipeable cards (like Tinder)
interface SwipeableDeckProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  onSwipeLeft?: (item: T) => void;
  onSwipeRight?: (item: T) => void;
  className?: string;
}

export function SwipeableDeck<T>({
  items,
  renderCard,
  onSwipeLeft,
  onSwipeRight,
  className = "",
}: SwipeableDeckProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: "left" | "right") => {
    const item = items[currentIndex];
    if (direction === "left" && onSwipeLeft) {
      onSwipeLeft(item);
    } else if (direction === "right" && onSwipeRight) {
      onSwipeRight(item);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className={`relative ${className}`}>
      {items.slice(currentIndex, currentIndex + 3).map((item, index) => (
        <motion.div
          key={currentIndex + index}
          className="absolute inset-0"
          style={{
            zIndex: items.length - currentIndex - index,
            scale: 1 - index * 0.05,
            y: index * 10,
          }}
        >
          {index === 0 ? (
            <SwipeableCard
              onSwipeLeft={() => handleSwipe("left")}
              onSwipeRight={() => handleSwipe("right")}
              snapBack={false}
              className="h-full"
            >
              {renderCard(item, currentIndex)}
            </SwipeableCard>
          ) : (
            renderCard(item, currentIndex + index)
          )}
        </motion.div>
      ))}
    </div>
  );
}
