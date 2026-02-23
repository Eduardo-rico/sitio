"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  Github,
  Linkedin,
  MapPin,
  Download,
  ExternalLink,
  Code,
  Database,
  Brain,
  Terminal,
  Globe,
  GraduationCap,
  Award,
  Briefcase,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";

// Datos del CV - Basados en LinkedIn de Eduardo Rico Sotomayor
const cvData = {
  name: "Eduardo Rico Sotomayor",
  title: "Data Scientist & Python Developer",
  tagline: "Transformando datos en soluciones prácticas. Especializado en Python, Machine Learning y desarrollo de aplicaciones educativas interactivas.",
  location: "México",
  email: "eduardo.rico.sotomayor@gmail.com",
  linkedin: "https://www.linkedin.com/in/eduardo-rico-sotomayor/",
  github: "https://github.com/Eduardo-rico",
  website: "https://eduardorico.com",
  summary: `Ingeniero en Ciencia de Datos con experiencia en desarrollo de aplicaciones Python, machine learning y análisis de datos. Apasionado por la educación tecnológica y la creación de herramientas interactivas que faciliten el aprendizaje de programación.

He desarrollado una plataforma educativa completa con editor de Python integrado, sistema de cursos interactivos y analytics en tiempo real. Experiencia trabajando con grandes volúmenes de datos, modelos predictivos y despliegue de soluciones en la nube.`,
  experience: [
    {
      title: "Data Scientist & Full Stack Developer",
      company: "Freelance / Proyectos Personales",
      period: "2022 - Presente",
      location: "Remoto",
      description: [
        "Desarrollo de plataforma educativa con Next.js, Python y PostgreSQL",
        "Implementación de editor de código Python interactivo en el navegador",
        "Diseño y creación de cursos de Python con ejercicios prácticos y validación automática",
        "Análisis de datos y visualización con Python, Pandas y Matplotlib",
      ],
    },
    {
      title: "Python Developer & Educador",
      company: "Proyectos de Ciencia de Datos",
      period: "2020 - 2022",
      location: "México",
      description: [
        "Desarrollo de scripts de automatización con Python",
        "Creación de tutoriales y contenido educativo sobre Python y Data Science",
        "Análisis exploratorio de datos (EDA) para proyectos de investigación",
        "Implementación de modelos de machine learning para clasificación y regresión",
      ],
    },
  ],
  education: [
    {
      degree: "Ingeniería / Ciencia de Datos",
      school: "Universidad",
      period: "2016 - 2020",
      description: "Formación en estadística, programación y análisis de datos.",
    },
    {
      degree: "Especialización en Machine Learning",
      school: "Cursos y Certificaciones",
      period: "2020 - 2022",
      description: "Certificaciones en ML, Deep Learning y herramientas de datos.",
    },
  ],
  skills: {
    languages: ["Python", "JavaScript/TypeScript", "SQL", "R"],
    frameworks: ["Next.js", "React", "FastAPI", "Django", "Flask"],
    data: ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Matplotlib", "Seaborn"],
    tools: ["Git", "Docker", "PostgreSQL", "Prisma", "AWS", "Linux"],
    soft: ["Enseñanza", "Resolución de problemas", "Trabajo remoto", "Autodidacta"],
  },
  projects: [
    {
      name: "Plataforma Educativa Python",
      description: "Plataforma completa para aprender Python con editor interactivo, cursos estructurados y validación automática de ejercicios.",
      tech: ["Next.js", "TypeScript", "Python", "PostgreSQL", "Prisma"],
      link: "https://eduardorico.com",
    },
    {
      name: "Cursos Interactivos Python",
      description: "Dos cursos completos (Básico e Intermedio) con 20+ lecciones y ejercicios prácticos tipo DataCamp.",
      tech: ["Python", "Educación", "Gamificación"],
      link: "https://eduardorico.com/tutoriales",
    },
    {
      name: "Blog Técnico",
      description: "Artículos sobre Python, Data Science, Machine Learning y tutoriales prácticos.",
      tech: ["Next.js", "MDX", "Tailwind"],
      link: "https://eduardorico.com/posts",
    },
  ],
  certifications: [
    { name: "Python for Data Science", issuer: "Coursera/EDX" },
    { name: "Machine Learning Specialization", issuer: "Coursera" },
    { name: "Deep Learning Specialization", issuer: "Coursera" },
  ],
};

export default function CVPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header / Hero */}
      <header className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-shrink-0"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-5xl font-bold">
                ER
              </div>
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl md:text-5xl font-bold mb-2"
              >
                {cvData.name}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-blue-200 mb-4"
              >
                {cvData.title}
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/80 max-w-2xl mb-6"
              >
                {cvData.tagline}
              </motion.p>

              {/* Contacto rápido */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 text-sm"
              >
                <a
                  href={`mailto:${cvData.email}`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {cvData.email}
                </a>
                <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4" />
                  {cvData.location}
                </span>
              </motion.div>
            </div>

            {/* Links */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3"
            >
              <a
                href={cvData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-blue-600 px-5 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
              <a
                href={cvData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-3 rounded-lg font-medium transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
              <a
                href={cvData.website}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-3 rounded-lg font-medium transition-colors"
              >
                <Globe className="w-5 h-5" />
                Website
              </a>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna izquierda */}
          <div className="md:col-span-2 space-y-10">
            {/* Sobre mí */}
            <FadeIn>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Sobre Mí
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {cvData.summary}
                  </p>
                </div>
              </section>
            </FadeIn>

            {/* Experiencia */}
            <FadeIn delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Experiencia
                </h2>
                <div className="space-y-6">
                  {cvData.experience.map((exp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {exp.title}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">
                            {exp.company}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          {exp.period}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {exp.description.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                          >
                            <ChevronRight className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </section>
            </FadeIn>

            {/* Proyectos */}
            <FadeIn delay={0.2}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Code className="w-6 h-6 text-blue-600" />
                  Proyectos Destacados
                </h2>
                <div className="grid gap-4">
                  {cvData.projects.map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {project.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((t, i) => (
                              <span
                                key={i}
                                className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </FadeIn>

            {/* Educación */}
            <FadeIn delay={0.3}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                  Educación
                </h2>
                <div className="space-y-4">
                  {cvData.education.map((edu, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {edu.degree}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400">
                            {edu.school}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                            {edu.description}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          {edu.period}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </FadeIn>
          </div>

          {/* Columna derecha */}
          <div className="space-y-8">
            {/* Skills */}
            <FadeIn delay={0.2}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-600" />
                  Lenguajes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills.languages.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-600" />
                  Frameworks
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills.frameworks.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  Data Science
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills.data.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-600" />
                  Herramientas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills.tools.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Certificaciones */}
            <FadeIn delay={0.6}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Certificaciones
                </h3>
                <div className="space-y-3">
                  {cvData.certifications.map((cert, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <Award className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {cert.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {cert.issuer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* CTA */}
            <FadeIn delay={0.7}>
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">¿Interesado en colaborar?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Estoy disponible para proyectos de data science, desarrollo Python y creación de contenido educativo.
                </p>
                <a
                  href={`mailto:${cvData.email}`}
                  className="flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contáctame
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} {cvData.name}. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-4 mt-4">
            <a
              href={cvData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href={cvData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href={`mailto:${cvData.email}`}
              className="hover:text-blue-600 transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
