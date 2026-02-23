"use client";

import { motion } from "framer-motion";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
}

const sizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function Spinner({
  size = "md",
  color = "text-blue-600",
  className = "",
}: SpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizes[size]} ${color} ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.416 31.416"
          strokeDashoffset="10"
          className="opacity-25"
        />
        <path
          d="M12 2C6.477 2 2 6.477 2 12"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

// Dots bouncing spinner
export function DotsSpinner({
  size = "md",
  color = "bg-blue-600",
  className = "",
}: SpinnerProps) {
  const dotSizes = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  const dotSize = dotSizes[size];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
          className={`${dotSize} ${color} rounded-full`}
        />
      ))}
    </div>
  );
}

// Pulse spinner
export function PulseSpinner({
  size = "md",
  color = "bg-blue-600",
  className = "",
}: SpinnerProps) {
  const pulseSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`${pulseSizes[size]} ${color} rounded-full`}
      />
    </div>
  );
}

// Ring spinner
export function RingSpinner({
  size = "md",
  color = "border-blue-600",
  className = "",
}: SpinnerProps) {
  const ringSizes = {
    xs: "w-4 h-4 border",
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-10 h-10 border-3",
    xl: "w-16 h-16 border-4",
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${ringSizes[size]} ${color} border-t-transparent rounded-full ${className}`}
    />
  );
}

// Orbit spinner (planets orbiting)
export function OrbitSpinner({
  size = "md",
  color = "bg-blue-600",
  className = "",
}: SpinnerProps) {
  const orbitSizes = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const dotSizes = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
    xl: "w-3 h-3",
  };

  const sizeClass = orbitSizes[size];
  const dotClass = dotSizes[size];

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${dotClass} ${color} rounded-full`} />
      </motion.div>
      
      {/* Inner ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2"
      >
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${dotClass} ${color} rounded-full opacity-70`} />
      </motion.div>
      
      {/* Center */}
      <div className={`absolute inset-[30%] ${color} rounded-full opacity-50`} />
    </div>
  );
}

// Square spinner
export function SquareSpinner({
  size = "md",
  color = "bg-blue-600",
  className = "",
}: SpinnerProps) {
  const squareSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <motion.div
      animate={{
        rotate: [0, 90, 180, 270, 360],
        borderRadius: ["10%", "50%", "10%"],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`${squareSizes[size]} ${color} ${className}`}
    />
  );
}

// Loading button spinner
export function ButtonSpinner({
  size = "sm",
  className = "",
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  return (
    <Spinner
      size={size}
      color="text-current"
      className={className}
    />
  );
}

// Full screen spinner with optional message
export function FullScreenSpinner({
  message,
  spinner = <Spinner size="xl" />,
}: {
  message?: string;
  spinner?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      {spinner}
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
