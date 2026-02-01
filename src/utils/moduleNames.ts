/**
 * Descriptive module names for the Debezium course
 * Single source of truth - used by Navigation, Homepage, and Breadcrumbs
 *
 * Module directory naming convention: NN-module-N (e.g., "01-module-1", "03-module-3")
 */

/**
 * Map of module directory IDs to descriptive names (Russian)
 */
export const MODULE_NAMES: Record<string, string> = {
  '01-module-1': 'Введение в CDC',
  '02-module-2': 'PostgreSQL и Aurora',
  '03-module-3': 'MySQL/Aurora',
  '04-module-4': 'Prod Operations',
  '05-module-5': 'SMT и Паттерны',
  '06-module-6': 'Data Engineering',
  '07-module-7': 'Cloud-Native GCP',
  '08-module-8': 'Capstone Project',
};

/**
 * Get descriptive name for a module
 * Falls back to formatted module ID if not found in mapping
 *
 * @param moduleId - Module directory name (e.g., "01-module-1")
 * @returns Descriptive module name in Russian
 */
export function getModuleName(moduleId: string): string {
  if (MODULE_NAMES[moduleId]) {
    return MODULE_NAMES[moduleId];
  }

  // Fallback: extract number and format as "Модуль NN"
  const match = moduleId.match(/^(\d+)/);
  if (match) {
    return `Модуль ${match[1].padStart(2, '0')}`;
  }

  return moduleId;
}

/**
 * Get module number from module ID
 * @param moduleId - Module directory name (e.g., "01-module-1")
 * @returns Module number as string (e.g., "01") or null
 */
export function getModuleNumber(moduleId: string): string | null {
  const match = moduleId.match(/^(\d+)/);
  return match ? match[1].padStart(2, '0') : null;
}
