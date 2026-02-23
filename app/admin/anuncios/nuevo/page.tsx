"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ChevronLeft, Megaphone } from "lucide-react";
import Link from "next/link";
import { AnnouncementForm, AnnouncementFormData } from "@/components/admin/announcement-form";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check admin access
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/admin/anuncios/nuevo");
      return;
    }

    if ((session.user as any).role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  const handleSubmit = async (formData: AnnouncementFormData) => {
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el anuncio");
      }

      toast.success("Anuncio creado exitosamente");
      router.push("/admin/anuncios");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el anuncio");
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/admin/anuncios");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
        <span className="text-gray-900 dark:text-gray-100 font-medium">Nuevo</span>
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
              Nuevo Anuncio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Crea un anuncio para notificar a los usuarios
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
        <AnnouncementForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
