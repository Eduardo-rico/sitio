"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  FaGithub,
  FaMedium,
  FaLinkedin,
  FaMastodon,
} from "react-icons/fa";
import { 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Shield, 
  BookOpen,
  Code,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "admin";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-800" 
          : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isScrolled 
                ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                : "bg-white/20 backdrop-blur-sm"
            }`}>
              <Code className={`w-6 h-6 ${isScrolled ? "text-white" : "text-white"}`} />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl font-bold transition-colors ${
                isScrolled ? "text-gray-900 dark:text-white" : "text-white"
              }`}>
                Eduardo Rico
              </h1>
              <p className={`text-xs transition-colors ${
                isScrolled ? "text-gray-500 dark:text-gray-400" : "text-white/70"
              }`}>
                Aprende a Programar
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Main Nav Links */}
            <NavLink href="/" isScrolled={isScrolled}>Inicio</NavLink>
            <NavLink href="/tutoriales" isScrolled={isScrolled}>Cursos</NavLink>
            
            {/* Social Links */}
            <div className={`h-6 w-px mx-2 ${isScrolled ? "bg-gray-300 dark:bg-gray-700" : "bg-white/30"}`} />
            
            <SocialLink href="https://github.com/Eduardo-rico" icon={<FaGithub />} isScrolled={isScrolled} />
            <SocialLink href="https://medium.com/@eduardo.rico" icon={<FaMedium />} isScrolled={isScrolled} />
            <SocialLink href="https://www.linkedin.com/in/eduardo-rico-sotomayor/" icon={<FaLinkedin />} isScrolled={isScrolled} />
            
            {/* Auth Section */}
            <div className={`h-6 w-px mx-2 ${isScrolled ? "bg-gray-300 dark:bg-gray-700" : "bg-white/30"}`} />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isScrolled 
                        ? "text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20" 
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isScrolled 
                      ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" 
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                    isScrolled 
                      ? "hover:bg-gray-100 dark:hover:bg-gray-800" 
                      : "hover:bg-white/10"
                  }`}>
                    <Avatar 
                      name={session.user?.name} 
                      image={session.user?.image}
                      size="sm"
                    />
                    <ChevronDown className={`w-4 h-4 ${isScrolled ? "text-gray-500" : "text-white/70"}`} />
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {session.user?.name || "Usuario"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link 
                        href="/dashboard/configuracion"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Configuración
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/auth/signin"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isScrolled 
                      ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" 
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>

                <Link
                  href="/auth/signup"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isScrolled 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled 
                ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" 
                : "text-white hover:bg-white/10"
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
              <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>Inicio</MobileNavLink>
              <MobileNavLink href="/tutoriales" onClick={() => setIsMobileMenuOpen(false)}>Cursos</MobileNavLink>
              
              {isAuthenticated ? (
                <>
                  <MobileNavLink href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </MobileNavLink>
                  {isAdmin && (
                    <MobileNavLink href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Shield className="w-4 h-4" /> Admin
                    </MobileNavLink>
                  )}
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-white/10 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <LogIn className="w-4 h-4" /> Entrar
                  </MobileNavLink>
                  <MobileNavLink href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <UserPlus className="w-4 h-4" /> Registrarse
                  </MobileNavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Nav Link Component
function NavLink({ 
  href, 
  children, 
  isScrolled 
}: { 
  href: string; 
  children: React.ReactNode; 
  isScrolled: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isScrolled 
          ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" 
          : "text-white/90 hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}

// Social Link Component
function SocialLink({ 
  href, 
  icon, 
  isScrolled 
}: { 
  href: string; 
  icon: React.ReactNode; 
  isScrolled: boolean;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-2 rounded-lg transition-all ${
        isScrolled 
          ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200" 
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
    </Link>
  );
}

// Mobile Nav Link
function MobileNavLink({ 
  href, 
  children, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode; 
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg transition-colors"
    >
      {children}
    </Link>
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

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-green-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-cyan-500 to-blue-600",
  ];
  const gradientIndex = name ? name.charCodeAt(0) % gradients.length : 0;
  const gradient = gradients[gradientIndex];

  if (image) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ring-2 ring-white/50 shadow-sm`}>
        <Image src={image} alt={name || "Avatar"} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white/50`}>
      {initials}
    </div>
  );
}
