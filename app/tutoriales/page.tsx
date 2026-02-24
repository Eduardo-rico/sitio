"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, Rocket, BarChart3, Briefcase } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";
import { transitions } from "@/lib/animations";
import { CardSkeleton } from "@/components/animations/loading-skeleton";
import { useState, useEffect } from "react";
import {
  LANGUAGE_LABELS,
  RUNTIME_LABELS,
  isCourseLanguage,
  isRuntimeType,
} from "@/lib/course-runtime";

// Course type definition
interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language?: string;
  runtimeType?: string;
  lessonsCount: number;
  progressPercentage?: number;
  lessons?: Array<{
    estimatedMinutes: number;
  }>;
}

export default function TutorialsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/courses");
        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "No se pudieron cargar los cursos");
        }

        if (!mounted) return;
        setCourses(payload.data);
      } catch (error) {
        console.error("Error cargando cursos:", error);
        if (!mounted) return;
        setCourses([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadCourses();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <FadeIn direction="up" className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...transitions.springSoft, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6"
        >
          <BookOpen className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Tutoriales Interactivos de Programación
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Aprende y practica con cursos interactivos de Python, Clojure, JavaScript,
          TypeScript, SQL, Go, Rust y Bash. Todo ejecuta directo en tu navegador.
        </p>
      </FadeIn>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} hasImage={false} lines={2} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-6xl mb-4"
          >
            💻
          </motion.div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Próximamente
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos preparando tutoriales increíbles. ¡Vuelve pronto!
          </p>
        </motion.div>
      ) : (
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {courses.map((course) => (
            <StaggerItem key={course.id}>
              <CourseCard course={course} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Featured Section */}
      <FeaturedSection />
    </main>
  );
}

function CourseCard({ course }: { course: Course }) {
  const estimatedMinutes =
    course.lessons && course.lessons.length > 0
      ? Math.round(
          course.lessons.reduce((acc, lesson) => acc + lesson.estimatedMinutes, 0) /
            course.lessons.length
        )
      : 10;

  const candidateLanguage = course.language ?? "";
  const candidateRuntime = course.runtimeType ?? "";
  const language = isCourseLanguage(candidateLanguage) ? candidateLanguage : "python";
  const runtime = isRuntimeType(candidateRuntime) ? candidateRuntime : "browser_pyodide";
  const courseEmoji = getLanguageEmoji(language);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={transitions.ease}
      className="group"
    >
      <Link
        href={`/tutoriales/${course.slug}`}
        className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <motion.span 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-4xl"
            >
              {courseEmoji}
            </motion.span>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {course.lessonsCount} lecciones
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-full">
              {LANGUAGE_LABELS[language]}
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-full">
              {RUNTIME_LABELS[runtime]}
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {course.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {course.description || "Curso práctico con ejercicios interactivos."}
          </p>
          
          <motion.div 
            className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium"
            whileHover={{ x: 4 }}
          >
            <span>Comenzar curso</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            {estimatedMinutes} min por lección
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturedSection() {
  const benefits = [
    {
      icon: Rocket,
      title: "Práctica real",
      description: "Corre código y valida ejercicios en una UX consistente.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Multi-lenguaje",
      description: "Una misma plataforma para varios stacks técnicos.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Briefcase,
      title: "Escalable",
      description: "Modelo de cursos y runtimes preparado para crecer.",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <FadeIn direction="up" delay={0.3} className="mt-16">
      <motion.div 
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
        className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white"
      >
        <div className="max-w-3xl">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-6"
          >
            ¿Por qué aprender aquí?
          </motion.h2>
          <StaggerContainer className="grid md:grid-cols-3 gap-6 text-sm" staggerDelay={0.1}>
            {benefits.map((benefit, idx) => (
              <StaggerItem key={idx}>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="flex items-start"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${benefit.color} mr-3`}>
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-blue-100">{benefit.description}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </motion.div>
    </FadeIn>
  );
}

function getLanguageEmoji(language: keyof typeof LANGUAGE_LABELS): string {
  switch (language) {
    case "python":
      return "🐍";
    case "clojure":
      return "🧠";
    case "javascript":
      return "🟨";
    case "typescript":
      return "🔷";
    case "sql":
      return "🗄️";
    case "go":
      return "🐹";
    case "rust":
      return "🦀";
    case "bash":
      return "🖥️";
  }
}
