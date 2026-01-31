import { persistentMap } from '@nanostores/persistent';

/**
 * Progress tracking store with automatic localStorage persistence.
 * Uses 'progress:' prefix for all keys in localStorage.
 *
 * Data structure:
 * - completed: string[] - Array of lesson slugs that are complete
 * - lastUpdated: number - Timestamp of last modification
 */
export const $progress = persistentMap<{
  completed: string[];
  lastUpdated: number;
}>('progress:', {
  completed: [],
  lastUpdated: Date.now(),
});

/**
 * Toggle lesson completion status.
 * If already complete, marks as incomplete. If incomplete, marks as complete.
 * @param slug - Lesson slug (e.g., "01-intro")
 */
export function toggleLessonComplete(slug: string): void {
  const current = $progress.get();
  const completed = current.completed.includes(slug)
    ? current.completed.filter(s => s !== slug)
    : [...current.completed, slug];

  $progress.set({
    completed,
    lastUpdated: Date.now(),
  });
}

/**
 * Check if a lesson is complete.
 * @param slug - Lesson slug
 * @returns true if lesson is in completed array
 */
export function isLessonComplete(slug: string): boolean {
  return $progress.get().completed.includes(slug);
}

/**
 * Calculate completion percentage.
 * @param totalLessons - Total number of lessons in course
 * @returns Percentage (0-100) rounded to nearest integer
 */
export function getCompletionPercentage(totalLessons: number): number {
  const completed = $progress.get().completed.length;
  if (totalLessons === 0) return 0;
  return Math.round((completed / totalLessons) * 100);
}

/**
 * Get count of completed lessons.
 * @returns Number of completed lessons
 */
export function getCompletedCount(): number {
  return $progress.get().completed.length;
}

/**
 * Reset all progress (for testing/debugging).
 */
export function resetProgress(): void {
  $progress.set({
    completed: [],
    lastUpdated: Date.now(),
  });
}
