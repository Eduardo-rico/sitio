"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  BookOpen,
  Code2,
  Clock3,
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
  learningMetrics: {
    totalActiveMinutes: number;
    avgActiveMinutesPerActiveUser: number;
    courseCompletionRates: Array<{
      courseId: string;
      courseName: string;
      enrolledUsers: number;
      completedUsers: number;
      completionRate: number;
    }>;
    lessonProgress: Array<{
      lessonId: string;
      lessonTitle: string;
      courseName: string;
      startedUsers: number;
      completedUsers: number;
      completionRate: number;
      activeMinutes: number;
    }>;
  };
  filterOptions: {
    courses: Array<{
      id: string;
      slug: string;
      title: string;
      language: string;
    }>;
    languages: string[];
  };
  appliedFilters: {
    courseId: string | null;
    language: string | null;
    scopeNotice: string | null;
  };
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
        `/api/admin/analytics?${new URLSearchParams({
          startDate,
          endDate,
          ...(selectedLanguage ? { language: selectedLanguage } : {}),
          ...(selectedCourseId ? { courseId: selectedCourseId } : {}),
        }).toString()}`
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
  }, [dateRange, selectedCourseId, selectedLanguage]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (!data || !selectedCourseId) {
      return;
    }
    const selectedCourseStillVisible = data.filterOptions.courses.some(
      (course) =>
        course.id === selectedCourseId && (!selectedLanguage || course.language === selectedLanguage)
    );
    if (!selectedCourseStillVisible) {
      setSelectedCourseId("");
    }
  }, [data, selectedCourseId, selectedLanguage]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const selectedRange = DATE_RANGES.find((r) => r.value === dateRange);
      const endDate = new Date().toISOString();
      const startDate = new Date(
        Date.now() - (selectedRange?.days || 30) * 24 * 60 * 60 * 1000
      ).toISOString();
      const query = new URLSearchParams({
        startDate,
        endDate,
        ...(selectedLanguage ? { language: selectedLanguage } : {}),
        ...(selectedCourseId ? { courseId: selectedCourseId } : {}),
      });
      const response = await fetch(`/api/admin/analytics/export?${query.toString()}`);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `analytics-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
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

  const averageCourseCompletionRate =
    data.learningMetrics.courseCompletionRates.length > 0
      ? Math.round(
          data.learningMetrics.courseCompletionRates.reduce(
            (acc, course) => acc + course.completionRate,
            0
          ) / data.learningMetrics.courseCompletionRates.length
        )
      : 0;
  const filteredCourseOptions = data.filterOptions.courses.filter(
    (course) => !selectedLanguage || course.language === selectedLanguage
  );

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
          <label className="sr-only" htmlFor="analytics-language-filter">
            Filtrar por lenguaje
          </label>
          <select
            id="analytics-language-filter"
            data-testid="analytics-language-filter"
            value={selectedLanguage}
            onChange={(event) => {
              const nextLanguage = event.target.value;
              if (
                nextLanguage &&
                selectedCourseId &&
                data.filterOptions.courses.some(
                  (course) => course.id === selectedCourseId && course.language !== nextLanguage
                )
              ) {
                setSelectedCourseId("");
              }
              setSelectedLanguage(nextLanguage);
            }}
            className={cn(
              "rounded-lg border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
              "px-3 py-2 text-sm"
            )}
          >
            <option value="">Todos los lenguajes</option>
            {data.filterOptions.languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="analytics-course-filter">
            Filtrar por curso
          </label>
          <select
            id="analytics-course-filter"
            data-testid="analytics-course-filter"
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            className={cn(
              "rounded-lg border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
              "px-3 py-2 text-sm min-w-[220px]"
            )}
          >
            <option value="">Todos los cursos</option>
            {filteredCourseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

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
            disabled={isExporting}
            data-testid="analytics-export-button"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-blue-600 text-white hover:bg-blue-700",
              "transition-colors font-medium disabled:opacity-50"
            )}
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {data.appliedFilters.scopeNotice && (
        <div
          data-testid="analytics-scope-notice"
          className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-300"
        >
          {data.appliedFilters.scopeNotice}
        </div>
      )}

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

      {/* Learning metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Clock3 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Tiempo activo total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.learningMetrics.totalActiveMinutes} min
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Tiempo promedio por usuario
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.learningMetrics.avgActiveMinutesPerActiveUser} min
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Completion promedio por curso
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {averageCourseCompletionRate}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Completion Rate por Curso
          </h3>
          <div className="space-y-3">
            {data.learningMetrics.courseCompletionRates.slice(0, 8).map((course) => (
              <div key={course.courseId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{course.courseName}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {course.completedUsers}/{course.enrolledUsers} usuarios
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${course.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
            {data.learningMetrics.courseCompletionRates.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sin datos de avance por curso.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Avance por Leccion
          </h3>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {data.learningMetrics.lessonProgress.slice(0, 12).map((lesson) => (
              <div
                key={lesson.lessonId}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {lesson.lessonTitle}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {lesson.courseName}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Completado: {lesson.completionRate}%</span>
                  <span>Tiempo activo: {lesson.activeMinutes} min</span>
                </div>
              </div>
            ))}
            {data.learningMetrics.lessonProgress.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sin datos de avance por leccion.
              </p>
            )}
          </div>
        </div>
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
