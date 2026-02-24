"use client";

import {
  BookOpen,
  CheckCircle,
  Code,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";

interface ProgressStats {
  coursesStarted: number;
  lessonsCompleted: number;
  exercisesSolved: number;
  totalLessonsInProgress: number;
  overallProgress: {
    completedLessons: number;
    totalAvailableLessons: number;
    completionPercentage: number;
  };
}

interface ProgressOverviewProps {
  data: ProgressStats | null;
}

export function ProgressOverview({ data }: ProgressOverviewProps) {
  const stats = [
    {
      label: "Cursos Iniciados",
      value: data?.coursesStarted ?? 0,
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Lecciones Completadas",
      value: data?.lessonsCompleted ?? 0,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Ejercicios Resueltos",
      value: data?.exercisesSolved ?? 0,
      icon: Code,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "En Progreso",
      value: data?.totalLessonsInProgress ?? 0,
      icon: Target,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  const overallPercentage = data?.overallProgress?.completionPercentage ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.05}>
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-shadow h-full"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl ${stat.bgColor}`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Overall Progress Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Progreso General
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data?.overallProgress?.completedLessons ?? 0} de{" "}
              {data?.overallProgress?.totalAvailableLessons ?? 0} lecciones
              disponibles
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {overallPercentage}% completado
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {overallPercentage === 100
                ? "¡Excelente trabajo! 🎉"
                : overallPercentage >= 50
                  ? "¡Vas por buen camino! 💪"
                  : "¡Sigue aprendiendo! 📚"}
            </span>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
