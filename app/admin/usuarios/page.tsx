"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import UserTable from "@/components/admin/user-table";
import UserDetailModal from "@/components/admin/user-detail-modal";
import { 
  Loader2, 
  Search, 
  Users, 
  AlertCircle, 
  Download,
  Ban,
  CheckCircle,
  Calendar,
  TrendingUp,
  UserPlus,
  Activity,
  Filter,
  X,
  ChevronDown,
  Trash2
} from "lucide-react";
import type { AdminUser, UserFilters, SortField, SortDirection, UserCourseProgress, UserActivity } from "@/types/admin";

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface UserStats {
  totalUsers: number;
  activeToday: number;
  newThisWeek: number;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Data state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userCourses, setUserCourses] = useState<UserCourseProgress[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });

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

  // Fetch users with filters and pagination
  const fetchUsers = useCallback(async (page: number = 1, limit: number = pagination.limit) => {
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortField,
        sortOrder: sortDirection,
        ...(filters.search && { search: filters.search }),
        ...(filters.role && filters.role !== 'all' && { role: filters.role }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.data.users);
      setPagination(data.data.pagination);
      if (data.data.stats) {
        setStats(data.data.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading users");
    } finally {
      setLoading(false);
    }
  }, [status, filters, sortField, sortDirection, pagination.limit]);

  // Initial fetch
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "admin") {
      fetchUsers(1);
    }
  }, [fetchUsers, session, status]);

  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return current;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  // Refetch when sort changes
  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers(pagination.page);
    }
  }, [sortField, sortDirection]);

  // Handle role update
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error updating role",
      };
    }
  };

  // Handle user suspension
  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: suspend }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update user status");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isSuspended: suspend } : user
        )
      );

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error updating user status",
      };
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setPagination((prev) => ({
        ...prev,
        totalCount: prev.totalCount - 1,
      }));
      setSelectedIds(prev => prev.filter(id => id !== userId));

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error deleting user",
      };
    }
  };

  // Handle bulk suspend
  const handleBulkSuspend = async (suspend: boolean) => {
    if (selectedIds.length === 0) return;
    
    setLoading(true);
    try {
      const promises = selectedIds.map(id => handleSuspendUser(id, suspend));
      await Promise.all(promises);
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/users/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  // Handle user selection
  const handleSelectUser = (userId: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? users.map(u => u.id) : []);
  };

  // Handle view details
  const handleViewDetails = async (user: AdminUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    
    // Fetch additional user details
    try {
      const response = await fetch(`/api/admin/users/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setUserCourses(data.data.courses || []);
        setUserActivities(data.data.activities || []);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
    });
    fetchUsers(1);
  };

  // Stats cards
  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue' as const,
      description: 'All registered users',
    },
    {
      label: 'Active Today',
      value: stats.activeToday,
      icon: Activity,
      color: 'green' as const,
      description: 'Users active in last 24h',
    },
    {
      label: 'New This Week',
      value: stats.newThisWeek,
      icon: UserPlus,
      color: 'purple' as const,
      description: 'New registrations',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; iconBg: string; text: string }> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        iconBg: "bg-blue-500",
        text: "text-blue-900 dark:text-blue-100",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        iconBg: "bg-green-500",
        text: "text-green-900 dark:text-green-100",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        iconBg: "bg-purple-500",
        text: "text-purple-900 dark:text-purple-100",
      },
    };
    return colors[color] || colors.blue;
  };

  if (status === "loading" || (loading && users.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const colors = getColorClasses(card.color);
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${colors.bg} rounded-xl p-5 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className={`text-3xl font-bold ${colors.text} mt-1`}>
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {card.description}
                  </p>
                </div>
                <div className={`${colors.iconBg} p-2.5 rounded-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
          {/* Search and Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                  showFilters 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={() => fetchUsers(1)}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters */}
          {(filters.role !== 'all' || filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
              {filters.role !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                  Role: {filters.role}
                  <button onClick={() => setFilters(prev => ({ ...prev, role: 'all' }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                  Status: {filters.status}
                  <button onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.dateFrom && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                  From: {filters.dateFrom}
                  <button onClick={() => setFilters(prev => ({ ...prev, dateFrom: '' }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.dateTo && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                  To: {filters.dateTo}
                  <button onClick={() => setFilters(prev => ({ ...prev, dateTo: '' }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedIds.length} user{selectedIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkSuspend(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                <Ban className="w-4 h-4" />
                Suspend
              </button>
              <button
                onClick={() => handleBulkSuspend(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Reactivate
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Table */}
      <UserTable
        users={users}
        pagination={pagination}
        selectedIds={selectedIds}
        sortField={sortField}
        sortDirection={sortDirection}
        onPageChange={(page) => fetchUsers(page)}
        onPageSizeChange={(size) => fetchUsers(1, size)}
        onSort={handleSort}
        onRoleUpdate={handleRoleUpdate}
        onDeleteUser={handleDeleteUser}
        onSuspendUser={handleSuspendUser}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onViewDetails={handleViewDetails}
        loading={loading}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onRoleUpdate={handleRoleUpdate}
        onSuspendUser={handleSuspendUser}
        onDeleteUser={handleDeleteUser}
        courses={userCourses}
        activities={userActivities}
      />
    </div>
  );
}
