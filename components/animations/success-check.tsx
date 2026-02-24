"use client";

import { motion } from "framer-motion";

export const SuccessCheck = ({ className = "w-12 h-12" }: { className?: string }) => {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-green-500 ${className}`}
            aria-hidden="true"
        >
            <motion.circle
                cx="12"
                cy="12"
                r="10"
                initial={{ pathLength: 0, scale: 0.5, opacity: 0 }}
                animate={{ pathLength: 1, scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <motion.path
                d="M8 12l3 3 5-5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            />
        </motion.svg>
    );
};
