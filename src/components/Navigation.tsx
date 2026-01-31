import { useStore } from '@nanostores/react';
import { isSidebarOpen } from '../stores/navigation';
import { $progress } from '../stores/progress';

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
 * Format module ID for display
 * "01-intro" -> "Module 01"
 */
function formatModuleHeader(moduleId: string): string {
  const match = moduleId.match(/^(\d+)/);
  if (match) {
    return `Модуль ${match[1].padStart(2, '0')}`;
  }
  return moduleId;
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

  // On mobile, don't render content when closed (optional optimization)
  // The parent container controls visibility via CSS

  const handleLinkClick = () => {
    // Close sidebar when navigating on mobile
    isSidebarOpen.set(false);
  };

  return (
    <nav aria-label="Course navigation" className="py-4">
      <ul className="space-y-6">
        {modules.map(([moduleId, lessons]) => (
          <li key={moduleId}>
            {/* Module header */}
            <h3 className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {formatModuleHeader(moduleId)}
            </h3>

            {/* Lessons list */}
            <ul className="space-y-1">
              {lessons.map((lesson) => {
                const href = `${basePath}/course/${lesson.slug}`;
                const isCurrentPage = currentPath.includes(lesson.slug);
                const isComplete = progress.completed.includes(lesson.slug);

                return (
                  <li key={lesson.slug}>
                    <a
                      href={href}
                      onClick={handleLinkClick}
                      aria-current={isCurrentPage ? 'page' : undefined}
                      className={`
                        block px-4 py-2 rounded-md text-sm transition-colors duration-150
                        ${isCurrentPage
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        {isComplete && (
                          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </span>
                      <span className={`text-xs text-gray-400 mt-0.5 block ${isComplete ? 'ml-6' : ''}`}>
                        {lesson.estimatedTime} мин
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;
