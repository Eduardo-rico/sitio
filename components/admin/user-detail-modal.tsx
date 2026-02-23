"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
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
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import type { AdminUser, UserCourseProgress, UserActivity } from "@/types/admin";

interface UserDetailModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onRoleUpdate: (userId: string, newRole: string) => Promise<{ success: boolean; error?: string }>;
  onSuspendUser: (userId: string, suspend: boolean) => Promise<{ success: boolean; error?: string }>;
  onDeleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  courses?: UserCourseProgress[];
  activities?: UserActivity[];
}

export default function UserDetailModal({
  user,
  isOpen,
  onClose,
  onRoleUpdate,
  onSuspendUser,
  onDeleteUser,
  courses = [],
  activities = [],
}: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'activity'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  if (!user) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const handleDelete = async () => {
    setIsProcessing(true);
    const result = await onDeleteUser(user.id);
    setIsProcessing(false);
    if (result.success) {
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleSuspend = async () => {
    setIsProcessing(true);
    const result = await onSuspendUser(user.id, !user.isSuspended);
    setIsProcessing(false);
    if (result.success) {
      setShowSuspendConfirm(false);
      user.isSuspended = !user.isSuspended;
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (newRole === user.role) return;
    setIsProcessing(true);
    const result = await onRoleUpdate(user.id, newRole);
    setIsProcessing(false);
    if (result.success) {
      user.role = newRole;
    }
  };

  const stats = [
    { 
      label: 'Courses Enrolled', 
      value: user.stats?.totalCoursesEnrolled || 0, 
      icon: GraduationCap,
      color: 'blue'
    },
    { 
      label: 'Certificates', 
      value: user.stats?.certificatesEarned || 0, 
      icon: Trophy,
      color: 'yellow'
    },
    { 
      label: 'Exercises Done', 
      value: user.stats?.exercisesAttempted || 0, 
      icon: Code2,
      color: 'green'
    },
    { 
      label: 'Avg Score', 
      value: `${user.stats?.averageScore || 0}%`, 
      icon: Target,
      color: 'purple'
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'activity', label: 'Activity', icon: TrendingUp },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-10 lg:inset-16 z-50 overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl h-full flex flex-col max-w-5xl mx-auto">
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || user.email}
                        width={80}
                        height={80}
                        className="rounded-2xl"
                      />
                    ) : (
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold ${getAvatarColor(user.role, user.isSuspended)}`}>
                        {getInitials(user.name, user.email)}
                      </div>
                    )}
                    {user.lastActive && new Date(user.lastActive).getTime() > Date.now() - 5 * 60 * 1000 && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full" />
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {user.name || "Unnamed User"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {user.role === 'admin' ? 'Administrator' : 'User'}
                      </span>
                      {user.isSuspended && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          <Ban className="w-3 h-3" />
                          Suspended
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Actions dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuOpen(!actionMenuOpen)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
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
                            onClick={() => { handleRoleChange('user'); setActionMenuOpen(false); }}
                            disabled={user.role === 'user' || isProcessing}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                          >
                            <User className="w-4 h-4" />
                            Set as User
                            {user.role === 'user' && <Check className="w-4 h-4 ml-auto text-green-600" />}
                          </button>
                          <button
                            onClick={() => { handleRoleChange('admin'); setActionMenuOpen(false); }}
                            disabled={user.role === 'admin' || isProcessing}
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
                          
                          <Link
                            href={`/admin/usuarios/${user.id}`}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <ChevronRight className="w-4 h-4" />
                            View Full Profile
                          </Link>
                          
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

                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-6 border-b border-gray-200 dark:border-gray-800">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {stats.map(stat => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                              stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                              stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                              'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            }`}>
                              <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stat.value}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {stat.label}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Info Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Account Info */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                          Account Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(user.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Last Active</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatRelativeTime(user.lastActive || null)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Email Verified</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.emailVerified ? 'Yes' : 'No'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Learning Stats */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                          Learning Statistics
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Lessons Viewed</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.stats?.totalLessonsViewed || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {user.stats?.exercisesCorrect || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Current Streak</span>
                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                              {user.stats?.streakDays || 0} days
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Time Spent</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {Math.floor((user.stats?.totalTimeSpentMinutes || 0) / 60)}h {(user.stats?.totalTimeSpentMinutes || 0) % 60}m
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity Preview */}
                    {activities.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                          Recent Activity
                        </h3>
                        <div className="space-y-3">
                          {activities.slice(0, 3).map((activity, index) => {
                            const Icon = getActivityIcon(activity.type);
                            return (
                              <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
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
                      </div>
                    )}
                  </div>
                )}

                {/* Courses Tab */}
                {activeTab === 'courses' && (
                  <div className="space-y-4">
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
                          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5"
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
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
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
                                {course.completedLessons} of {course.totalLessons} lessons
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {course.progress}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
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
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                        
                        <div className="space-y-4">
                          {activities.map((activity, index) => {
                            const Icon = getActivityIcon(activity.type);
                            return (
                              <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex items-start gap-4 pl-2"
                              >
                                <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                  <Icon className="w-3 h-3" />
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {activity.description}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatRelativeTime(activity.timestamp)}
                                  </p>
                                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                    <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                      {JSON.stringify(activity.metadata)}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                <Link
                  href={`/admin/usuarios/${user.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  View full profile
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ID: {user.id}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
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
                  </p>
                  
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

          {/* Suspend Confirmation */}
          <AnimatePresence>
            {showSuspendConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
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
                          {user.isSuspended ? 'Reactivate' : 'Suspend'}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
