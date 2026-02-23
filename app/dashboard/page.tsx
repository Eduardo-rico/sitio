import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { MyCourses } from "@/components/dashboard/MyCourses";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ApiResponse } from "@/types";

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

async function getUserProgress(): Promise<ProgressStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/user/progress`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const result: ApiResponse<ProgressStats> = await response.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

async function getUserCourses(): Promise<CourseProgress[]> {
  // This will be enhanced when we create the courses API endpoint
  return [];
}

async function getRecentActivity(): Promise<ActivityItem[]> {
  // This will be enhanced when we create the activity API endpoint
  return [];
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const [progress, courses, activity] = await Promise.all([
    getUserProgress(),
    getUserCourses(),
    getRecentActivity(),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {session.user.name || "Estudiante"}!
        </h1>
        <p className="text-blue-100 text-lg">
          Continúa tu aprendizaje y sigue tu progreso desde aquí.
        </p>
      </div>

      {/* Stats Overview */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Tu Progreso
        </h2>
        <ProgressOverview data={progress} />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Courses - Takes up 2/3 on large screens */}
        <section className="lg:col-span-2">
          <MyCourses courses={courses} />
        </section>

        {/* Recent Activity - Takes up 1/3 on large screens */}
        <section>
          <RecentActivity activity={activity} />
        </section>
      </div>
    </div>
  );
}
