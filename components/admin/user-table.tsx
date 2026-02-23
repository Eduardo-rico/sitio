"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import RoleEditor from "./RoleEditor";
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Shield,
  User,
  Trash2,
  Ban,
  Loader2,
  AlertTriangle,
  Check,
  X,
  Eye,
  Clock,
  GraduationCap,
  Search,
  Filter,
  Download,
  Square,
  CheckSquare,
  MinusSquare
} from "lucide-react";
import type { AdminUser, SortField, SortDirection, PaginationParams } from "@/types/admin";

interface UserTableProps {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  selectedIds: string[];
  sortField: SortField;
  sortDirection: SortDirection;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort: (field: SortField) => void;
  onRoleUpdate: (userId: string, newRole: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  onSuspendUser: (userId: string, suspend: boolean) => Promise<{ success: boolean; error?: string }>;
  onSelectUser: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails: (user: AdminUser) => void;
  loading?: boolean;
}

const pageSizeOptions = [10, 20, 50, 100];

export default function UserTable({
  users,
  pagination,
  selectedIds,
  sortField,
  sortDirection,
  onPageChange,
  onPageSizeChange,
  onSort,
  onRoleUpdate,
  onDeleteUser,
  onSuspendUser,
  onSelectUser,
  onSelectAll,
  onViewDetails,
  loading = false,
}: UserTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<AdminUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Sort indicator component
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return formatDate(dateString);
  };

  // Get initials for avatar
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

  // Get avatar color based on role
  const getAvatarColor = (role: string, isSuspended?: boolean) => {
    if (isSuspended) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return role === "admin" 
      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsProcessing(true);
    const result = await onDeleteUser(userToDelete.id);
    setIsProcessing(false);
    if (result.success) {
      setUserToDelete(null);
    }
  };

  // Handle suspend confirmation
  const handleSuspendConfirm = async () => {
    if (!userToSuspend) return;
    setIsProcessing(true);
    const result = await onSuspendUser(userToSuspend.id, !userToSuspend.isSuspended);
    setIsProcessing(false);
    if (result.success) {
      setUserToSuspend(null);
    }
  };

  // Check if all visible users are selected
  const allSelected = users.length > 0 && users.every(u => selectedIds.includes(u.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Calculate progress percentage
  const getProgressPercentage = (user: AdminUser) => {
    if (!user.stats) return 0;
    return user.stats.coursesCompleted > 0 
      ? Math.round((user.stats.coursesCompleted / Math.max(user.stats.totalCoursesEnrolled, 1)) * 100)
      : 0;
  };

  // Table Header Cell
  const HeaderCell = ({ field, children, className = "" }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIndicator field={field} />
      </div>
    </th>
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing <strong>{((pagination.page - 1) * pagination.limit) + 1}</strong> to{" "}
            <strong>{Math.min(pagination.page * pagination.limit, pagination.totalCount)}</strong> of{" "}
            <strong>{pagination.totalCount}</strong> users
          </span>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Page size selector */}
          <select
            value={pagination.limit}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3">
                    <button
                      onClick={() => onSelectAll(!allSelected)}
                      className="flex items-center justify-center"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : someSelected ? (
                        <MinusSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <HeaderCell field="name">User</HeaderCell>
                  <HeaderCell field="email">Email</HeaderCell>
                  <HeaderCell field="role">Role</HeaderCell>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <HeaderCell field="progress">Progress</HeaderCell>
                  <HeaderCell field="lastActive">Last Active</HeaderCell>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence mode="popLayout">
                  {users.map((user, index) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${user.isSuspended ? 'opacity-60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => onSelectUser(user.id, !selectedIds.includes(user.id))}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.includes(user.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>

                      {/* User Info */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name || user.email}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(user.role, user.isSuspended)}`}>
                                {getInitials(user.name, user.email)}
                              </div>
                            )}
                            {/* Online indicator */}
                            {user.lastActive && new Date(user.lastActive).getTime() > Date.now() - 5 * 60 * 1000 && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {user.name || "Unnamed User"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Joined {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <RoleEditor
                          userId={user.id}
                          currentRole={user.role}
                          onRoleUpdate={onRoleUpdate}
                          disabled={user.isSuspended}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {user.isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            <Ban className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Progress */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(user)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getProgressPercentage(user)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {user._count.progress} courses
                        </p>
                      </td>

                      {/* Last Active */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(user.lastActive || null)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {actionMenuOpen === user.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setActionMenuOpen(null)}
                              />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1"
                              >
                                <button
                                  onClick={() => {
                                    onViewDetails(user);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setUserToSuspend(user);
                                    setActionMenuOpen(null);
                                  }}
                                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${user.isSuspended ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                >
                                  {user.isSuspended ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                  {user.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                                </button>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                <button
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Account
                                </button>
                              </motion.div>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                No users found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card View (Mobile) */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${user.isSuspended ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onSelectUser(user.id, !selectedIds.includes(user.id))}
                    className="mt-1"
                  >
                    {selectedIds.includes(user.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || user.email}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(user.role, user.isSuspended)}`}>
                              {getInitials(user.name, user.email)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.name || "Unnamed User"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <RoleEditor
                        userId={user.id}
                        currentRole={user.role}
                        onRoleUpdate={onRoleUpdate}
                        disabled={user.isSuspended}
                      />
                      {user.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          <Ban className="w-3 h-3" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${getProgressPercentage(user)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {getProgressPercentage(user)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last Active</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatRelativeTime(user.lastActive || null)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Card Pagination */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
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
                Are you sure you want to permanently delete <strong>{userToDelete.email}</strong>?
                This action cannot be undone.
              </p>

              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
                <li>All user data will be permanently removed</li>
                <li>Progress and submissions will be deleted</li>
                <li>This action is irreversible</li>
              </ul>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setUserToDelete(null)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
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

      {/* Suspend/Reactivate Confirmation Modal */}
      <AnimatePresence>
        {userToSuspend && (
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
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${userToSuspend.isSuspended ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  {userToSuspend.isSuspended ? (
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Ban className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {userToSuspend.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                  </h3>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to {userToSuspend.isSuspended ? 'reactivate' : 'suspend'} <strong>{userToSuspend.email}</strong>?
              </p>

              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
                {userToSuspend.isSuspended ? (
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
                  onClick={() => setUserToSuspend(null)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspendConfirm}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors ${userToSuspend.isSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {userToSuspend.isSuspended ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      {userToSuspend.isSuspended ? 'Reactivate' : 'Suspend'} Account
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
