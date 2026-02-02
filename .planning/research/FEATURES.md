# Feature Landscape: Interactive Glass Diagrams

**Domain:** Interactive technical diagrams for educational course content
**Project:** Debezium CDC Course - Liquid Glass Diagram Migration (v1.4)
**Researched:** 2026-02-02
**Confidence:** MEDIUM (multiple authoritative UX sources, limited Mermaid-specific interactivity sources)

## Context

The project has **170 existing Mermaid diagrams** across 8 modules covering CDC architectures, data flows, connector configurations, and sequence diagrams. The goal is to migrate these to interactive React components with the liquid glass design system, adding tooltips for explanations.

**Target users:** Middle+ data engineers learning Debezium CDC.

**Existing ecosystem:**
- Astro 5 + React 19 + Tailwind CSS 4
- Liquid glass design system (CSS variables, gradient backgrounds, glass utilities)
- MDX content with syntax highlighting
- Mobile responsive design with accessibility fallbacks

---

## Table Stakes

Features users **expect** from interactive technical diagrams. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Hover highlight on nodes** | Visual feedback that elements are interactive | Low | CSS only | Users expect cursor change + visual indication on hover. Standard UX pattern across all interactive content. |
| **Click-to-reveal tooltips** | Core mechanism for explanations | Medium | Tooltip component, positioning logic | Mobile: tap-triggered. Desktop: click or hover. Must not obscure the element being explained. |
| **Tooltip dismiss on outside click** | Standard tooltip behavior | Low | Event listeners | Also dismiss on Escape key for accessibility. Timer-based dismiss is frustrating. |
| **Clear visual hierarchy** | Understand diagram structure at a glance | Low | Glass design system | Nodes vs containers vs arrows must be visually distinct. Already have glass styling as foundation. |
| **Mobile responsive** | 50%+ of technical docs consumed on mobile | Medium | Responsive breakpoints, touch events | Diagram may need horizontal scroll or scaled view on narrow screens. |
| **Touch support** | Mobile users can't hover | Medium | Touch event handlers | Tap = click for tooltips. Tap outside = dismiss. No gesture interference with page scroll. |
| **Keyboard accessibility** | WCAG 2.1.1 Level A requirement | Medium | tabindex, focus management, ARIA | Tab through nodes, Enter/Space to activate tooltip, Escape to close. Focus indicators visible. |
| **Readable on light/dark backgrounds** | Glass design works on varied backgrounds | Low | CSS variables | Already have glass utilities; ensure sufficient contrast for text. |
| **Smooth transitions/animations** | Polished UX, reduces jarring state changes | Low | CSS transitions | Tooltip fade-in, hover state transitions. Respect prefers-reduced-motion. |
| **Aria labels for screen readers** | Accessibility requirement | Low | ARIA attributes | role="tooltip", aria-describedby linking, descriptive labels for nodes. |

**Sources:**
- [LogRocket - Designing Better Tooltips](https://blog.logrocket.com/ux-design/designing-better-tooltips-improved-ux/)
- [UXPin - WCAG 2.1.1 Keyboard Accessibility](https://www.uxpin.com/studio/blog/wcag-211-keyboard-accessibility-explained/)
- [UserGuiding - Tooltip Examples](https://userguiding.com/blog/tooltip-examples-best-practices)

---

## Differentiators

Features that **set the product apart**. Not universally expected, but add significant value for technical education.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Multi-level tooltips** | Simple explanation for beginners, detailed for advanced users | Medium | Content structure | "Learn more" expandable within tooltip. Matches progressive disclosure pattern. |
| **Node relationship highlighting** | Click node A, see all connected nodes/arrows highlighted | Medium | Graph traversal, CSS classes | Helps understand data flow direction. Especially valuable for CDC architecture diagrams. |
| **Code snippet in tooltips** | Show config example relevant to clicked node | Medium | Syntax highlighting in tooltip | E.g., click "Debezium Connector" node, see connector config JSON. Direct link to code examples. |
| **Step-through animation** | Animate data flow through diagram sequentially | High | Animation system, state management | For sequence diagrams showing "event journey." User controls with play/pause/step. |
| **Zoom/pan for complex diagrams** | Navigate large architecture diagrams | High | Transform handling, gesture support | Only for 10+ node diagrams. Most educational diagrams are simple enough without. |
| **Deep-link to node** | URL fragment links to specific node, opens its tooltip | Low | URL hash handling | Share "debezium-course.com/lesson#kafka-connect-node" to highlight specific concept. |
| **Glossary integration** | Terms in tooltips link to glossary definitions | Medium | Glossary system, cross-referencing | "WAL" in tooltip links to WAL glossary entry. Builds interconnected learning. |
| **Print-friendly mode** | Diagrams render well when printed | Low | CSS print styles | Educational content often printed/PDF'd. Hide interactive elements, show all labels. |

**Sources:**
- [IcePanel - Interactive Zoomable Architecture Diagrams](https://icepanel.medium.com/how-to-create-interactive-zoomable-software-architecture-diagrams-6724f1d087ac)
- [Visme - Interactive Data Visualization Techniques](https://visme.co/blog/interactive-data-visualization/)
- [NN/G - Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/)

---

## Anti-Features

Features to **explicitly NOT build**. Common mistakes in this domain that add complexity without proportional value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Hover-only tooltips (no click)** | Inaccessible on mobile, frustrating when tooltip disappears mid-read | Click/tap to show, click elsewhere to dismiss. Hover can preview, but click locks tooltip open. |
| **Auto-dismiss timers** | User loses tooltip while still reading | User-controlled dismiss only (click outside, Escape key). |
| **Tooltips covering the target element** | Blocks context, user can't see what they clicked | Position tooltip adjacent to element, not overlapping. Smart positioning based on viewport. |
| **Zoom/pan on simple diagrams** | Overhead for 3-5 node diagrams, confuses users | Only add zoom/pan for diagrams with 10+ nodes. Most CDC diagrams are conceptual, not detailed. |
| **Drag-to-rearrange nodes** | Not educational value, massive complexity | Static layout. Users learn from consistent positioning across lessons. |
| **Real-time data integration** | Way out of scope, requires backend | Static diagrams with example data. Course already has Docker lab for live exploration. |
| **Diagram editing/export** | Not a diagramming tool, just visualization | Read-only diagrams. If users want to edit, they can view source MDX. |
| **Complex gesture combinations** | Confusing, interferes with page navigation | Simple: tap to select, pinch-zoom only if enabled, no multi-finger gestures. |
| **Sound effects** | Distracting, often disabled anyway | Silent interactions. Visual feedback only. |
| **Mandatory tutorials/onboarding** | Users know how to click | Optional "click nodes for details" hint on first diagram, dismissable. |
| **Per-diagram theming** | Inconsistent experience, maintenance burden | All diagrams use liquid glass design system. Consistency across course. |

**Sources:**
- [CSS-Tricks - Tooltip Best Practices](https://css-tricks.com/tooltip-best-practices/)
- [Appcues - Tooltips Guide](https://www.appcues.com/blog/tooltips)
- [UX Design World - Tooltip Guidelines](https://uxdworld.com/tooltip-guidelines/)

---

## Feature Dependencies

```
Graph of feature dependencies:

[Glass Design System] (existing)
        |
        v
[Diagram Primitives: FlowNode, Arrow, Container]
        |
        +---> [Hover States] --> [Keyboard Focus States]
        |
        +---> [Tooltip Component]
                    |
                    +---> [Click-to-reveal]
                    +---> [Touch support]
                    +---> [Positioning logic]
                    +---> [ARIA accessibility]
        |
        v
[Node Interaction System]
        |
        +---> [Relationship highlighting] (differentiator)
        +---> [Code snippets in tooltips] (differentiator)
        +---> [Deep-link to node] (differentiator)

[Zoom/Pan System] (separate, only for complex diagrams)
        |
        +---> [Touch gestures]
        +---> [Keyboard zoom controls]
```

**Critical path:** Glass primitives --> Tooltip system --> Basic interactivity --> Module-by-module migration

---

## MVP Recommendation

For MVP (v1.4), prioritize:

### Phase 1: Foundation (must have)
1. **Diagram primitives** (FlowNode, Arrow, Container) with glass styling
2. **Basic tooltip component** with click-to-reveal
3. **Hover highlight states** with smooth transitions
4. **Mobile touch support** (tap = click)
5. **Keyboard accessibility** (Tab, Enter/Space, Escape)

### Phase 2: Module Migration (table stakes completion)
6. **Module 1 diagram migration** - establish patterns
7. **Remaining modules (2-8)** - apply established patterns
8. **Tooltip content** - explanatory text for key nodes

### Defer to post-v1.4:
- **Step-through animation** - High complexity, niche value
- **Zoom/pan** - Only needed for very complex diagrams (may not have any)
- **Glossary integration** - Requires building glossary system first
- **Node relationship highlighting** - Nice-to-have, not critical for education

---

## Complexity Estimates

| Feature Category | Complexity | Rationale |
|------------------|------------|-----------|
| Diagram primitives | Medium | React components + CSS, straightforward with existing glass system |
| Tooltip system | Medium | Positioning logic, accessibility, mobile support add complexity |
| Hover states | Low | CSS-only, already have glass utilities |
| 170 diagram migration | High (volume) | Each diagram needs individual attention; pattern-based but time-intensive |
| Keyboard accessibility | Medium | Focus management, ARIA attributes require careful implementation |
| Touch support | Low-Medium | Event handling differences from mouse, but well-documented patterns |
| Zoom/pan | High | Transform math, gesture handling, performance optimization |
| Step-through animation | High | State machine, timing controls, coordination with diagram structure |

---

## Mermaid Migration Considerations

**Current Mermaid usage observed:**
- Flowcharts with subgraphs (deployment modes, architecture)
- Sequence diagrams (CDC event flow)
- Custom styling via style directives
- Client-side rendering via `client:visible`

**Migration approach considerations:**
1. **Flowcharts** - Map to FlowNode + Arrow + Container components
2. **Sequence diagrams** - May need specialized SequenceDiagram component
3. **Subgraphs** - Map to Container/Group component with glass styling
4. **Styling** - Replace style directives with glass CSS classes

**Mermaid interactivity limitations (source: GitHub issues):**
- Click handlers require `securityLevel: 'loose'`
- Hover tooltips not natively supported (only click)
- Shadow DOM encapsulation can block CSS overrides
- Custom styling is limited compared to raw SVG/React

This supports the decision to migrate away from Mermaid to custom React components for richer interactivity.

**Sources:**
- [Mermaid Flowcharts Syntax](https://mermaid.ai/open-source/syntax/flowchart.html)
- [Mermaid GitHub Issue #1763 - Hover Tooltip](https://github.com/mermaid-js/mermaid/issues/1763)
- [Quarto Discussion - Mermaid Tooltips](https://github.com/quarto-dev/quarto-cli/discussions/1054)

---

## Expected Behavior Patterns

### Tooltip Behavior (Table Stakes)

**Desktop:**
1. Hover over node: cursor changes to pointer, node shows hover highlight
2. Click node: tooltip appears adjacent to node (not covering it)
3. Tooltip remains visible until user clicks outside or presses Escape
4. Focus moves to tooltip content for screen readers

**Mobile:**
1. Tap node: tooltip appears (no hover state on touch)
2. Tap outside tooltip: tooltip dismisses
3. Scroll remains functional (tooltip dismisses on scroll)

**Keyboard:**
1. Tab through nodes in logical order (visual flow)
2. Enter/Space on focused node: opens tooltip
3. Escape: closes tooltip, returns focus to node
4. Visible focus indicators on all interactive elements

### Tooltip Content Guidelines

Based on research, tooltips should:
- Be concise: 1-2 sentences max
- Add information not already visible in diagram
- Avoid jargon or define it inline
- Not contain critical information (course content is in lesson text)

For this course, tooltips explain:
- What the component does in CDC context
- Why it's important
- Brief config reference if applicable

Example tooltip for "Debezium Connector" node:
```
"Debezium Connector reads the database transaction log (WAL/binlog)
and transforms changes into Kafka events. Configured via REST API."
```

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Table stakes features | HIGH | Multiple UX authoritative sources agree on tooltip/interaction patterns |
| Differentiator features | MEDIUM | Based on best-in-class examples, but value for this specific audience unvalidated |
| Anti-features | HIGH | Common mistakes well-documented in UX literature |
| Complexity estimates | MEDIUM | Based on general React/CSS complexity, not project-specific validation |
| Mermaid limitations | MEDIUM | GitHub issues and documentation, but may have evolved |

---

## Open Questions for Phase Planning

1. **Sequence diagram approach:** Keep Mermaid for sequence diagrams (they work well) or build custom SequenceDiagram component?
2. **Tooltip content authoring:** Where does tooltip content live? Inline in diagram definition? Separate content file?
3. **Testing strategy:** How to E2E test interactive diagrams? Visual regression for diagram rendering?
4. **Performance:** 170 diagrams = many React components. Lazy loading strategy? Islands architecture helps here.

---

## Sources Summary

**Authoritative (HIGH confidence):**
- [WCAG 2.1.1 - Keyboard Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [MDN - touch-action CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action)
- [Material Design - Gesture Patterns](https://m1.material.io/patterns/gestures.html)

**UX Best Practices (MEDIUM-HIGH confidence):**
- [Nielsen Norman Group - Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/)
- [LogRocket - Designing Better Tooltips](https://blog.logrocket.com/ux-design/designing-better-tooltips-improved-ux/)
- [UserPilot - Tooltip Examples](https://userpilot.com/blog/tooltip-best-practices/)
- [UX Patterns for Developers - Tooltip Pattern](https://uxpatterns.dev/patterns/content-management/tooltip)
- [Scandiweb - Tooltip Guidelines](https://scandiweb.com/blog/tooltip-best-practices/)

**Domain-specific (MEDIUM confidence):**
- [IcePanel - Interactive Architecture Diagrams](https://icepanel.medium.com/how-to-create-interactive-zoomable-software-architecture-diagrams-6724f1d087ac)
- [Mermaid.js Documentation](https://mermaid.js.org/config/usage.html)
- [Steve Ruiz - Creating a Zoom UI](https://www.steveruiz.me/posts/zoom-ui)
- [Archbee - Diagrams in Developer Documentation](https://www.archbee.com/blog/diagrams-in-developer-documentation)
