import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { $progress } from '../stores/progress';

interface ProgressIndicatorProps {
  /** Total number of lessons in course */
  totalLessons: number;
}

/**
 * Progress bar showing course completion percentage.
 * SSR-safe: renders placeholder until client hydration.
 */
export function ProgressIndicator({ totalLessons }: ProgressIndicatorProps) {
  const progress = useStore($progress);
  const [mounted, setMounted] = useState(false);

  // SSR-safe: only calculate percentage on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Placeholder for SSR
  if (!mounted) {
    return (
      <div className="w-full">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Прогресс курса</span>
          <span className="text-sm text-gray-400">--%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-gray-600 h-2.5 rounded-full w-0" />
        </div>
      </div>
    );
  }

  // Safely access completed array
  const completed = Array.isArray(progress?.completed) ? progress.completed : [];
  const completedCount = completed.length;
  const percentage = totalLessons > 0
    ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
    : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-400">Прогресс курса</span>
        <span className="text-sm text-gray-300 font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {completedCount} из {totalLessons} уроков пройдено
      </p>
    </div>
  );
}

export default ProgressIndicator;
