/**
 * Admin Layout
 * Protected layout with sidebar navigation for admin users
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

import { 
  LayoutDashboard, 
  BookOpen, 
  Code2, 
  Users,
  BarChart3,
  Home,
  Settings,
  FileText,
  Megaphone
} from "lucide-react";

export const metadata = {
  title: "Admin Panel | Eduardo Rico",
  description: "Administration panel for managing courses, lessons, and users",
};

async function checkAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }
  
  if ((session.user as any).role !== "admin") {
    redirect("/");
  }
  
  return session;
}

const sidebarNavItems = [
  { 
    href: "/admin", 
    icon: LayoutDashboard, 
    label: "Dashboard",
    description: "Overview and stats"
  },
  { 
    href: "/admin/usuarios", 
    icon: Users, 
    label: "Users",
    description: "Manage users"
  },
  { 
    href: "/admin/cursos", 
    icon: BookOpen, 
    label: "Courses",
    description: "Manage courses"
  },
  { 
    href: "/admin/lecciones", 
    icon: FileText, 
    label: "Lessons",
    description: "Manage lessons"
  },
  { 
    href: "/admin/ejercicios", 
    icon: Code2, 
    label: "Exercises",
    description: "Manage exercises"
  },
  { 
    href: "/admin/anuncios", 
    icon: Megaphone, 
    label: "Anuncios",
    description: "Manage announcements"
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdmin();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin" 
                className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <span>Admin</span>
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link 
                href="/" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 transition-colors"
              >
                <Home className="w-4 h-4" />
                View Site
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse" />
                Admin Access
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1 lg:sticky lg:top-24">
              {sidebarNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden xl:block">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Admin Info Card */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Admin Panel
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Manage your platform content, users, and view statistics.
              </p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
