/**
 * Admin Dashboard - Main Page
 * Protected for admin users only
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import {
  Plus,
  Users,
  BookOpen,
  Code2,
  ArrowRight,
  Loader2,
  LayoutDashboard,
  Settings,
  BarChart3,
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

    if ((session.user as { role?: string }).role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch basic stats from API
  useEffect(() => {
    if (status !== "authenticated" || (session?.user as { role?: string })?.role !== "admin") return;

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

  const quickActions = [
    {
      href: "/admin/cursos/nuevo",
      label: "Create Course",
      icon: Plus,
      color: "blue",
      description: "Add a new course to the platform",
    },
    {
      href: "/admin/lecciones/nueva",
      label: "Create Lesson",
      icon: BookOpen,
      color: "green",
      description: "Add content to existing courses",
    },
    {
      href: "/admin/ejercicios/nuevo",
      label: "Create Exercise",
      icon: Code2,
      color: "purple",
      description: "Add coding challenges for students",
    },
    {
      href: "/admin/users",
      label: "Manage Users",
      icon: Users,
      color: "orange",
      description: "View and manage user accounts",
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your platform and view analytics
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Settings className="w-3 h-3 mr-1" />
            Admin
          </span>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Analytics Overview
          </h2>
        </div>
        <AnalyticsDashboard />
      </section>

      {/* Quick Actions */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl transition-all hover:shadow-md ${getColorClasses(action.color)}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-white/20 transition-colors">
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {action.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
              <div className="flex items-center gap-1 text-sm mt-auto">
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Additional Links */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/cursos"
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
        >
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">Manage Courses</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats?.publishedCourses || 0} published
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>

        <Link
          href="/admin/snippets"
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
        >
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">Code Snippets</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Interactive examples
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>

        <Link
          href="/admin/users"
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all"
        >
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">User Management</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats?.totalUsers || 0} total users
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>
      </section>
    </div>
  );
}
