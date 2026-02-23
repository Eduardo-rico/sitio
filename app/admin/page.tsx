/**
 * Admin Dashboard - Main Page
 * Protected for admin users only
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AdminStats from "@/components/admin/AdminStats";
import { 
  Plus, 
  Users, 
  BookOpen, 
  Code2, 
  TrendingUp,
  ArrowRight,
  Loader2
} from "lucide-react";

interface AdminStatsData {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalExercises: number;
  exercisesCompletedToday: number;
  totalSubmissions: number;
  completionRate: number;
  publishedCourses: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check admin role and redirect if not admin
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }

    if ((session.user as any).role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch stats from API
  useEffect(() => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "admin") return;

    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch stats");
        }

        setStats(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const quickActions = [
    {
      href: "/admin/cursos/nuevo",
      label: "Create Course",
      icon: Plus,
      color: "blue",
    },
    {
      href: "/admin/lecciones/nueva",
      label: "Create Lesson",
      icon: Plus,
      color: "green",
    },
    {
      href: "/admin/ejercicios/nuevo",
      label: "Create Exercise",
      icon: Plus,
      color: "purple",
    },
    {
      href: "/admin/users",
      label: "Manage Users",
      icon: Users,
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "text-blue-600 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20",
      green: "text-green-600 dark:text-green-400 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20",
      purple: "text-purple-600 dark:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20",
      orange: "text-orange-600 dark:text-orange-400 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Admin
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <AdminStats stats={stats} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Published Courses Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Course Status
            </h2>
            <Link 
              href="/admin/cursos"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Published Courses
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Visible to students
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.publishedCourses}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Draft Courses
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Not publicly visible
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.totalCourses - stats.publishedCourses}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Activity Overview
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Total Submissions
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Code exercises attempted
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalSubmissions.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Completion Rate
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Correct submissions
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.completionRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${getColorClasses(action.color)}`}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
