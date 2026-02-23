"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Code, 
  Terminal, 
  Zap, 
  Users, 
  Award, 
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  GraduationCap,
  Sparkles
} from "lucide-react";
import Posts from "./components/Posts";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideUp, SlideInLeft, SlideInRight } from "@/components/animations/slide-up";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";
import { transitions } from "@/lib/animations";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Python Course Promo */}
      <PythonCourseSection />
      
      {/* Features */}
      <FeaturesSection />
      
      {/* About */}
      <AboutSection />
      
      {/* Blog Posts */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <FadeIn direction="up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Últimos Artículos
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Compartiendo conocimiento sobre programación, ciencia de datos e inteligencia artificial
            </p>
          </FadeIn>
          <Posts />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
      {/* Background Pattern */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nuevo: Curso de Python Gratuito</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Aprende a Programar{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              desde Cero
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/80 mb-4 max-w-2xl mx-auto"
          >
            Hola, soy Eduardo Rico
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Químico, científico de datos y estudiante de maestría en IA. 
            Te enseño programación de forma práctica y sin complicaciones.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/tutoriales"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <PlayCircle className="w-5 h-5" />
                Comenzar a Aprender
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <Users className="w-5 h-5" />
                Crear Cuenta Gratis
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" className="dark:fill-gray-950"/>
        </svg>
      </div>
    </section>
  );
}

function PythonCourseSection() {
  const features = [
    "100% Gratuito - Acceso ilimitado",
    "Editor de código interactivo en el navegador",
    "Ejercicios prácticos con validación automática",
    "Progreso guardado en tu cuenta",
    "Certificado al completar",
    "Sin experiencia previa necesaria",
  ];

  const lessons = [
    "Introducción a Python",
    "Variables y tipos de datos",
    "Operadores y expresiones",
    "Estructuras de control (if, for, while)",
    "Funciones y módulos",
    "Listas, tuplas y diccionarios",
    "Manejo de archivos",
    "Programación orientada a objetos",
    "Manejo de errores",
    "Proyecto final",
  ];

  return (
    <section className="py-20 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <SlideInLeft>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full mb-6">
              <Zap className="w-4 h-4" />
              <span>Curso Destacado</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Python desde{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
                Cero
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Aprende el lenguaje de programación más popular del mundo. 
              Desde tus primeras líneas de código hasta crear programas reales, 
              todo con ejercicios interactivos y retroalimentación instantánea.
            </p>
            
            <StaggerContainer className="grid sm:grid-cols-2 gap-3 mb-8" staggerDelay={0.05}>
              {features.map((feature, idx) => (
                <StaggerItem key={idx}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/tutoriales/python"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Terminal className="w-5 h-5" />
                  Ir al Curso
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  Crear Cuenta
                </Link>
              </motion.div>
            </div>
          </SlideInLeft>
          
          {/* Lessons Preview */}
          <SlideInRight delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
              <motion.div 
                whileHover={{ y: -4 }}
                transition={transitions.ease}
                className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div 
                    whileHover={{ rotate: 10 }}
                    className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center"
                  >
                    <Code className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Contenido del Curso</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">10 lecciones • Proyecto final</p>
                  </div>
                </div>
                
                <StaggerContainer className="space-y-2" staggerDelay={0.05} delayChildren={0.3}>
                  {lessons.map((lesson, idx) => (
                    <StaggerItem key={idx}>
                      <motion.div 
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                      >
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{lesson}</span>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </motion.div>
            </div>
          </SlideInRight>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Terminal,
      title: "Código Interactivo",
      description: "Escribe y ejecuta código Python directamente en tu navegador, sin necesidad de instalar nada.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BookOpen,
      title: "Contenido Estructurado",
      description: "Lecciones organizadas desde lo básico hasta conceptos avanzados con ejemplos prácticos.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Award,
      title: "Certificado de Finalización",
      description: "Obtén un certificado al completar el curso para compartir en tus redes profesionales.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Comunidad de Aprendizaje",
      description: "Únete a otros estudiantes, comparte tu progreso y resuelve dudas juntos.",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="up" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Por qué aprender aquí?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Una plataforma diseñada para que aprendas de forma efectiva y práctica
          </p>
        </FadeIn>
        
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {features.map((feature, idx) => (
            <StaggerItem key={idx}>
              <motion.div 
                whileHover={{ y: -8, boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15)" }}
                transition={transitions.ease}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={transitions.spring}
                  className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="py-20 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn direction="up">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6"
          >
            <GraduationCap className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Sobre el Instructor
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Soy químico de formación, licenciado en ciencias de datos y actualmente 
            estudio la maestría en inteligencia artificial. Me apasiona enseñar 
            programación de forma clara y práctica.
          </p>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Cuando no estoy programando, me gusta hacer ejercicio, salir a correr 
            y pasar tiempo con mis 5 perros. 🐕
          </p>
          
          <StaggerContainer className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400" staggerDelay={0.1}>
            {["Ciencia de Datos", "Inteligencia Artificial", "Programación"].map((skill, idx) => (
              <StaggerItem key={idx}>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {skill}
                </motion.span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </FadeIn>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn direction="up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para comenzar tu viaje en programación?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes que están aprendiendo Python de forma gratuita. 
            Crea tu cuenta y comienza hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Crear Cuenta Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/tutoriales"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Explorar Cursos
              </Link>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
