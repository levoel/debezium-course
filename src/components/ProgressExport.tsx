import { useRef, useState } from 'react';
import { $progress, resetProgress } from '../stores/progress';

/**
 * Export/import progress data for backup and cross-device sync.
 * Uses Blob download for export, FileReader for import.
 */
export function ProgressExport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error' | 'reset'>('idle');

  const handleExport = () => {
    const data = $progress.get();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `debezium-course-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate structure
      if (!Array.isArray(data.completed)) {
        throw new Error('Invalid progress format: completed must be an array');
      }

      // Validate all items are strings
      if (!data.completed.every((item: unknown) => typeof item === 'string')) {
        throw new Error('Invalid progress format: completed items must be strings');
      }

      $progress.set({
        completed: data.completed,
        lastUpdated: Date.now(),
      });

      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    // Reset input for re-import of same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300">Резервное копирование прогресса</h3>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Экспорт</span>
        </button>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="progress-import"
          />
          <label
            htmlFor="progress-import"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Импорт</span>
          </label>
        </div>

        <button
          onClick={() => {
            resetProgress();
            setImportStatus('reset');
            setTimeout(() => setImportStatus('idle'), 3000);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Сбросить</span>
        </button>
      </div>

      {/* Status messages */}
      {importStatus === 'success' && (
        <p className="text-sm text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Прогресс успешно импортирован
        </p>
      )}
      {importStatus === 'error' && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Ошибка импорта. Проверьте формат файла.
        </p>
      )}
      {importStatus === 'reset' && (
        <p className="text-sm text-yellow-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Прогресс сброшен
        </p>
      )}

      <p className="text-xs text-gray-500">
        Экспортируйте прогресс для резервного копирования или переноса на другое устройство.
      </p>
    </div>
  );
}

export default ProgressExport;
