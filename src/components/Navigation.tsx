import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isSidebarOpen } from '../stores/navigation';
import { $progress } from '../stores/progress';
import { getModuleName, getModuleNumber } from '../utils/moduleNames';

/**
 * Lesson item for navigation
 */
interface LessonItem {
  title: string;
  slug: string;
  difficulty: string;
  estimatedTime: number;
}

/**
 * Module entry for navigation (array of tuples for JSON serialization)
 * Astro islands require serializable props, Map is not serializable
 */
type ModuleEntry = [string, LessonItem[]];

/**
 * Navigation component props
 * Props must be JSON-serializable for Astro islands
 */
interface NavigationProps {
  /** Module entries as array of [moduleId, lessons[]] tuples */
  modules: ModuleEntry[];
  /** Current page path for highlighting */
  currentPath: string;
  /** Base path for URLs (e.g., "/debezium-course") */
  basePath?: string;
}

/**
 * Format module header with number and descriptive name
 * "01-module-1" -> "01. Введение в CDC"
 */
function formatModuleHeader(moduleId: string): string {
  const number = getModuleNumber(moduleId);
  const name = getModuleName(moduleId);

  if (number) {
    return `${number}. ${name}`;
  }
  return name;
}

/**
 * Sidebar navigation with module grouping
 *
 * Displays course lessons organized by modules with current page highlighting.
 * Links close the sidebar on click (mobile UX).
 * Uses nanostores for cross-island state sharing.
 */
export function Navigation({ modules, currentPath, basePath = '' }: NavigationProps) {
  const $isOpen = useStore(isSidebarOpen);
  const progress = useStore($progress);
  // Safely access completed array
  const completed = Array.isArray(progress?.completed) ? progress.completed : [];

  // Track which modules are expanded (moduleId -> boolean)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Auto-expand module containing current page on mount
  useEffect(() => {
    for (const [moduleId, lessons] of modules) {
      const hasCurrentPage = lessons.some(lesson => currentPath.includes(lesson.slug));
      if (hasCurrentPage) {
        setExpandedModules(prev => new Set(prev).add(moduleId));
        break;
      }
    }
  }, [currentPath, modules]);

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

  const handleLinkClick = () => {
    // Close sidebar when navigating on mobile
    isSidebarOpen.set(false);
  };

  return (
    <nav aria-label="Course navigation" className="py-4">
      <ul className="space-y-2">
        {modules.map(([moduleId, lessons]) => {
          const isExpanded = expandedModules.has(moduleId);
          const completedCount = lessons.filter(l => completed.includes(l.slug)).length;
          const hasCurrentPage = lessons.some(lesson => currentPath.includes(lesson.slug));

          return (
            <li key={moduleId}>
              {/* Clickable module header */}
              <button
                onClick={() => toggleModule(moduleId)}
                className={`
                  w-full px-4 py-2 flex items-center justify-between
                  text-sm font-semibold uppercase tracking-wide
                  rounded-md transition-colors duration-150
                  ${hasCurrentPage
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  }
                `}
                aria-expanded={isExpanded}
              >
                <span className="flex items-center gap-2">
                  {formatModuleHeader(moduleId)}
                  {completedCount > 0 && (
                    <span className="text-xs text-emerald-300/70 font-normal normal-case">
                      {completedCount}/{lessons.length}
                    </span>
                  )}
                </span>
                {/* Chevron indicator */}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Collapsible lessons list */}
              <ul
                className={`
                  space-y-1 overflow-hidden transition-all duration-200 ease-in-out
                  ${isExpanded ? 'mt-1 max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                {lessons.map((lesson) => {
                  const href = `${basePath}/course/${lesson.slug}`;
                  const isCurrentPage = currentPath.includes(lesson.slug);
                  const isComplete = completed.includes(lesson.slug);

                  return (
                    <li key={lesson.slug}>
                      <a
                        href={href}
                        onClick={handleLinkClick}
                        aria-current={isCurrentPage ? 'page' : undefined}
                        className={`
                          block px-4 py-2 ml-2 rounded-md text-sm transition-all duration-150
                          ${isCurrentPage
                            ? 'bg-blue-500/20 backdrop-blur-sm text-blue-100 font-medium border border-blue-400/30'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2">
                          {isComplete && (
                            <svg className="w-4 h-4 text-emerald-300/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </span>
                        <span className={`text-xs mt-0.5 block ${isComplete ? 'ml-6' : ''} ${isCurrentPage ? 'text-gray-300' : 'text-gray-400'}`}>
                          {lesson.estimatedTime} мин
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}

        {/* Reference Materials Section */}
        <li className="pt-4 mt-4 border-t border-white/10">
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Справочные материалы
          </div>
          <ul className="space-y-1 mt-1">
            <li>
              <a
                href={`${basePath}/glossary`}
                onClick={handleLinkClick}
                aria-current={currentPath.includes('/glossary') ? 'page' : undefined}
                className={`
                  block px-4 py-2 ml-2 rounded-md text-sm transition-all duration-150
                  ${currentPath.includes('/glossary')
                    ? 'bg-blue-500/20 backdrop-blur-sm text-blue-100 font-medium border border-blue-400/30'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>📚</span>
                  <span>Глоссарий</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`${basePath}/troubleshooting`}
                onClick={handleLinkClick}
                aria-current={currentPath.includes('/troubleshooting') ? 'page' : undefined}
                className={`
                  block px-4 py-2 ml-2 rounded-md text-sm transition-all duration-150
                  ${currentPath.includes('/troubleshooting')
                    ? 'bg-blue-500/20 backdrop-blur-sm text-blue-100 font-medium border border-blue-400/30'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>🔧</span>
                  <span>Troubleshooting</span>
                </span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
