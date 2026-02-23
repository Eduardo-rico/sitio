import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserSettings } from "@/components/dashboard/UserSettings";
import prisma from "@/lib/prisma";

async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/configuracion");
  }

  const user = await getUserProfile(session.user.id);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Error al cargar tu perfil. Por favor, intenta nuevamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona tu perfil y preferencias de cuenta
        </p>
      </div>

      {/* Settings Component */}
      <UserSettings user={user} />
    </div>
  );
}
