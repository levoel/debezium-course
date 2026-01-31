import { useStore } from '@nanostores/react';
import { isSidebarOpen } from '../stores/navigation';

/**
 * Mobile hamburger menu toggle button
 *
 * Uses nanostores for state sharing across Astro islands.
 * Hidden on desktop (lg:hidden) where sidebar is always visible.
 */
export function MobileMenuToggle() {
  const $isOpen = useStore(isSidebarOpen);

  return (
    <button
      type="button"
      onClick={() => isSidebarOpen.set(!$isOpen)}
      className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md lg:hidden"
      aria-label={$isOpen ? 'Закрыть меню' : 'Открыть меню'}
      aria-expanded={$isOpen}
    >
      {$isOpen ? (
        // Close X icon
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        // Hamburger icon (3 horizontal lines)
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}

export default MobileMenuToggle;
