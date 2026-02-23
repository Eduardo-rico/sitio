"use client";

import { 
  Users, 
  BookOpen, 
  FileText, 
  Code2,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalLessons: number;
    totalExercises: number;
    exercisesCompletedToday: number;
    totalSubmissions?: number;
    completionRate?: number;
  };
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "orange";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  description?: string;
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color,
  trend = "neutral",
  trendValue,
  description 
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      iconBg: "bg-blue-500",
      text: "text-blue-900 dark:text-blue-100",
      subtext: "text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      iconBg: "bg-green-500",
      text: "text-green-900 dark:text-green-100",
      subtext: "text-green-600 dark:text-green-400",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      iconBg: "bg-purple-500",
      text: "text-purple-900 dark:text-purple-100",
      subtext: "text-purple-600 dark:text-purple-400",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      iconBg: "bg-orange-500",
      text: "text-orange-900 dark:text-orange-100",
      subtext: "text-orange-600 dark:text-orange-400",
    },
  };

  const TrendIcon = trend === "up" 
    ? TrendingUp 
    : trend === "down" 
      ? TrendingDown 
      : Minus;

  const trendColor = trend === "up" 
    ? "text-green-600 dark:text-green-400" 
    : trend === "down" 
      ? "text-red-600 dark:text-red-400" 
      : "text-gray-500 dark:text-gray-400";

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.subtext}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold ${colors.text} mt-2`}>
            {value.toLocaleString()}
          </p>
          
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}

          {trendValue && (
            <div className={`flex items-center gap-1 mt-3 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className={`${colors.iconBg} p-3 rounded-lg shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminStats({ stats }: AdminStatsProps) {
  const statCards: StatCardProps[] = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "blue" as const,
      trend: "up" as const,
      trendValue: "All time",
      description: "Registered accounts",
    },
    {
      label: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "green" as const,
      trend: "neutral" as const,
      description: "Available courses",
    },
    {
      label: "Total Lessons",
      value: stats.totalLessons,
      icon: FileText,
      color: "purple" as const,
      trend: "neutral" as const,
      description: "Course content",
    },
    {
      label: "Completed Today",
      value: stats.exercisesCompletedToday,
      icon: Code2,
      color: "orange" as const,
      trend: stats.exercisesCompletedToday > 0 ? "up" : "neutral",
      trendValue: "Today's exercises",
      description: "Correct submissions",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <StatCard
          key={card.label}
          {...card}
        />
      ))}
    </div>
  );
}
