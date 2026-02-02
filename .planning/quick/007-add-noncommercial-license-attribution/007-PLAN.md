---
phase: quick
plan: 007
type: execute
wave: 1
depends_on: []
files_modified:
  - LICENSE
  - README.md
autonomous: true

must_haves:
  truths:
    - "Repository has CC BY-NC 4.0 license file"
    - "README shows author attribution and license notice"
    - "License terms are clear: attribution required, no commercial use"
  artifacts:
    - path: "LICENSE"
      provides: "CC BY-NC 4.0 full license text"
      contains: "Creative Commons Attribution-NonCommercial 4.0"
    - path: "README.md"
      provides: "Project description with author and license"
      contains: "Lev Neganov"
  key_links:
    - from: "README.md"
      to: "LICENSE"
      via: "license badge/link"
      pattern: "LICENSE|CC BY-NC"
---

<objective>
Add CC BY-NC 4.0 license with author attribution to the Debezium CDC course repository.

Purpose: Protect course content with non-commercial license while ensuring proper attribution to author Lev Neganov.
Output: LICENSE file with CC BY-NC 4.0 text, updated README.md with project description and license notice.
</objective>

<execution_context>
@/Users/levoely/.claude/get-shit-done/workflows/execute-plan.md
@/Users/levoely/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create LICENSE file with CC BY-NC 4.0</name>
  <files>LICENSE</files>
  <action>
Create LICENSE file in repository root with full CC BY-NC 4.0 International license text.

Include at the top:
```
Debezium CDC Course
Copyright (c) 2026 Lev Neganov

This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
```

Then the full license text from: https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt

Key terms to include:
- Attribution requirement (BY)
- NonCommercial restriction (NC)
- Share-alike provisions
- Disclaimer of warranties
  </action>
  <verify>File LICENSE exists in repo root with CC BY-NC 4.0 content</verify>
  <done>LICENSE file contains full CC BY-NC 4.0 text with author copyright notice</done>
</task>

<task type="auto">
  <name>Task 2: Update README.md with project description and license</name>
  <files>README.md</files>
  <action>
Replace default Astro README with project-specific content:

```markdown
# Debezium CDC Course

Interactive web course on Change Data Capture with Debezium for experienced data engineers. Deep dive into CDC with focus on real integrations (Aurora DB, PostgreSQL, GCP) and production pitfalls.

## Features

- 8 modules, 57+ lessons covering CDC fundamentals to production operations
- 170 interactive glass-styled diagrams
- Docker Compose lab environment (PostgreSQL, MySQL, Kafka, Debezium)
- Russian language content, English code examples

## Live Demo

https://levoel.github.io/debezium-course/

## Tech Stack

- Astro 5, React 19, Tailwind CSS 4
- MDX with Shiki syntax highlighting
- Docker Compose for lab infrastructure

## Development

```bash
npm install
npm run dev       # Start dev server at localhost:4321
npm run build     # Build production site
npm run preview   # Preview production build
```

## Author

**Lev Neganov**

## License

This work is licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).

You are free to:
- Share - copy and redistribute the material
- Adapt - remix, transform, and build upon the material

Under the following terms:
- **Attribution** - You must give appropriate credit to Lev Neganov
- **NonCommercial** - You may not use the material for commercial purposes

See [LICENSE](./LICENSE) for full terms.
```
  </action>
  <verify>README.md contains project description, author name, and license section</verify>
  <done>README shows Debezium CDC Course description, Lev Neganov attribution, CC BY-NC 4.0 license with link</done>
</task>

</tasks>

<verification>
- [ ] LICENSE file exists in repo root
- [ ] LICENSE contains "Creative Commons Attribution-NonCommercial 4.0"
- [ ] LICENSE contains "Lev Neganov" copyright
- [ ] README.md contains project description (not Astro template)
- [ ] README.md contains "Lev Neganov" author attribution
- [ ] README.md contains CC BY-NC 4.0 license section with link
</verification>

<success_criteria>
Repository has proper CC BY-NC 4.0 license with author attribution. LICENSE file contains full legal text. README.md describes the project and clearly states license terms.
</success_criteria>

<output>
After completion, create `.planning/quick/007-add-noncommercial-license-attribution/007-SUMMARY.md`
</output>
