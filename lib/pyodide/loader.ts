/**
 * Pyodide Loader - Funciones auxiliares para carga y configuración de Pyodide
 */

import type { PyodideInterface } from 'pyodide';

// URL del CDN de Pyodide
const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/';

// Paquetes pre-cargados por defecto
const DEFAULT_PACKAGES = ['matplotlib'];

// Tiempo máximo de carga en ms
const LOAD_TIMEOUT = 90000;

// Declaración para extender Window
interface PyodideWindow extends Window {
  __pyodideInstance?: PyodideInterface;
  __pyodideScriptPromise?: Promise<void>;
  loadPyodide?: (options?: { indexURL?: string }) => Promise<PyodideInterface>;
}

/**
 * Opciones de carga de Pyodide
 */
export interface PyodideLoaderOptions {
  /** Paquetes a instalar durante la carga */
  packages?: string[];
  /** URL base del CDN */
  indexURL?: string;
  /** Timeout en milisegundos */
  timeout?: number;
}

/**
 * Carga Pyodide con las opciones especificadas
 * Implementa caching en window para reutilizar instancia
 */
export async function loadPyodideInstance(
  options: PyodideLoaderOptions = {}
): Promise<PyodideInterface> {
  if (typeof window === 'undefined') {
    throw new Error('Pyodide solo se puede cargar en el navegador');
  }

  const {
    packages = DEFAULT_PACKAGES,
    indexURL = PYODIDE_CDN_URL,
    timeout = LOAD_TIMEOUT,
  } = options;

  const win = window as PyodideWindow;

  // Retornar instancia cacheada si existe
  if (win.__pyodideInstance) {
    return win.__pyodideInstance;
  }

  // Cargar script browser de Pyodide desde CDN
  await ensurePyodideScript(indexURL);
  const loadPyodide = win.loadPyodide;

  if (!loadPyodide) {
    throw new Error('No se pudo inicializar loadPyodide desde el CDN');
  }

  const loadPromise = loadPyodide({
    indexURL,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout al cargar Pyodide'));
    }, timeout);
  });

  // Race entre carga y timeout
  const pyodide = await Promise.race([loadPromise, timeoutPromise]);

  // Cargar paquetes requeridos y configurar matplotlib
  if (packages.length > 0) {
    await pyodide.loadPackage(packages);
  }
  await configureMatplotlib(pyodide);

  // Cachear instancia
  win.__pyodideInstance = pyodide;

  return pyodide;
}

/**
 * Carga pyodide.js en el navegador y expone window.loadPyodide
 */
async function ensurePyodideScript(indexURL: string): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Pyodide solo se puede cargar en el navegador');
  }

  const win = window as PyodideWindow;
  if (typeof win.loadPyodide === 'function') return;

  if (!win.__pyodideScriptPromise) {
    win.__pyodideScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide-loader="true"]');
      if (existing) {
        if (typeof win.loadPyodide === 'function') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Error cargando pyodide.js')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = `${indexURL}pyodide.js`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.pyodideLoader = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`No se pudo cargar ${script.src}`));
      document.head.appendChild(script);
    }).catch((error) => {
      // Permitir reintentos si falla la carga
      delete win.__pyodideScriptPromise;
      throw error;
    });
  }

  await win.__pyodideScriptPromise;
}

/**
 * Configura matplotlib para usar el backend Agg y capturar imágenes
 */
async function configureMatplotlib(pyodide: PyodideInterface): Promise<void> {
  await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from io import BytesIO
import base64

# Función para mostrar figuras como base64
def show_plot():
    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return f'<img src="data:image/png;base64,{img_str}" class="matplotlib-plot" />'

# Reemplazar plt.show() con nuestra función
plt.show = show_plot
  `);
}

/**
 * Verifica si Pyodide ya está cargado
 */
export function isPyodideLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as PyodideWindow;
  return !!win.__pyodideInstance;
}

/**
 * Obtiene la instancia de Pyodide si está cargada
 */
export function getPyodideInstance(): PyodideInterface | null {
  if (typeof window === 'undefined') return null;
  const win = window as PyodideWindow;
  return win.__pyodideInstance || null;
}

/**
 * Limpia la instancia de Pyodide cacheada
 */
export function clearPyodideCache(): void {
  if (typeof window === 'undefined') return;
  const win = window as PyodideWindow;
  delete win.__pyodideInstance;
}

/**
 * Instala paquetes adicionales en Pyodide
 */
export async function installPackages(
  pyodide: PyodideInterface,
  packages: string[]
): Promise<void> {
  if (packages.length === 0) return;
  await pyodide.loadPackage(packages);
}

/**
 * Reinicia el entorno de Pyodide manteniendo la instancia
 */
export async function resetPyodideEnvironment(
  pyodide: PyodideInterface
): Promise<void> {
  // Reiniciar el scope de Python
  await pyodide.runPythonAsync(`
# Limpiar variables del namespace global (excepto builtins)
import sys
for name in list(globals().keys()):
    if name not in ['__builtins__', 'sys', 'matplotlib', 'plt', 'show_plot']:
        del globals()[name]

# Limpiar módulos importados
for mod in list(sys.modules.keys()):
    if mod not in sys.builtin_module_names and mod not in ['matplotlib', 'matplotlib.pyplot']:
        del sys.modules[mod]
  `);
}
