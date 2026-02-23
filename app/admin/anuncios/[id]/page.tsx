"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ChevronLeft, Megaphone, Loader2 } from "lucide-react";
import Link from "next/link";
import { AnnouncementForm, AnnouncementFormData } from "@/components/admin/announcement-form";

interface EditAnnouncementPageProps {
  params: { id: string };
}

export default function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [announcement, setAnnouncement] = useState<AnnouncementFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch announcement data
  useEffect(() => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "admin") return;

    const fetchAnnouncement = async () => {
      try {
        // Fetch all and filter by id
        const allResponse = await fetch("/api/admin/announcements");
        const data = await allResponse.json();

        if (!data.success) {
          throw new Error(data.error || "Error al cargar el anuncio");
        }

        const found = data.data.find((a: any) => a.id === params.id);
        if (!found) {
          throw new Error("Anuncio no encontrado");
        }

        // Format dates for form inputs
        setAnnouncement({
          title: found.title,
          message: found.message,
          type: found.type,
          priority: found.priority,
          displayType: found.displayType,
          audience: found.audience,
          specificUserIds: found.specificUserIds || [],
          startDate: found.startDate ? new Date(found.startDate).toISOString().split("T")[0] : "",
          endDate: found.endDate ? new Date(found.endDate).toISOString().split("T")[0] : "",
          isActive: found.isActive,
          dismissible: found.dismissible,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [session, status, params.id]);

  const handleSubmit = async (formData: AnnouncementFormData) => {
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id, ...formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el anuncio");
      }

      toast.success("Anuncio actualizado exitosamente");
      router.push("/admin/anuncios");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar el anuncio");
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/admin/anuncios");
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
        <Link
          href="/admin/anuncios"
          className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a anuncios
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Link 
          href="/admin" 
          className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          Admin
        </Link>
        <span>/</span>
        <Link 
          href="/admin/anuncios" 
          className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          Anuncios
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">Editar</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/anuncios"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Editar Anuncio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Modifica los detalles del anuncio
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
        {announcement && (
          <AnnouncementForm
            initialData={announcement}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing
          />
        )}
      </div>
    </div>
  );
}
