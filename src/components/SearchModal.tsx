import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isSearchOpen, closeSearch, toggleSearch } from '../stores/search';

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

export default function SearchModal() {
  const isOpen = useStore(isSearchOpen);
  const [query, setQuery] = useState('');
  const [pagefind, setPagefind] = useState<PagefindAPI | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load Pagefind on mount
  useEffect(() => {
    const loadPagefind = async () => {
      try {
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

  // Handle Cmd+K to open/close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeSearch();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Search when query changes
  useEffect(() => {
    if (!pagefind || !query.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const doSearch = async () => {
      try {
        const response = await pagefind.search(query);
        if (cancelled) return;

        const searchResults = await Promise.all(
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
          setResults(searchResults);
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
  }, [pagefind, query]);

  // Handle keyboard navigation within results
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const selectedResult = results[activeIndex];
      if (selectedResult) {
        window.location.href = selectedResult.url;
      }
    }
  }, [results, activeIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const activeElement = resultsRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, results.length]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20"
      onClick={() => closeSearch()}
    >
      <div
        className="w-full max-w-2xl mx-4 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="w-full px-6 py-4 bg-transparent text-white text-lg placeholder-gray-400 focus:outline-none border-b border-white/10"
          placeholder="Search lessons, code, diagrams..."
        />

        {/* Results */}
        <div className="max-h-96 overflow-y-auto" ref={resultsRef}>
          {!query.trim() ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Start typing to search lessons, code, and diagrams...
            </div>
          ) : isSearching && results.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              Searching...
            </div>
          ) : !isSearching && results.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            results.map((result, index) => (
              <a
                key={result.id}
                href={result.url}
                className={`
                  block px-6 py-4 cursor-pointer transition-colors
                  border-b border-white/5 last:border-b-0
                  ${index === activeIndex ? 'bg-white/10' : 'hover:bg-white/5'}
                `}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="text-white font-medium">{result.title}</div>
                <div
                  className="text-sm text-gray-400 mt-1 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: result.excerpt }}
                />
              </a>
            ))
          )}
        </div>

        {/* Keyboard hints */}
        <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-500 flex gap-4">
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd> select</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

// Helper function
function extractTitle(url: string): string {
  const parts = url.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1] || 'Page';
  return lastPart.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
