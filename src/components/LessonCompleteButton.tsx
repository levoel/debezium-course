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
        flex items-center gap-2 px-4 py-2 rounded-xl font-medium
        transition-all duration-200 backdrop-blur-sm border
        ${isComplete
          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/30'
          : 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/10'
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
