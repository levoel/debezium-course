# Architecture: Reusable Diagram Components for 170 Diagrams

**Project:** Debezium Course Website
**Domain:** Interactive glass diagram system
**Researched:** 2026-02-02
**Confidence:** HIGH (based on existing codebase analysis)

## Executive Summary

The 170 Mermaid diagrams should be replaced with a **primitive-based component architecture** where shared building blocks (FlowNode, Arrow, Container, SequenceMessage) are composed into diagram-specific components. Each diagram becomes a lightweight composition of primitives rather than a monolithic component, enabling rapid creation while maintaining visual consistency with the existing liquid glass design system.

**Key architectural decision:** Create a three-tier hierarchy - (1) primitives in `src/components/diagrams/primitives/`, (2) composed diagrams in `src/components/diagrams/`, and (3) MDX imports that use `client:visible` for lazy hydration.

## Current State Analysis

### Existing Architecture

```
src/
  components/
    diagrams/
      DeploymentModes.tsx    # Proof-of-concept (inline primitives)
    Mermaid.tsx              # Current Mermaid renderer (to be deprecated)
    Callout.tsx              # Example of glass-styled React component
    Navigation.tsx           # Uses nanostores for state
  content/
    course/
      **/*.mdx               # 57 lessons containing Mermaid imports
  styles/
    global.css               # Glass CSS variables and utilities
  stores/
    navigation.ts            # nanostores example
```

### Diagram Analysis by Type

| Type | Count | Primitives Needed |
|------|-------|-------------------|
| Flowcharts (`flowchart TB/LR`) | ~90 | FlowNode, Arrow, Container |
| Sequence Diagrams (`sequenceDiagram`) | ~35 | Participant, Message, Note, ActivationBar |
| Subgraph-heavy flows | ~30 | Container (nested), FlowNode, Arrow |
| Simple node chains | ~15 | FlowNode, Arrow |

### Existing Glass Design Tokens

From `src/styles/global.css`, the diagram system should use:

```css
/* Available tokens */
--glass-blur-md: 10px;
--glass-blur-lg: 16px;
--glass-bg-opacity: 0.1;
--glass-border-color: rgba(255, 255, 255, 0.18);
--glass-border-radius: 16px;
--glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
```

### MDX Integration Pattern

Current pattern from `02-debezium-architecture.mdx`:

```tsx
import { Mermaid } from '../../../components/Mermaid.tsx';

<Mermaid chart={`flowchart TB...`} client:visible />
```

Target pattern:

```tsx
import { DeploymentModesDiagram } from '../../../components/diagrams/DeploymentModes';

<DeploymentModesDiagram client:visible />
```

## Recommended Architecture: Primitive Composition

### Component Hierarchy

```
src/components/diagrams/
  primitives/
    index.ts                 # Re-export all primitives
    FlowNode.tsx             # Node with variant styling
    Arrow.tsx                # Directional connector (→, ↓, ←, ↑)
    Container.tsx            # Subgraph wrapper (ModeCard generalized)
    Tooltip.tsx              # Click-activated explanation popup

    # Sequence diagram primitives
    Participant.tsx          # Column header for sequence diagrams
    Message.tsx              # Arrow with label between participants
    ActivationBar.tsx        # Vertical bar showing active processing
    Note.tsx                 # Annotation box in sequences

  # Module 1 diagrams (6 diagrams across 6 lessons)
  module-1/
    CDCvsPollingDiagram.tsx
    CDCSequenceDiagram.tsx
    DeploymentModesDiagram.tsx
    KafkaConnectArchitecture.tsx
    CDCEventFlowSequence.tsx
    EventStructureDiagram.tsx

  # Module 2 diagrams (7 lessons, ~15 diagrams)
  module-2/
    ...

  # Shared diagram layouts
  layouts/
    FlowchartLayout.tsx      # Horizontal/vertical flow container
    SequenceLayout.tsx       # Participant-column based layout
```

### Primitive API Design

#### FlowNode

```tsx
interface FlowNodeProps {
  children: React.ReactNode;
  variant: 'database' | 'connector' | 'queue' | 'service' | 'cloud' | 'app' | 'target';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;       // For tooltip activation
  tooltipContent?: string;    // Russian explanation
  className?: string;         // Escape hatch for one-offs
}
```

**Variant color mapping** (from DeploymentModes.tsx proof-of-concept):

| Variant | Background | Border | Text |
|---------|------------|--------|------|
| database | purple-500/20 | purple-400/30 | purple-200 |
| connector | emerald-500/15 | emerald-400/30 | emerald-200 |
| queue | emerald-500/20 | emerald-400/40 | emerald-100 |
| service | blue-500/15 | blue-400/30 | blue-200 |
| cloud | blue-500/20 | blue-400/40 | blue-100 |
| app | rose-500/15 | rose-400/30 | rose-200 |
| target | rose-500/20 | rose-400/40 | rose-100 |

#### Arrow

```tsx
interface ArrowProps {
  direction: 'right' | 'down' | 'left' | 'up';
  label?: string;             // Optional arrow label
  dashed?: boolean;           // For optional/async flows
  className?: string;
}
```

#### Container

```tsx
interface ContainerProps {
  title: string;
  color: 'emerald' | 'blue' | 'rose' | 'amber' | 'purple' | 'neutral';
  recommended?: boolean;      // Shows badge
  children: React.ReactNode;
  className?: string;
}
```

#### Tooltip

```tsx
interface TooltipProps {
  content: string;            // Russian explanation text
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

// Tooltip state managed in parent diagram component
const [tooltipState, setTooltipState] = useState<{
  content: string;
  anchor: HTMLElement | null;
} | null>(null);
```

### Sequence Diagram Primitives

#### Participant

```tsx
interface ParticipantProps {
  id: string;                 // Used for message routing
  label: string;
  variant?: 'actor' | 'service' | 'database' | 'queue';
}
```

#### Message

```tsx
interface MessageProps {
  from: string;               // Participant ID
  to: string;                 // Participant ID
  label: string;
  type?: 'sync' | 'async' | 'return';
  note?: string;              // Annotation above message
}
```

#### SequenceLayout

```tsx
interface SequenceLayoutProps {
  participants: ParticipantProps[];
  children: React.ReactNode;  // Message components
  columnWidth?: number;       // Default 150px
}
```

**Example sequence diagram composition:**

```tsx
export function CDCSequenceDiagram() {
  return (
    <SequenceLayout
      participants={[
        { id: 'app', label: 'Приложение', variant: 'actor' },
        { id: 'pg', label: 'PostgreSQL', variant: 'database' },
        { id: 'wal', label: 'Transaction Log', variant: 'service' },
        { id: 'deb', label: 'Debezium', variant: 'service' },
        { id: 'kafka', label: 'Kafka', variant: 'queue' },
      ]}
    >
      <Message from="app" to="pg" label="INSERT INTO customers" />
      <Message from="pg" to="wal" label="Запись в WAL" type="sync" />
      <Message from="pg" to="app" label="OK" type="return" />
      <Note>~миллисекунды</Note>
      <Message from="deb" to="wal" label="Чтение новых записей" />
      <Message from="wal" to="deb" label="CDC Event" type="return" />
      <Message from="deb" to="kafka" label="Publish" />
    </SequenceLayout>
  );
}
```

## File Organization Strategy

### Directory Structure

```
src/components/diagrams/
  primitives/
    index.ts                  # Export all primitives
    FlowNode.tsx
    Arrow.tsx
    Container.tsx
    Tooltip.tsx
    Participant.tsx
    Message.tsx
    ActivationBar.tsx
    Note.tsx
    SequenceLayout.tsx
    FlowchartLayout.tsx

  # Group by module for discoverability
  module-1/
    index.ts                  # Export all module-1 diagrams
    CDCvsPolling.tsx
    CDCSequence.tsx
    DeploymentModes.tsx
    KafkaConnectArch.tsx
    EventFlow.tsx
    EventStructure.tsx

  module-2/
    index.ts
    LogicalDecoding.tsx
    ReplicationSlots.tsx
    ...

  # Continue for all 8 modules
```

### Naming Convention

| Convention | Example | Rationale |
|------------|---------|-----------|
| Diagram file | `CDCvsPolling.tsx` | PascalCase, descriptive |
| Export name | `CDCvsPollingDiagram` | Suffix with "Diagram" for MDX clarity |
| Primitive | `FlowNode.tsx` | Generic, reusable name |

### Import Path in MDX

**Recommended:** Use barrel exports for cleaner imports.

```tsx
// In module-1/index.ts
export { CDCvsPollingDiagram } from './CDCvsPolling';
export { CDCSequenceDiagram } from './CDCSequence';
// ...

// In MDX file
import { CDCvsPollingDiagram } from '../../../components/diagrams/module-1';
```

**Alternative:** Direct imports (more explicit, easier to tree-shake)

```tsx
import { CDCvsPollingDiagram } from '../../../components/diagrams/module-1/CDCvsPolling';
```

**Recommendation:** Use barrel exports. The 170 diagrams are all used, so tree-shaking is not a concern. Barrel exports reduce import noise in MDX.

## MDX Integration

### Hydration Strategy

All diagram components should use `client:visible` for lazy hydration:

```tsx
<CDCvsPollingDiagram client:visible />
```

**Rationale:**
- Diagrams are below the fold in most lessons
- `client:visible` delays JS loading until diagram enters viewport
- Reduces initial page load by ~50KB per diagram (React hydration)

### Component Prop Passing

For diagrams that need lesson-specific variations:

```tsx
interface DiagramProps {
  showTooltips?: boolean;     // Disable for screenshots
  simplified?: boolean;       // Show fewer nodes
  highlightStep?: number;     // Highlight specific node
}
```

**Example in MDX:**

```tsx
<CDCSequenceDiagram highlightStep={3} client:visible />
```

### Coexistence with Mermaid

During migration, both systems will coexist:

```tsx
// Old (to be replaced)
import { Mermaid } from '../../../components/Mermaid.tsx';
<Mermaid chart={`...`} client:visible />

// New
import { CDCSequenceDiagram } from '../../../components/diagrams/module-1';
<CDCSequenceDiagram client:visible />
```

**Migration strategy:** Replace one module at a time, keeping Mermaid.tsx available until all 170 diagrams are converted.

## State Management for Tooltips

### Option 1: Local Component State (Recommended)

Each diagram manages its own tooltip state:

```tsx
export function CDCvsPollingDiagram() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div className="relative">
      <FlowNode
        variant="database"
        onClick={() => setActiveTooltip('database')}
        isActive={activeTooltip === 'database'}
      >
        PostgreSQL
      </FlowNode>

      {activeTooltip && (
        <Tooltip
          content={tooltipContent[activeTooltip]}
          onClose={() => setActiveTooltip(null)}
        />
      )}
    </div>
  );
}
```

**Rationale:**
- Simple, no cross-island state needed
- Each diagram is self-contained
- nanostores not required for tooltips

### Option 2: nanostores for Cross-Diagram State

If we need to track which diagrams the user has explored:

```tsx
// src/stores/diagrams.ts
import { atom } from 'nanostores';

export const $exploredDiagrams = atom<Set<string>>(new Set());

export function markExplored(diagramId: string) {
  const current = $exploredDiagrams.get();
  $exploredDiagrams.set(new Set([...current, diagramId]));
}
```

**Not recommended for v1.4** - Keep it simple. Tooltips are informational, not progress-tracked.

## Build Order (Phased Approach)

### Phase 1: Primitives Foundation

1. **FlowNode** - Core building block (exists in PoC, needs extraction)
2. **Arrow** - Directional connector
3. **Container** - Subgraph wrapper (generalized ModeCard)
4. **Tooltip** - Click-activated popup

**Output:** `src/components/diagrams/primitives/` with 4 components

### Phase 2: Flowchart Diagrams (Module 1-4)

Priority: Start with Module 1 as they're the entry point for learners.

| Module | Diagram Count | Complexity |
|--------|---------------|------------|
| Module 1 | 6 | Low (simple flows) |
| Module 2 | 15 | Medium (PostgreSQL internals) |
| Module 3 | 20 | Medium (MySQL binlog) |
| Module 4 | 15 | Medium (monitoring) |

### Phase 3: Sequence Diagram Primitives

1. **Participant**
2. **Message**
3. **ActivationBar**
4. **Note**
5. **SequenceLayout**

**Output:** Sequence primitives ready for Module 1-4 sequence diagrams

### Phase 4: Remaining Modules

| Module | Diagram Count | Complexity |
|--------|---------------|------------|
| Module 5 | 25 | High (SMT chains, complex flows) |
| Module 6 | 20 | High (streaming architectures) |
| Module 7 | 15 | Medium (cloud diagrams) |
| Module 8 | 10 | Medium (capstone architecture) |

### Phase 5: MDX Migration

Replace Mermaid imports with new diagram components, one module at a time.

### Phase 6: Mermaid Deprecation

Remove `mermaid` npm dependency and `Mermaid.tsx` component.

## Integration Points

### New Components (to create)

| Component | Location | Purpose |
|-----------|----------|---------|
| FlowNode | primitives/FlowNode.tsx | Node rendering |
| Arrow | primitives/Arrow.tsx | Directional connector |
| Container | primitives/Container.tsx | Subgraph wrapper |
| Tooltip | primitives/Tooltip.tsx | Interactive popup |
| Participant | primitives/Participant.tsx | Sequence participant |
| Message | primitives/Message.tsx | Sequence message |
| SequenceLayout | primitives/SequenceLayout.tsx | Sequence container |
| 170 diagram components | module-N/*.tsx | Composed diagrams |

### Modified Files

| File | Change |
|------|--------|
| 57 MDX files | Replace Mermaid imports with diagram components |
| package.json | Remove `mermaid` dependency (after migration) |

### No Changes Required

| File | Reason |
|------|--------|
| src/styles/global.css | Glass tokens already defined |
| src/stores/* | No cross-island state needed for tooltips |
| src/layouts/BaseLayout.astro | No layout changes |
| astro.config.mjs | No config changes |

## Performance Considerations

### Bundle Size Impact

| Item | Size | Notes |
|------|------|-------|
| Mermaid (current) | ~1.2MB | Full diagram DSL parser |
| Diagram primitives | ~15KB | React components only |
| Per-diagram component | ~1-3KB | Simple compositions |

**Net savings:** ~1MB bundle size reduction after Mermaid removal.

### Hydration Strategy

```tsx
// Lazy hydration - JS loads when diagram enters viewport
<DiagramComponent client:visible />

// Alternative: No hydration for static diagrams (future optimization)
// Render as SVG at build time, no client JS
```

### Mobile Performance

Diagram components should use reduced blur on mobile:

```tsx
// Use existing CSS variable
className="backdrop-blur-[var(--glass-blur-md)]"

// global.css handles mobile reduction
@media (max-width: 1023px) {
  :root {
    --glass-blur-md: 8px;
  }
}
```

## Accessibility

### Keyboard Navigation

```tsx
<FlowNode
  role="img"
  aria-label="PostgreSQL database"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && openTooltip()}
>
  PostgreSQL
</FlowNode>
```

### Screen Reader Support

```tsx
<div role="figure" aria-label="CDC event flow diagram showing data from PostgreSQL through Debezium to Kafka">
  <FlowNode aria-describedby="step-1-desc" />
  <span id="step-1-desc" className="sr-only">
    Step 1: PostgreSQL receives INSERT command
  </span>
</div>
```

### Reduced Motion

Tooltip animations should respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .tooltip-enter {
    animation: none;
  }
}
```

## Testing Strategy

### Visual Regression

Use Playwright for screenshot comparison:

```typescript
test('CDCvsPollingDiagram renders correctly', async ({ page }) => {
  await page.goto('/course/01-module-1/01-cdc-fundamentals');
  await expect(page.locator('[data-testid="cdc-vs-polling-diagram"]'))
    .toHaveScreenshot();
});
```

### Component Tests

Use Vitest + React Testing Library:

```typescript
test('FlowNode renders with correct variant styles', () => {
  render(<FlowNode variant="database">PostgreSQL</FlowNode>);
  expect(screen.getByText('PostgreSQL')).toHaveClass('bg-purple-500/20');
});
```

### Integration Tests

Verify MDX imports work:

```typescript
test('MDX renders diagram component', async () => {
  const lesson = await import('./01-cdc-fundamentals.mdx');
  render(<lesson.default />);
  expect(screen.getByTestId('cdc-vs-polling-diagram')).toBeInTheDocument();
});
```

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Component organization | Module-based folders | Discoverability, matches content structure |
| Primitive extraction | Dedicated primitives/ folder | Reusability across 170 diagrams |
| State management | Local component state | Simple, no cross-island complexity |
| Hydration | client:visible | Performance (lazy loading) |
| Import style | Barrel exports | Cleaner MDX imports |
| Tooltip approach | Click-activated | Touch-friendly, explicit interaction |
| Sequence diagrams | Layout component + Messages | Flexible, composable |

## Roadmap Implications

Based on this architecture:

1. **Phase 1-2:** Primitives first (foundation for all diagrams)
2. **Phase 3-4:** Module 1 diagrams (learning path entry point)
3. **Phase 5+:** Sequential module migration (2, 3, 4, 5, 6, 7, 8)
4. **Final phase:** Mermaid removal (after all 170 converted)

**Suggested phase count:** 12-15 phases
- 2 phases for primitives
- 8 phases for module diagrams (one per module)
- 2-3 phases for testing, polish, and Mermaid removal

## Sources

- Existing codebase analysis (HIGH confidence)
- DeploymentModes.tsx proof-of-concept (HIGH confidence)
- Astro Islands documentation for hydration strategies
- Existing glass design system in global.css
