"use client";

import { motion } from "framer-motion";

export const HeroGraphic = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-30">
            {/* Grid lines in background */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/20 dark:text-white/5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Floating Shapes */}
            <motion.svg
                className="absolute top-[10%] left-[10%] w-32 h-32 text-blue-300 dark:text-blue-500"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 45, 0],
                    opacity: [0.6, 1, 0.6]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                aria-hidden="true"
            >
                <rect x="20" y="20" width="60" height="60" rx="15" />
            </motion.svg>

            <motion.svg
                className="absolute top-[30%] right-[15%] w-24 h-24 text-purple-300 dark:text-purple-500"
                viewBox="0 0 100 100"
                fill="currentColor"
                animate={{
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                aria-hidden="true"
            >
                <circle cx="50" cy="50" r="30" opacity="0.4" />
                <circle cx="50" cy="50" r="15" opacity="0.8" />
            </motion.svg>

            <motion.svg
                className="absolute bottom-[20%] left-[25%] w-40 h-40 text-green-300 dark:text-green-500"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                animate={{
                    x: [0, 20, 0],
                    rotate: [0, -30, 0],
                    opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                aria-hidden="true"
            >
                <polygon points="50,15 90,80 10,80" />
            </motion.svg>

            {/* Code Brackets */}
            <motion.svg
                className="absolute top-[60%] right-[25%] w-20 h-20 text-yellow-300 dark:text-yellow-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                    y: [0, -15, 0],
                    opacity: [0.5, 0.9, 0.5]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                aria-hidden="true"
            >
                <path d="M16 18l6-6-6-6" />
                <path d="M8 6l-6 6 6 6" />
            </motion.svg>

            <motion.svg
                className="absolute bottom-[30%] right-[10%] w-16 h-16 text-pink-300 dark:text-pink-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                    rotate: [0, 180, 360],
                    scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                }}
                aria-hidden="true"
            >
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
            </motion.svg>
        </div>
    );
};
