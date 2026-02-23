/**
 * Content Preview Component
 * Renders markdown content with styling matching the lesson view
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Eye, EyeOff, BookOpen, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ContentPreviewProps {
  title: string;
  content: string;
  estimatedMinutes?: number;
  isPublished?: boolean;
  courseName?: string;
}

export function ContentPreview({
  title,
  content,
  estimatedMinutes = 10,
  isPublished = false,
  courseName,
}: ContentPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="prose prose-gray dark:prose-invert max-w-none"
    >
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        {courseName && (
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
            {courseName}
          </p>
        )}
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{estimatedMinutes} min</span>
          </div>
          
          {isPublished ? (
            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
              <Eye className="w-4 h-4" />
              Publicada
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <EyeOff className="w-4 h-4" />
              Borrador
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="lesson-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-5 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {children}
              </p>
            ),
            code({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "text";

              if (inline) {
                return (
                  <code
                    className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              return (
                <div className="my-4 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 text-gray-400 text-xs">
                    <span className="uppercase">{language}</span>
                    <span>Código</span>
                  </div>
                  <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      fontSize: "0.875rem",
                      background: "#1f2937",
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            },
            pre: ({ children }) => <>{children}</>,
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700 dark:text-gray-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700 dark:text-gray-300">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="ml-4">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                <p className="text-gray-700 dark:text-gray-300 italic m-0">
                  {children}
                </p>
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-100 dark:bg-gray-800">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                {children}
              </td>
            ),
          }}
        >
          {content || "_El contenido aparecerá aquí..._"}
        </ReactMarkdown>
      </div>

      {/* Empty state hint */}
      {!content && (
        <div className="text-center py-8 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Escribe en el editor para ver la vista previa</p>
        </div>
      )}
    </motion.div>
  );
}
