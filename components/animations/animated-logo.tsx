"use client";

import { motion } from "framer-motion";

export const AnimatedLogo = ({ 
  className = "w-8 h-8", 
  color = "currentColor",
  strokeWidth = 2
}: { 
  className?: string, 
  color?: string,
  strokeWidth?: number
}) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.path 
        d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.path 
        d="M8 7h6" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
      />
      <motion.path 
        d="M8 11h8" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
      />
      <motion.path 
        d="M8 15h4" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
};
