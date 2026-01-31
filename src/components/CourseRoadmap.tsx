import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useStore } from '@nanostores/react';
import { $progress } from '../stores/progress';

/**
 * Lesson data for roadmap rendering.
 * Uses flat array (not Map) for JSON serialization compatibility with Astro islands.
 */
export interface RoadmapLesson {
  title: string;
  slug: string;
}

export interface CourseRoadmapProps {
  lessons: RoadmapLesson[];
  /** Base path for URLs (e.g., "/debezium-course") */
  basePath?: string;
}

// Color palette for node styling (rotates through for visual variety)
const NODE_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
];

/**
 * Generates Mermaid flowchart syntax from lessons array.
 * Creates clickable nodes with color styling and sequential connections.
 * Completed lessons show checkmark prefix and green color.
 */
function generateFlowchartSyntax(
  lessons: RoadmapLesson[],
  basePath: string = '',
  completedSlugs: string[] = []
): string {
  if (lessons.length === 0) {
    return `flowchart TB
    empty["Уроки пока не добавлены"]
    style empty fill:#374151,stroke:#6b7280,color:#9ca3af`;
  }

  const lines: string[] = ['flowchart TB'];

  // Node definitions
  lessons.forEach((lesson, index) => {
    // Prepend checkmark for completed lessons
    const isComplete = completedSlugs.includes(lesson.slug);
    const prefix = isComplete ? '✓ ' : '';
    // Escape quotes in title for Mermaid syntax
    const escapedTitle = (prefix + lesson.title).replace(/"/g, '#quot;');
    lines.push(`    N${index}["${escapedTitle}"]`);
  });

  lines.push('');

  // Node connections (sequential flow)
  if (lessons.length > 1) {
    const connections = lessons.map((_, index) => `N${index}`).join(' --> ');
    lines.push(`    ${connections}`);
    lines.push('');
  }

  // Click handlers - navigate to course lesson URLs (with base path)
  lessons.forEach((lesson, index) => {
    lines.push(`    click N${index} "${basePath}/course/${lesson.slug}"`);
  });

  lines.push('');

  // Node styling - green for completed, color rotation for incomplete
  lessons.forEach((lesson, index) => {
    const isComplete = completedSlugs.includes(lesson.slug);
    // Green (#10b981 emerald-500) for completed, original color rotation for incomplete
    const color = isComplete ? '#10b981' : NODE_COLORS[index % NODE_COLORS.length];
    lines.push(`    style N${index} fill:${color},stroke:${color},color:#fff`);
  });

  return lines.join('\n');
}

/**
 * Interactive course roadmap component using Mermaid flowcharts.
 *
 * IMPORTANT: Uses securityLevel: 'loose' to enable click event handlers.
 * This is required for navigation to work - without it clicks fail silently.
 *
 * @param lessons - Array of lesson data (title, slug) for roadmap nodes
 */
export function CourseRoadmap({ lessons, basePath = '' }: CourseRoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const progress = useStore($progress);

  useEffect(() => {
    const renderRoadmap = async () => {
      if (!containerRef.current) return;

      try {
        // Initialize mermaid with dark theme and LOOSE security for click handlers
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose', // CRITICAL: Required for click events to work
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#e5e7eb',
            primaryBorderColor: '#60a5fa',
            lineColor: '#9ca3af',
            secondaryColor: '#1f2937',
            tertiaryColor: '#111827',
            background: '#1f2937',
            mainBkg: '#1f2937',
            secondBkg: '#111827',
            labelBackground: '#374151',
            labelTextColor: '#e5e7eb',
            nodeTextColor: '#e5e7eb',
          },
        });

        // Safely get completed slugs array
        const completedSlugs = Array.isArray(progress?.completed) ? progress.completed : [];
        // Generate flowchart syntax from lessons (with base path and completed slugs)
        const chartSyntax = generateFlowchartSyntax(lessons, basePath, completedSlugs);

        // Generate unique ID for this diagram
        const id = `roadmap-${Math.random().toString(36).substring(7)}`;

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, chartSyntax);
        setSvg(renderedSvg);
        setError('');
      } catch (err) {
        console.error('Roadmap rendering error:', err);
        setError(err instanceof Error ? err.message : 'Не удалось отрисовать карту курса');
      }
    };

    renderRoadmap();
  }, [lessons, basePath, progress]);

  if (error) {
    return (
      <section className="my-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
          Карта курса
        </h2>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300">
          <p className="font-semibold">Ошибка отрисовки карты:</p>
          <pre className="text-sm mt-2 overflow-x-auto">{error}</pre>
        </div>
      </section>
    );
  }

  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
        Карта курса
      </h2>
      <div className="overflow-x-auto">
        <div
          ref={containerRef}
          className="roadmap-container flex justify-center min-w-max"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <p className="text-sm text-gray-400 text-center mt-4">
        Нажмите на урок для перехода
      </p>
    </section>
  );
}
