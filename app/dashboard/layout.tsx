import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth";
import { AnnouncementBanner } from "@/components/announcement-banner";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | Mi Aprendizaje",
};

const sidebarItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Resumen" },
  { href: "/dashboard/cursos", icon: BookOpen, label: "Mis Cursos" },
  { href: "/dashboard/configuracion", icon: Settings, label: "Configuración" },
];

async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Announcement Banner */}
      <AnnouncementBanner />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                Mi Dashboard
              </Link>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {session.user.name || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session.user.email}
                  </p>
                </div>
                <Avatar name={session.user.name} image={session.user.image} />
              </div>

              {/* Sign Out Button */}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1 lg:sticky lg:top-24">
              {sidebarItems.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Back to Site Link */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Volver al sitio
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all group"
    >
      <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
      <span className="font-medium group-hover:text-gray-900 dark:group-hover:text-white">
        {children}
      </span>
    </Link>
  );
}

// Avatar Component with initials
function Avatar({ name, image }: { name?: string | null; image?: string | null }) {
  // Generate initials from name
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Consistent gradient based on name
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-green-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-cyan-500 to-blue-600",
  ];
  const gradientIndex = name
    ? name.charCodeAt(0) % gradients.length
    : 0;
  const gradient = gradients[gradientIndex];

  if (image) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-md">
        <Image
          src={image}
          alt={name || "Avatar"}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white dark:ring-gray-700`}
    >
      {initials}
    </div>
  );
}

export default DashboardLayout;
