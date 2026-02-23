/**
 * LessonContent - Renderiza contenido Markdown de la lección
 * Soporta bloques de código interactivos
 */

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface LessonContentProps {
  content: string;
}

export function LessonContent({ content }: LessonContentProps) {
  return (
    <div className="prose dark:prose-invert prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Código con syntax highlighting
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Código interactivo de Python
            if (language === 'python-interactive') {
              return (
                <div className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Código ejecutable
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto m-0">
                    <code {...props}>{children}</code>
                  </pre>
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-sm">
                    <span className="text-blue-600 dark:text-blue-400">
                      💡 Este código se puede ejecutar en el editor de la derecha
                    </span>
                  </div>
                </div>
              );
            }
            
            return !inline && match ? (
              <div className="my-4 rounded-lg overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {language}
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  className="m-0 rounded-none !bg-gray-900"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props}>
                {children}
              </code>
            );
          },
          
          // Encabezados con anchor links
          h1({ children }) {
            return <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-8">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6 pb-2 border-b border-gray-200 dark:border-gray-700">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-5">{children}</h3>;
          },
          
          // Párrafos
          p({ children }) {
            return <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{children}</p>;
          },
          
          // Listas
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">{children}</ol>;
          },
          
          // Blockquotes (tips, warnings, etc.)
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg text-gray-700 dark:text-gray-300">
                {children}
              </blockquote>
            );
          },
          
          // Tablas
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>;
          },
          th({ children }) {
            return <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">{children}</td>;
          },
          
          // Links
          a({ children, href }) {
            return (
              <a 
                href={href} 
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            );
          },
          
          // Separadores
          hr() {
            return <hr className="my-6 border-gray-200 dark:border-gray-700" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
