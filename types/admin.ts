/**
 * Admin User Management Types
 */

// User with extended stats
export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  emailVerified: string | null;
  _count: {
    progress: number;
    codeSubmissions: number;
  };
  // Extended stats (computed)
  stats?: UserStats;
  lastActive?: string | null;
  isSuspended?: boolean;
}

export interface UserStats {
  totalCoursesEnrolled: number;
  coursesCompleted: number;
  certificatesEarned: number;
  totalLessonsViewed: number;
  exercisesAttempted: number;
  exercisesCorrect: number;
  averageScore: number;
  streakDays: number;
  totalTimeSpentMinutes: number;
}

export interface UserActivity {
  id: string;
  type: 'lesson_viewed' | 'exercise_completed' | 'login' | 'course_enrolled';
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UserCourseProgress {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt: string;
  enrolledAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface UserFilters {
  search?: string;
  role?: 'all' | 'user' | 'admin';
  status?: 'all' | 'active' | 'suspended';
  dateFrom?: string;
  dateTo?: string;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats?: {
    totalUsers: number;
    activeToday: number;
    newThisWeek: number;
  };
}

export interface UserDetailResponse {
  user: AdminUser;
  courses: UserCourseProgress[];
  activities: UserActivity[];
  loginHistory: {
    timestamp: string;
    ip?: string;
    userAgent?: string;
  }[];
}

export type SortField = 'name' | 'email' | 'role' | 'createdAt' | 'lastActive' | 'progress';
export type SortDirection = 'asc' | 'desc';
