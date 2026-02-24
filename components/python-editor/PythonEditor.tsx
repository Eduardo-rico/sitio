/**
 * PythonEditor Component - Editor de código con Monaco Editor
 */

'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import type { CourseLanguage } from '@/lib/course-runtime';
import { getMonacoLanguage } from '@/lib/course-runtime';

export interface PythonEditorProps {
  /** Código inicial */
  initialCode?: string;
  /** Código actual (controlado) */
  value?: string;
  /** Callback cuando el código cambia */
  onChange?: (code: string) => void;
  /** Altura del editor (default: '300px') */
  height?: string | number;
  /** Solo lectura */
  readOnly?: boolean;
  /** Placeholder cuando está vacío */
  placeholder?: string;
  /** Clase CSS adicional */
  className?: string;
  /** Callback al montar el editor */
  onMount?: OnMount;
  /** Tema forzado (si no se usa el del sistema) */
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  /** Lenguaje del editor */
  language?: CourseLanguage;
}

// Código por defecto
const DEFAULT_CODE = '';

// Configuración del editor
const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  automaticLayout: true,
  tabSize: 4,
  insertSpaces: true,
  wordWrap: 'on',
  folding: true,
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  padding: { top: 16, bottom: 16 },
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  fontLigatures: true,
  renderWhitespace: 'selection',
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  snippetSuggestions: 'inline',
};

/**
 * Editor de código Python usando Monaco Editor
 * Soporta modo oscuro/claro, autocompletado y resaltado de sintaxis
 */
export function PythonEditor({
  initialCode = DEFAULT_CODE,
  value,
  onChange,
  height = '300px',
  readOnly = false,
  placeholder = '# Escribe tu código Python aquí...',
  className = '',
  onMount,
  theme: forcedTheme,
  language = 'python',
}: PythonEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar modo oscuro
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Determinar tema
  const theme = forcedTheme || (isDarkMode ? 'vs-dark' : 'vs');

  // Configurar autocompletado Python
  const configurePythonLanguage = useCallback((monaco: Monaco) => {
    if (language !== 'python') return;

    // Palabras clave de Python
    const pythonKeywords = [
      'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
      'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
      'except', 'finally', 'for', 'from', 'global', 'if', 'import',
      'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
      'return', 'try', 'while', 'with', 'yield',
    ];

    // Funciones built-in
    const builtinFunctions = [
      'abs', 'all', 'any', 'bin', 'bool', 'bytearray', 'bytes',
      'callable', 'chr', 'classmethod', 'compile', 'complex',
      'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval',
      'exec', 'filter', 'float', 'format', 'frozenset', 'getattr',
      'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input',
      'int', 'isinstance', 'issubclass', 'iter', 'len', 'list',
      'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object',
      'oct', 'open', 'ord', 'pow', 'print', 'property', 'range',
      'repr', 'reversed', 'round', 'set', 'setattr', 'slice',
      'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple',
      'type', 'vars', 'zip', '__import__',
    ];

    // Configurar provider de autocompletado
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const keywordSuggestions = pythonKeywords.map((keyword) => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range,
        }));

        const functionSuggestions = builtinFunctions.map((func) => ({
          label: func,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: func,
          range,
        }));

        // Snippets comunes
        const snippets = [
          {
            label: 'for-loop',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for ${1:item} in ${2:items}:\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Bucle for',
            range,
          },
          {
            label: 'if-else',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if ${1:condition}:\n\t${2:pass}\nelse:\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If-else statement',
            range,
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'def ${1:function_name}(${2:params}):\n\t"""${3:docstring}"""\n\t${4:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Definir función',
            range,
          },
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'print(${1:message})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
        ];

        return {
          suggestions: [...keywordSuggestions, ...functionSuggestions, ...snippets],
        };
      },
    });
  }, [language]);

  // Handler de montaje
  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Configurar autocompletado
      configurePythonLanguage(monaco);

      // Configurar atajos de teclado
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        // Emitir evento personalizado para ejecutar
        window.dispatchEvent(new CustomEvent('python-editor:execute'));
      });

      // Llamar onMount externo si existe
      onMount?.(editor, monaco);
    },
    [onMount, configurePythonLanguage]
  );

  // Handler de cambio
  const handleChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== undefined) {
        onChange?.(newValue);
      }
    },
    [onChange]
  );

  // Placeholder personalizado
  useEffect(() => {
    if (editorRef.current && placeholder) {
      const editor = editorRef.current;
      
      // Crear decoración de placeholder
      const updatePlaceholder = () => {
        const model = editor.getModel();
        if (model && model.getValueLength() === 0) {
          // Monaco no tiene placeholder nativo, usamos un widget
          // Por simplicidad, usamos un overlay simple
          const overlay = document.querySelector('.monaco-editor-placeholder');
          if (!overlay) {
            const container = editor.getContainerDomNode();
            const placeholderEl = document.createElement('div');
            placeholderEl.className = 'monaco-editor-placeholder';
            placeholderEl.textContent = placeholder;
            placeholderEl.style.cssText = `
              position: absolute;
              top: 16px;
              left: 60px;
              color: ${isDarkMode ? '#6b7280' : '#9ca3af'};
              font-family: 'JetBrains Mono', monospace;
              font-size: 14px;
              pointer-events: none;
              z-index: 10;
            `;
            container.style.position = 'relative';
            container.appendChild(placeholderEl);
          }
        } else {
          const overlay = document.querySelector('.monaco-editor-placeholder');
          overlay?.remove();
        }
      };

      updatePlaceholder();
      const disposable = editor.onDidChangeModelContent(updatePlaceholder);
      
      return () => {
        disposable.dispose();
        document.querySelector('.monaco-editor-placeholder')?.remove();
      };
    }
  }, [placeholder, isDarkMode]);

  // Determinar valor controlado o no controlado
  const editorValue = value !== undefined ? value : initialCode;

  return (
    <div className={`python-editor ${className}`}>
      <Editor
        height={height}
        defaultLanguage={getMonacoLanguage(language)}
        value={editorValue}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          ...EDITOR_OPTIONS,
          readOnly,
        }}
        theme={theme}
        loading={
          <div className="flex items-center justify-center h-full text-gray-500">
            Cargando editor...
          </div>
        }
      />
    </div>
  );
}

export default PythonEditor;
