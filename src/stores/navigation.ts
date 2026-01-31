import { atom } from 'nanostores';

/**
 * Navigation state store for cross-island state sharing
 * Uses nanostores for Astro islands architecture compatibility
 */

/** Sidebar visibility state - shared across React islands */
export const isSidebarOpen = atom<boolean>(false);

/** Toggle sidebar visibility */
export function toggleSidebar(): void {
  isSidebarOpen.set(!isSidebarOpen.get());
}

/** Close sidebar (useful for mobile when navigating) */
export function closeSidebar(): void {
  isSidebarOpen.set(false);
}

/** Open sidebar */
export function openSidebar(): void {
  isSidebarOpen.set(true);
}
