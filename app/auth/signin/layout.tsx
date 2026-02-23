import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Eduardo Rico",
  description: "Inicia sesión para acceder a tu cuenta",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Eduardo Rico
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Accede a tu cuenta para continuar
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          {children}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

// Separate client component for the date to avoid hydration mismatch
function Footer() {
  return (
    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
      &copy; 2025 Eduardo Rico. Todos los derechos reservados.
    </p>
  );
}
