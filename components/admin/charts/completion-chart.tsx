"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CheckCircle, XCircle, MinusCircle, PieChartIcon } from "lucide-react";

interface CompletionChartProps {
  data: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  isLoading?: boolean;
}

export function CompletionChart({ data, isLoading = false }: CompletionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 bg-amber-200 dark:bg-amber-800 rounded-full animate-bounce" />
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!data || (data.completed === 0 && data.inProgress === 0 && data.notStarted === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <PieChartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No completion data available</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Completed", value: data.completed, color: "#10b981" },
    { name: "In Progress", value: data.inProgress, color: "#f59e0b" },
    { name: "Not Started", value: data.notStarted, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  const total = data.completed + data.inProgress + data.notStarted;
  const completionRate = total > 0 ? Math.round((data.completed / total) * 100) : 0;

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { color: string } }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.payload.color }}
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {item.name}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {item.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 text-center">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-900 dark:text-green-100">
            {data.completed.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2.5 text-center">
          <MinusCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
            {data.inProgress.toLocaleString()}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">In Progress</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
          <XCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {data.notStarted.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Not Started</p>
        </div>
      </div>

      {/* Completion rate badge */}
      <div className="flex items-center justify-center mb-4">
        <div className={`
          px-4 py-2 rounded-full text-sm font-medium
          ${completionRate >= 70
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : completionRate >= 40
            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }
        `}>
          Completion Rate: {completionRate}%
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={activeIndex === index ? "#fff" : "transparent"}
                  strokeWidth={activeIndex === index ? 3 : 0}
                  style={{
                    filter: activeIndex === index ? "brightness(1.1)" : "none",
                    transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompletionChart;
