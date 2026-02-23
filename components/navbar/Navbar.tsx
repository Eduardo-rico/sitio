"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  FaGithub,
  FaMedium,
  FaLinkedin,
  FaMastodon,

} from "react-icons/fa";
import { LayoutDashboard, LogOut, LogIn, UserPlus, Shield } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="bg-slate-600 p-4 sticky top-0 drop-shadow-xl z-10">
      <div className="prose prose-xl mx-auto flex justify-between flex-col sm:flex-row items-center">
        {/* Logo / Brand */}
        <h1 className="text-3xl font-bold text-white grid place-content-center mb-2 md:mb-0">
          <Link
            href="/"
            className="text-white/90 no-underline hover:text-white"
          >
            Eduardo Rico
          </Link>
        </h1>

        {/* Navigation Links */}
        <div className="flex flex-row justify-center sm:justify-evenly items-center gap-4 text-white">
          {/* Social Links */}
          <Link
            className="text-white/90 hover:text-white text-2xl lg:text-3xl"
            href="https://medium.com/@eduardo.rico"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaMedium />
          </Link>
          <Link
            className="text-white/90 hover:text-white text-2xl lg:text-3xl"
            href="https://github.com/Eduardo-rico"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </Link>
          <Link
            className="text-white/90 hover:text-white text-2xl lg:text-3xl"
            href="https://www.linkedin.com/in/eduardo-rico-sotomayor/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </Link>
          <Link
            className="text-white/90 hover:text-white text-2xl lg:text-3xl"
            href="https://mastodon.social/@LaloRico4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaMastodon />
          </Link>

          {/* Divider */}
          <span className="text-white/30 mx-2">|</span>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Admin Link */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium px-2 py-1 rounded hover:bg-slate-500 transition-colors"
                  title="Panel de Administración"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium px-2 py-1 rounded hover:bg-slate-500 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* User Avatar/Name */}
              <div className="flex items-center gap-2 text-sm">
                <Avatar 
                  name={session.user?.name} 
                  image={session.user?.image}
                  size="sm"
                />
                <span className="hidden md:inline font-medium">
                  {session.user?.name?.split(" ")[0] || session.user?.email?.split("@")[0]}
                </span>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium px-3 py-1.5 rounded bg-slate-500/50 hover:bg-slate-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Sign In Link */}
              <Link
                href="/auth/signin"
                className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-slate-500 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>

              {/* Sign Up Link */}
              <Link
                href="/auth/signup"
                className="flex items-center gap-1 text-white bg-blue-500/80 hover:bg-blue-500 text-sm font-medium px-3 py-1.5 rounded transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Registrarse</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Avatar Component with initials
function Avatar({ 
  name, 
  image,
  size = "md"
}: { 
  name?: string | null; 
  image?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

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
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ring-2 ring-white/50 shadow-sm`}>
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
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white/50`}
    >
      {initials}
    </div>
  );
}
