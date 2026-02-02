# Project Research Summary

**Project:** Debezium CDC Course v1.4 - Interactive Glass Diagram System
**Domain:** Educational technical documentation with interactive diagram components
**Researched:** 2026-02-02
**Confidence:** HIGH

## Executive Summary

The 170 Mermaid diagrams should be replaced with a **primitive-based React component architecture** where shared building blocks (FlowNode, Arrow, Container, Tooltip) are composed into diagram-specific components. This approach delivers visual consistency through the existing liquid glass design system, full interactivity via Radix UI tooltips, and significant bundle size reduction (~1MB) by removing the Mermaid dependency. The existing `DeploymentModes.tsx` proof-of-concept validates the pattern.

**Recommended approach:** Build a primitives library first (Phase 1-2), then migrate diagrams module-by-module. The primitives must cover both flowcharts (~90 diagrams) and sequence diagrams (~35 diagrams) before bulk migration begins. Use `@radix-ui/react-tooltip` for accessible tooltips with zero custom accessibility code. Continue using CSS transitions (Tailwind) for animations - Motion/Framer Motion is unnecessary overhead for tooltip fade/scale effects.

**Critical risks:** (1) Component API explosion across 170 diagrams creates maintenance nightmare - enforce TypeScript interfaces from day one; (2) Hydration mismatches with `client:visible` cause blank diagrams - use deterministic IDs and SSR-safe patterns; (3) Glass design drift - all components must use CSS variables, not hardcoded Tailwind classes; (4) Accessibility violations at scale (850+ tooltip interactions) - use Radix which handles WCAG compliance automatically.

## Key Findings

### Recommended Stack

Add only one new dependency: `@radix-ui/react-tooltip` (~8-10KB gzipped). This provides unstyled, accessible tooltip primitives that integrate perfectly with the existing liquid glass design system. Radix handles positioning, keyboard navigation (Escape to dismiss), focus management, and ARIA attributes out of the box.

**Do NOT add:** React Flow or diagram libraries (overkill for static diagrams), Motion/Framer Motion (CSS handles animations), CSS-in-JS (conflicts with Tailwind), additional state management (Radix handles tooltip state internally).

**Core technologies:**
- **@radix-ui/react-tooltip ^1.2.8:** Accessible tooltips - unstyled primitives, React 19 compatible, handles positioning and ARIA automatically
- **Custom React/SVG primitives:** Diagram components - continue DeploymentModes.tsx pattern, zero bundle cost vs 50-200KB for diagram libraries
- **CSS transitions (Tailwind):** Animations - already available, handles tooltip fade/scale with zero additional bundle impact
- **nanostores (existing):** Optional state - only if cross-diagram tracking needed, not required for tooltip state

### Expected Features

**Must have (table stakes):**
- Hover highlight on nodes (visual feedback that elements are interactive)
- Click-to-reveal tooltips (core mechanism for explanations, mobile: tap-triggered)
- Tooltip dismiss on outside click/Escape (standard behavior, accessibility requirement)
- Clear visual hierarchy (nodes vs containers vs arrows visually distinct)
- Mobile responsive (horizontal scroll or scaled view on narrow screens)
- Touch support (tap = click, no gesture interference with page scroll)
- Keyboard accessibility (Tab through nodes, Enter/Space to activate, Escape to close)
- Smooth transitions/animations (respect prefers-reduced-motion)
- ARIA labels for screen readers (role="tooltip", aria-describedby linking)

**Should have (competitive):**
- Deep-link to node (URL fragment links to specific node, opens tooltip)
- Code snippets in tooltips (show config example for clicked node)
- Print-friendly mode (render well when printed, hide interactive elements)

**Defer (v2+):**
- Step-through animation (animate data flow sequentially - high complexity)
- Zoom/pan for complex diagrams (only needed for 10+ node diagrams)
- Glossary integration (requires building glossary system first)
- Node relationship highlighting (nice-to-have, not critical)
- Multi-level tooltips (progressive disclosure within tooltip)

### Architecture Approach

Create a three-tier hierarchy: (1) primitives in `src/components/diagrams/primitives/` providing FlowNode, Arrow, Container, Tooltip and sequence diagram components; (2) composed diagrams in module folders (`module-1/`, `module-2/`, etc.); (3) MDX imports using `client:visible` for lazy hydration. Each diagram becomes a lightweight composition of primitives (1-3KB) rather than a monolithic component.

**Major components:**
1. **FlowNode** - Clickable node with glass styling, variant colors (database, connector, queue, service, cloud, app, target)
2. **Arrow** - Directional connector (right, down, left, up), optional label, dashed variant
3. **Container** - Subgraph wrapper with title, color variants, optional "recommended" badge
4. **Tooltip** - Radix-based wrapper with glass styling, click-to-open, accessible
5. **Participant/Message/SequenceLayout** - Sequence diagram primitives (35 diagrams require these)

**Bundle impact:** Remove Mermaid (~1.2MB) + add primitives (~15KB) + Radix tooltip (~8KB) = net ~1MB savings

### Critical Pitfalls

1. **Component API explosion** - Each diagram gets custom props, maintenance becomes impossible. **Avoid by:** Design primitives with TypeScript interfaces first, enforce imports from shared library, review gate for new components.

2. **Hydration mismatch cascade** - `client:visible` timing causes blank diagrams or React errors. **Avoid by:** No random IDs (`node-${index}` not `Math.random()`), use CSS for responsiveness not JS viewport queries, add error boundaries per diagram.

3. **Glass design drift** - 170 interpretations of "glass" styling. **Avoid by:** All components use CSS variables (`--glass-blur-md`, `--glass-border-color`), never hardcode Tailwind opacity values, visual regression testing for every diagram.

4. **Tooltip accessibility violations** - Hover-only tooltips exclude keyboard/mobile users. **Avoid by:** Use Radix (handles WCAG automatically), click-to-open pattern, minimum 44x44px touch targets.

5. **Sequence diagram blindside** - Flowchart primitives don't work for 35 sequence diagrams. **Avoid by:** Prototype each diagram type before bulk migration, build Participant/Message/SequenceLayout primitives in Phase 2.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation - Glass Design System Module & Naming
**Rationale:** Primitives must exist before any diagram migration; prevents API explosion and design drift
**Delivers:** FlowNode, Arrow, Container, Tooltip primitives with TypeScript interfaces
**Addresses:** Hover states, glass styling consistency, basic accessibility
**Avoids:** Component API explosion (Pitfall 1), Glass design drift (Pitfall 3)

### Phase 2: Sequence Diagram Primitives
**Rationale:** 35 sequence diagrams require different primitives; must build before hitting them during migration
**Delivers:** Participant, Message, ActivationBar, Note, SequenceLayout components
**Uses:** Radix tooltip from Phase 1, glass tokens
**Implements:** Sequence diagram architecture pattern
**Avoids:** Sequence diagram blindside (Pitfall 8)

### Phase 3: Module 1 Diagram Migration
**Rationale:** Entry point for learners; establish migration patterns with 6 simple diagrams
**Delivers:** 6 converted diagrams, validated patterns, MDX import structure
**Implements:** Barrel exports, `client:visible` hydration, error boundaries

### Phase 4-10: Module 2-8 Diagram Migration
**Rationale:** Sequential migration by module maintains focus and enables incremental testing
**Delivers per phase:** 10-25 converted diagrams per module
**Pattern:** Each module gets its own phase for predictable progress tracking

| Phase | Module | Diagram Count | Complexity |
|-------|--------|---------------|------------|
| 4 | Module 2 | 15 | Medium (PostgreSQL internals) |
| 5 | Module 3 | 20 | Medium (MySQL binlog) |
| 6 | Module 4 | 15 | Medium (monitoring) |
| 7 | Module 5 | 25 | High (SMT chains) |
| 8 | Module 6 | 20 | High (streaming architectures) |
| 9 | Module 7 | 15 | Medium (cloud diagrams) |
| 10 | Module 8 | 10 | Medium (capstone) |

### Phase 11: Polish, Testing & Mermaid Removal
**Rationale:** Final cleanup after all diagrams converted
**Delivers:** Visual regression tests, bundle optimization, Mermaid dependency removed
**Avoids:** Bundle size explosion (Pitfall 5), technical debt accumulation

### Phase Ordering Rationale

- **Primitives first (Phase 1-2):** All research sources agree - design component library before bulk migration prevents 170 unique APIs
- **Sequence primitives before Module 2:** Module 2+ contain sequence diagrams; hitting them without primitives blocks progress
- **Module-by-module (Phase 3-10):** Matches content structure, enables incremental deployment, allows pattern refinement
- **Mermaid removal last:** Can only remove after 100% conversion; earlier removal breaks site

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2 (Sequence primitives):** Message routing, lifeline rendering, timing/spacing algorithms need implementation research
- **Phase 7 (Module 5):** SMT chain diagrams are most complex; may need specialized components

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Radix tooltip integration well-documented, existing DeploymentModes.tsx validates pattern
- **Phase 3-10:** Bulk migration follows established patterns from Phase 1-2

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Radix docs, React 19 compatibility verified, Tailwind already in use |
| Features | MEDIUM-HIGH | Multiple UX sources agree on tooltip patterns; differentiators unvalidated for this audience |
| Architecture | HIGH | Based on existing codebase analysis, DeploymentModes.tsx PoC validates approach |
| Pitfalls | HIGH | Multiple React/Astro sources confirm hydration issues; accessibility patterns well-documented |

**Overall confidence:** HIGH

### Gaps to Address

- **Sequence diagram implementation details:** SequenceLayout component needs column width calculations and message routing algorithm - research during Phase 2 planning
- **Tooltip content authoring workflow:** Where does tooltip text live? Inline in diagram vs separate content file - decide during Phase 1 planning
- **Visual regression baseline:** No current screenshot tests for diagrams - establish infrastructure in Phase 1
- **Mobile diagram scrolling UX:** Complex diagrams may need horizontal scroll - test patterns during Phase 3

## Sources

### Primary (HIGH confidence)
- [Radix UI Tooltip Documentation](https://www.radix-ui.com/primitives/docs/components/tooltip) - accessibility, API, React 19 support
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/) - hydration strategies, client:visible behavior
- [WCAG 2.1.1 Keyboard Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) - tooltip accessibility requirements
- Existing codebase analysis: DeploymentModes.tsx, global.css glass tokens

### Secondary (MEDIUM confidence)
- [Martin Fowler - Modularizing React Applications](https://martinfowler.com/articles/modularizing-react-apps.html) - component organization
- [Nielsen Norman Group - Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/) - UX patterns
- [TkDodo - Tooltip Components Should Not Exist](https://tkdodo.eu/blog/tooltip-components-should-not-exist) - accessibility concerns
- [Akos Komuves - React Hydration Error in Astro](https://akoskm.com/how-to-fix-react-hydration-error-in-astro/) - hydration pitfalls

### Tertiary (LOW confidence)
- [IcePanel - Interactive Architecture Diagrams](https://icepanel.medium.com/how-to-create-interactive-zoomable-software-architecture-diagrams-6724f1d087ac) - zoom/pan patterns (deferred to v2)

---
*Research completed: 2026-02-02*
*Ready for roadmap: yes*
