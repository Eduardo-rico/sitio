"use client";

import { useMemo } from "react";
import { Activity, Clock } from "lucide-react";

interface ActivityHeatmapProps {
  data: {
    day: string; // 0-6 (Sunday-Saturday)
    hour: number; // 0-23
    value: number; // activity count
  }[];
  isLoading?: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Color scale for heatmap
const getColorIntensity = (value: number, max: number): string => {
  if (value === 0) return "bg-gray-100 dark:bg-gray-800";
  const intensity = value / max;
  if (intensity <= 0.2) return "bg-green-100 dark:bg-green-900/30";
  if (intensity <= 0.4) return "bg-green-200 dark:bg-green-800/50";
  if (intensity <= 0.6) return "bg-green-300 dark:bg-green-700";
  if (intensity <= 0.8) return "bg-green-400 dark:bg-green-600";
  return "bg-green-500 dark:bg-green-500";
};

const getTextColor = (value: number, max: number): string => {
  const intensity = value / max;
  if (intensity > 0.5) return "text-white";
  return "text-gray-700 dark:text-gray-300";
};

export function ActivityHeatmap({ data, isLoading = false }: ActivityHeatmapProps) {
  const { heatmapData, maxValue, totalActivity, peakHour, peakDay } = useMemo(() => {
    if (!data || data.length === 0) {
      return { heatmapData: [], maxValue: 0, totalActivity: 0, peakHour: "-", peakDay: "-" };
    }

    // Create a 7x24 matrix
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    data.forEach((item) => {
      const day = parseInt(item.day);
      const hour = item.hour;
      if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
        matrix[day][hour] = item.value;
      }
    });

    const flatValues = data.map((d) => d.value);
    const max = Math.max(...flatValues, 1);

    // Find peak hour and day
    let maxActivity = 0;
    let peakH = 0;
    let peakD = 0;

    matrix.forEach((dayData, dayIndex) => {
      dayData.forEach((value, hourIndex) => {
        if (value > maxActivity) {
          maxActivity = value;
          peakD = dayIndex;
          peakH = hourIndex;
        }
      });
    });

    return {
      heatmapData: matrix,
      maxValue: max,
      totalActivity: flatValues.reduce((a, b) => a + b, 0),
      peakHour: `${peakH}:00`,
      peakDay: DAYS[peakD],
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 bg-emerald-200 dark:bg-emerald-800 rounded-full animate-bounce" />
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading activity data...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No activity data available</p>
        </div>
      </div>
    );
  }

  // Group hours into 4-hour blocks for better visualization
  const hourGroups = ["0-4", "4-8", "8-12", "12-16", "16-20", "20-24"];

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wide">Total</span>
          </div>
          <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            {totalActivity.toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wide">Peak Hour</span>
          </div>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{peakHour}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wide">Peak Day</span>
          </div>
          <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{peakDay}</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex mb-1">
            <div className="w-12" /> {/* Day label spacer */}
            {hourGroups.map((group) => (
              <div
                key={group}
                className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400"
              >
                {group}h
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {heatmapData.map((dayData, dayIndex) => (
              <div key={dayIndex} className="flex items-center gap-1">
                <div className="w-10 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {DAYS[dayIndex]}
                </div>
                <div className="flex-1 flex gap-0.5">
                  {dayData.map((value, hourIndex) => (
                    <div
                      key={hourIndex}
                      className={`
                        flex-1 h-6 rounded-sm transition-all duration-200
                        ${getColorIntensity(value, maxValue)}
                        hover:ring-2 hover:ring-offset-1 hover:ring-emerald-400
                        dark:hover:ring-offset-gray-800
                        cursor-pointer
                      `}
                      title={`${DAYS[dayIndex]} ${hourIndex}:00 - ${value} activities`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-800" />
              <div className="w-4 h-4 rounded-sm bg-green-100 dark:bg-green-900/30" />
              <div className="w-4 h-4 rounded-sm bg-green-200 dark:bg-green-800/50" />
              <div className="w-4 h-4 rounded-sm bg-green-300 dark:bg-green-700" />
              <div className="w-4 h-4 rounded-sm bg-green-400 dark:bg-green-600" />
              <div className="w-4 h-4 rounded-sm bg-green-500 dark:bg-green-500" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile
export function ActivityHeatmapCompact({ data, isLoading = false }: ActivityHeatmapProps) {
  const { dailyTotals, maxDaily, hourlyTotals, maxHourly } = useMemo(() => {
    if (!data || data.length === 0) {
      return { dailyTotals: [], maxDaily: 0, hourlyTotals: [], maxHourly: 0 };
    }

    // Aggregate by day
    const daily = Array(7).fill(0);
    const hourly = Array(24).fill(0);

    data.forEach((item) => {
      const day = parseInt(item.day);
      const hour = item.hour;
      if (day >= 0 && day < 7) daily[day] += item.value;
      if (hour >= 0 && hour < 24) hourly[hour] += item.value;
    });

    return {
      dailyTotals: daily,
      maxDaily: Math.max(...daily, 1),
      hourlyTotals: hourly,
      maxHourly: Math.max(...hourly, 1),
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="animate-pulse text-sm text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily activity */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Activity by Day
        </h4>
        <div className="flex items-end gap-1 h-24">
          {dailyTotals.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-emerald-500 dark:bg-emerald-400 rounded-t-sm transition-all duration-500"
                style={{ height: `${(value / maxDaily) * 100}%` }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{DAYS[index][0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly activity */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Activity by Hour
        </h4>
        <div className="flex items-end gap-0.5 h-20">
          {hourlyTotals.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-500 dark:bg-blue-400 rounded-t-sm transition-all duration-500"
              style={{ height: `${(value / maxHourly) * 100}%` }}
              title={`${index}:00 - ${value} activities`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>00:00</span>
          <span>12:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
