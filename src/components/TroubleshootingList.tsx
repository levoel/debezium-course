import React, { useState, useMemo } from 'react';
import { TroubleshootingEntry } from './TroubleshootingEntry';

interface RelatedLesson {
  title: string;
  slug: string;
}

interface TroubleshootingEntryData {
  errorCode?: string;
  errorMessage: string;
  connector: 'postgresql' | 'mysql' | 'common';
  category: 'connection' | 'snapshot' | 'streaming' | 'configuration' | 'performance';
  symptoms: string[];
  cause: string;
  solution: string[];
  relatedLessons?: RelatedLesson[];
}

interface TroubleshootingListProps {
  entries: TroubleshootingEntryData[];
  basePath: string;
}

type ConnectorFilter = 'all' | 'postgresql' | 'mysql' | 'common';
type CategoryFilter = 'all' | 'connection' | 'snapshot' | 'streaming' | 'configuration' | 'performance';

export const TroubleshootingList: React.FC<TroubleshootingListProps> = ({ entries, basePath }) => {
  const [connectorFilter, setConnectorFilter] = useState<ConnectorFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Filter entries based on selected filters
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesConnector = connectorFilter === 'all' || entry.connector === connectorFilter;
      const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
      return matchesConnector && matchesCategory;
    });
  }, [entries, connectorFilter, categoryFilter]);

  return (
    <div>
      {/* Filter Controls - not indexed by Pagefind */}
      <div className="mb-8 space-y-6" data-pagefind-ignore>
        {/* Connector Filter */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 mt-0">Фильтр по коннектору</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setConnectorFilter('all')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border
                ${connectorFilter === 'all'
                  ? 'bg-white/20 text-white border-white/30 shadow-lg'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
            >
              Все
            </button>
            <button
              onClick={() => setConnectorFilter('postgresql')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border inline-flex items-center gap-2
                ${connectorFilter === 'postgresql'
                  ? 'bg-blue-500/30 text-blue-200 border-blue-400/50 shadow-lg'
                  : 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-400/40'
                }`}
            >
              <span className="text-base">🐘</span>
              PostgreSQL
            </button>
            <button
              onClick={() => setConnectorFilter('mysql')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border inline-flex items-center gap-2
                ${connectorFilter === 'mysql'
                  ? 'bg-orange-500/30 text-orange-200 border-orange-400/50 shadow-lg'
                  : 'bg-orange-500/10 text-orange-300 border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-400/40'
                }`}
            >
              <span className="text-base">🐬</span>
              MySQL
            </button>
            <button
              onClick={() => setConnectorFilter('common')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border inline-flex items-center gap-2
                ${connectorFilter === 'common'
                  ? 'bg-gray-500/30 text-gray-200 border-gray-400/50 shadow-lg'
                  : 'bg-gray-500/10 text-gray-300 border-gray-500/20 hover:bg-gray-500/20 hover:border-gray-400/40'
                }`}
            >
              <span className="text-base">⚙️</span>
              Общие
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 mt-0">Фильтр по категории</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border
                ${categoryFilter === 'all'
                  ? 'bg-white/20 text-white border-white/30 shadow-lg'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
            >
              Все категории
            </button>
            <button
              onClick={() => setCategoryFilter('connection')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border inline-flex items-center gap-2
                ${categoryFilter === 'connection'
                  ? 'bg-purple-500/30 text-purple-200 border-purple-400/50 shadow-lg'
                  : 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400/40'
                }`}
            >
              <span>🔌</span>
              Подключение
            </button>
            <button
              onClick={() => setCategoryFilter('snapshot')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border inline-flex items-center gap-2
                ${categoryFilter === 'snapshot'
                  ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50 shadow-lg'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-400/40'
                }`}
            >
              <span>📸</span>
              Snapshot
            </button>
            <button
              onClick={() => setCategoryFilter('streaming')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border inline-flex items-center gap-2
                ${categoryFilter === 'streaming'
                  ? 'bg-teal-500/30 text-teal-200 border-teal-400/50 shadow-lg'
                  : 'bg-teal-500/10 text-teal-300 border-teal-500/20 hover:bg-teal-500/20 hover:border-teal-400/40'
                }`}
            >
              <span>🌊</span>
              Streaming
            </button>
            <button
              onClick={() => setCategoryFilter('configuration')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border inline-flex items-center gap-2
                ${categoryFilter === 'configuration'
                  ? 'bg-amber-500/30 text-amber-200 border-amber-400/50 shadow-lg'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400/40'
                }`}
            >
              <span>⚙️</span>
              Конфигурация
            </button>
            <button
              onClick={() => setCategoryFilter('performance')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200 border inline-flex items-center gap-2
                ${categoryFilter === 'performance'
                  ? 'bg-rose-500/30 text-rose-200 border-rose-400/50 shadow-lg'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-400/40'
                }`}
            >
              <span>⚡</span>
              Производительность
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-400">
          Показано <span className="font-semibold text-gray-300">{filteredEntries.length}</span> из{' '}
          <span className="font-semibold text-gray-300">{entries.length}</span> ошибок
        </div>
      </div>

      {/* Troubleshooting Entries - indexed by Pagefind */}
      <div data-pagefind-body>
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry, index) => (
            <TroubleshootingEntry
              key={index}
              errorCode={entry.errorCode}
              errorMessage={entry.errorMessage}
              connector={entry.connector}
              category={entry.category}
              symptoms={entry.symptoms}
              cause={entry.cause}
              solution={entry.solution}
              relatedLessons={entry.relatedLessons}
              basePath={basePath}
            />
          ))
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400 text-lg mb-2">
              Ошибок с выбранными фильтрами не найдено
            </p>
            <p className="text-gray-500 text-sm">
              Попробуйте изменить фильтры или использовать поиск Cmd+K
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TroubleshootingList;
