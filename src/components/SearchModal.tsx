import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  KBarResults,
  useRegisterActions,
  useKBar,
  Action,
} from 'kbar';
import { useState, useEffect, useMemo } from 'react';

interface SearchResult {
  id: string;
  url: string;
  title: string;
  excerpt: string;
}

interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta?: { title?: string };
  }>;
}

interface PagefindAPI {
  init: () => Promise<void>;
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
  options: (opts: { baseUrl?: string }) => Promise<void>;
}

// Component to handle search results as kbar actions
function SearchActions() {
  const { searchQuery } = useKBar((state) => ({
    searchQuery: state.searchQuery,
  }));

  const [pagefind, setPagefind] = useState<PagefindAPI | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load Pagefind on mount
  useEffect(() => {
    const loadPagefind = async () => {
      try {
        // Ensure basePath has trailing slash for correct URL construction
        const rawBasePath = import.meta.env.BASE_URL || '/';
        const basePath = rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`;
        const pf = await import(
          /* @vite-ignore */ `${basePath}pagefind/pagefind.js`
        ) as PagefindAPI;
        await pf.options({ baseUrl: basePath });
        await pf.init();
        setPagefind(pf);
      } catch (err) {
        console.error('Failed to load Pagefind:', err);
      }
    };
    loadPagefind();
  }, []);

  // Search when query changes (debounced internally by kbar)
  useEffect(() => {
    if (!pagefind || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const doSearch = async () => {
      try {
        const response = await pagefind.search(searchQuery);
        if (cancelled) return;

        const results = await Promise.all(
          response.results.slice(0, 10).map(async (result) => {
            const data = await result.data();
            return {
              id: result.id,
              url: data.url,
              title: data.meta?.title || extractTitle(data.url),
              excerpt: data.excerpt,
            };
          })
        );

        if (!cancelled) {
          setSearchResults(results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };

    const timeoutId = setTimeout(doSearch, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [pagefind, searchQuery]);

  // Register search results as kbar actions
  const actions: Action[] = useMemo(() => {
    if (isSearching && searchResults.length === 0) {
      return [{
        id: 'loading',
        name: 'Searching...',
        section: 'Results',
        perform: () => {},
      }];
    }

    if (searchQuery && searchResults.length === 0 && !isSearching) {
      return [{
        id: 'no-results',
        name: 'No results found',
        section: 'Results',
        perform: () => {},
      }];
    }

    return searchResults.map((result) => ({
      id: result.id,
      name: result.title,
      subtitle: stripHtml(result.excerpt).substring(0, 100) + '...',
      section: 'Results',
      perform: () => {
        window.location.href = result.url;
      },
    }));
  }, [searchResults, searchQuery, isSearching]);

  useRegisterActions(actions, [actions]);

  return null;
}

// Result item renderer
function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {item}
          </div>
        ) : (
          <div
            className={`
              px-4 py-3 cursor-pointer transition-colors
              ${active ? 'bg-white/10' : 'bg-transparent'}
              border-b border-white/5 last:border-b-0
            `}
          >
            <div className="text-white font-medium">{item.name}</div>
            {item.subtitle && (
              <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                {item.subtitle}
              </div>
            )}
          </div>
        )
      }
    />
  );
}

// Main SearchModal component
export default function SearchModal() {
  // Initial actions (empty - search results are dynamic)
  const initialActions: Action[] = [];

  return (
    <KBarProvider actions={initialActions}>
      <SearchActions />
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20">
          <KBarAnimator className="w-full max-w-2xl mx-4 bg-gray-900/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            <KBarSearch
              className="w-full px-6 py-4 bg-transparent text-white text-lg placeholder-gray-400 focus:outline-none border-b border-white/10"
              placeholder="Search lessons, code, diagrams..."
            />
            <div className="max-h-96 overflow-y-auto">
              <RenderResults />
            </div>
            <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-500 flex gap-4">
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd> navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd> select</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">esc</kbd> close</span>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
    </KBarProvider>
  );
}

// Helper functions
function extractTitle(url: string): string {
  const parts = url.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1] || 'Page';
  return lastPart.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
