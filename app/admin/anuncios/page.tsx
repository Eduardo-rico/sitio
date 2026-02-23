"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Megaphone,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Users,
  UserPlus,
  Target,
  Calendar,
  Filter,
  Loader2,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  priority: "normal" | "high";
  displayType: "banner" | "toast" | "modal";
  audience: "all" | "new_users" | "specific_users";
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  dismissible: boolean;
  createdAt: string;
  updatedAt: string;
}

const typeConfig = {
  info: { 
    label: "Info", 
    icon: Info, 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" 
  },
  success: { 
    label: "Éxito", 
    icon: CheckCircle, 
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" 
  },
  warning: { 
    label: "Advertencia", 
    icon: AlertTriangle, 
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" 
  },
  error: { 
    label: "Error", 
    icon: AlertCircle, 
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" 
  },
};

const displayTypeLabels = {
  banner: "Banner",
  toast: "Toast",
  modal: "Modal",
};

const audienceConfig = {
  all: { label: "Todos", icon: Users },
  new_users: { label: "Nuevos", icon: UserPlus },
  specific_users: { label: "Específicos", icon: Target },
};

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Check admin access
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/admin/anuncios");
      return;
    }

    if ((session.user as any).role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch announcements
  useEffect(() => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "admin") return;

    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (typeFilter !== "all") params.append("type", typeFilter);

        const response = await fetch(`/api/admin/announcements?${params}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Error al cargar anuncios");
        }

        setAnnouncements(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [session, status, statusFilter, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este anuncio? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar");
      }

      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Error al eliminar el anuncio");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar");
      }

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, isActive: !currentStatus } : a
        )
      );
    } catch (err) {
      alert("Error al actualizar el estado");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Sin fecha fin";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Anuncios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los anuncios y notificaciones de la plataforma
          </p>
        </div>
        <Link
          href="/admin/anuncios/nuevo"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Anuncio
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filtros:</span>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">Todos los tipos</option>
          <option value="info">Información</option>
          <option value="success">Éxito</option>
          <option value="warning">Advertencia</option>
          <option value="error">Error</option>
        </select>

        {(statusFilter !== "all" || typeFilter !== "all") && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setTypeFilter("all");
            }}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Bell className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay anuncios
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Crea tu primer anuncio para notificar a los usuarios sobre actualizaciones, 
            nuevas funciones o información importante.
          </p>
          <Link
            href="/admin/anuncios/nuevo"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Anuncio
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Anuncio
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Audiencia
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fechas
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {announcements.map((announcement) => {
                  const typeInfo = typeConfig[announcement.type];
                  const TypeIcon = typeInfo.icon;
                  const audienceInfo = audienceConfig[announcement.audience];
                  const AudienceIcon = audienceInfo.icon;
                  const expired = isExpired(announcement.endDate);

                  return (
                    <tr 
                      key={announcement.id} 
                      className={cn(
                        "hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors",
                        !announcement.isActive && "opacity-60"
                      )}
                    >
                      {/* Title & Message */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {announcement.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {announcement.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              {displayTypeLabels[announcement.displayType]}
                            </span>
                            {announcement.priority === "high" && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">
                                Alta prioridad
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                          typeInfo.color
                        )}>
                          <TypeIcon className="w-3.5 h-3.5" />
                          {typeInfo.label}
                        </span>
                      </td>

                      {/* Audience */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <AudienceIcon className="w-4 h-4" />
                          <span className="text-sm">{audienceInfo.label}</span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <div className="text-sm">
                            <p>{formatDate(announcement.startDate)}</p>
                            <p className={cn(
                              "text-xs",
                              expired && "text-red-500 font-medium"
                            )}>
                              → {formatDate(announcement.endDate)}
                              {expired && " (Expirado)"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {announcement.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <Eye className="w-3.5 h-3.5" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                            <EyeOff className="w-3.5 h-3.5" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(announcement.id, announcement.isActive)}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              announcement.isActive
                                ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            )}
                            title={announcement.isActive ? "Desactivar" : "Activar"}
                          >
                            {announcement.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          
                          <Link
                            href={`/admin/anuncios/${announcement.id}`}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats summary */}
      {announcements.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {announcements.filter(a => a.isActive).length}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Activos</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {announcements.filter(a => !a.isActive).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Inactivos</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {announcements.filter(a => a.priority === "high").length}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">Alta prioridad</p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {announcements.filter(a => a.displayType === "modal").length}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">Modales</p>
          </div>
        </div>
      )}
    </div>
  );
}
