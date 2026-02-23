"use client";

import { useState } from "react";
import { 
  Shield, 
  User, 
  Check, 
  AlertTriangle,
  Loader2,
  ChevronDown
} from "lucide-react";

interface RoleEditorProps {
  userId: string;
  currentRole: string;
  onRoleUpdate: (userId: string, newRole: string) => Promise<{ success: boolean; error?: string }>;
}

export default function RoleEditor({ 
  userId, 
  currentRole, 
  onRoleUpdate 
}: RoleEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { value: "user", label: "User", icon: User, color: "gray" },
    { value: "admin", label: "Admin", icon: Shield, color: "purple" },
  ];

  const currentRoleData = roles.find(r => r.value === currentRole) || roles[0];

  const handleRoleClick = (roleValue: string) => {
    if (roleValue === currentRole) {
      setIsOpen(false);
      return;
    }

    // Show confirmation modal for admin promotion
    if (roleValue === "admin") {
      setPendingRole(roleValue);
      setShowConfirmModal(true);
      setIsOpen(false);
    } else {
      // Direct update for user role
      executeRoleUpdate(roleValue);
      setIsOpen(false);
    }
  };

  const executeRoleUpdate = async (roleValue: string) => {
    setIsUpdating(true);
    setError(null);

    const result = await onRoleUpdate(userId, roleValue);

    if (!result.success) {
      setError(result.error || "Failed to update role");
    }

    setIsUpdating(false);
    setShowConfirmModal(false);
    setPendingRole(null);
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "user":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={() => !isUpdating && setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border
            ${getRoleBadgeClasses(currentRole)}
            ${isUpdating ? "opacity-75 cursor-not-allowed" : "hover:opacity-80 cursor-pointer"}
            transition-opacity
          `}
        >
          {isUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <currentRoleData.icon className="w-3.5 h-3.5" />
              <span>{currentRoleData.label}</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </>
          )}
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleClick(role.value)}
                  className={`
                    w-full px-4 py-2 text-left text-sm flex items-center gap-2
                    ${currentRole === role.value 
                      ? "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                    transition-colors
                  `}
                >
                  <role.icon className={`w-4 h-4 ${
                    role.value === "admin" 
                      ? "text-purple-600 dark:text-purple-400" 
                      : "text-gray-500 dark:text-gray-400"
                  }`} />
                  <span>{role.label}</span>
                  {currentRole === role.value && (
                    <Check className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Confirmation Modal for Admin Promotion */}
      {showConfirmModal && pendingRole === "admin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Grant Admin Privileges
                </h3>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                <strong>Warning:</strong> You are about to grant administrator privileges.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This user will have full access to:
              </p>
              <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
                <li>Manage all users and their roles</li>
                <li>Create, edit, and delete courses</li>
                <li>Access all administrative functions</li>
                <li>View platform statistics and data</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingRole(null);
                }}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => executeRoleUpdate("admin")}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Grant Admin Access
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
