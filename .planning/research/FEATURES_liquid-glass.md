# Feature Landscape: Liquid Glass/Glassmorphism Design

**Domain:** UI Design - Glassmorphism/Liquid Glass Effects
**Project Context:** Technical course website (dark theme dominant)
**Components:** Tables, Cards, Sidebar Navigation, Callouts, Accordion Menus
**Researched:** 2026-02-01
**Overall Confidence:** HIGH (verified with Nielsen Norman Group, MDN, Axess Lab, and multiple authoritative sources)

---

## Executive Summary

Glassmorphism creates depth through semi-transparent layers with background blur, mimicking frosted glass. When done well, it provides premium visual hierarchy and modern aesthetics. When done poorly, it becomes inaccessible, illegible, and cheap-looking.

**The core tension:** Visual beauty vs. accessibility. Premium glassmorphism balances both.

**Critical success factors:**
1. Sufficient contrast (WCAG compliance: 4.5:1 for body text, 3:1 for large UI elements)
2. Purposeful use (2-3 glass elements per viewport maximum)
3. Proper background design (vibrant gradients, not solid colors)
4. Performance optimization (blur values 8-16px for most components)

---

## Table Stakes

Features users expect from glassmorphism. Missing these = effect looks broken or cheap.

### 1. Background Blur (backdrop-filter)

| Property | Specification | Why Essential |
|----------|--------------|---------------|
| **Value range** | `blur(8px)` to `blur(16px)` | Core visual effect; below 5px looks barely frosted, above 25px becomes opaque and loses glass quality |
| **Technical implementation** | `backdrop-filter: blur(10px)` with `-webkit-` prefix | Standard approach; 97%+ browser support as of 2024 |
| **Performance note** | Reduce to 6-8px on mobile | GPU-intensive; lower values maintain effect while improving performance |

**Why expected:** This is THE defining characteristic. Without background blur, it's just a semi-transparent box, not glass.

**Complexity:** Low (single CSS property)

**Notes:**
- Always include `-webkit-backdrop-filter` for Safari compatibility
- Test on lower-end devices for performance
- Blur only considers pixels directly behind element (see Josh Comeau technique for extended blur)

---

### 2. Semi-Transparent Background

| Property | Specification | Why Essential |
|----------|--------------|---------------|
| **Light backgrounds** | `rgba(255, 255, 255, 0.1)` to `rgba(255, 255, 255, 0.25)` | Alpha 0.1-0.25 provides glass appearance without washing out |
| **Dark backgrounds** | `rgba(0, 0, 0, 0.15)` to `rgba(0, 0, 0, 0.3)` | Dark themes handle slightly higher opacity; 0.15-0.3 range |
| **Starting point** | 20-30% opacity | Standard baseline; adjust based on background complexity |

**Why expected:** Transparency allows background to show through, creating the layered depth effect.

**Complexity:** Low (RGBA color value)

**Notes:**
- Dark glassmorphism is practically invisible on solid black backgrounds
- Need colorful/gradient backgrounds for effect to work
- Test with actual background images/gradients, not flat colors

---

### 3. Subtle Border

| Property | Specification | Why Essential |
|----------|--------------|---------------|
| **Border width** | `1px` | Defines glass edge without overwhelming |
| **Border color (light)** | `rgba(255, 255, 255, 0.18)` to `rgba(255, 255, 255, 0.3)` | Creates rim-light effect, enhances depth |
| **Border color (dark)** | `rgba(255, 255, 255, 0.1)` to `rgba(255, 255, 255, 0.2)` or subtle colored rims (navy, violet, teal) | Dark mode requires lighter borders or colored accents |

**Why expected:** Borders define the glass panel boundaries and add realism to the frosted glass effect.

**Complexity:** Low (border property)

**Notes:**
- Too thick (>2px) looks heavy and cheap
- Too opaque (>0.4 alpha) breaks the glass illusion
- Consider gradient borders for premium feel

---

### 4. Border Radius

| Property | Specification | Why Essential |
|----------|--------------|---------------|
| **Standard cards/panels** | `12px` to `16px` | Modern, soft corners; 16px is common premium standard |
| **Larger components** | `24px` to `32px` (2rem) | Premium liquid glass effect for hero sections, modals |
| **Buttons/small elements** | `8px` to `12px` | Proportional to element size |

**Why expected:** Sharp corners (0px) look dated; rounded corners are part of the modern glass aesthetic.

**Complexity:** Low (border-radius property)

**Notes:**
- Consistency matters: use design system scale (8, 12, 16, 24, 32)
- Pill-shaped (50px+) can work for buttons but not large panels

---

### 5. Soft Shadow

| Property | Specification | Why Essential |
|----------|--------------|---------------|
| **Standard depth** | `box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2)` | Creates floating effect, separates glass from background |
| **Subtle variant** | `box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25)` | Common alternative for dark themes |
| **Inner glow (optional)** | `inset 0 4px 20px rgba(255, 255, 255, 0.3)` | Adds internal luminosity, premium enhancement |

**Why expected:** Shadows provide depth perception; flat glass looks pasted on.

**Complexity:** Low to Medium (single or multiple shadow layers)

**Notes:**
- Large blur radius (32px) is characteristic of glass depth
- Keep opacity low (0.2-0.25) for subtlety
- Inner shadows simulate light refraction

---

### 6. Contrast Compliance (WCAG)

| Requirement | Specification | Why Essential |
|-------------|--------------|---------------|
| **Body text** | 4.5:1 minimum contrast ratio | Accessibility requirement; non-negotiable for readability |
| **Large text/UI elements** | 3:1 minimum contrast ratio | WCAG standard for interactive elements |
| **Text color on dark glass** | `#ffffff` (white) or `#f5f5f5` (light gray) | Never dark text on dark glass; white is safest |
| **Opacity boost for readability** | Increase background to 0.3-0.4 alpha if needed | Trade some transparency for legibility |

**Why expected:** Legal/ethical requirement; users with visual impairments must be able to read content.

**Complexity:** Medium (requires testing with contrast checkers)

**Notes:**
- Semi-transparent backgrounds over colorful gradients often fail contrast
- Add semi-opaque overlay behind text (10-30% opacity solid tint)
- Test with actual backgrounds, not mockups
- Use browser DevTools or WebAIM Contrast Checker

---

## Differentiators

Features that set premium glassmorphism apart from cheap implementations.

### 1. Vibrant Gradient Background

| Feature | Premium Approach | Cheap Approach |
|---------|------------------|----------------|
| **Background type** | Vibrant color orbs (deep purples, neon blues, hot pinks) floating behind UI | Solid black or single-color background |
| **Gradient complexity** | Multi-layer radial gradients with blur | Single linear gradient or flat color |
| **Motion** | Subtle animation on gradients (optional) | Static background |

**Value Proposition:** Glass only works when there's something interesting behind it. Premium implementations design the background as carefully as the glass.

**Complexity:** Medium (CSS gradients, positioning)

**Examples:**
- Apple's iOS 26 Liquid Glass: Dynamic color meshes
- Modern SaaS dashboards: Layered radial gradients with ambient movement

**Implementation:**
```css
body {
  background:
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 0, 128, 0.2), transparent 50%),
    radial-gradient(circle at 40% 90%, rgba(0, 200, 255, 0.25), transparent 50%),
    #0a0a0a;
}
```

---

### 2. Subtle Noise Texture

| Feature | Specification | Value |
|---------|--------------|-------|
| **Texture opacity** | 2-3% monochromatic noise | Acts as dithering, makes surfaces feel tangible |
| **Implementation** | SVG noise filter or CSS pattern overlay | Prevents "too smooth" plastic look |

**Value Proposition:** Premium glass has subtle texture; cheap glass looks artificially smooth.

**Complexity:** Medium (SVG or CSS pattern)

**When to use:** On larger glass panels (cards, sidebars) where flatness would be noticeable.

---

### 3. Multi-Layer Shadow Depth

| Feature | Premium Approach | Basic Approach |
|---------|------------------|----------------|
| **Shadow layers** | 2-3 shadow layers with different blur/spread | Single shadow |
| **Example** | `box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2), inset 0 4px 20px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)` | `box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)` |

**Value Proposition:** Multiple shadow layers create realistic depth and internal luminosity.

**Complexity:** Low (CSS, but requires design eye)

**When to use:** Hero cards, featured content, modal dialogs.

---

### 4. Hover/Interaction States

| Feature | Premium Approach | Basic Approach |
|---------|------------------|----------------|
| **Opacity change** | Increase background opacity by 0.05-0.1 on hover | No hover state or jarring opacity jump |
| **Border glow** | Subtle border color intensity increase | No border change |
| **Shadow lift** | Increase shadow blur/spread slightly | No shadow change |
| **Transition** | `transition: all 0.3s ease` | Instant or no transition |

**Value Proposition:** Responsive interactions make glass feel tangible and interactive, not static.

**Complexity:** Low to Medium (CSS transitions)

**Example:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 48px rgba(31, 38, 135, 0.3);
}
```

---

### 5. Saturation Boost (saturate filter)

| Feature | Specification | Value |
|---------|--------------|-------|
| **Saturation increase** | `backdrop-filter: blur(10px) saturate(180%)` | Makes colors behind glass more vibrant |
| **Apple's approach** | `blur(2px) saturate(180%)` | Subtle blur with color enhancement |

**Value Proposition:** Saturated colors make the glass effect more visually striking and premium.

**Complexity:** Low (add to backdrop-filter)

**When to use:** When background has colorful elements; avoid on monochrome backgrounds.

---

### 6. Accessibility Features

| Feature | Premium Approach | Basic Approach |
|---------|------------------|----------------|
| **Reduced transparency** | Implement `prefers-reduced-transparency` media query | Ignore user preferences |
| **Reduced motion** | Respect `prefers-reduced-motion` for gradient animations | Animate regardless |
| **High contrast mode** | Provide solid background fallback | Glass breaks in high-contrast mode |

**Value Proposition:** Premium implementations are inclusive and respect user preferences.

**Complexity:** Medium (media queries, progressive enhancement)

**Example:**
```css
@media (prefers-reduced-transparency: reduce) {
  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass-card {
    animation: none;
    transition: none;
  }
}
```

---

## Anti-Features

Features to explicitly NOT implement. Common mistakes that make glassmorphism look cheap or break usability.

### 1. Glass Everywhere

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Applying glassmorphism to every element on page | Creates chaos, disorienting experience, kills visual hierarchy, destroys performance | **Limit to 2-3 glass elements per viewport.** Use for: cards, modals, headers, navbars, hero sections. NOT for: all text containers, buttons, footers, small components. |

**Consequences:**
- Performance degradation (GPU overload)
- No focal points
- Visual clutter
- Accessibility nightmare (contrast fails everywhere)

**Detection:** If more than 30% of viewport has backdrop-filter, you've overused it.

---

### 2. Dark Glass on Solid Black Background

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| `background: rgba(0, 0, 0, 0.3)` with `backdrop-filter: blur(10px)` on solid `#000000` background | Glass is practically invisible; blur has nothing to distort; looks like a faint gray box | **Design vibrant background first.** Use radial gradients, color meshes, or imagery. Glass needs something behind it to refract. |

**Consequences:**
- Effect collapses into semi-transparent box
- No depth perception
- Looks unfinished

**Rule of thumb:** If you remove backdrop-filter and can barely tell the difference, your background isn't suitable for glass.

---

### 3. Insufficient Contrast Ratio

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| White text at 50% opacity on semi-transparent glass over colorful gradient | Fails WCAG 4.5:1 requirement; illegible for users with visual impairments | **Test contrast ratio with tools.** Add semi-opaque solid overlay behind text (10-30% opacity), increase glass background opacity to 0.3-0.4, or use text-shadow for separation. Always use white or light gray text on dark glass. |

**Consequences:**
- Legal liability (ADA/WCAG violations)
- Unusable for colorblind users
- Eye strain for all users

**Testing:** Use WebAIM Contrast Checker or browser DevTools on actual backgrounds, not design mockups.

---

### 4. Excessive Blur (>25px)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| `backdrop-filter: blur(40px)` or higher | Becomes completely opaque; loses glass transparency; triggers vestibular issues; kills performance on mobile | **Keep blur between 8-16px for most components.** Use 10px as default. Only exceed 20px for large hero sections with performance testing. Reduce to 6-8px on mobile. |

**Consequences:**
- Performance bottlenecks
- Motion sickness in sensitive users
- Loses transparency effect (defeats purpose)

**Rule:** If you can't see background shapes at all, blur is too high.

---

### 5. Cheap Opacity-Only Approach

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Using only `background: rgba(128, 128, 128, 0.5)` without backdrop-filter | Looks washed out; no frosted glass effect; appears amateurish | **Always combine opacity with backdrop-filter.** The blur is what creates the glass effect. Opacity alone creates a translucent box, not glass. |

**Consequences:**
- Looks dated (2010s web design)
- No depth or premium feel
- Beginner mistake that screams "cheap"

**Why it happens:** Developers skip backdrop-filter for browser compatibility or performance. Instead, use progressive enhancement with fallback.

---

### 6. Thick Borders (>2px)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| `border: 3px solid rgba(255, 255, 255, 0.5)` | Looks heavy and cheap; overwhelms the subtle glass aesthetic; appears like a design from 2000s | **Use 1px borders maximum.** Focus on border color opacity (0.18-0.3 alpha) rather than width. Premium glass is defined by subtle edges, not thick outlines. |

**Consequences:**
- Destroys elegance
- Looks like old Windows Aero
- Amateurish appearance

**Exception:** Colored accent borders on hover states can go to 2px if using vibrant colors.

---

### 7. High-Frequency Noise Backgrounds

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Using busy patterns, high-contrast photos, or detailed textures as backgrounds for glass elements | Creates visual artifacts when blurred; distracting; makes text illegible; overwhelming | **Use smooth, vector-like backgrounds.** Radial gradients, soft color meshes, low-frequency patterns. If using photos, apply heavy blur to background layer first. |

**Consequences:**
- Readability disaster
- Visual noise
- Defeats the "clean, modern" aesthetic

**Test:** If the background looks chaotic before adding glass, it will be worse after.

---

### 8. Animating Blur Values

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Transitioning `backdrop-filter: blur(0)` to `blur(20px)` on hover or scroll | Severe performance issues; browser repaints/reflows; janky animations; battery drain | **Animate opacity, transform, or box-shadow instead.** Keep backdrop-filter static. If you must animate blur, limit to one element and test extensively on mobile. |

**Consequences:**
- Stuttering, choppy animations
- Mobile device battery drain
- Poor user experience

**Alternative:** Animate the glass container's opacity or scale, not the blur itself.

---

### 9. No Fallback for Unsupported Browsers

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Using backdrop-filter without fallback styling | Breaks layout in older browsers; users see invisible or broken UI | **Use @supports feature query.** Provide solid background fallback with sufficient opacity for readability. |

**Example:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.9); /* Fallback */
}

@supports (backdrop-filter: blur(10px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
```

**Consequences without fallback:**
- Invisible elements (0.1 opacity with no blur = can't see)
- Inaccessible in older browsers
- Professional negligence

---

### 10. Dark Text on Dark Glass

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Using dark gray or black text on dark glassmorphic surfaces | Illegible; contrast ratio fails catastrophically; common beginner mistake | **Always use white (`#ffffff`) or light gray (`#f5f5f5`) text on dark glass.** This is non-negotiable for dark themes. Never compromise. |

**Consequences:**
- Completely unreadable
- WCAG failure
- Unusable interface

**Rule:** Dark glass = light text. Light glass = dark text. No exceptions.

---

## Component-Specific Guidelines

### Tables (Comparison Tables, Data Tables)

**Table Stakes:**
- Semi-transparent table background: `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.1)`
- Backdrop blur: `blur(10px)`
- Border on entire table: `1px solid rgba(255, 255, 255, 0.1)`
- Header row with higher opacity: `rgba(255, 255, 255, 0.15)` to differentiate
- Cell borders for readability: `border-bottom: 1px solid rgba(255, 255, 255, 0.08)` between rows

**Differentiators:**
- Hover state on rows: Increase row background opacity to `rgba(255, 255, 255, 0.12)` on hover
- Sticky header with stronger glass effect: Higher opacity + subtle shadow
- Alternating row tint (zebra striping): Every other row at `rgba(255, 255, 255, 0.03)` for readability

**Anti-Features:**
- Glass on individual cells (too busy)
- No cell separation (data becomes unreadable)
- Excessive blur that makes cell content bleed together

**Complexity:** Medium (nested elements, hover states)

**Critical for course website:** Clear cell separation is essential for data tables. Use subtle borders between rows/columns.

---

### Cards (Module Cards on Homepage)

**Table Stakes:**
- Card background: `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.12)`
- Backdrop blur: `blur(10px)` to `blur(16px)`
- Border radius: `16px`
- Border: `1px solid rgba(255, 255, 255, 0.18)`
- Shadow: `0 8px 32px rgba(31, 38, 135, 0.2)`

**Differentiators:**
- Hover lift effect: `transform: translateY(-4px)` with increased shadow
- Inner glow: `inset 0 4px 20px rgba(255, 255, 255, 0.3)`
- Gradient border on hover
- Content padding: Adequate whitespace (24px+) to prevent cramped feel

**Anti-Features:**
- Cards stacked/overlapping with multiple blur layers (performance killer)
- No hover state (feels static)
- Insufficient padding (content touches edges)

**Complexity:** Low to Medium

**Critical for course website:** Module cards are primary navigation. They must have clear visual hierarchy and responsive hover states.

---

### Sidebar Navigation

**Table Stakes:**
- Sidebar background: `rgba(0, 0, 0, 0.2)` to `rgba(0, 0, 0, 0.3)` for dark themes
- Backdrop blur: `blur(10px)`
- Right border to separate from content: `1px solid rgba(255, 255, 255, 0.1)`
- Nav item hover: `rgba(255, 255, 255, 0.1)` background
- Active/selected item: `rgba(255, 255, 255, 0.15)` background with border accent

**Differentiators:**
- Smooth transitions on hover/active states: `transition: all 0.2s ease`
- Subtle left border accent on active item: `border-left: 2px solid [accent-color]`
- Collapsed/expanded states with icon-only mode
- Sticky positioning with stronger glass at top (scroll shadow)

**Anti-Features:**
- Full-width glass sidebar that competes with main content
- No visual indicator for active page
- Animations that conflict with `prefers-reduced-motion`

**Complexity:** Medium (state management, transitions)

**Critical for course website:** Navigation must be discoverable. Active state needs strong visual differentiation.

---

### Callouts (Info, Warning, Tip Boxes)

**Table Stakes:**
- Box background varies by type:
  - Info: `rgba(59, 130, 246, 0.1)` (blue tint)
  - Warning: `rgba(251, 146, 60, 0.1)` (orange tint)
  - Tip: `rgba(34, 197, 94, 0.1)` (green tint)
- Backdrop blur: `blur(8px)` to `blur(10px)` (lighter than cards)
- Border radius: `12px`
- Colored left border accent: `border-left: 3px solid [type-color]`
- Icon in accent color

**Differentiators:**
- Icon with subtle glow matching border color
- Title text in accent color, body text in white/light gray
- Inner shadow for depth: `inset 0 1px 3px rgba(0, 0, 0, 0.1)`

**Anti-Features:**
- Same styling for all callout types (loses semantic meaning)
- Over-saturated accent colors that clash with glass aesthetic
- Insufficient contrast between text and background

**Complexity:** Low to Medium (multiple variants)

**Critical for course website:** Callouts must be semantically clear. Color-coding + icons ensure understanding even if blur is reduced.

---

### Accordion Menus

**Table Stakes:**
- Accordion header: `rgba(255, 255, 255, 0.08)` with `blur(8px)`
- Border radius on closed items: `12px`, top corners only when open
- Hover state on header: `rgba(255, 255, 255, 0.12)`
- Expand/collapse icon with rotation transition
- Content area: Slightly darker `rgba(255, 255, 255, 0.05)` or no glass (plain background)

**Differentiators:**
- Smooth height transition on expand/collapse: `transition: max-height 0.3s ease`
- Border separator between accordion items: `1px solid rgba(255, 255, 255, 0.08)`
- Active/expanded header has higher opacity and subtle shadow

**Anti-Features:**
- Glass effect on content area (double-blur makes text illegible)
- No visual indicator of expanded state
- Jarring instant expand/collapse

**Complexity:** Medium (JavaScript state + CSS transitions)

**Critical for course website:** Content area should NOT have glass effect. Keep glass on headers only for readability.

---

## Component Priority Matrix

| Component | Visual Prominence | Glass Intensity | Complexity | Implementation Order |
|-----------|------------------|-----------------|------------|---------------------|
| **Cards** | High | Strong (blur 12-16px) | Medium | 1st (primary navigation) |
| **Sidebar** | Medium | Medium (blur 10px) | Medium | 2nd (persistent element) |
| **Tables** | High | Light (blur 8-10px) | Medium | 3rd (data readability critical) |
| **Callouts** | Medium | Light (blur 8px) | Low | 4th (semantic variants) |
| **Accordions** | Low | Very Light (blur 8px, header only) | Medium | 5th (progressive enhancement) |

---

## Visual Hierarchy Strategy

**For technical course website (dark theme):**

1. **Background Layer:** Vibrant radial gradients (purple, blue, pink orbs) on dark base (#0a0a0a)
2. **Glass Layer 1 (Strongest):** Module cards - highest opacity, strongest shadow
3. **Glass Layer 2 (Medium):** Sidebar navigation - persistent but secondary
4. **Glass Layer 3 (Subtle):** Tables, callouts, accordions - light glass to avoid overwhelming data

**Rule:** Each layer should have distinct opacity/blur levels to maintain hierarchy.

---

## Accessibility Checklist

- [ ] **Contrast tested:** All text meets WCAG 4.5:1 (body) or 3:1 (UI elements)
- [ ] **Prefers-reduced-transparency:** Fallback to opaque backgrounds
- [ ] **Prefers-reduced-motion:** Remove gradient animations, reduce transitions
- [ ] **High-contrast mode:** Solid backgrounds with borders
- [ ] **White text on dark glass:** Never dark text on dark surfaces
- [ ] **Semi-opaque overlays:** Added behind text where needed for readability
- [ ] **Focus indicators:** Visible keyboard focus states
- [ ] **Screen reader testing:** Semantic HTML with ARIA labels

---

## Performance Checklist

- [ ] **Blur limit:** No more than 2-3 glass elements per viewport
- [ ] **Mobile optimization:** Reduce blur to 6-8px on mobile devices
- [ ] **No animated blur:** Animate opacity/transform, not backdrop-filter
- [ ] **GPU acceleration:** Use `will-change: transform` sparingly
- [ ] **Fallback provided:** @supports query with solid background for unsupported browsers
- [ ] **Testing:** Verify on lower-end Android devices

---

## Good vs. Bad Implementation Examples

### GOOD: Premium Glassmorphism

**Visual characteristics:**
- Vibrant, multi-layer gradient background (not flat)
- Blur between 8-16px (visible background shapes, but diffused)
- Subtle borders (1px, 0.18-0.3 alpha)
- Sufficient contrast (4.5:1 minimum)
- Purposeful use (2-3 glass elements)
- Hover states with smooth transitions
- Shadow depth with multiple layers
- Border radius 12-16px (modern, soft)

**Examples:**
- Apple iOS 26 Liquid Glass UI
- Modern SaaS dashboard cards (Stripe, Linear)
- Glassmorphic navigation in premium themes

**User perception:** "Modern, premium, professional, easy to read"

---

### BAD: Cheap Glassmorphism

**Visual characteristics:**
- Solid black or single-color background (glass invisible)
- Excessive blur (>25px, completely opaque) OR no blur (just opacity)
- Thick borders (3px+) with high opacity
- Poor contrast (white text at 50% opacity on busy background)
- Glass everywhere (every element has backdrop-filter)
- No hover states or jarring transitions
- Sharp corners (0px radius) or inconsistent radius
- Washed-out gray tint from `rgba(128, 128, 128, 0.5)`

**Examples:**
- Codepen experiments without accessibility testing
- Overused glass on entire page layouts
- Glass on solid backgrounds

**User perception:** "Cheap, hard to read, dated, amateurish"

---

## Quick Reference: CSS Formula

**Standard premium glassmorphism:**

```css
.glass-premium {
  /* Background - semi-transparent */
  background: rgba(255, 255, 255, 0.1);

  /* Blur effect - ESSENTIAL */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari */

  /* Border - subtle rim light */
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;

  /* Shadow - floating depth */
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);

  /* Optional: inner glow */
  /* box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2),
                 inset 0 4px 20px rgba(255, 255, 255, 0.3); */
}

.glass-premium:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 48px rgba(31, 38, 135, 0.3);
  transition: all 0.3s ease;
}
```

**With fallback:**

```css
.glass-safe {
  /* Fallback for unsupported browsers */
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@supports (backdrop-filter: blur(10px)) {
  .glass-safe {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
```

---

## Sources

### Authoritative Sources (HIGH Confidence)

- [Glassmorphism: Definition and Best Practices - Nielsen Norman Group](https://www.nngroup.com/articles/glassmorphism/)
- [Glassmorphism Meets Accessibility - Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [backdrop-filter - CSS | MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [Next-level frosted glass with backdrop-filter - Josh W. Comeau](https://www.joshwcomeau.com/css/backdrop-filter/)

### Design Resources (MEDIUM Confidence)

- [Glassmorphism: What It Is and How to Use It in 2026 - Inverness Design Studio](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026)
- [Dark Glassmorphism: The Aesthetic That Will Define UI in 2026 - Medium](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)
- [12 Glassmorphism UI Features, Best Practices, and Examples - UX Pilot](https://uxpilot.ai/blogs/glassmorphism-ui)
- [How to Create Modern UI with Glassmorphism Effects: A Complete 2026 Guide - Medium](https://medium.com/@Kinetools/how-to-create-modern-ui-with-glassmorphism-effects-a-complete-2026-guide-2b1d71856542)

### Implementation Examples (MEDIUM Confidence)

- [44 CSS Glassmorphism Examples You Can Actually Use - WP Dean](https://wpdean.com/css-glassmorphism/)
- [60 CSS Glassmorphism Examples - Free Frontend](https://freefrontend.com/css-glassmorphism/)
- [Glassmorphism Card Hover Effect - GeeksforGeeks](https://www.geeksforgeeks.org/glassmorphism-card-hover-effect/)
- [How to Create Glassmorphism Sidebar in HTML & CSS - GeeksforGeeks](https://www.geeksforgeeks.org/html/how-to-create-glassmorphism-sidebar-in-html-css/)

### Component-Specific Resources

- [Glassmorphism Sidebar Menu - JV Codes](https://jvcodes.com/glassmorphism-sidebar-menu/)
- [Glassmorphism alerts-ui-design-examples - GitHub](https://github.com/octet-design/alerts-ui-design-examples)
- [How to Create Glassmorphic UI Effects with Pure CSS - OpenReplay Blog](https://blog.openreplay.com/create-glassmorphic-ui-css/)

---

## Confidence Assessment

| Area | Confidence Level | Reasoning |
|------|-----------------|-----------|
| **Visual Properties** | HIGH | Verified with Nielsen Norman Group, MDN, multiple authoritative sources; specific values cross-referenced |
| **Accessibility Requirements** | HIGH | Axess Lab, NN/G provide explicit WCAG ratios; 4.5:1 and 3:1 are official standards |
| **CSS Specifications** | HIGH | MDN Web Docs provides authoritative CSS specs; backdrop-filter is W3C Filter Effects Module Level 2 |
| **Browser Support** | HIGH | MDN reports 97%+ support as of Sept 2024; Baseline 2024 designation |
| **Component Patterns** | MEDIUM | Based on community examples and tutorials; not standardized but widely adopted |
| **Premium vs Cheap** | MEDIUM | Based on design critique from multiple sources; subjective but consensus exists |
| **Performance Impact** | MEDIUM | Reported by multiple sources; GPU-intensive nature confirmed but exact metrics vary by device |

---

## Ready for Requirements Definition

This features research provides:

1. **Clear table stakes:** Mandatory visual properties with specific values (blur 8-16px, opacity 0.1-0.3, etc.)
2. **Differentiators:** Premium enhancements that elevate quality (multi-layer shadows, saturation boost, hover states)
3. **Anti-features:** Explicit mistakes to avoid with rationale (no blur >25px, no dark text on dark glass, limit to 2-3 elements)
4. **Component-specific guidance:** Tailored recommendations for tables, cards, sidebar, callouts, accordions
5. **Accessibility gates:** WCAG compliance requirements (4.5:1 contrast, prefers-reduced-transparency)
6. **Performance constraints:** GPU considerations, mobile optimization, blur value limits

**Next phase:** Requirements definition can reference this research to create specific acceptance criteria for each component implementation.
