import { useState, useEffect, useCallback, useRef } from 'react';

export interface SearchResult {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  meta?: Record<string, string>;
}

interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta?: { title?: string; [key: string]: string | undefined };
    content?: string;
  }>;
}

interface PagefindSearchResponse {
  results: PagefindResult[];
}

interface PagefindAPI {
  init: () => Promise<void>;
  search: (query: string) => Promise<PagefindSearchResponse>;
  options: (opts: { baseUrl?: string }) => Promise<void>;
}

export interface UsePagefindSearchOptions {
  debounceMs?: number;
  maxResults?: number;
}

export interface UsePagefindSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

export function usePagefindSearch(
  options: UsePagefindSearchOptions = {}
): UsePagefindSearchReturn {
  const { debounceMs = 200, maxResults = 10 } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagefindRef = useRef<PagefindAPI | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Pagefind API on mount
  useEffect(() => {
    const loadPagefind = async () => {
      try {
        // Dynamic import of Pagefind from the build output
        const basePath = import.meta.env.BASE_URL || '/';
        const pagefind = await import(
          /* @vite-ignore */ `${basePath}pagefind/pagefind.js`
        ) as PagefindAPI;

        await pagefind.options({ baseUrl: basePath });
        await pagefind.init();

        pagefindRef.current = pagefind;
        setIsReady(true);
      } catch (err) {
        console.error('Failed to load Pagefind:', err);
        setError('Search is not available in development mode. Run `npm run build && npm run preview` to test search.');
      }
    };

    loadPagefind();
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!pagefindRef.current || !searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResponse = await pagefindRef.current.search(searchQuery);

        // Load result data in parallel (limited to maxResults)
        const limitedResults = searchResponse.results.slice(0, maxResults);
        const resultsWithData = await Promise.all(
          limitedResults.map(async (result) => {
            const data = await result.data();
            return {
              id: result.id,
              url: data.url,
              title: data.meta?.title || extractTitleFromUrl(data.url),
              excerpt: data.excerpt,
              meta: data.meta,
            };
          })
        );

        setResults(resultsWithData);
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [maxResults]
  );

  // Debounced query handler
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs, performSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isReady,
    error,
  };
}

// Helper to extract a readable title from URL
function extractTitleFromUrl(url: string): string {
  const parts = url.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1] || 'Page';
  return lastPart
    .replace(/-/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default usePagefindSearch;
