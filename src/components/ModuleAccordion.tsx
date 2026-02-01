import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $progress } from '../stores/progress';
import { getModuleName, getModuleNumber } from '../utils/moduleNames';

/**
 * Lesson item for accordion display
 */
interface LessonItem {
  title: string;
  slug: string;
  difficulty: string;
  estimatedTime: number;
}

/**
 * Module entry as array tuple (serializable for Astro islands)
 */
type ModuleEntry = [string, LessonItem[]];

/**
 * ModuleAccordion component props
 */
interface ModuleAccordionProps {
  /** Module entries as array of [moduleId, lessons[]] tuples */
  modules: ModuleEntry[];
  /** Base path for URLs (e.g., "/debezium-course") */
  basePath?: string;
}

/**
 * Get difficulty badge color based on level
 */
function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-500/20 text-green-400';
    case 'intermediate':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'advanced':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

/**
 * Translate difficulty level to Russian
 */
function translateDifficulty(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'Начальный';
    case 'intermediate':
      return 'Средний';
    case 'advanced':
      return 'Продвинутый';
    default:
      return difficulty;
  }
}

/**
 * ModuleAccordion - Interactive accordion for homepage module display
 *
 * Features:
 * - All modules collapsed by default
 * - Glass card styling with hover lift
 * - Per-module progress calculation
 * - Keyboard accessible (Enter/Space to toggle)
 * - SSR-safe progress (shows 0% during SSR)
 */
export function ModuleAccordion({ modules, basePath = '' }: ModuleAccordionProps) {
  const progress = useStore($progress);
  // Safely access completed array
  const completed = Array.isArray(progress?.completed) ? progress.completed : [];

  // Track which modules are expanded - all collapsed by default
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // SSR safety: only show real progress after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Calculate progress for a specific module
   */
  const getModuleProgress = (lessons: LessonItem[]): { completed: number; total: number; percentage: number } => {
    if (!mounted) {
      return { completed: 0, total: lessons.length, percentage: 0 };
    }
    const completedCount = lessons.filter(l => completed.includes(l.slug)).length;
    return {
      completed: completedCount,
      total: lessons.length,
      percentage: lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0
    };
  };

  /**
   * Toggle module expand/collapse state
   */
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {modules.map(([moduleId, lessons]) => {
        const isExpanded = expandedModules.has(moduleId);
        const moduleNumber = getModuleNumber(moduleId);
        const moduleName = getModuleName(moduleId);
        const moduleProgress = getModuleProgress(lessons);

        return (
          <div key={moduleId} className="glass-card overflow-hidden">
            {/* Module header button - always visible */}
            <button
              onClick={() => toggleModule(moduleId)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
              aria-expanded={isExpanded}
              aria-controls={`module-${moduleId}-content`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-blue-400">{moduleNumber}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">{moduleName}</h3>
                  <span className="text-sm text-gray-400">{lessons.length} уроков</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Progress indicator */}
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-100">{moduleProgress.percentage}%</span>
                  <div className="w-20 h-1.5 bg-gray-700 rounded-full mt-1">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${moduleProgress.percentage}%` }}
                    />
                  </div>
                </div>
                {/* Chevron indicator */}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expandable lesson list */}
            <div
              id={`module-${moduleId}-content`}
              className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'}`}
            >
              <div className="px-6 pb-4 pt-2 border-t border-white/10">
                <ul className="space-y-2">
                  {lessons.map(lesson => {
                    const isComplete = mounted && completed.includes(lesson.slug);

                    return (
                      <li key={lesson.slug}>
                        <a
                          href={`${basePath}/course/${lesson.slug}`}
                          className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isComplete && (
                              <svg
                                className="w-5 h-5 text-green-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            <span className={`text-gray-200 ${isComplete ? '' : 'ml-8'}`}>{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-500">{lesson.estimatedTime} мин</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(lesson.difficulty)}`}>
                              {translateDifficulty(lesson.difficulty)}
                            </span>
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ModuleAccordion;
