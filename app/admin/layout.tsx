/**
 * Layout del panel de administración
 * Protegido para usuarios admin
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { 
  LayoutDashboard, 
  BookOpen, 
  Code2, 
  Settings, 
  Users,
  BarChart3,
  Home
} from 'lucide-react';

export const metadata = {
  title: 'Panel de Administración | Eduardo Rico',
};

async function checkAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  if ((session.user as any).role !== 'admin') {
    redirect('/');
  }
  
  return session;
}

const sidebarItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/cursos', icon: BookOpen, label: 'Cursos' },
  { href: '/admin/lecciones', icon: Code2, label: 'Lecciones' },
  { href: '/admin/ejercicios', icon: Code2, label: 'Ejercicios' },
  { href: '/admin/estadisticas', icon: BarChart3, label: 'Estadísticas' },
  { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
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
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin" 
                className="text-xl font-bold text-gray-900 dark:text-gray-100"
              >
                Admin
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link 
                href="/" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Ver sitio
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
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
