import prisma from "@/lib/prisma";
import { COURSE_LANGUAGES, type CourseLanguage } from "@/lib/course-runtime";

export interface AdminAnalyticsFilters {
  startDate: Date;
  endDate: Date;
  courseId: string | null;
  language: CourseLanguage | null;
}

export interface AdminAnalyticsCourseOption {
  id: string;
  slug: string;
  title: string;
  language: string;
}

export interface AdminAnalyticsData {
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
    courses: AdminAnalyticsCourseOption[];
    languages: string[];
  };
  appliedFilters: {
    courseId: string | null;
    language: string | null;
    scopeNotice: string | null;
  };
}

const DEFAULT_RANGE_DAYS = 30;

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

function readActiveSeconds(metadata: unknown): number {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return 0;
  }
  const activeSeconds = (metadata as Record<string, unknown>).activeSeconds;
  return typeof activeSeconds === "number" && Number.isFinite(activeSeconds)
    ? Math.max(0, Math.round(activeSeconds))
    : 0;
}

function parseDate(raw: string | null, fallback: Date) {
  if (!raw) return fallback;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function normalizeLanguage(raw: string | null): CourseLanguage | null {
  if (!raw) return null;
  return COURSE_LANGUAGES.includes(raw as CourseLanguage) ? (raw as CourseLanguage) : null;
}

function buildCourseWhere(filters: AdminAnalyticsFilters) {
  return {
    isPublished: true,
    ...(filters.courseId ? { id: filters.courseId } : {}),
    ...(filters.language ? { language: filters.language } : {}),
  };
}

function buildScopedLearningEventWhere(
  startDate: Date,
  endDate: Date,
  courseIds: string[],
  courseSlugs: string[],
  filtered: boolean
) {
  return {
    createdAt: { gte: startDate, lte: endDate },
    ...(filtered
      ? {
          OR: [
            { courseId: { in: courseIds } },
            { courseSlug: { in: courseSlugs } },
          ],
        }
      : {}),
  };
}

function buildCsvValue(value: string | number | null | undefined) {
  const normalized = value == null ? "" : String(value);
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function rowsToCsv(rows: Array<Array<string | number | null | undefined>>) {
  return rows.map((row) => row.map(buildCsvValue).join(",")).join("\n");
}

export function resolveAdminAnalyticsFilters(searchParams: URLSearchParams): AdminAnalyticsFilters {
  const endDate = parseDate(searchParams.get("endDate"), new Date());
  const startDate = parseDate(
    searchParams.get("startDate"),
    new Date(Date.now() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000)
  );

  return {
    startDate,
    endDate,
    courseId: searchParams.get("courseId")?.trim() || null,
    language: normalizeLanguage(searchParams.get("language")?.trim() || null),
  };
}

export async function getAdminAnalyticsData(
  filters: AdminAnalyticsFilters
): Promise<AdminAnalyticsData> {
  const rangeMs = Math.max(24 * 60 * 60 * 1000, filters.endDate.getTime() - filters.startDate.getTime());
  const previousEnd = new Date(filters.startDate.getTime());
  const previousStart = new Date(filters.startDate.getTime() - rangeMs);

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = endOfDay(now);
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const previousWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [allPublishedCourses, scopedPublishedCourses] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        title: true,
        language: true,
      },
      orderBy: [{ language: "asc" }, { order: "asc" }, { title: "asc" }],
    }),
    prisma.course.findMany({
      where: buildCourseWhere(filters),
      select: {
        id: true,
        slug: true,
        title: true,
        language: true,
      },
      orderBy: [{ order: "asc" }, { title: "asc" }],
    }),
  ]);

  const filteredByCourseScope = Boolean(filters.courseId || filters.language);
  const scopedCourseIds = scopedPublishedCourses.map((course) => course.id);
  const scopedCourseSlugs = scopedPublishedCourses.map((course) => course.slug);
  const scopedExerciseWhere = filteredByCourseScope
    ? {
        exercise: {
          lesson: {
            courseId: {
              in: scopedCourseIds,
            },
          },
        },
      }
    : {};
  const scopedProgressWhere = filteredByCourseScope
    ? {
        lesson: {
          courseId: {
            in: scopedCourseIds,
          },
        },
      }
    : {};
  const scopedEventRangeWhere = buildScopedLearningEventWhere(
    filters.startDate,
    filters.endDate,
    scopedCourseIds,
    scopedCourseSlugs,
    filteredByCourseScope
  );
  const lessonActiveTimeWhere = {
    ...buildScopedLearningEventWhere(
      filters.startDate,
      filters.endDate,
      scopedCourseIds,
      scopedCourseSlugs,
      filteredByCourseScope
    ),
    eventType: "lesson_active_time",
  };

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
    enrollmentEvents,
    completedProgressInRange,
    activityEventsInRange,
    completionStatsRaw,
    lessonActiveTimeEvents,
    publishedCoursesWithLessonProgress,
  ] = await Promise.all([
    prisma.user.count({
      where: { createdAt: { lte: filters.endDate } },
    }),
    prisma.user.count({
      where: { createdAt: { lt: filters.startDate } },
    }),
    prisma.learningEvent.findMany({
      where: {
        createdAt: { gte: todayStart, lt: tomorrowStart },
        userId: { not: null },
        ...(filteredByCourseScope
          ? {
              OR: [
                { courseId: { in: scopedCourseIds } },
                { courseSlug: { in: scopedCourseSlugs } },
              ],
            }
          : {}),
      },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.learningEvent.findMany({
      where: {
        createdAt: { gte: yesterdayStart, lt: todayStart },
        userId: { not: null },
        ...(filteredByCourseScope
          ? {
              OR: [
                { courseId: { in: scopedCourseIds } },
                { courseSlug: { in: scopedCourseSlugs } },
              ],
            }
          : {}),
      },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.progress.count({
      where: {
        status: "completed",
        completedAt: { gte: weekStart, lt: tomorrowStart },
        ...scopedProgressWhere,
      },
    }),
    prisma.progress.count({
      where: {
        status: "completed",
        completedAt: { gte: previousWeekStart, lt: weekStart },
        ...scopedProgressWhere,
      },
    }),
    prisma.codeSubmission.count({
      where: {
        isCorrect: true,
        createdAt: { gte: todayStart, lt: tomorrowStart },
        ...scopedExerciseWhere,
      },
    }),
    prisma.codeSubmission.count({
      where: {
        isCorrect: true,
        createdAt: { gte: yesterdayStart, lt: todayStart },
        ...scopedExerciseWhere,
      },
    }),
    prisma.user.findMany({
      where: {
        createdAt: { gte: filters.startDate, lte: filters.endDate },
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.learningEvent.findMany({
      where: {
        createdAt: { gte: filters.startDate, lte: filters.endDate },
        userId: { not: null },
      },
      select: {
        userId: true,
        createdAt: true,
      },
    }),
    prisma.learningEvent.findMany({
      where: {
        eventType: "course_enrolled",
        createdAt: { gte: filters.startDate, lte: filters.endDate },
        courseSlug: filteredByCourseScope ? { in: scopedCourseSlugs } : { not: null },
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
        completedAt: { gte: filters.startDate, lte: filters.endDate },
        ...scopedProgressWhere,
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
      where: scopedEventRangeWhere,
      select: {
        createdAt: true,
      },
    }),
    prisma.progress.groupBy({
      by: ["status"],
      where: scopedProgressWhere,
      _count: {
        status: true,
      },
    }),
    prisma.learningEvent.findMany({
      where: lessonActiveTimeWhere,
      select: {
        userId: true,
        lessonId: true,
        metadata: true,
      },
    }),
    prisma.course.findMany({
      where: buildCourseWhere(filters),
      select: {
        id: true,
        title: true,
        lessons: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            progress: {
              select: {
                userId: true,
                status: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const activeUsersToday = activeUsersTodayRaw.length;
  const previousActiveUsers = previousActiveUsersRaw.length;

  const usersByDate = new Map<string, { newUsers: number; activeSet: Set<string> }>();
  const rangeStartDay = startOfDay(filters.startDate);
  const rangeEndDay = startOfDay(filters.endDate);

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

  const coursePopularity = scopedPublishedCourses
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
  for (let day = 0; day < 7; day += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
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

  const lessonActiveSecondsByLessonId = new Map<string, number>();
  const activeUsersSet = new Set<string>();
  let totalActiveSeconds = 0;

  for (const event of lessonActiveTimeEvents) {
    const activeSeconds = readActiveSeconds(event.metadata);
    if (activeSeconds <= 0) continue;

    totalActiveSeconds += activeSeconds;
    if (event.userId) {
      activeUsersSet.add(event.userId);
    }
    if (event.lessonId) {
      lessonActiveSecondsByLessonId.set(
        event.lessonId,
        (lessonActiveSecondsByLessonId.get(event.lessonId) || 0) + activeSeconds
      );
    }
  }

  const courseCompletionRates = publishedCoursesWithLessonProgress
    .map((course) => {
      const totalLessons = course.lessons.length;
      const startedUsers = new Set<string>();
      const completedLessonsByUser = new Map<string, number>();

      for (const lesson of course.lessons) {
        for (const progress of lesson.progress) {
          startedUsers.add(progress.userId);
          if (progress.status === "completed") {
            completedLessonsByUser.set(
              progress.userId,
              (completedLessonsByUser.get(progress.userId) || 0) + 1
            );
          }
        }
      }

      const enrolledUsers = startedUsers.size;
      const completedUsers =
        totalLessons > 0
          ? Array.from(startedUsers).filter(
              (userId) => (completedLessonsByUser.get(userId) || 0) >= totalLessons
            ).length
          : 0;

      const completionRate =
        enrolledUsers > 0 && totalLessons > 0
          ? Math.round((completedUsers / enrolledUsers) * 100)
          : 0;

      return {
        courseId: course.id,
        courseName: course.title,
        enrolledUsers,
        completedUsers,
        completionRate,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate);

  const lessonProgress = publishedCoursesWithLessonProgress
    .flatMap((course) =>
      course.lessons.map((lesson) => {
        const startedUsers = new Set<string>();
        let completedUsers = 0;

        for (const progress of lesson.progress) {
          startedUsers.add(progress.userId);
          if (progress.status === "completed") {
            completedUsers += 1;
          }
        }

        const startedUsersCount = startedUsers.size;
        const completionRate =
          startedUsersCount > 0
            ? Math.round((completedUsers / startedUsersCount) * 100)
            : 0;

        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          courseName: course.title,
          startedUsers: startedUsersCount,
          completedUsers,
          completionRate,
          activeMinutes: Math.round((lessonActiveSecondsByLessonId.get(lesson.id) || 0) / 60),
        };
      })
    )
    .sort((a, b) => {
      if (b.startedUsers !== a.startedUsers) return b.startedUsers - a.startedUsers;
      return b.activeMinutes - a.activeMinutes;
    })
    .slice(0, 24);

  const totalActiveMinutes = Math.round(totalActiveSeconds / 60);
  const avgActiveMinutesPerActiveUser =
    activeUsersSet.size > 0 ? Math.round(totalActiveMinutes / activeUsersSet.size) : 0;

  return {
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
    learningMetrics: {
      totalActiveMinutes,
      avgActiveMinutesPerActiveUser,
      courseCompletionRates,
      lessonProgress,
    },
    filterOptions: {
      courses: allPublishedCourses,
      languages: Array.from(new Set(allPublishedCourses.map((course) => course.language))).sort(),
    },
    appliedFilters: {
      courseId: filters.courseId,
      language: filters.language,
      scopeNotice: filteredByCourseScope
        ? "Los filtros de curso y lenguaje afectan actividad, cursos y aprendizaje. El crecimiento de usuarios se mantiene a nivel plataforma."
        : null,
    },
  };
}

export function buildAdminAnalyticsCsv(
  data: AdminAnalyticsData,
  filters: AdminAnalyticsFilters
) {
  const sections = [
    rowsToCsv([
      ["section", "metric", "value"],
      ["filters", "startDate", filters.startDate.toISOString()],
      ["filters", "endDate", filters.endDate.toISOString()],
      ["filters", "courseId", filters.courseId || ""],
      ["filters", "language", filters.language || ""],
      ["summary", "totalUsers", data.stats.totalUsers],
      ["summary", "previousTotalUsers", data.stats.previousTotalUsers],
      ["summary", "activeUsersToday", data.stats.activeUsersToday],
      ["summary", "previousActiveUsers", data.stats.previousActiveUsers],
      ["summary", "coursesCompletedThisWeek", data.stats.coursesCompletedThisWeek],
      ["summary", "previousCoursesCompleted", data.stats.previousCoursesCompleted],
      ["summary", "exercisesSolvedToday", data.stats.exercisesSolvedToday],
      ["summary", "previousExercisesSolved", data.stats.previousExercisesSolved],
      ["summary", "totalActiveMinutes", data.learningMetrics.totalActiveMinutes],
      [
        "summary",
        "avgActiveMinutesPerActiveUser",
        data.learningMetrics.avgActiveMinutesPerActiveUser,
      ],
    ]),
    rowsToCsv([
      ["section", "courseId", "courseName", "enrollments", "completions"],
      ...data.coursePopularity.map((course) => [
        "coursePopularity",
        course.courseId,
        course.courseName,
        course.enrollments,
        course.completions,
      ]),
    ]),
    rowsToCsv([
      ["section", "courseId", "courseName", "enrolledUsers", "completedUsers", "completionRate"],
      ...data.learningMetrics.courseCompletionRates.map((course) => [
        "courseCompletionRates",
        course.courseId,
        course.courseName,
        course.enrolledUsers,
        course.completedUsers,
        course.completionRate,
      ]),
    ]),
    rowsToCsv([
      [
        "section",
        "lessonId",
        "lessonTitle",
        "courseName",
        "startedUsers",
        "completedUsers",
        "completionRate",
        "activeMinutes",
      ],
      ...data.learningMetrics.lessonProgress.map((lesson) => [
        "lessonProgress",
        lesson.lessonId,
        lesson.lessonTitle,
        lesson.courseName,
        lesson.startedUsers,
        lesson.completedUsers,
        lesson.completionRate,
        lesson.activeMinutes,
      ]),
    ]),
    rowsToCsv([
      ["section", "date", "newUsers", "activeUsers"],
      ...data.usersOverTime.map((row) => [
        "usersOverTime",
        row.date,
        row.newUsers,
        row.activeUsers,
      ]),
    ]),
  ];

  return `${sections.join("\n\n")}\n`;
}
