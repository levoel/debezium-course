# Pitfalls: Interactive Glass Diagram Migration (v1.4)

**Domain:** Replacing 170 Mermaid diagrams with React components
**Context:** Debezium course, existing glass design system, Astro 5 + React 19, MDX content
**Researched:** 2026-02-02
**Confidence:** HIGH

---

## Critical Pitfalls

Mistakes that cause rewrites, major delays, or broken functionality across 170 diagrams.

### Pitfall 1: Component API Explosion (Inconsistent Props Across Diagrams)

**What goes wrong:** Each of 170 diagrams gets its own custom props structure. DiagramA uses `nodes={[]}`, DiagramB uses `items={[]}`, DiagramC uses `data={[]}`. Six months later, maintaining consistency across 170 components becomes impossible.

**Why it happens:**
- Different developers (or same developer on different days) create diagrams without shared API contract
- Rush to "just get it working" for each diagram without considering reusability
- No design review process for new diagram components
- Diagram types vary (flowcharts, sequence diagrams, architecture diagrams) leading to assumption that APIs must differ

**Consequences:**
- Maintenance nightmare: updating tooltip behavior requires touching 170 different prop structures
- Onboarding friction: new contributors must learn 170 different APIs
- Design drift: glass styling becomes inconsistent as each diagram interprets "glass" differently
- Testing overhead: 170 unique component APIs means 170 unique test patterns

**Warning signs (how to detect early):**
- First 5 diagrams use different prop names for the same concept (nodes vs items vs elements)
- No shared types/interfaces for diagram primitives
- Copy-paste between diagram files with "slight modifications"
- Absence of component library documentation

**Prevention strategy:**
1. **Design primitives first:** Create a shared component library BEFORE any diagram replacement
   ```tsx
   // Shared primitives with consistent API
   interface DiagramNodeProps {
     id: string;
     label: string;
     variant: 'database' | 'service' | 'queue' | 'cloud';
     tooltip?: TooltipContent;
   }

   interface DiagramArrowProps {
     from: string;
     to: string;
     label?: string;
     variant?: 'solid' | 'dashed';
   }
   ```
2. **Enforce TypeScript interfaces:** All diagram components must implement shared interfaces
3. **Create diagram templates:** Standard patterns for flowcharts, sequences, architectures
4. **Review gate:** New diagram components require API review before merge
5. **Component inventory:** Track all diagram components and their API compliance

**Which phase should address it:**
- **Phase 1 (Foundation):** Define primitives library and TypeScript interfaces
- **Phase 2:** Template creation for common diagram types
- **Phase 3+:** Enforce API compliance during module-by-module migration

---

### Pitfall 2: Hydration Mismatch Cascade (client:visible Timing Issues)

**What goes wrong:** React diagrams using `client:visible` directive intermittently fail to hydrate correctly. Some diagrams render as empty boxes, others show React hydration errors, layout shifts occur on scroll.

**Why it happens:**
- Astro renders static HTML server-side, then React hydrates client-side
- Mismatch between server-rendered HTML and client-rendered React causes errors
- `client:visible` delays hydration until viewport intersection, creating race conditions
- Diagram content depends on runtime state (viewport size, random IDs)

**Consequences:**
- Users see empty diagram containers or cryptic error messages
- Layout shifts as diagrams suddenly appear/resize during scrolling
- Inconsistent behavior across browsers (Chrome vs Safari timing)
- Error reports flood your monitoring from the 170 diagram instances

**Warning signs:**
- Console errors: "An error occurred during hydration. The server HTML was replaced with client content"
- Diagrams work on page load but break on navigation (Astro's view transitions)
- Intermittent blank diagrams that "fix themselves" on page refresh
- CI tests pass but production has visual glitches

**Prevention strategy:**
1. **Deterministic rendering:** No random IDs, no `Math.random()`, no `Date.now()` in component render
   ```tsx
   // WRONG: Random ID causes hydration mismatch
   const nodeId = `node-${Math.random().toString(36)}`;

   // CORRECT: Stable, deterministic ID
   const nodeId = `node-${diagramId}-${index}`;
   ```

2. **Use `client:load` for above-fold diagrams:** Reserve `client:visible` for diagrams below fold
   ```astro
   <!-- First diagram in lesson - use client:load -->
   <CDCFlowDiagram client:load />

   <!-- Later diagrams - client:visible is fine -->
   <ArchitectureDiagram client:visible />
   ```

3. **Handle viewport-dependent sizing server-side:** Use CSS for responsiveness, not JS viewport queries
   ```tsx
   // WRONG: Runtime viewport check causes mismatch
   const width = typeof window !== 'undefined' ? window.innerWidth : 800;

   // CORRECT: CSS handles responsiveness
   <div className="w-full max-w-4xl">
   ```

4. **Test with disabled JavaScript:** Server-rendered HTML should be meaningful, not empty

5. **Add error boundaries per diagram:**
   ```tsx
   <ErrorBoundary fallback={<DiagramFallback name="CDC Flow" />}>
     <CDCFlowDiagram />
   </ErrorBoundary>
   ```

**Which phase should address it:**
- **Phase 1:** Establish hydration-safe patterns in primitives library
- **Phase 2:** Add error boundaries wrapper pattern
- **All phases:** Test each diagram in both SSR and CSR modes before merge

---

### Pitfall 3: Glass Design Drift (170 Interpretations of "Glass")

**What goes wrong:** Each diagram implements glass effects slightly differently. Some use 8px blur, others 16px. Some have gradient borders, others don't. After migrating 170 diagrams, visual consistency is lost.

**Why it happens:**
- Glass design system has CSS variables but diagram components don't use them
- Copy-paste from DeploymentModes.tsx with "small tweaks" each time
- No visual regression testing to catch drift
- Different contributors have different interpretations of design

**Consequences:**
- Site looks unprofessional with inconsistent visual language
- Glass performance varies (some diagrams use heavy blur, others light)
- Maintenance burden: "make all diagrams match" becomes massive refactor
- Design system becomes meaningless as exceptions accumulate

**Warning signs:**
- Inline Tailwind classes with hardcoded opacity values (`bg-purple-500/20`)
- Diagram components not importing from shared glass utilities
- Multiple different border-radius values across diagrams
- Varying hover effects (some lift, some glow, some do nothing)

**Prevention strategy:**
1. **Glass tokens in primitives:** All diagram components MUST use CSS variables
   ```tsx
   // WRONG: Hardcoded glass values
   className="backdrop-blur-md bg-purple-500/20 border-purple-400/30"

   // CORRECT: Use design tokens
   className="glass-node glass-node-database"
   ```

2. **Semantic glass variants (not color-based):**
   ```css
   @utility glass-node {
     background: var(--glass-node-bg);
     backdrop-filter: blur(var(--glass-blur-sm));
     border: 1px solid var(--glass-border);
   }

   @utility glass-node-database {
     --glass-node-bg: var(--color-database-glass);
   }

   @utility glass-node-service {
     --glass-node-bg: var(--color-service-glass);
   }
   ```

3. **Visual regression testing:** Screenshot comparison for every diagram
   ```yaml
   # Playwright visual regression
   test('DeploymentModes visual match', async ({ page }) => {
     await page.goto('/module-1/debezium-architecture');
     await expect(page.locator('[data-diagram="deployment-modes"]'))
       .toHaveScreenshot('deployment-modes.png');
   });
   ```

4. **Design review checklist:** Every diagram PR must pass visual consistency check
5. **Storybook for diagrams:** Component catalog ensures consistency is visible

**Which phase should address it:**
- **Phase 1:** Define all glass variants as CSS utilities
- **Phase 2:** Create visual regression test infrastructure
- **Every module phase:** Run visual regression before merge

---

### Pitfall 4: Tooltip Accessibility Violations at Scale

**What goes wrong:** Tooltips on diagram nodes fail WCAG requirements. Hover-only tooltips exclude keyboard users. Screen readers announce nothing useful. 170 diagrams with 5+ nodes each = 850+ accessibility violations.

**Why it happens:**
- Tooltip "just works" with mouse, no one tests keyboard
- Focus management not implemented for diagram nodes
- aria-describedby not connected to tooltip content
- Mobile users can't hover, tooltips are inaccessible on touch

**Consequences:**
- Legal liability (WCAG 2.1 AA required for many organizations)
- 15-20% of users can't access diagram explanations
- Automated accessibility audits fail across entire site
- Retrofitting accessibility into 170 diagrams = massive rework

**Warning signs:**
- Tooltips appear on :hover only, no :focus state
- No keyboard navigation between diagram nodes
- Screen reader announces "button" but not what it explains
- Mobile version has no way to access tooltip content

**Prevention strategy:**
1. **Click-to-open tooltips (not hover-only):**
   ```tsx
   // Accessible tooltip pattern
   <DiagramNode
     aria-describedby={`tooltip-${nodeId}`}
     tabIndex={0}
     onKeyDown={(e) => e.key === 'Enter' && toggleTooltip()}
     onClick={toggleTooltip}
   >
     {label}
   </DiagramNode>

   <Tooltip
     id={`tooltip-${nodeId}`}
     role="tooltip"
     aria-hidden={!isOpen}
   />
   ```

2. **Focus management for keyboard navigation:**
   ```tsx
   // Arrow key navigation between nodes
   const handleKeyDown = (e: KeyboardEvent) => {
     if (e.key === 'ArrowRight') focusNextNode();
     if (e.key === 'ArrowLeft') focusPrevNode();
     if (e.key === 'Escape') closeTooltip();
   };
   ```

3. **Use established tooltip library (Radix, Floating UI):**
   - These handle WCAG compliance out of the box
   - Radix UI Tooltip is lightweight (~3kB) and accessible
   - Avoids reinventing focus traps, escape handling, screen reader announcements

4. **Mobile: tap to show, tap outside to dismiss:**
   ```tsx
   // Mobile-friendly interaction
   <DiagramNode
     onClick={() => setActiveTooltip(nodeId)}
     aria-expanded={activeTooltip === nodeId}
   />
   ```

5. **Automated accessibility testing:**
   ```typescript
   // axe-core in Playwright
   test('diagram nodes are keyboard accessible', async ({ page }) => {
     await page.goto('/module-1/cdc-fundamentals');
     await page.keyboard.press('Tab'); // Focus first node
     await page.keyboard.press('Enter'); // Open tooltip
     await expect(page.locator('[role="tooltip"]')).toBeVisible();
   });
   ```

**Which phase should address it:**
- **Phase 1:** Integrate accessible tooltip library into primitives
- **Phase 2:** Build keyboard navigation into base diagram component
- **All phases:** Accessibility audit per diagram before merge

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or user frustration.

### Pitfall 5: Bundle Size Explosion (170 Unique Components)

**What goes wrong:** Each diagram is a separate React component. Client bundle grows from 50KB to 500KB. First Contentful Paint regresses. Lighthouse performance score drops.

**Why it happens:**
- Each diagram imports React, tooltip library, animation libraries
- No code splitting strategy for diagrams
- Shared dependencies duplicated across diagram chunks
- Tree shaking fails because diagram components reference each other

**Consequences:**
- Page load time increases significantly
- Mobile users on slow connections abandon site
- Lighthouse scores tank (affects SEO)
- Build times increase as component count grows

**Warning signs:**
- Bundle analyzer shows React duplicated in multiple chunks
- Page load metrics regress after adding more diagrams
- Build output shows 170 separate JS files for diagrams
- Initial JS payload exceeds 200KB

**Prevention strategy:**
1. **Shared primitives bundle:** All diagrams import from single primitives package
   ```tsx
   // All diagrams use same base components
   import { FlowNode, Arrow, Container } from '@/components/diagrams/primitives';
   ```

2. **Lazy load diagrams below fold:**
   ```astro
   <!-- Only load diagram JS when visible -->
   <DiagramContainer client:visible>
     <CDCFlowDiagram />
   </DiagramContainer>
   ```

3. **Prefer CSS animations over JS:**
   ```css
   /* CSS handles hover animations, not Framer Motion */
   .glass-node {
     transition: transform 150ms ease, box-shadow 150ms ease;
   }
   .glass-node:hover {
     transform: translateY(-2px);
   }
   ```

4. **Bundle analysis in CI:**
   ```yaml
   # Fail build if bundle exceeds budget
   - name: Check bundle size
     run: |
       npx bundlewatch --config bundlewatch.config.json
   ```

5. **Consider SVG-first approach:** Simple diagrams can be static SVG with CSS, not React

**Which phase should address it:**
- **Phase 1:** Establish bundle budget and measurement
- **Phase 2:** Implement lazy loading pattern
- **Phase 3+:** Monitor bundle size per module migration

---

### Pitfall 6: MDX Import Proliferation (Managing 170 Import Statements)

**What goes wrong:** Each MDX file manually imports its specific diagram components. Import paths change during refactoring, causing 170 broken imports. No single place to update diagram component locations.

**Why it happens:**
- MDX files directly import: `import { CDCFlowDiagram } from '../../../components/diagrams/CDCFlow.tsx'`
- Component restructuring requires updating every MDX file
- No centralized diagram registry
- Relative paths are fragile and hard to refactor

**Consequences:**
- Refactoring diagram folder structure breaks entire course
- Renaming a component requires finding/replacing across 61 files
- New diagrams require manual MDX edits in multiple places
- Risk of import typos causing build failures

**Warning signs:**
- Multiple different import paths to same diagram component
- Build errors after moving a component file
- MDX files have 10+ import statements at top
- Diagram components scattered across multiple folders

**Prevention strategy:**
1. **Centralized diagram registry:**
   ```tsx
   // src/components/diagrams/index.ts
   export { CDCFlowDiagram } from './module-1/CDCFlow';
   export { DeploymentModesDiagram } from './module-1/DeploymentModes';
   export { OutboxPatternDiagram } from './module-5/OutboxPattern';
   // ... all 170 diagrams
   ```

2. **Single import in MDX:**
   ```mdx
   import { CDCFlowDiagram, OutboxPatternDiagram } from '@diagrams';
   ```

3. **Path alias in tsconfig:**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@diagrams": ["./src/components/diagrams/index.ts"]
       }
     }
   }
   ```

4. **Diagram components in MDX provider (avoid imports entirely):**
   ```astro
   <!-- BaseLayout.astro -->
   <Content components={{
     CDCFlowDiagram,
     OutboxPatternDiagram,
     ...allDiagrams
   }} />
   ```

5. **Co-locate diagrams with content (alternative):**
   ```
   src/content/course/01-module-1/
   |-- 02-debezium-architecture.mdx
   |-- diagrams/
   |   +-- DeploymentModes.tsx
   ```

**Which phase should address it:**
- **Phase 1:** Establish import strategy and path aliases
- **Phase 2:** Create diagram registry pattern
- **All phases:** Enforce registry updates when adding diagrams

---

### Pitfall 7: Diagram Rendering Without Mermaid Fallback

**What goes wrong:** React diagram fails to load (JS error, hydration issue), user sees blank space. No fallback, no error message, just missing content. Unlike Mermaid which rendered server-side.

**Why it happens:**
- React components require JS to render; Mermaid had server-side output
- Error boundary missing or shows unhelpful message
- No graceful degradation for diagram content
- Assumption that JS always works

**Consequences:**
- Users on slow connections see blank spaces while JS loads
- JS errors cause entire diagrams to disappear
- No SEO value from diagram content (search engines can't index React)
- Broken user experience when things go wrong

**Warning signs:**
- Diagrams render blank for 2-3 seconds on slow connections
- Error boundary shows "Something went wrong" with no useful info
- Disable JS in browser, all diagrams vanish
- Core Web Vitals show high Cumulative Layout Shift

**Prevention strategy:**
1. **Meaningful loading state:**
   ```tsx
   function DiagramContainer({ children, title }) {
     return (
       <div
         className="glass-panel min-h-[200px] flex items-center justify-center"
         aria-label={`Diagram: ${title}`}
       >
         <Suspense fallback={<DiagramSkeleton title={title} />}>
           {children}
         </Suspense>
       </div>
     );
   }
   ```

2. **Error boundary with diagram description:**
   ```tsx
   function DiagramErrorBoundary({ children, fallbackDescription }) {
     return (
       <ErrorBoundary
         fallback={
           <div className="glass-panel p-4 text-gray-400">
             <p>Diagram could not be loaded.</p>
             <p className="text-sm mt-2">{fallbackDescription}</p>
           </div>
         }
       >
         {children}
       </ErrorBoundary>
     );
   }
   ```

3. **Alt text / figure caption for all diagrams:**
   ```tsx
   <figure>
     <DiagramContainer>
       <CDCFlowDiagram />
     </DiagramContainer>
     <figcaption className="text-center text-sm text-gray-400 mt-2">
       Figure 1: CDC data flow from PostgreSQL through Debezium to Kafka
     </figcaption>
   </figure>
   ```

4. **Static SVG preview (advanced):** Pre-render diagram to SVG at build time, hydrate with interactivity

**Which phase should address it:**
- **Phase 1:** Create DiagramContainer with loading/error states
- **Phase 2:** Establish figure/figcaption pattern
- **All phases:** Every diagram must have fallback description

---

### Pitfall 8: Sequence Diagram Complexity (Different Paradigm Than Flowcharts)

**What goes wrong:** Team builds reusable flowchart components, then hits sequence diagrams (18+ occurrences). Sequence diagrams need timelines, lifelines, message ordering - completely different primitives. Flowchart components don't transfer.

**Why it happens:**
- Mermaid handled all diagram types with same syntax
- React component library built only for flowcharts
- Sequence diagrams require: participants, lifelines, messages, activation boxes
- Assumption that "diagram = nodes + arrows" applies to all types

**Consequences:**
- Sequence diagram migration blocks entire modules
- New primitive library needed mid-project
- Timeline: 3 weeks for flowcharts, +4 weeks for sequence diagrams
- Inconsistent styling between diagram types

**Warning signs:**
- First flowchart components don't have timeline concept
- Mermaid `sequenceDiagram` occurrences deferred "for later"
- Diagrams with vertical timelines (not horizontal flows)
- Attempt to force sequence diagrams into flowchart components

**Prevention strategy:**
1. **Audit diagram types upfront:**
   ```
   Diagram types in course:
   - flowchart: ~95 occurrences
   - sequenceDiagram: ~18 occurrences
   - graph (simple): ~45 occurrences
   - architecture: ~12 occurrences
   ```

2. **Build primitives for each type:**
   ```tsx
   // Flowchart primitives
   export { FlowNode, Arrow, Container, DecisionNode };

   // Sequence primitives
   export { Participant, Lifeline, Message, ActivationBox };

   // Architecture primitives
   export { SystemBlock, ServiceNode, DataFlow };
   ```

3. **Prototype one of each type before bulk migration:**
   - Build one flowchart diagram
   - Build one sequence diagram
   - Build one architecture diagram
   - Then proceed with bulk migration

4. **Consider specialized sequence library:** Libraries like `react-sequence-diagram` or build custom

**Which phase should address it:**
- **Phase 1:** Audit all diagram types, count occurrences
- **Phase 2:** Prototype each diagram type
- **Phase 3+:** Module migration only after all primitives exist

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable without major refactoring.

### Pitfall 9: Tooltip Content Maintenance (Duplicated Explanations)

**What goes wrong:** Tooltip content explaining "WAL" is duplicated in 15 diagrams. Definition changes, 14 diagrams still have old text. No single source of truth for domain terminology.

**Prevention:**
```tsx
// Centralized terminology
const GLOSSARY = {
  wal: {
    title: 'Write-Ahead Log (WAL)',
    description: 'PostgreSQL\'s transaction log that records all changes before they\'re applied.'
  },
  cdc: {
    title: 'Change Data Capture',
    description: 'Pattern for tracking database changes and propagating them to other systems.'
  }
};

// Usage in diagram
<FlowNode
  label="WAL"
  tooltip={GLOSSARY.wal}
/>
```

**Which phase:** Phase 1 (create glossary with primitives)

---

### Pitfall 10: Mobile Touch Target Size (Tiny Diagram Nodes)

**What goes wrong:** Diagram nodes are 40x24px. On mobile, touching the right node is impossible. Users tap wrong elements constantly.

**Prevention:**
- Minimum touch target: 44x44px (WCAG 2.5.5)
- Add padding around nodes for touch without visual change
- Mobile: nodes expand slightly on touch

```tsx
<FlowNode
  className="min-w-[44px] min-h-[44px] p-2"
/>
```

**Which phase:** Phase 1 (set minimum size in primitives)

---

### Pitfall 11: Diagram Responsiveness (Desktop-First Designs)

**What goes wrong:** 4-column flowcharts look great on desktop, break completely on 375px mobile screens. Nodes overlap, arrows cross illegibly.

**Prevention:**
- Design mobile-first: vertical flow as default
- Use CSS container queries or media queries
- Consider simplified mobile version for complex diagrams

```tsx
<DiagramContainer className="flex flex-col md:flex-row">
  {/* Mobile: vertical stack, Desktop: horizontal flow */}
</DiagramContainer>
```

**Which phase:** Phase 2 (test responsive behavior during template creation)

---

### Pitfall 12: Animation Performance with 10+ Nodes

**What goes wrong:** Diagram with 15 nodes all animate on hover. Staggered animations look cool but cause frame drops on mobile.

**Prevention:**
- Disable animation for diagrams with >8 nodes
- Use CSS transitions, not JS animations
- Respect `prefers-reduced-motion`

```tsx
const useSimpleAnimations = nodes.length > 8;
```

**Which phase:** Phase 1 (establish animation rules)

---

## Integration with Existing Glass Design System

These pitfalls build on the existing v1.3 glassmorphism research (see `PITFALLS.md`). Key inherited constraints:

| Glass Pitfall (v1.3) | Diagram Implication (v1.4) |
|---------------------|---------------------------|
| WCAG contrast violations | Diagram node text must meet 4.5:1 ratio |
| Backdrop-filter performance | Limit blur to 8px on nodes, 12px on containers |
| Dark mode invisibility | Diagram nodes need sufficient opacity on dark backgrounds |
| Animation blur flicker | Never animate backdrop-filter on diagram elements |
| Overuse in interface | Max 1-2 glassmorphic diagrams visible per viewport |

**Cross-reference:** The glass design tokens from v1.3 (`--glass-blur`, `--glass-bg`, `--glass-border`) should be used in diagram primitives, not bypassed with inline styles.

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Phase 1 (Foundation) | Under-scoping primitives library | Audit ALL 170 diagrams before starting |
| Phase 1 (Foundation) | Forgetting sequence diagram primitives | Build prototype of each diagram type first |
| Phase 2 (Tooltips) | Hover-only tooltips | Use click/tap to open, not hover |
| Phase 2 (Tooltips) | No keyboard navigation | Implement arrow key navigation between nodes |
| Phase 3-10 (Modules) | Copy-paste drift | Enforce imports from primitives, not raw Tailwind |
| Phase 3-10 (Modules) | Import path chaos | Use centralized registry from day one |
| All phases | No visual regression | Screenshot test every diagram |
| All phases | Bundle size growth | Monitor with bundlewatch, lazy load |

---

## Pre-Migration Checklist

Before starting diagram migration:

**Architecture:**
- [ ] All diagram types identified and counted (flowchart, sequence, architecture)
- [ ] Primitives library API designed for ALL types
- [ ] Import strategy decided (registry vs co-location)
- [ ] Bundle budget set and measurement configured

**Design System:**
- [ ] Glass variants defined as CSS utilities (not inline Tailwind)
- [ ] Semantic color tokens for diagram node types
- [ ] Visual regression testing infrastructure ready
- [ ] Animation rules documented (max nodes, CSS-only)

**Accessibility:**
- [ ] Tooltip library selected (Radix, Floating UI recommended)
- [ ] Keyboard navigation pattern documented
- [ ] Touch target sizes enforced (44px minimum)
- [ ] Error boundary with meaningful fallback ready

**Hydration Safety:**
- [ ] No random IDs pattern documented
- [ ] client:load vs client:visible guidance written
- [ ] SSR-safe patterns in primitives
- [ ] Error handling for failed hydration

**Maintenance:**
- [ ] Glossary/terminology source of truth created
- [ ] Diagram registry pattern established
- [ ] Update process documented for future diagrams

---

## Sources

### React Component Libraries at Scale
- [Architecting React for Scale - Ancilar Tech](https://medium.com/@ancilartech/architecting-react-for-scale-7-hard-lessons-from-real-world-projects-b06aa35f97e9)
- [React Design Systems: Building UIs with Consistency and Scale - Angular Minds](https://medium.com/@angularminds/react-design-systems-building-uis-with-consistency-and-scale-8a89975ef8d8)
- [Top Mistakes Using React UI Component Libraries - Sencha](https://www.sencha.com/blog/top-mistakes-developers-make-using-react-ui-component-library-and-how-to-avoid-them/)
- [Modularizing React Applications - Martin Fowler](https://martinfowler.com/articles/modularizing-react-apps.html)

### Astro Hydration and Islands
- [Islands Architecture - Astro Docs](https://docs.astro.build/en/concepts/islands/)
- [How to Fix React Hydration Error in Astro - Akos Komuves](https://akoskm.com/how-to-fix-react-hydration-error-in-astro/)
- [Astro Islands Architecture Explained - Strapi](https://strapi.io/blog/astro-islands-architecture-explained-complete-guide)
- [Hydration Error with React - Astro GitHub Issue #9473](https://github.com/withastro/astro/issues/9473)

### Tooltip Accessibility
- [Tooltip Components Should Not Exist - TkDodo](https://tkdodo.eu/blog/tooltip-components-should-not-exist)
- [How to Create Accessible Tooltip Using React - DEV](https://dev.to/micaavigliano/how-to-create-an-accessible-tooltip-using-react-2cck)
- [Tooltip Accessibility - Carbon Design System](https://carbondesignsystem.com/components/tooltip/accessibility/)
- [Material UI Tooltip - WCAG compliance](https://mui.com/material-ui/react-tooltip/)
- [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)

### Glass/Glassmorphism Performance
- [Glassmorphism with backdrop-filter - 12 Features](https://uxpilot.ai/blogs/glassmorphism-ui)
- [Implementing Liquid Glass UI in React Native - Cygnis](https://cygnis.co/blog/implementing-liquid-glass-ui-react-native/)
- [Apple Liquid Glass Recreation - GitHub](https://github.com/olii-dev/liquid-glass)

### MDX Integration
- [MDX and React - Docusaurus](https://docusaurus.io/docs/markdown-features/react)
- [Using MDX - MDX Docs](https://mdxjs.com/docs/using-mdx/)
- [Next.js MDX Guide](https://nextjs.org/docs/pages/guides/mdx)

### Component Organization
- [React Folder Structure in 5 Steps - Robin Wieruch](https://www.robinwieruch.de/react-folder-structure/)
- [Code Organization & Conventions - Hands on React](https://handsonreact.com/docs/code-organization-conventions)
- [Handling Icons in React: Best Practices - DEV](https://dev.to/seanyasno/handling-icons-in-react-best-practices-22c5)

---

*Research completed: 2026-02-02*
*Migration scope: 170 Mermaid diagrams across 61 MDX files*
*Related: PITFALLS.md (v1.3 glassmorphism pitfalls)*
