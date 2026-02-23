"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BookOpen, Users } from "lucide-react";

interface CoursesChartProps {
  data: {
    courseName: string;
    enrollments: number;
    completions: number;
    courseId: string;
  }[];
  isLoading?: boolean;
}

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
];

export function CoursesChart({ data, isLoading = false }: CoursesChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 bg-purple-200 dark:bg-purple-800 rounded-full animate-bounce" />
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No course data available</p>
        </div>
      </div>
    );
  }

  // Sort by enrollments descending
  const sortedData = [...data].sort((a, b) => b.enrollments - a.enrollments).slice(0, 8);

  const totalEnrollments = sortedData.reduce((sum, d) => sum + d.enrollments, 0);
  const totalCompletions = sortedData.reduce((sum, d) => sum + d.completions, 0);
  const avgCompletionRate = totalEnrollments > 0
    ? Math.round((totalCompletions / totalEnrollments) * 100)
    : 0;

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: typeof sortedData[0] }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const completionRate = data.enrollments > 0
        ? Math.round((data.completions / data.enrollments) * 100)
        : 0;

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
            {data.courseName}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400">Enrollments:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {data.enrollments.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400">Completions:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {data.completions.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Completion Rate:</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {completionRate}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Enrollments</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {totalEnrollments.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Avg Completion</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {avgCompletionRate}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            layout="vertical"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-gray-500 dark:text-gray-400"
              tickLine={false}
              axisLine={{ stroke: "currentColor", className: "text-gray-200 dark:text-gray-700" }}
            />
            <YAxis
              type="category"
              dataKey="courseName"
              tick={{ fontSize: 10, fill: "currentColor" }}
              className="text-gray-600 dark:text-gray-400"
              tickLine={false}
              axisLine={false}
              width={100}
              tickFormatter={(value: string) =>
                value.length > 15 ? `${value.slice(0, 15)}...` : value
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", className: "text-gray-100 dark:text-gray-800 opacity-30" }} />
            <Bar
              dataKey="enrollments"
              name="Enrollments"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
              animationBegin={0}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.5}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CoursesChart;
