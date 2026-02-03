# Quick Task 009: Replace Emojis with Project-Style Icons

## Objective

Replace all emojis in React components with inline SVG icons matching the glass design system.

## Approach

Create a reusable Icon component with inline SVGs (Heroicons-style) instead of generating bitmap images:
- SVGs scale perfectly at any size
- Inherit colors via `currentColor`
- No additional HTTP requests
- Smaller than images
- Consistent with glass design aesthetic

## Tasks

1. **Audit emoji usage** — identify all emojis in components
2. **Create Icon component** — 16 SVG icons matching needed semantics
3. **Update TroubleshootingEntry.tsx** — symptoms, cause, solution, categories
4. **Update TroubleshootingList.tsx** — filter buttons (PostgreSQL, MySQL, categories)
5. **Update GlossaryTerm.tsx** — related lessons book icon
6. **Update Callout.tsx** — note, tip, warning, danger icons
7. **Verify build** — ensure compilation succeeds

## Icons Created

| Icon Name | Replaces | Context |
|-----------|----------|---------|
| info | ℹ️ | Callout note |
| lightbulb | 💡 | Callout tip |
| warning | ⚠️ | Callout warning |
| alert | 🚨 | Callout danger |
| search | 🔍 | Symptoms section |
| target | 🎯 | Cause section |
| check | ✅ | Solution section |
| book | 📖 | Related lessons |
| chevronDown | ▼ | Expandable sections |
| postgresql | 🐘 | PostgreSQL filter |
| mysql | 🐬 | MySQL filter |
| gear | ⚙️ | Common/configuration |
| plug | 🔌 | Connection category |
| camera | 📸 | Snapshot category |
| wave | 🌊 | Streaming category |
| lightning | ⚡ | Performance category |

## Files Modified

- `src/components/Icon.tsx` (NEW)
- `src/components/TroubleshootingEntry.tsx`
- `src/components/TroubleshootingList.tsx`
- `src/components/GlossaryTerm.tsx`
- `src/components/Callout.tsx`
