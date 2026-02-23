/**
 * Pyodide Loader - Funciones auxiliares para carga y configuración de Pyodide
 */

import { loadPyodide, PyodideInterface } from 'pyodide';

// URL del CDN de Pyodide
const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/';

// Paquetes pre-cargados por defecto
const DEFAULT_PACKAGES = ['matplotlib'];

// Tiempo máximo de carga en ms
const LOAD_TIMEOUT = 30000;

// Declaración para extender Window
interface PyodideWindow extends Window {
  __pyodideInstance?: PyodideInterface;
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

  // Crear una promesa con timeout
  const loadPromise = loadPyodide({
    indexURL,
    packages,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout al cargar Pyodide'));
    }, timeout);
  });

  // Race entre carga y timeout
  const pyodide = await Promise.race([loadPromise, timeoutPromise]);

  // Configurar matplotlib para mostrar imágenes
  await configureMatplotlib(pyodide);

  // Cachear instancia
  win.__pyodideInstance = pyodide;

  return pyodide;
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
  const win = window as PyodideWindow;
  return !!win.__pyodideInstance;
}

/**
 * Obtiene la instancia de Pyodide si está cargada
 */
export function getPyodideInstance(): PyodideInterface | null {
  const win = window as PyodideWindow;
  return win.__pyodideInstance || null;
}

/**
 * Limpia la instancia de Pyodide cacheada
 */
export function clearPyodideCache(): void {
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
