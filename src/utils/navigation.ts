import { getCollection } from 'astro:content';

/**
 * Navigation item representing a lesson in the navigation tree
 */
export interface NavigationItem {
  title: string;
  slug: string;        // Full path for routing (e.g., "01-intro")
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

/**
 * Module metadata extracted from content
 */
export interface ModuleInfo {
  id: string;          // Module identifier (e.g., "01-intro")
  lessons: NavigationItem[];
}

/**
 * Navigation tree type - Map with moduleId as key and lesson array as value
 */
export type NavigationTree = Map<string, NavigationItem[]>;

/**
 * Extract module ID from content entry ID
 * Entry IDs follow pattern: "01-intro/index" or "02-fundamentals/lesson-1"
 * @param entryId - Content entry ID
 * @returns Module ID (first path segment)
 */
function extractModuleId(entryId: string): string {
  const segments = entryId.split('/');
  return segments[0];
}

/**
 * Builds a navigation tree from the course content collection.
 *
 * The tree is derived automatically from content, ensuring navigation
 * stays in sync with content changes. No hardcoded module arrays.
 *
 * @returns Map with moduleId as key and array of lesson metadata as value,
 *          sorted by module order and lesson order within modules
 */
export async function getNavigationTree(): Promise<NavigationTree> {
  // Fetch all course entries from content collection
  const allEntries = await getCollection('course');

  // Filter out draft entries if draft field exists
  const publishedEntries = allEntries.filter(entry => {
    // Content collection entries may have draft field in data
    const data = entry.data as { draft?: boolean };
    return data.draft !== true;
  });

  // Sort by order field
  const sortedEntries = publishedEntries.sort((a, b) => a.data.order - b.data.order);

  // Group by module
  const tree: NavigationTree = new Map();

  for (const entry of sortedEntries) {
    const moduleId = extractModuleId(entry.id);

    const navItem: NavigationItem = {
      title: entry.data.title,
      slug: entry.id.replace(/\/index\.mdx?$/, '').replace(/\.mdx?$/, ''), // Remove index and extension for cleaner URLs
      order: entry.data.order,
      difficulty: entry.data.difficulty,
      estimatedTime: entry.data.estimatedTime,
    };

    if (!tree.has(moduleId)) {
      tree.set(moduleId, []);
    }

    tree.get(moduleId)!.push(navItem);
  }

  // Sort lessons within each module by order
  for (const [moduleId, lessons] of tree) {
    lessons.sort((a, b) => a.order - b.order);
  }

  // Sort modules by their ID (which has numeric prefix like "01-module-1")
  const sortedTree: NavigationTree = new Map(
    Array.from(tree.entries()).sort(([a], [b]) => a.localeCompare(b))
  );

  return sortedTree;
}

/**
 * Flattens the navigation tree into a single sorted array of lessons.
 * Useful for prev/next navigation.
 *
 * @returns Flat array of all lessons sorted by order
 */
export async function getFlatNavigationList(): Promise<NavigationItem[]> {
  const tree = await getNavigationTree();
  const allLessons: NavigationItem[] = [];

  // Get modules in order (Map preserves insertion order, which is sorted by order)
  for (const [, lessons] of tree) {
    allLessons.push(...lessons);
  }

  // Re-sort by order to ensure correct sequence
  return allLessons.sort((a, b) => a.order - b.order);
}

/**
 * Gets the total count of lessons in the course.
 *
 * @returns Number of lessons
 */
export async function getLessonCount(): Promise<number> {
  const tree = await getNavigationTree();
  let count = 0;

  for (const [, lessons] of tree) {
    count += lessons.length;
  }

  return count;
}

/**
 * Gets the total estimated time for all lessons in the course.
 *
 * @returns Total time in minutes
 */
export async function getTotalEstimatedTime(): Promise<number> {
  const flat = await getFlatNavigationList();
  return flat.reduce((sum, lesson) => sum + lesson.estimatedTime, 0);
}
