import { useStore } from '@nanostores/react';
import { $progress, toggleLessonComplete } from '../stores/progress';

interface LessonCompleteButtonProps {
  /** Lesson slug for tracking completion */
  slug: string;
}

/**
 * Toggle button for marking a lesson as complete/incomplete.
 * Uses nanostores for reactive state updates across islands.
 */
export function LessonCompleteButton({ slug }: LessonCompleteButtonProps) {
  const progress = useStore($progress);
  // Safely check completed array (may be undefined during hydration)
  const completed = Array.isArray(progress?.completed) ? progress.completed : [];
  const isComplete = completed.includes(slug);

  return (
    <button
      onClick={() => toggleLessonComplete(slug)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium
        transition-colors duration-200
        ${isComplete
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }
      `}
      aria-pressed={isComplete}
    >
      {isComplete ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Урок пройден</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Отметить как пройденный</span>
        </>
      )}
    </button>
  );
}

export default LessonCompleteButton;
