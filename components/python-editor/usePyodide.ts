/**
 * Hook usePyodide - Maneja la carga lazy de Pyodide
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PyodideInterface } from 'pyodide';
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
  load: () => Promise<void>;
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

  // Función para cargar Pyodide
  const load = useCallback(async () => {
    // Si ya está cargado, no hacer nada
    if (isPyodideLoaded()) {
      setStatus('ready');
      pyodideRef.current = getPyodideInstance();
      return;
    }

    // Si ya está cargando, no iniciar otra carga
    if (status === 'loading') {
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const instance = await loadPyodideInstance(loaderOptions);
      pyodideRef.current = instance;
      setStatus('ready');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('error');
      console.error('Error cargando Pyodide:', error);
    }
  }, [status, loaderOptions]);

  // Carga automática al montar
  useEffect(() => {
    if (autoLoad && status === 'idle') {
      load();
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
