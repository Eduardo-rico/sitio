"use client";

import Link from "next/link";
import { 
  FaGithub, 
  FaMedium, 
  FaLinkedin, 
  FaMastodon,
  FaTwitter
} from "react-icons/fa";
import { 
  Mail, 
  MapPin, 
  Heart,
  Code,
  BookOpen,
  Terminal,
  ExternalLink
} from "lucide-react";

export function Footer() {
  const currentYear = 2025;

  const footerLinks = {
    cursos: [
      { name: "Python desde Cero", href: "/tutoriales/python" },
      { name: "Todos los Cursos", href: "/tutoriales" },
      { name: "Ejercicios Prácticos", href: "/tutoriales" },
    ],
    recursos: [
      { name: "Blog", href: "/" },
      { name: "Documentación", href: "#" },
      { name: "FAQ", href: "#" },
    ],
    legal: [
      { name: "Términos de Uso", href: "#" },
      { name: "Privacidad", href: "#" },
      { name: "Cookies", href: "#" },
    ],
  };

  const socialLinks = [
    { name: "GitHub", href: "https://github.com/Eduardo-rico", icon: FaGithub },
    { name: "Medium", href: "https://medium.com/@eduardo.rico", icon: FaMedium },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/eduardo-rico-sotomayor/", icon: FaLinkedin },
    { name: "Mastodon", href: "https://mastodon.social/@LaloRico4", icon: FaMastodon },
  ];

  return (
    <footer className="bg-slate-900 dark:bg-black border-t border-slate-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Eduardo Rico</h3>
                <p className="text-xs text-slate-400">Aprende a Programar</p>
              </div>
            </Link>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Plataforma educativa gratuita para aprender programación, 
              ciencia de datos e inteligencia artificial desde cero.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Cursos Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Cursos
            </h4>
            <ul className="space-y-3">
              {footerLinks.cursos.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-500" />
              Recursos
            </h4>
            <ul className="space-y-3">
              {footerLinks.recursos.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-purple-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-500" />
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-slate-500" />
                <span>emrs94@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-500" />
                <span>México</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="text-white text-sm font-medium mb-2">
                ¿Nuevo contenido?
              </p>
              <p className="text-slate-400 text-xs mb-3">
                Sígueme en Medium para estar al día
              </p>
              <a
                href="https://medium.com/@eduardo.rico"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Ir a Medium
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-slate-500 text-sm text-center md:text-left">
              {currentYear} Eduardo Rico. Todos los derechos reservados.
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Made with love */}
            <p className="text-slate-500 text-sm flex items-center gap-1">
              Hecho con <Heart className="w-4 h-4 text-red-500 fill-red-500" /> y código
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
