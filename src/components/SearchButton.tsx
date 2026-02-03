import { openSearch } from '../stores/search';

export function SearchButton() {
  return (
    <button
      onClick={() => openSearch()}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white
                 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg
                 transition-colors cursor-pointer"
      aria-label="Search (Cmd+K)"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-white/10 rounded">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </button>
  );
}
