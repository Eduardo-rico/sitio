/**
 * Hook usePyodide - Maneja la carga lazy de Pyodide
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PyodideInterface } from 'pyodide';
import {
  loadPyodideInstance,
  isPyodideLoaded,
  getPyodideInstance,
  PyodideLoaderOptions,
} from '@/lib/pyodide/loader';

export type PyodideStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UsePyodideReturn {
  /** Estado actual de carga */
  status: PyodideStatus;
  /** Instancia de Pyodide (null si no está listo) */
  pyodide: PyodideInterface | null;
  /** Error si la carga falló */
  error: Error | null;
  /** Función para iniciar la carga manualmente */
  load: () => Promise<PyodideInterface>;
}

export interface UsePyodideOptions {
  /** Cargar automáticamente al montar */
  autoLoad?: boolean;
  /** Opciones de carga */
  loaderOptions?: PyodideLoaderOptions;
}

/**
 * Hook para cargar y usar Pyodide de forma lazy
 * Cachea la instancia en window para reutilizar entre componentes
 */
export function usePyodide(options: UsePyodideOptions = {}): UsePyodideReturn {
  const { autoLoad = false, loaderOptions = {} } = options;

  const [status, setStatus] = useState<PyodideStatus>(() =>
    isPyodideLoaded() ? 'ready' : 'idle'
  );
  const [error, setError] = useState<Error | null>(null);

  // Usar ref para mantener la instancia actual sin causar re-renders
  const pyodideRef = useRef<PyodideInterface | null>(getPyodideInstance());
  const loadPromiseRef = useRef<Promise<PyodideInterface> | null>(null);

  // Función para cargar Pyodide
  const load = useCallback(async (): Promise<PyodideInterface> => {
    // Si ya está cargado, no hacer nada
    const cachedInstance = getPyodideInstance();
    if (cachedInstance) {
      setStatus('ready');
      pyodideRef.current = cachedInstance;
      return cachedInstance;
    }

    // Reusar promesa en curso para evitar cargas duplicadas
    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    setStatus('loading');
    setError(null);

    loadPromiseRef.current = loadPyodideInstance(loaderOptions)
      .then((instance) => {
        pyodideRef.current = instance;
        setStatus('ready');
        return instance;
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setStatus('error');
        console.error('Error cargando Pyodide:', error);
        throw error;
      })
      .finally(() => {
        loadPromiseRef.current = null;
      });

    return loadPromiseRef.current;
  }, [loaderOptions]);

  // Carga automática al montar
  useEffect(() => {
    if (autoLoad && status === 'idle') {
      void load();
    }
  }, [autoLoad, status, load]);

  return {
    status,
    pyodide: pyodideRef.current,
    error,
    load,
  };
}

export default usePyodide;
