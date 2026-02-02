# Phase 27: Sequence Diagram Primitives - Research

**Researched:** 2026-02-02
**Domain:** React SVG components for sequence diagram rendering
**Confidence:** HIGH

## Summary

This phase creates three sequence diagram primitives (SequenceActor, SequenceMessage, SequenceLifeline) to replace Mermaid sequence diagrams in the course. The approach follows the established pattern from Phase 26 - custom React/SVG components with zero external library cost.

Sequence diagrams differ fundamentally from flowcharts. Flowcharts are spatial (nodes positioned anywhere), while sequence diagrams are temporal (actors across top, messages flow downward representing time). This requires different primitives:

1. **SequenceActor** - Participant boxes positioned horizontally across the top
2. **SequenceLifeline** - Vertical dashed lines extending downward from actors
3. **SequenceMessage** - Horizontal arrows between lifelines with labels

**Primary recommendation:** Build primitives using pure SVG with consistent column-based layout algorithm. Reuse DiagramContainer and DiagramTooltip from Phase 26.

## Standard Stack

### Core (Already Available)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | Component framework | Project standard |
| TypeScript | 5.x | Type safety | Project standard |
| Tailwind CSS | 4.x | Styling | Project standard |
| @radix-ui/react-tooltip | 1.x | Accessible tooltips | Already installed (Phase 26) |

### Reuse from Phase 26

| Component | Purpose | How to Reuse |
|-----------|---------|--------------|
| DiagramContainer | Glass wrapper | Wrap entire sequence diagram |
| DiagramTooltip | Click-to-open tooltips | Wrap SequenceActor and SequenceMessage |
| CSS variables | Glass styling | Use --glass-blur-md, --glass-border-color |
| forwardRef pattern | Radix compatibility | Apply to all interactive elements |

### New Components Required

| Component | Purpose | Technical Approach |
|-----------|---------|-------------------|
| SequenceActor | Participant box | FlowNode-like div with variant styles |
| SequenceLifeline | Dashed vertical line | SVG line with stroke-dasharray |
| SequenceMessage | Arrow with label | SVG path + text positioning |
| SequenceDiagram | Layout container | CSS Grid/Flexbox for column positioning |

**Installation:** No new packages required - all dependencies available.

## Architecture Patterns

### Recommended Project Structure

```
src/components/diagrams/primitives/
|-- index.ts                  # Add new exports
|-- types.ts                  # Add sequence diagram types
|-- FlowNode.tsx              # (existing)
|-- Arrow.tsx                 # (existing)
|-- DiagramContainer.tsx      # (existing)
|-- Tooltip.tsx               # (existing)
|-- SequenceActor.tsx         # NEW
|-- SequenceLifeline.tsx      # NEW
|-- SequenceMessage.tsx       # NEW
|-- SequenceDiagram.tsx       # NEW (optional layout helper)
```

### Pattern 1: Column-Based Layout Algorithm

**What:** Position actors in equal-width columns, messages span between column centers.

**When to use:** All sequence diagrams.

**Example:**
```tsx
// Layout calculation for sequence diagrams
interface SequenceLayoutProps {
  actors: string[];           // Actor IDs in display order
  messages: MessageDef[];     // Messages with from/to actor IDs
  containerWidth?: number;    // Optional fixed width
}

// Calculate column positions
const getColumnCenter = (actorIndex: number, totalActors: number, width: number) => {
  const columnWidth = width / totalActors;
  return columnWidth * actorIndex + columnWidth / 2;
};
```

### Pattern 2: SVG Coordinate System for Messages

**What:** Use SVG for rendering message arrows between lifelines.

**When to use:** All message rendering.

**Example:**
```tsx
// Message arrow between two actors
interface SequenceMessageProps {
  fromX: number;              // Start X coordinate (from lifeline center)
  toX: number;                // End X coordinate (to lifeline center)
  y: number;                  // Y position (time order)
  label: string;              // Message text
  variant?: 'sync' | 'async' | 'return';  // Arrow style
}

// SVG path for arrow
// Sync: solid line, filled arrowhead
// Async: solid line, open arrowhead
// Return: dashed line, open arrowhead
```

### Pattern 3: Composable Sequence Diagram

**What:** Build diagrams from primitives with explicit layout data.

**When to use:** Creating sequence diagrams in MDX.

**Example:**
```tsx
// Composition pattern for MDX usage
<DiagramContainer title="CDC Event Flow" color="emerald">
  <SequenceDiagram
    actors={['PostgreSQL', 'WAL', 'Debezium', 'Kafka']}
    height={300}
  >
    {(layout) => (
      <>
        {/* Actors render automatically via layout */}
        <SequenceMessage
          from="PostgreSQL"
          to="WAL"
          y={50}
          label="Write to log"
        />
        <SequenceMessage
          from="Debezium"
          to="WAL"
          y={100}
          label="Read changes"
          variant="sync"
        />
        <SequenceMessage
          from="WAL"
          to="Debezium"
          y={130}
          label="CDC events"
          variant="return"
        />
      </>
    )}
  </SequenceDiagram>
</DiagramContainer>
```

### Anti-Patterns to Avoid

- **Absolute pixel positioning:** Don't hardcode x/y coordinates. Use column-based calculation.
- **Separate SVG per message:** Use single SVG container for all messages to avoid coordination issues.
- **HTML-based arrows:** Don't use divs/borders for arrows - SVG provides better control.
- **Hover-only tooltips:** Already decided (STATE.md) - use click-to-open for mobile.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tooltip accessibility | Custom tooltip logic | DiagramTooltip (Phase 26) | WCAG compliance, focus management |
| Container styling | New glass styles | DiagramContainer (Phase 26) | Consistent design system |
| Arrow paths | Custom SVG math | Calculated path strings | Simple horizontal arrows |

**Key insight:** Sequence diagram arrows are simpler than flowchart arrows - they are always horizontal. No need for routing algorithms or curved paths.

## Common Pitfalls

### Pitfall 1: Text Overflow in Message Labels

**What goes wrong:** Long message labels like "INSERT INTO customers VALUES (...)" overflow column boundaries or get truncated illegibly.

**Why it happens:** Fixed column widths don't accommodate variable text lengths.

**How to avoid:**
- Use CSS text-overflow: ellipsis with max-width
- Position labels above/below the arrow, not inline
- Use abbreviated labels with full text in tooltip
- Consider multi-line labels for long text

**Warning signs:** Labels overlapping adjacent columns, unreadable truncation.

### Pitfall 2: Variable Actor Count Layout Breakage

**What goes wrong:** Diagram looks fine with 3 actors, breaks with 6 actors (too cramped) or 2 actors (too sparse).

**Why it happens:** Fixed width calculations without min/max constraints.

**How to avoid:**
```tsx
// Min/max column width constraints
const COLUMN_MIN_WIDTH = 80;  // px
const COLUMN_MAX_WIDTH = 200; // px

const calculateColumnWidth = (containerWidth: number, actorCount: number) => {
  const raw = containerWidth / actorCount;
  return Math.max(COLUMN_MIN_WIDTH, Math.min(COLUMN_MAX_WIDTH, raw));
};
```

**Warning signs:** Actors overlapping or diagram filling only partial width.

### Pitfall 3: Lifeline Alignment with Actor Box

**What goes wrong:** Dashed lifeline doesn't start exactly at the center-bottom of the actor box.

**Why it happens:** Coordinate mismatch between HTML actor box and SVG lifeline.

**How to avoid:**
- Use CSS for layout, calculate SVG coordinates from DOM positions
- Or use pure SVG for both actor and lifeline
- Test alignment at different responsive breakpoints

**Warning signs:** Visual misalignment visible at different screen sizes.

### Pitfall 4: Message Arrow Direction Ambiguity

**What goes wrong:** User can't tell if message goes left-to-right or right-to-left.

**Why it happens:** Arrowhead too small, or same style for both directions.

**How to avoid:**
- Arrowhead at destination end (standard UML)
- Minimum arrowhead size: 8px for visibility
- Different arrow directions render correctly (leftward arrows)

**Warning signs:** Users misread message flow direction.

### Pitfall 5: Mobile Responsiveness Collapse

**What goes wrong:** Sequence diagram is unreadable on mobile (375px viewport).

**Why it happens:** Too many actors to fit, no mobile adaptation.

**How to avoid:**
- Allow horizontal scroll on mobile for complex diagrams
- Or simplify diagrams for mobile (fewer actors shown)
- Test with real course sequence diagrams (4-7 actors typical)

**Warning signs:** Touch targets too small, text unreadable on mobile.

## Code Examples

### SequenceActor Component

```typescript
// Source: Based on FlowNode pattern from Phase 26
import { forwardRef } from 'react';

type SequenceActorVariant = 'database' | 'service' | 'queue' | 'external';

interface SequenceActorProps {
  children: React.ReactNode;
  variant?: SequenceActorVariant;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
  'aria-label'?: string;
}

const variantStyles: Record<SequenceActorVariant, string> = {
  database: 'bg-purple-500/20 border-purple-400/30 text-purple-200',
  service: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200',
  queue: 'bg-blue-500/20 border-blue-400/30 text-blue-200',
  external: 'bg-gray-500/20 border-gray-400/30 text-gray-200',
};

export const SequenceActor = forwardRef<HTMLDivElement, SequenceActorProps>(
  function SequenceActor(
    { children, variant = 'service', className = '', onClick, tabIndex, 'aria-label': ariaLabel },
    ref
  ) {
    const isInteractive = !!onClick;

    return (
      <div
        ref={ref}
        className={`
          px-3 py-2 rounded-lg border backdrop-blur-md
          text-sm font-medium text-center
          shadow-md shadow-black/20
          min-w-[60px] max-w-[120px]
          ${variantStyles[variant]}
          ${isInteractive ? 'cursor-pointer hover:brightness-110' : ''}
          ${className}
        `.trim()}
        onClick={onClick}
        tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
        role={isInteractive ? 'button' : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    );
  }
);
```

### SequenceLifeline Component

```typescript
// Source: SVG dashed line pattern
interface SequenceLifelineProps {
  height: number;        // Total height of lifeline
  className?: string;
}

export function SequenceLifeline({ height, className = '' }: SequenceLifelineProps) {
  return (
    <svg
      width="2"
      height={height}
      className={`mx-auto ${className}`}
      aria-hidden="true"
    >
      <line
        x1="1"
        y1="0"
        x2="1"
        y2={height}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 3"
        className="text-gray-500"
      />
    </svg>
  );
}
```

### SequenceMessage Component

```typescript
// Source: UML sequence diagram arrow patterns
interface SequenceMessageProps {
  fromX: number;         // Start X position
  toX: number;           // End X position
  y: number;             // Y position
  label: string;         // Message text
  variant?: 'sync' | 'async' | 'return';
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
}

export const SequenceMessage = forwardRef<SVGGElement, SequenceMessageProps>(
  function SequenceMessage(
    { fromX, toX, y, label, variant = 'sync', className = '', onClick, tabIndex },
    ref
  ) {
    const isLeftToRight = toX > fromX;
    const arrowheadSize = 8;

    // Line style based on variant
    const lineStyle = variant === 'return'
      ? { strokeDasharray: '4 2' }
      : {};

    // Arrowhead style (filled for sync, open for async/return)
    const arrowFill = variant === 'sync' ? 'currentColor' : 'none';

    // Arrow path
    const arrowPath = isLeftToRight
      ? `M${toX - arrowheadSize},${y - arrowheadSize/2} L${toX},${y} L${toX - arrowheadSize},${y + arrowheadSize/2}`
      : `M${toX + arrowheadSize},${y - arrowheadSize/2} L${toX},${y} L${toX + arrowheadSize},${y + arrowheadSize/2}`;

    const isInteractive = !!onClick;

    return (
      <g
        ref={ref}
        className={`text-gray-400 ${className}`}
        onClick={onClick}
        tabIndex={tabIndex}
        role={isInteractive ? 'button' : undefined}
        style={{ cursor: isInteractive ? 'pointer' : undefined }}
      >
        {/* Line */}
        <line
          x1={fromX}
          y1={y}
          x2={toX}
          y2={y}
          stroke="currentColor"
          strokeWidth="1.5"
          {...lineStyle}
        />

        {/* Arrowhead */}
        <path
          d={arrowPath}
          stroke="currentColor"
          strokeWidth="1.5"
          fill={arrowFill}
          strokeLinejoin="round"
        />

        {/* Label */}
        <text
          x={(fromX + toX) / 2}
          y={y - 6}
          textAnchor="middle"
          className="text-xs fill-gray-300"
        >
          {label}
        </text>
      </g>
    );
  }
);
```

### Complete Sequence Diagram Layout Helper

```typescript
// Source: Column-based layout pattern
interface Actor {
  id: string;
  label: string;
  variant?: SequenceActorVariant;
  tooltip?: React.ReactNode;
}

interface Message {
  id: string;
  from: string;
  to: string;
  label: string;
  variant?: 'sync' | 'async' | 'return';
  tooltip?: React.ReactNode;
}

interface SequenceDiagramProps {
  actors: Actor[];
  messages: Message[];
  messageSpacing?: number;  // Vertical spacing between messages
  className?: string;
}

export function SequenceDiagram({
  actors,
  messages,
  messageSpacing = 40,
  className = '',
}: SequenceDiagramProps) {
  const diagramHeight = 80 + messages.length * messageSpacing;
  const columnWidth = 100 / actors.length; // Percentage-based

  const getActorCenterX = (actorId: string): number => {
    const index = actors.findIndex(a => a.id === actorId);
    return columnWidth * index + columnWidth / 2;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Actor row */}
      <div className="flex justify-around mb-4">
        {actors.map((actor) => (
          <DiagramTooltip key={actor.id} content={actor.tooltip}>
            <SequenceActor variant={actor.variant} tabIndex={0}>
              {actor.label}
            </SequenceActor>
          </DiagramTooltip>
        ))}
      </div>

      {/* SVG for lifelines and messages */}
      <svg
        width="100%"
        height={diagramHeight}
        className="overflow-visible"
        aria-label="Sequence diagram messages"
      >
        {/* Lifelines */}
        {actors.map((actor, i) => {
          const x = `${getActorCenterX(actor.id)}%`;
          return (
            <line
              key={`lifeline-${actor.id}`}
              x1={x}
              y1="0"
              x2={x}
              y2={diagramHeight}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 3"
              className="text-gray-500"
            />
          );
        })}

        {/* Messages */}
        {messages.map((msg, i) => {
          const fromX = getActorCenterX(msg.from);
          const toX = getActorCenterX(msg.to);
          const y = 20 + i * messageSpacing;

          return (
            <SequenceMessage
              key={msg.id}
              fromX={fromX}
              toX={toX}
              y={y}
              label={msg.label}
              variant={msg.variant}
            />
          );
        })}
      </svg>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mermaid sequenceDiagram | Custom React/SVG | Phase 27 | Zero library cost, full styling control |
| External diagram library | Built-in primitives | Phase 26-27 | No dependencies, consistent glass design |
| Hover-only tooltips | Click-to-open | Phase 26 | Mobile accessibility |

**Deprecated/outdated:**
- Mermaid library for sequence diagrams: Being replaced by custom primitives
- react-sequence-diagram npm package: Outdated (8 years), not maintained

## Open Questions

1. **Percentage vs Pixel Coordinates**
   - What we know: SVG can use percentage for x positions in some contexts
   - What's unclear: Browser support for percentage in SVG line coordinates
   - Recommendation: Use viewBox and calculate pixel positions based on container width, or use percentage strings with width="100%"

2. **Note/Comment Support**
   - What we know: Mermaid supports `Note over Actor` syntax
   - What's unclear: How often notes are used in course diagrams
   - Recommendation: Audit sequence diagrams for note usage, add SequenceNote component if needed

3. **Activation Bars**
   - What we know: UML sequence diagrams have activation bars (thin rectangles on lifelines)
   - What's unclear: Whether course diagrams need this feature
   - Recommendation: Defer - not in requirements, can add later if needed

## Sources

### Primary (HIGH confidence)

- **Phase 26 Primitives (local)** - FlowNode, Arrow, DiagramContainer, DiagramTooltip patterns
- **Course Content Analysis (local)** - Mermaid sequence diagram patterns in MDX files
- **PITFALLS_diagram-migration.md (local)** - Pitfall 8 specifically addresses sequence diagram complexity

### Secondary (MEDIUM confidence)

- [Sequence Diagram Tutorial - Creately](https://creately.com/guides/sequence-diagram-tutorial/) - UML notation guide
- [Mermaid Sequence Diagram Syntax](https://mermaid.ai/open-source/syntax/sequenceDiagram.html) - Current Mermaid syntax reference
- [SVG Sequence Diagram patterns](https://www.productboard.com/blog/how-we-implemented-svg-arrows-in-react-the-basics-1-3/) - Productboard arrow implementation

### Tertiary (LOW confidence)

- [react-archer GitHub](https://github.com/pierpo/react-archer) - General arrow drawing patterns
- [svg-sequence-diagram npm](https://www.npmjs.com/package/svg-sequence-diagram) - NPM package (for reference only, not used)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing Phase 26 components and patterns
- Architecture: HIGH - Based on existing primitives pattern, verified with course content
- Pitfalls: HIGH - Based on PITFALLS research document and Phase 26 learnings

**Research date:** 2026-02-02
**Valid until:** 30 days (stable SVG/React patterns, no external dependencies)

---

## Key Findings Summary

1. **Reuse DiagramContainer and DiagramTooltip** from Phase 26 - no new tooltip/wrapper components needed

2. **Three new components needed:**
   - SequenceActor - Glass-styled participant box (similar to FlowNode)
   - SequenceLifeline - SVG dashed vertical line
   - SequenceMessage - SVG horizontal arrow with label

3. **Layout approach:** Column-based positioning with flex/percentage for actors, SVG for lifelines/messages

4. **Typical course diagrams use 4-7 actors** with 5-15 messages - optimize for this range

5. **Message variants needed:** sync (solid arrow), async (open arrow), return (dashed)

6. **No external libraries required** - pure React/SVG/CSS solution
