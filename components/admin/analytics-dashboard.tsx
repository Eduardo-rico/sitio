"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  BookOpen,
  Code2,
  Download,
  Calendar,
  ChevronDown,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { StatsCard } from "./stats-card";
import { UsersChart } from "./charts/users-chart";
import { CoursesChart } from "./charts/courses-chart";
import { ActivityHeatmap, ActivityHeatmapCompact } from "./charts/activity-heatmap";
import { CompletionChart } from "./charts/completion-chart";
import { cn } from "@/lib/utils";

// Date range types
 type DateRange = "today" | "7days" | "30days" | "90days" | "year";

interface DateRangeOption {
  value: DateRange;
  label: string;
  days: number;
}

const DATE_RANGES: DateRangeOption[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "7days", label: "7 Days", days: 7 },
  { value: "30days", label: "30 Days", days: 30 },
  { value: "90days", label: "3 Months", days: 90 },
  { value: "year", label: "Year", days: 365 },
];

interface AnalyticsData {
  stats: {
    totalUsers: number;
    previousTotalUsers: number;
    activeUsersToday: number;
    previousActiveUsers: number;
    coursesCompletedThisWeek: number;
    previousCoursesCompleted: number;
    exercisesSolvedToday: number;
    previousExercisesSolved: number;
  };
  usersOverTime: {
    date: string;
    newUsers: number;
    activeUsers: number;
  }[];
  coursePopularity: {
    courseId: string;
    courseName: string;
    enrollments: number;
    completions: number;
  }[];
  activityHeatmap: {
    day: string;
    hour: number;
    value: number;
  }[];
  completionStats: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const selectedRange = DATE_RANGES.find((r) => r.value === dateRange);
      const endDate = new Date().toISOString();
      const startDate = new Date(
        Date.now() - (selectedRange?.days || 30) * 24 * 60 * 60 * 1000
      ).toISOString();

      const response = await fetch(
        `/api/admin/analytics?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch analytics data");
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = () => {
    // Placeholder for export functionality
    alert("Export functionality coming soon!");
  };

  const selectedRangeLabel = DATE_RANGES.find((r) => r.value === dateRange)?.label || "30 Days";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => fetchAnalytics()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header with date range picker and export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your platform&apos;s performance and user engagement
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing}
            className={cn(
              "p-2 rounded-lg border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400",
              "hover:bg-gray-50 dark:hover:bg-gray-700 transition-all",
              isRefreshing && "animate-spin"
            )}
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Date range dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border",
                "border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              )}
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{selectedRangeLabel}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setDateRange(range.value);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors",
                        dateRange === range.value
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-blue-600 text-white hover:bg-blue-700",
              "transition-colors font-medium"
            )}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Users"
          value={data.stats.totalUsers}
          previousValue={data.stats.previousTotalUsers}
          icon={Users}
          color="blue"
          trend={data.stats.totalUsers >= data.stats.previousTotalUsers ? "up" : "down"}
          description="All registered accounts"
        />
        <StatsCard
          label="Active Users Today"
          value={data.stats.activeUsersToday}
          previousValue={data.stats.previousActiveUsers}
          icon={UserCheck}
          color="green"
          trend={data.stats.activeUsersToday >= data.stats.previousActiveUsers ? "up" : "down"}
          description="Users active in last 24h"
        />
        <StatsCard
          label="Courses Completed"
          value={data.stats.coursesCompletedThisWeek}
          previousValue={data.stats.previousCoursesCompleted}
          icon={BookOpen}
          color="purple"
          trend={
            data.stats.coursesCompletedThisWeek >= data.stats.previousCoursesCompleted
              ? "up"
              : "down"
          }
          description="Lessons completed this week"
        />
        <StatsCard
          label="Exercises Solved Today"
          value={data.stats.exercisesSolvedToday}
          previousValue={data.stats.previousExercisesSolved}
          icon={Code2}
          color="orange"
          trend={
            data.stats.exercisesSolvedToday >= data.stats.previousExercisesSolved
              ? "up"
              : "down"
          }
          description="Correct submissions today"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              User Growth
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">New Users</span>
              <span className="w-3 h-3 rounded-full bg-purple-500 ml-2" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
            </div>
          </div>
          <UsersChart data={data.usersOverTime} />
        </div>

        {/* Courses Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Course Popularity
            </h3>
          </div>
          <CoursesChart data={data.coursePopularity} />
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Activity Heatmap
            </h3>
          </div>
          {/* Desktop heatmap */}
          <div className="hidden md:block">
            <ActivityHeatmap data={data.activityHeatmap} />
          </div>
          {/* Mobile compact heatmap */}
          <div className="md:hidden">
            <ActivityHeatmapCompact data={data.activityHeatmap} />
          </div>
        </div>

        {/* Completion Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Completion Rates
            </h3>
          </div>
          <CompletionChart data={data.completionStats} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
