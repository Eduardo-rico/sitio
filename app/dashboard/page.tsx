"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { MyCourses } from "@/components/dashboard/MyCourses";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";
import { transitions } from "@/lib/animations";

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

interface CourseProgress {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessonsCompleted: number;
  totalLessons: number;
  progressPercentage: number;
  lastAccessedAt: string | null;
}

interface ActivityItem {
  id: string;
  type: "lesson" | "exercise";
  title: string;
  courseTitle: string;
  timestamp: string;
  status: string;
}

// Mock data for initial render
const mockProgress: ProgressStats = {
  coursesStarted: 0,
  lessonsCompleted: 0,
  exercisesSolved: 0,
  totalLessonsInProgress: 0,
  overallProgress: {
    completedLessons: 0,
    totalAvailableLessons: 10,
    completionPercentage: 0,
  },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const progress = mockProgress;
  const courses: CourseProgress[] = [];
  const activity: ActivityItem[] = [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <FadeIn direction="up">
        <motion.div 
          initial={{ backgroundPosition: "0% 50%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-2"
          >
            ¡Bienvenido, {session.user.name || "Estudiante"}!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-lg"
          >
            Continúa tu aprendizaje y sigue tu progreso desde aquí.
          </motion.p>
        </motion.div>
      </FadeIn>

      {/* Stats Overview */}
      <FadeIn direction="up" delay={0.1}>
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Tu Progreso
          </h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitions.ease}
          >
            <ProgressOverview data={progress} />
          </motion.div>
        </section>
      </FadeIn>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Courses - Takes up 2/3 on large screens */}
        <FadeIn direction="up" delay={0.2} className="lg:col-span-2">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...transitions.ease, delay: 0.2 }}
          >
            <MyCourses courses={courses} />
          </motion.section>
        </FadeIn>

        {/* Recent Activity - Takes up 1/3 on large screens */}
        <FadeIn direction="up" delay={0.3}>
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...transitions.ease, delay: 0.3 }}
          >
            <RecentActivity activity={activity} />
          </motion.section>
        </FadeIn>
      </div>
    </div>
  );
}

// Dashboard skeleton for loading state
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 animate-pulse">
        <div className="h-10 w-64 bg-white/20 rounded-lg mb-2" />
        <div className="h-6 w-96 bg-white/20 rounded-lg" />
      </div>

      {/* Stats Skeleton */}
      <section>
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
            >
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 h-64" />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 h-64" />
        </div>
      </div>
    </div>
  );
}
