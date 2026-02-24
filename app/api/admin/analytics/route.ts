import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDisplayDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// GET /api/admin/analytics - Get detailed analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const rangeMs = Math.max(24 * 60 * 60 * 1000, endDate.getTime() - startDate.getTime());
    const previousEnd = new Date(startDate.getTime());
    const previousStart = new Date(startDate.getTime() - rangeMs);

    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = endOfDay(now);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const previousWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      previousTotalUsers,
      activeUsersTodayRaw,
      previousActiveUsersRaw,
      coursesCompletedThisWeek,
      previousCoursesCompleted,
      exercisesSolvedToday,
      previousExercisesSolved,
      usersCreatedInRange,
      activeEventsInRange,
      publishedCourses,
      enrollmentEvents,
      completedProgressInRange,
      activityEventsInRange,
      completionStatsRaw,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { lte: endDate } },
      }),
      prisma.user.count({
        where: { createdAt: { lt: startDate } },
      }),
      prisma.learningEvent.findMany({
        where: {
          createdAt: { gte: todayStart, lt: tomorrowStart },
          userId: { not: null },
        },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.learningEvent.findMany({
        where: {
          createdAt: { gte: yesterdayStart, lt: todayStart },
          userId: { not: null },
        },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.progress.count({
        where: {
          status: "completed",
          completedAt: { gte: weekStart, lt: tomorrowStart },
        },
      }),
      prisma.progress.count({
        where: {
          status: "completed",
          completedAt: { gte: previousWeekStart, lt: weekStart },
        },
      }),
      prisma.codeSubmission.count({
        where: {
          isCorrect: true,
          createdAt: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.codeSubmission.count({
        where: {
          isCorrect: true,
          createdAt: { gte: yesterdayStart, lt: todayStart },
        },
      }),
      prisma.user.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.learningEvent.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          userId: { not: null },
        },
        select: {
          userId: true,
          createdAt: true,
        },
      }),
      prisma.course.findMany({
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          slug: true,
          title: true,
        },
      }),
      prisma.learningEvent.findMany({
        where: {
          eventType: "course_enrolled",
          createdAt: { gte: startDate, lte: endDate },
          courseSlug: { not: null },
        },
        select: {
          courseSlug: true,
          userId: true,
          id: true,
        },
      }),
      prisma.progress.findMany({
        where: {
          status: "completed",
          completedAt: { gte: startDate, lte: endDate },
        },
        select: {
          lesson: {
            select: {
              course: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      }),
      prisma.learningEvent.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.progress.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
    ]);

    const activeUsersToday = activeUsersTodayRaw.length;
    const previousActiveUsers = previousActiveUsersRaw.length;

    const usersByDate = new Map<string, { newUsers: number; activeSet: Set<string> }>();
    const rangeStartDay = startOfDay(startDate);
    const rangeEndDay = startOfDay(endDate);

    for (
      let cursor = new Date(rangeStartDay);
      cursor <= rangeEndDay;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      usersByDate.set(toDateKey(cursor), { newUsers: 0, activeSet: new Set<string>() });
    }

    for (const user of usersCreatedInRange) {
      const key = toDateKey(new Date(user.createdAt));
      const bucket = usersByDate.get(key);
      if (bucket) bucket.newUsers += 1;
    }

    for (const event of activeEventsInRange) {
      if (!event.userId) continue;
      const key = toDateKey(new Date(event.createdAt));
      const bucket = usersByDate.get(key);
      if (bucket) bucket.activeSet.add(event.userId);
    }

    const usersOverTime = Array.from(usersByDate.entries()).map(([dateKey, value]) => ({
      date: toDisplayDate(dateKey),
      newUsers: value.newUsers,
      activeUsers: value.activeSet.size,
    }));

    const enrollmentMap = new Map<string, { users: Set<string>; anonymousCount: number }>();
    for (const event of enrollmentEvents) {
      const slug = event.courseSlug ?? "";
      if (!slug) continue;
      if (!enrollmentMap.has(slug)) {
        enrollmentMap.set(slug, { users: new Set<string>(), anonymousCount: 0 });
      }
      const entry = enrollmentMap.get(slug)!;
      if (event.userId) {
        entry.users.add(event.userId);
      } else {
        entry.anonymousCount += 1;
      }
    }

    const completionMap = new Map<string, number>();
    for (const progress of completedProgressInRange) {
      const slug = progress.lesson.course.slug;
      completionMap.set(slug, (completionMap.get(slug) || 0) + 1);
    }

    const coursePopularity = publishedCourses
      .map((course) => {
        const enrollment = enrollmentMap.get(course.slug);
        return {
          courseId: course.id,
          courseName: course.title,
          enrollments: enrollment ? enrollment.users.size + enrollment.anonymousCount : 0,
          completions: completionMap.get(course.slug) || 0,
        };
      })
      .sort((a, b) => b.enrollments - a.enrollments);

    const activityMap = new Map<string, number>();
    for (const event of activityEventsInRange) {
      const date = new Date(event.createdAt);
      const key = `${date.getDay()}-${date.getHours()}`;
      activityMap.set(key, (activityMap.get(key) || 0) + 1);
    }

    const activityHeatmap: Array<{ day: string; hour: number; value: number }> = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        activityHeatmap.push({
          day: day.toString(),
          hour,
          value: activityMap.get(key) || 0,
        });
      }
    }

    const completionStats = {
      completed: completionStatsRaw.find((item) => item.status === "completed")?._count.status || 0,
      inProgress: completionStatsRaw.find((item) => item.status === "in_progress")?._count.status || 0,
      notStarted: completionStatsRaw.find((item) => item.status === "not_started")?._count.status || 0,
    };

    return Response.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          previousTotalUsers,
          activeUsersToday,
          previousActiveUsers,
          coursesCompletedThisWeek,
          previousCoursesCompleted,
          exercisesSolvedToday,
          previousExercisesSolved,
        },
        usersOverTime,
        coursePopularity,
        activityHeatmap,
        completionStats,
      },
    } satisfies ApiResponse<{
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
      usersOverTime: { date: string; newUsers: number; activeUsers: number }[];
      coursePopularity: { courseId: string; courseName: string; enrollments: number; completions: number }[];
      activityHeatmap: { day: string; hour: number; value: number }[];
      completionStats: { completed: number; inProgress: number; notStarted: number };
    }>);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { success: false, error: "Failed to fetch analytics data" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
