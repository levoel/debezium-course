import React, { useState } from 'react';
import { Icon, type IconName } from './Icon';

interface RelatedLesson {
  title: string;
  slug: string;
}

interface TroubleshootingEntryProps {
  errorCode?: string;
  errorMessage: string;
  connector: 'postgresql' | 'mysql' | 'common';
  category: 'connection' | 'snapshot' | 'streaming' | 'configuration' | 'performance';
  symptoms: string[];
  cause: string;
  solution: string[];
  relatedLessons?: RelatedLesson[];
  basePath?: string;
}

const connectorLabels = {
  postgresql: { label: 'PostgreSQL', color: 'blue' },
  mysql: { label: 'MySQL', color: 'orange' },
  common: { label: 'Общее', color: 'gray' },
};

const categoryLabels: Record<string, { label: string; icon: IconName }> = {
  connection: { label: 'Подключение', icon: 'plug' },
  snapshot: { label: 'Snapshot', icon: 'camera' },
  streaming: { label: 'Streaming', icon: 'wave' },
  configuration: { label: 'Конфигурация', icon: 'gear' },
  performance: { label: 'Производительность', icon: 'lightning' },
};

export const TroubleshootingEntry: React.FC<TroubleshootingEntryProps> = ({
  errorCode,
  errorMessage,
  connector,
  category,
  symptoms,
  cause,
  solution,
  relatedLessons = [],
  basePath = '/',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const connectorInfo = connectorLabels[connector];
  const categoryInfo = categoryLabels[category];

  return (
    <div className="glass-card overflow-hidden mb-4">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start justify-between text-left
                   hover:bg-white/5 transition-colors duration-200"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {errorCode && (
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {errorCode}
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs rounded
              ${connectorInfo.color === 'blue' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : ''}
              ${connectorInfo.color === 'orange' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : ''}
              ${connectorInfo.color === 'gray' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' : ''}
            `}>
              {connectorInfo.label}
            </span>
            <span className="px-2 py-0.5 text-xs rounded bg-white/10 text-gray-300 border border-white/10 inline-flex items-center gap-1">
              <Icon name={categoryInfo.icon} size={14} /> {categoryInfo.label}
            </span>
          </div>
          <div className="font-mono text-sm text-rose-300 break-all pr-4">
            {errorMessage}
          </div>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <Icon name="chevronDown" size={16} />
        </span>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/10 pt-4">
          {/* Symptoms */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
              <Icon name="search" size={16} /> Симптомы
            </h4>
            <ul className="text-sm text-gray-300 space-y-1 ml-6">
              {symptoms.map((symptom, index) => (
                <li key={index} className="list-disc">{symptom}</li>
              ))}
            </ul>
          </div>

          {/* Cause */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
              <Icon name="target" size={16} /> Причина
            </h4>
            <p className="text-sm text-gray-300 ml-6">
              {cause}
            </p>
          </div>

          {/* Solution */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-2">
              <Icon name="check" size={16} /> Решение
            </h4>
            <ol className="text-sm text-gray-300 space-y-2 ml-6">
              {solution.map((step, index) => (
                <li key={index} className="list-decimal">
                  <span dangerouslySetInnerHTML={{ __html: step.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 text-xs rounded bg-slate-700/50 text-gray-200 border border-white/10">$1</code>') }} />
                </li>
              ))}
            </ol>
          </div>

          {/* Related Lessons */}
          {relatedLessons.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Связанные уроки:</h4>
              <div className="flex flex-wrap gap-2">
                {relatedLessons.map((lesson, index) => (
                  <a
                    key={index}
                    href={`${basePath}course/${lesson.slug}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg
                             bg-white/5 hover:bg-white/10 text-blue-300 hover:text-blue-200
                             border border-white/10 hover:border-white/20
                             transition-all duration-200"
                  >
                    <Icon name="book" size={14} className="mr-1.5" />
                    {lesson.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TroubleshootingEntry;
