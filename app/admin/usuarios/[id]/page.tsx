"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Loader2, 
  AlertCircle,
  Shield, 
  User, 
  Mail, 
  Calendar, 
  Clock,
  Ban,
  Check,
  Trash2,
  GraduationCap,
  Trophy,
  Target,
  TrendingUp,
  Activity,
  BookOpen,
  Code2,
  Award,
  ArrowLeft,
  MoreHorizontal,
  AlertTriangle,
  Edit3,
  CheckCircle,
  X,
  MapPin,
  Monitor,
  Globe
} from "lucide-react";
import type { AdminUser, UserCourseProgress, UserActivity } from "@/types/admin";

interface UserDetailData {
  user: AdminUser;
  courses: UserCourseProgress[];
  activities: UserActivity[];
  loginHistory: {
    timestamp: string;
    ip?: string;
    userAgent?: string;
  }[];
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { data: session, status } = useSession();
  
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'activity' | 'security'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // Check admin role
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/admin/usuarios");
      return;
    }

    if ((session.user as any).role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch user details
  const fetchUserDetails = useCallback(async () => {
    if (status !== "authenticated" || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch user details");
      }

      setData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading user details");
    } finally {
      setLoading(false);
    }
  }, [status, userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Handle role update
  const handleRoleUpdate = async (newRole: string) => {
    if (!data || newRole === data.user.role) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update role");
      }

      setData(prev => prev ? { ...prev, user: { ...prev.user, role: newRole } } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating role");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user suspension
  const handleSuspend = async () => {
    if (!data) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: !data.user.isSuspended }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update user status");
      }

      setData(prev => prev ? { ...prev, user: { ...prev.user, isSuspended: !prev.user.isSuspended } } : null);
      setShowSuspendConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating user status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user deletion
  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete user");
      }

      router.push('/admin/usuarios');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting user");
      setIsProcessing(false);
    }
  };

  // Format functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 10080)} weeks ago`;
    return formatDate(dateString);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (role: string, isSuspended?: boolean) => {
    if (isSuspended) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return role === "admin" 
      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_viewed': return BookOpen;
      case 'exercise_completed': return Code2;
      case 'login': return Activity;
      case 'course_enrolled': return GraduationCap;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lesson_viewed': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'exercise_completed': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'login': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      case 'course_enrolled': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'activity', label: 'Activity', icon: TrendingUp },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link 
          href="/admin/usuarios"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <p className="text-red-600 dark:text-red-400">{error || "User not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, courses, activities, loginHistory } = data;

  const stats = [
    { 
      label: 'Courses Enrolled', 
      value: user.stats?.totalCoursesEnrolled || 0, 
      icon: GraduationCap,
      color: 'blue' as const,
    },
    { 
      label: 'Completed', 
      value: user.stats?.coursesCompleted || 0, 
      icon: Trophy,
      color: 'yellow' as const,
    },
    { 
      label: 'Exercises', 
      value: user.stats?.exercisesAttempted || 0, 
      icon: Code2,
      color: 'green' as const,
    },
    { 
      label: 'Avg Score', 
      value: `${user.stats?.averageScore || 0}%`, 
      icon: Target,
      color: 'purple' as const,
    },
    { 
      label: 'Streak', 
      value: `${user.stats?.streakDays || 0}d`, 
      icon: Award,
      color: 'orange' as const,
    },
    { 
      label: 'Time Spent', 
      value: `${Math.floor((user.stats?.totalTimeSpentMinutes || 0) / 60)}h`, 
      icon: Clock,
      color: 'gray' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link 
        href="/admin/usuarios"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || user.email}
                width={120}
                height={120}
                className="rounded-2xl"
              />
            ) : (
              <div className={`w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-bold ${getAvatarColor(user.role, user.isSuspended)}`}>
                {getInitials(user.name, user.email)}
              </div>
            )}
            {user.lastActive && new Date(user.lastActive).getTime() > Date.now() - 5 * 60 * 1000 && (
              <span className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.name || "Unnamed User"}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                  </span>
                  {user.isSuspended ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <Ban className="w-4 h-4" />
                      Account Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircle className="w-4 h-4" />
                      Active Account
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="relative">
                <button
                  onClick={() => setActionMenuOpen(!actionMenuOpen)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <Edit3 className="w-4 h-4" />
                  Actions
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {actionMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setActionMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 py-2"
                    >
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Change Role
                      </div>
                      <button
                        onClick={() => { handleRoleUpdate('user'); setActionMenuOpen(false); }}
                        disabled={user.role === 'user'}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        <User className="w-4 h-4" />
                        Set as User
                        {user.role === 'user' && <Check className="w-4 h-4 ml-auto text-green-600" />}
                      </button>
                      <button
                        onClick={() => { handleRoleUpdate('admin'); setActionMenuOpen(false); }}
                        disabled={user.role === 'admin'}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Shield className="w-4 h-4" />
                        Set as Admin
                        {user.role === 'admin' && <Check className="w-4 h-4 ml-auto text-green-600" />}
                      </button>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                      
                      <button
                        onClick={() => { setShowSuspendConfirm(true); setActionMenuOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${user.isSuspended ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                      >
                        {user.isSuspended ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        {user.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                      </button>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                      
                      <button
                        onClick={() => { setShowDeleteConfirm(true); setActionMenuOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Active</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatRelativeTime(user.lastActive || null)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email Verified</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.emailVerified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 px-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700"
                  >
                    <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 ${
                      stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                      stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity Preview */}
              {activities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  {activities.length > 5 && (
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all activity →
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    No courses enrolled
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This user hasn&apos;t enrolled in any courses yet
                  </p>
                </div>
              ) : (
                courses.map((course, index) => (
                  <motion.div
                    key={course.courseId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {course.courseTitle}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Enrolled {formatDate(course.enrolledAt)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.progress === 100 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : course.progress > 0
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {course.progress === 100 ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {course.completedLessons} of {course.totalLessons} lessons completed
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {course.progress}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`h-full rounded-full ${
                            course.progress === 100 
                              ? 'bg-green-500' 
                              : 'bg-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                      Last accessed {formatRelativeTime(course.lastAccessedAt)}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    No activity recorded
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This user hasn&apos;t had any recent activity
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  
                  <div className="space-y-6">
                    {activities.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="relative flex items-start gap-4 pl-2"
                        >
                          <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(activity.timestamp)}
                            </p>
                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 font-mono">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Login History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  Login History
                </h3>
                {loginHistory.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <Monitor className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">No login history available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loginHistory.map((login, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatDate(login.timestamp)}
                            </p>
                            {login.userAgent && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {login.userAgent}
                              </p>
                            )}
                          </div>
                        </div>
                        {login.ip && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {login.ip}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Account Status
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.isSuspended 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.emailVerified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">User ID</span>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {user.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Delete User Account
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to permanently delete <strong>{user.email}</strong>?
                This action cannot be undone.
              </p>
              
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
                <li>All user data will be permanently removed</li>
                <li>Progress and submissions will be deleted</li>
                <li>This action is irreversible</li>
              </ul>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspend Confirmation Modal */}
      <AnimatePresence>
        {showSuspendConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.isSuspended ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  {user.isSuspended ? (
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Ban className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {user.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to {user.isSuspended ? 'reactivate' : 'suspend'} <strong>{user.email}</strong>?
              </p>
              
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
                {user.isSuspended ? (
                  <>
                    <li>User will be able to log in again</li>
                    <li>All account features will be restored</li>
                  </>
                ) : (
                  <>
                    <li>User will be logged out of all sessions</li>
                    <li>User will not be able to log in until reactivated</li>
                    <li>All data will be preserved</li>
                  </>
                )}
              </ul>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSuspendConfirm(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspend}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${user.isSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {user.isSuspended ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      {user.isSuspended ? 'Reactivate' : 'Suspend'} Account
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
