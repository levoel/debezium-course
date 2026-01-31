import { persistentAtom } from '@nanostores/persistent';

/**
 * Progress data structure stored in localStorage.
 */
interface ProgressData {
  completed: string[];
  lastUpdated: number;
}

const DEFAULT_PROGRESS: ProgressData = {
  completed: [],
  lastUpdated: Date.now(),
};

/**
 * Progress tracking store with automatic localStorage persistence.
 * Uses persistentAtom with JSON encoding for reliable array storage.
 */
export const $progress = persistentAtom<ProgressData>(
  'course-progress',
  DEFAULT_PROGRESS,
  {
    encode: JSON.stringify,
    decode: (str) => {
      try {
        const data = JSON.parse(str);
        // Validate structure
        if (data && Array.isArray(data.completed)) {
          return data as ProgressData;
        }
      } catch {
        // Invalid JSON, return default
      }
      return DEFAULT_PROGRESS;
    },
  }
);

/**
 * Get completed array safely (always returns array).
 */
function getCompleted(): string[] {
  const data = $progress.get();
  return Array.isArray(data?.completed) ? data.completed : [];
}

/**
 * Toggle lesson completion status.
 * If already complete, marks as incomplete. If incomplete, marks as complete.
 * @param slug - Lesson slug (e.g., "01-intro")
 */
export function toggleLessonComplete(slug: string): void {
  const completed = getCompleted();
  const newCompleted = completed.includes(slug)
    ? completed.filter(s => s !== slug)
    : [...completed, slug];

  $progress.set({
    completed: newCompleted,
    lastUpdated: Date.now(),
  });
}

/**
 * Check if a lesson is complete.
 * @param slug - Lesson slug
 * @returns true if lesson is in completed array
 */
export function isLessonComplete(slug: string): boolean {
  return getCompleted().includes(slug);
}

/**
 * Calculate completion percentage.
 * @param totalLessons - Total number of lessons in course
 * @returns Percentage (0-100) rounded to nearest integer
 */
export function getCompletionPercentage(totalLessons: number): number {
  const completed = getCompleted().length;
  if (totalLessons === 0) return 0;
  return Math.round((completed / totalLessons) * 100);
}

/**
 * Get count of completed lessons.
 * @returns Number of completed lessons
 */
export function getCompletedCount(): number {
  return getCompleted().length;
}

/**
 * Reset all progress.
 */
export function resetProgress(): void {
  $progress.set({
    completed: [],
    lastUpdated: Date.now(),
  });
}
