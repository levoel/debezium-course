# Full-Text Search Implementation Pitfalls

**Domain:** Adding client-side search to Astro static sites
**Context:** Astro 5 + 65 MDX lessons + Russian content + glass UI + Cmd+K modal
**Researched:** 2026-02-03
**Confidence:** HIGH (verified with multiple production case studies, library documentation)

---

## Critical Pitfalls

Mistakes that cause rewrites, major performance issues, or complete feature failures.

### Pitfall 1: Bundle Size Explosion from Index

**What goes wrong:** Shipping the entire site content to the client as a search index causes massive bundle sizes (500KB-5MB+). On 65+ MDX lessons with Russian text and code examples, the index can easily exceed 2-3MB uncompressed, causing slow page loads, especially on mobile connections. Users abandon the site before search even loads.

**Why it happens:**
- Developers naively include full lesson content in the index
- No content truncation or field selection strategy
- Russian text with Cyrillic characters has higher byte counts than ASCII
- Code blocks from lessons get indexed without stripping formatting
- Build-time index generation includes metadata (dates, URLs, frontmatter) users don't search

**Consequences:**
- Time to Interactive (TTI) increases by 3-10 seconds on 3G connections
- Search modal takes 500ms-2s to open (loading index)
- Mobile users see blank screen during index parsing
- Lighthouse performance score drops significantly
- Hosting costs increase (bandwidth)
- Users perceive site as "slow" even if everything else is fast

**Prevention:**

1. **Limit indexed content per document:**
   ```javascript
   // BAD: Index everything
   const index = documents.map(doc => ({
     content: doc.fullContent,  // 5000+ words
     code: doc.codeBlocks,
     metadata: doc.frontmatter
   }));

   // GOOD: Index strategically
   const index = documents.map(doc => ({
     title: doc.title,
     excerpt: doc.content.slice(0, 200),  // First 200 chars
     headings: doc.headings.join(' '),
     // Code blocks excluded from index
   }));
   ```

2. **Use chunking strategy:** For 65 lessons, split into module-level chunks and lazy-load relevant chunks:
   ```javascript
   // Only load Module 1-2 index initially
   // Load other modules on-demand if search query doesn't match
   const moduleIndexes = {
     'module-1': '/search-indexes/module-1.json',  // 50KB
     'module-2': '/search-indexes/module-2.json',  // 60KB
     // Lazy-load others
   };
   ```

3. **Compress index:** Use gzip/brotli compression. Russian text compresses well (repeated words, grammar patterns).

4. **Measure before shipping:** Set budget of 150KB gzipped for full search index. Test on 3G throttled connection.

5. **Avoid indexing code blocks:** Code snippets are syntax, not semantic content. Exclude `<pre>`, `<code>` content from index or only include code comments.

**Detection:**
- Run `npm run build` and check size of generated search index file
- Use Chrome DevTools Network tab with "Fast 3G" throttling
- Measure Time to Interactive on low-end mobile device
- Check bundle analyzer for search-related assets
- Ask: "Can I load and parse this index in under 500ms on mobile?"

**Warning signs:**
- Search index file > 200KB uncompressed
- Cmd+K modal opens with visible delay (>300ms)
- Browser console shows parsing time > 100ms
- Mobile users report "laggy" search

**Phase implications:**
- **Phase 1 (Research/Planning):** Define index size budget (150KB gzipped max)
- **Phase 2 (Index Generation):** Implement content truncation, measure per-document size
- **Phase 3 (Implementation):** Test on 3G connection, enforce budget
- **Phase 4 (Optimization):** Consider chunking if single index exceeds budget

**Related to:** Pitfall 2 (Build Time), Pitfall 7 (Index Staleness)

---

### Pitfall 2: Russian Language Stemming Ignored

**What goes wrong:** Search libraries default to English stemming/tokenization. Russian words don't match variations: "подключение" (connection) won't match "подключения" (connections, genitive), "подключении" (connection, prepositional), or "подключить" (to connect). Users type natural queries but get zero results because the search doesn't understand Russian morphology.

**Why it happens:**
- Most JS search libraries (Fuse.js, MiniSearch, Pagefind) are English-first
- Russian has complex morphology: 6 cases, 3 genders, 2 aspects, extensive prefixing
- Developers test with English queries and assume it works for Russian
- Stemming libraries require separate plugins (lunr-languages, snowball-stemmers)
- Cyrillic character ranges aren't handled in default tokenizers

**Consequences:**
- Search appears "broken" - users type correct terms, get no results
- Users must type exact word forms (impossible for technical terms with declensions)
- Frustration leads to site abandonment
- English-speaking developers don't notice the issue during testing
- Workarounds like "search for 'Debezium postgres настройк'" fail for "настройка" vs "настройки"

**Prevention:**

1. **Use library with explicit Russian support:**
   | Library | Russian Support | How |
   |---------|----------------|-----|
   | **Lunr.js** | YES | Requires `lunr-languages` plugin with `ru` stemmer |
   | **Pagefind** | YES | Built-in multilingual support, auto-detects Russian |
   | **FlexSearch** | YES | Supports Cyrillic, configure language: 'ru' |
   | **Fuse.js** | NO | Fuzzy only, no stemming (workaround: increase threshold) |
   | **MiniSearch** | NO | Requires external stemmer package integration |

2. **Configure Russian language explicitly:**
   ```javascript
   // Lunr.js with Russian
   import lunr from 'lunr';
   import 'lunr-languages/lunr.stemmer.support';
   import 'lunr-languages/lunr.ru';

   const index = lunr(function() {
     this.use(lunr.ru);
     this.field('title');
     this.field('content');
   });

   // FlexSearch with Russian
   const index = new FlexSearch.Document({
     language: 'ru',
     tokenize: 'full',
     charset: 'cyrillic'
   });

   // Pagefind (auto-detects via lang attribute)
   <html lang="ru">
   ```

3. **Test with Russian morphological variations:**
   ```javascript
   // Test suite for Russian stemming
   const testCases = [
     { query: 'подключение', shouldMatch: ['подключения', 'подключений'] },
     { query: 'настройка', shouldMatch: ['настройки', 'настроек', 'настройкой'] },
     { query: 'реплик', shouldMatch: ['репликация', 'репликации', 'репликацию'] },
   ];
   ```

4. **Add stop words for Russian:** Common words like "это", "все", "для", "при", "или" shouldn't boost relevance scores.

5. **Handle mixed Russian/English content:** Technical terms like "CDC", "PostgreSQL", "Kafka" mixed with Russian text need bilingual tokenization.

**Detection:**
- Test search with Russian query forms: "репликация" vs "репликации" vs "репликацией"
- Search for technical terms in different cases: "Debezium" vs "Debezium'а" vs "Debezium'ом"
- Use browser language set to Russian during testing
- Ask native Russian speaker to test with natural queries
- Check if stemmer is actually loaded (console.log lunr pipeline)

**Warning signs:**
- Exact matches work but variants don't
- Search for "подключение" returns nothing but "подключения" works
- Users report "search doesn't work" in Russian context
- Relevance scores seem random for Russian queries

**Phase implications:**
- **Phase 1 (Research):** Choose library with native Russian support (Pagefind or Lunr.js + lunr-languages)
- **Phase 2 (Implementation):** Configure language, test with morphological variations
- **Phase 3 (Validation):** Native speaker testing with natural queries
- **Phase 4 (Monitoring):** Track search queries with zero results (identify stemming gaps)

**Related to:** Pitfall 3 (Cyrillic encoding), Pitfall 10 (Stop words)

---

### Pitfall 3: Cyrillic Encoding Corruption

**What goes wrong:** Search index is built with incorrect encoding, causing Cyrillic characters to render as gibberish ("РїРѕРґРєР»СЋС‡РµРЅРёРµ" instead of "подключение"). JSON files default to UTF-8 but build tools may use system encoding. Search appears to work but displays corrupted text, or worse, queries fail because stored text doesn't match input.

**Why it happens:**
- Node.js file operations default to system encoding (Windows CP-1251 vs UTF-8)
- MDX files are UTF-8 but build script reads them incorrectly
- JSON.stringify doesn't specify encoding explicitly
- Russian characters outside basic Latin range (U+0410 - U+044F for Cyrillic)
- Build environment (CI/CD) has different locale than development machine

**Consequences:**
- Search results show corrupted Russian text: "РџРѕРґРєР»СЋС‡РµРЅРёРµ Debezium Рє PostgreSQL"
- Query matching breaks: user types "подключение", index contains "РїРѕРґРєР»СЋС‡РµРЅРёРµ", no match
- Copy-paste from search results yields mojibake
- Different builds (local vs CI) produce different corrupted encodings
- Russian-speaking users see unusable search results

**Prevention:**

1. **Explicit UTF-8 encoding in all file operations:**
   ```javascript
   // BAD: Default encoding
   const content = fs.readFileSync('lesson.mdx');

   // GOOD: Explicit UTF-8
   const content = fs.readFileSync('lesson.mdx', 'utf-8');

   fs.writeFileSync('search-index.json', JSON.stringify(index, null, 2), 'utf-8');
   ```

2. **Verify MDX frontmatter encoding:**
   ```javascript
   // When parsing MDX files
   import { readFile } from 'node:fs/promises';

   const fileContent = await readFile(mdxPath, { encoding: 'utf-8' });
   ```

3. **Add encoding test to build script:**
   ```javascript
   // Assert Cyrillic roundtrips correctly
   const testString = "Подключение Debezium к PostgreSQL";
   const roundtrip = JSON.parse(JSON.stringify({ title: testString })).title;

   if (testString !== roundtrip) {
     throw new Error(`Encoding corruption detected: ${roundtrip}`);
   }
   ```

4. **Set HTML charset explicitly:**
   ```html
   <meta charset="UTF-8">
   ```

5. **Configure git to preserve Cyrillic:**
   ```gitattributes
   *.mdx text eol=lf
   *.json text eol=lf
   ```

6. **CI/CD environment locale:**
   ```yaml
   # .github/workflows/build.yml
   env:
     LANG: en_US.UTF-8
     LC_ALL: en_US.UTF-8
   ```

**Detection:**
- Visual inspection of search results for mojibake
- Check JSON search index file in hex editor (should see D0 D1 bytes for Cyrillic)
- Search for "подключение" and verify results display correctly
- Compare build artifacts between local and CI environments
- Use regex to detect encoding corruption: `/\?{2,}|\u00[A-F0-9]{2}/`

**Warning signs:**
- Search results show question marks: "???????????"
- Cyrillic characters appear as Latin with diacritics: "Ð¿Ð¾Ð´ÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ðµ"
- Local build works but CI/CD build shows corruption
- Copy-paste from search results doesn't match source content

**Phase implications:**
- **Phase 1 (Foundation):** Add encoding test to build script
- **Phase 2 (Index Generation):** Explicit UTF-8 in all file operations
- **Phase 3 (Testing):** Visual inspection of Cyrillic in search results
- **Phase 4 (CI/CD):** Verify encoding in deployed artifacts

**Related to:** Pitfall 2 (Russian stemming), Pitfall 11 (Character range issues)

---

### Pitfall 4: Keyboard Shortcut Conflicts (Cmd+K)

**What goes wrong:** `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux) conflicts with browser shortcuts, text editor shortcuts, and Emacs-style keybindings. Firefox uses Ctrl+K for search bar, text editors use it for hyperlink insertion, terminals use it to clear line. Users expect one behavior, get another, leading to confusion and broken workflows.

**Why it happens:**
- `Cmd+K` became popular for "command palettes" (GitHub, Notion, Linear) but wasn't standardized
- Browser vendors already assigned the shortcut (Firefox: focus search bar)
- Text editors use it for "insert link" (VS Code, Google Docs, macOS system-wide)
- Terminal emulators use Ctrl+K to delete from cursor to end of line
- Emacs keybindings (Ctrl+K kills line) are deeply ingrained in some users

**Consequences:**
- User presses Cmd+K expecting browser search bar, modal opens instead (Firefox)
- In contenteditable fields, Cmd+K triggers modal instead of "insert link"
- Terminal users accidentally open search when clearing lines
- Power users with Emacs keybindings have muscle memory broken
- Accessibility: screen reader users may have conflicting shortcuts
- Some users physically unable to press Cmd+K (accessibility)

**Prevention:**

1. **Provide alternative shortcuts:**
   ```javascript
   const searchShortcuts = [
     { key: 'k', metaKey: true },        // Cmd+K (macOS)
     { key: 'k', ctrlKey: true },        // Ctrl+K (Windows/Linux)
     { key: '/', ctrlKey: false },       // "/" (like GitHub, Reddit)
     { key: 'f', metaKey: true, altKey: true },  // Cmd+Alt+F (alternative)
   ];
   ```

2. **Don't intercept in input fields:**
   ```javascript
   document.addEventListener('keydown', (e) => {
     const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
     const isContentEditable = e.target.isContentEditable;

     if (isInputField || isContentEditable) return;  // Let browser handle it

     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
       e.preventDefault();
       openSearchModal();
     }
   });
   ```

3. **Detect Firefox and show warning:**
   ```javascript
   const isFirefox = navigator.userAgent.includes('Firefox');
   if (isFirefox) {
     // Show hint: "Use / to search, or Cmd+K to open browser search"
   }
   ```

4. **Allow users to customize shortcut:**
   ```javascript
   // Store in localStorage
   const userShortcut = localStorage.getItem('searchShortcut') || 'cmd+k';
   ```

5. **Visual hint in UI:**
   ```jsx
   <button className="search-button">
     Search <kbd>Cmd+K</kbd> or <kbd>/</kbd>
   </button>
   ```

6. **Escape key to close (mandatory):**
   ```javascript
   // Always allow Escape to close modal
   if (e.key === 'Escape') {
     closeSearchModal();
   }
   ```

7. **Test on all platforms:**
   - macOS: Cmd+K vs Cmd+Option+K
   - Windows: Ctrl+K
   - Linux: Ctrl+K
   - Firefox: Ctrl+K conflicts
   - Terminal emulators: check when site is open in background tab

**Detection:**
- Test in Firefox (Ctrl+K opens browser search bar)
- Open browser DevTools console and try Ctrl+K (might clear console)
- Test in `<input>` fields - Cmd+K shouldn't trigger modal
- Ask beta users if they experience unexpected behavior
- Check WCAG 2.2 keyboard accessibility (alternative triggers required)

**Warning signs:**
- User reports "Cmd+K doesn't work" (it's triggering browser instead)
- User reports "Cmd+K works too well" (triggers when they don't want it)
- Issues from Firefox users specifically
- Accessibility complaints about single shortcut

**Phase implications:**
- **Phase 1 (Design):** Choose primary + fallback shortcuts (Cmd+K + /)
- **Phase 2 (Implementation):** Don't intercept in input fields, test escape
- **Phase 3 (Cross-browser testing):** Test in Chrome, Firefox, Safari, Edge
- **Phase 4 (Accessibility):** Alternative activation methods (button click, voice)

**Related to:** Pitfall 5 (Modal UX), Pitfall 14 (Mobile accessibility)

---

### Pitfall 5: Stale Search Index in Continuous Deployment

**What goes wrong:** Site content updates via CI/CD but search index isn't regenerated, causing search results to show outdated lessons, missing new content, or pointing to URLs that no longer exist. Users search for newly added topics and find nothing, or click search results that lead to 404 pages.

**Why it happens:**
- Search index is generated once during initial build, not on every deploy
- CI/CD caches index file to speed up builds, serves stale version
- CDN caches search index JSON with long TTL (24 hours)
- Incremental builds (Astro fast refresh) don't regenerate index
- Index generation is manual step, not integrated into build pipeline
- Developer adds new lesson, deploys, forgets to rebuild index

**Consequences:**
- New lessons published but unsearchable for hours/days
- Search results link to renamed/deleted pages (404s)
- Edited content shows old text in search results
- Users report "I know this lesson exists but search can't find it"
- Inconsistent state: visible on site but not in search
- Trust erosion: "Is search broken or does this content not exist?"

**Prevention:**

1. **Integrate index generation into build process:**
   ```javascript
   // astro.config.mjs
   export default defineConfig({
     integrations: [
       searchIndex({
         beforeBuild: true,  // Regenerate on every build
         contentPath: './src/content/course',
       })
     ]
   });
   ```

2. **Use Astro integration hooks:**
   ```javascript
   // integrations/search-index.ts
   export function searchIndexIntegration() {
     return {
       name: 'search-index',
       hooks: {
         'astro:build:done': async ({ dir, pages }) => {
           // Generate index after build completes
           await generateSearchIndex(pages);
         }
       }
     };
   }
   ```

3. **Cache bust search index:**
   ```javascript
   // Include build timestamp in filename
   const indexFileName = `search-index.${Date.now()}.json`;

   // Or use content hash
   const indexHash = createHash('md5').update(indexContent).digest('hex').slice(0, 8);
   const indexFileName = `search-index.${indexHash}.json`;
   ```

4. **Set appropriate cache headers:**
   ```javascript
   // Astro endpoint for search index
   export async function GET() {
     const index = await loadSearchIndex();

     return new Response(JSON.stringify(index), {
       headers: {
         'Content-Type': 'application/json',
         'Cache-Control': 'public, max-age=3600, s-maxage=3600, must-revalidate',
       }
     });
   }
   ```

5. **CI/CD: Don't cache search index:**
   ```yaml
   # .github/workflows/deploy.yml
   - name: Build site
     run: npm run build
     # Don't cache search-index.json

   - name: Deploy
     run: npm run deploy
     # Clear CDN cache for /search-index*.json
   ```

6. **Verify index freshness:**
   ```javascript
   // Add build timestamp to index
   const searchIndex = {
     version: Date.now(),
     documents: [...],
   };

   // Client checks version
   const cachedVersion = localStorage.getItem('searchIndexVersion');
   if (index.version !== cachedVersion) {
     // Index updated, clear cached results
     localStorage.setItem('searchIndexVersion', index.version);
   }
   ```

7. **Monitor for staleness:**
   ```javascript
   // Add test that runs post-deploy
   const response = await fetch('/search-index.json');
   const index = await response.json();

   // Check if recently published lesson exists in index
   const latestLesson = 'module-8-lesson-10';
   const exists = index.documents.some(doc => doc.slug === latestLesson);

   if (!exists) {
     throw new Error('Search index is stale! Latest lesson not indexed.');
   }
   ```

**Detection:**
- Search for content you just published - does it appear?
- Check search index JSON file timestamp vs latest git commit time
- Add automated test: "search for [known recent term]"
- Monitor 404 errors from search result clicks
- Check `Last-Modified` header on search index endpoint

**Warning signs:**
- Search can't find lessons you know exist
- Search results lead to 404 pages
- Index file timestamp is days old
- Users report search feels "out of date"

**Phase implications:**
- **Phase 1 (Build Integration):** Hook index generation into Astro build lifecycle
- **Phase 2 (Testing):** Verify index regenerates on content changes
- **Phase 3 (CI/CD):** Configure cache headers, cache busting
- **Phase 4 (Monitoring):** Add staleness detection to post-deploy checks

**Related to:** Pitfall 1 (Bundle size - regenerating index frequently), Pitfall 7 (Index generation performance)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

### Pitfall 6: MDX Component Content Not Indexed

**What goes wrong:** Search only indexes plain text from MDX files but misses content inside React components like `<Callout>`, `<CodeBlock>`, `<Tabs>`, or custom components. Users search for terms that appear in callouts or tabbed content but get zero results because that content was never indexed.

**Why it happens:**
- MDX compilation converts components to JSX, build-time indexer only sees Markdown text
- Components render dynamically on client, so build script can't access their content
- Remark/rehype plugins process AST but custom components are opaque nodes
- Content inside component props (e.g., `<Callout message="Important!" />`) isn't in the text tree
- Developer assumes "all content is indexed" without checking component boundaries

**Consequences:**
- Important warnings/tips in `<Callout>` are unsearchable
- Code examples in custom `<CodeTabs>` components don't appear in results
- Users search for exact phrases they saw in lesson, get nothing
- Inconsistent search quality: some lessons fully searchable, others partial
- Trust erosion: "I know I read about X but search can't find it"

**Prevention:**

1. **Extract component content during indexing:**
   ```javascript
   // Use MDX AST to walk component props
   import { visit } from 'unist-util-visit';

   function extractComponentContent(tree) {
     const componentContent = [];

     visit(tree, 'mdxJsxFlowElement', (node) => {
       if (node.name === 'Callout') {
         const messageAttr = node.attributes.find(a => a.name === 'message');
         if (messageAttr) {
           componentContent.push(messageAttr.value);
         }
       }

       // Extract children text
       if (node.children) {
         const text = node.children
           .filter(c => c.type === 'text')
           .map(c => c.value)
           .join(' ');
         componentContent.push(text);
       }
     });

     return componentContent.join(' ');
   }
   ```

2. **Render components at build time:**
   ```javascript
   // For server-renderable components, render to string and index
   import { renderToStaticMarkup } from 'react-dom/server';

   const componentHTML = renderToStaticMarkup(<Callout message="Important" />);
   const textContent = stripHTML(componentHTML);
   ```

3. **Use data attributes for indexing hints:**
   ```tsx
   // In component definition
   export function Callout({ message }: Props) {
     return (
       <div className="callout" data-searchable={message}>
         {message}
       </div>
     );
   }

   // Indexer extracts data-searchable attributes
   ```

4. **Document which components are indexed:**
   ```markdown
   # Indexed Components
   - <Callout> - message prop + children text
   - <CodeBlock> - language name, comments only (not code)
   - <Tabs> - tab labels + panel text

   # NOT Indexed
   - <Mermaid> - diagram syntax (too noisy)
   - <Video> - no text content
   ```

5. **Test with component-heavy lessons:**
   ```javascript
   // Find lessons with most component usage
   const componentHeavyLessons = lessons.filter(l =>
     l.content.includes('<Callout') || l.content.includes('<Tabs')
   );

   // Search for terms that only appear in components
   const searchQuery = "важное предупреждение";  // From Callout
   const results = searchIndex.search(searchQuery);

   expect(results).toContain(componentHeavyLessons[0].slug);
   ```

6. **Fallback: Manual index hints in frontmatter:**
   ```yaml
   ---
   title: "Настройка Debezium"
   searchKeywords: "важное предупреждение, конфигурация, подключение"
   ---
   ```

**Detection:**
- Search for text you know appears in a `<Callout>` component
- Check lessons with heavy component usage (lots of callouts, tabs)
- Inspect search index JSON - do you see component content?
- Compare lesson source (MDX) vs indexed content (JSON)
- Ask beta users to search for terms from callouts/warnings

**Warning signs:**
- Users report "I can see X on the page but search doesn't find it"
- Search results skewed toward plain text lessons
- Important warnings/tips are unsearchable
- Index JSON is smaller than expected

**Phase implications:**
- **Phase 1 (Index Strategy):** Decide which components to index (Callout: yes, Mermaid: no)
- **Phase 2 (Implementation):** Build AST walker or SSR renderer for components
- **Phase 3 (Testing):** Test with component-heavy lessons
- **Phase 4 (Documentation):** Document indexed vs non-indexed components

**Related to:** Pitfall 1 (Bundle size - more content to index), Pitfall 8 (Code block noise)

---

### Pitfall 7: Build Time Explosion with Large Content

**What goes wrong:** Generating search index for 65+ MDX lessons slows down build time from 30 seconds to 5-10 minutes. Every content edit requires full index regeneration, killing developer productivity. CI/CD builds timeout or consume excessive resources, increasing costs.

**Why it happens:**
- Index generation processes every MDX file on every build
- No incremental indexing - small content change rebuilds entire index
- Stemming/tokenization is CPU-intensive for Russian text (morphological analysis)
- Build script re-parses MDX AST for each lesson sequentially (not parallel)
- Large code blocks in lessons get tokenized unnecessarily
- No caching of parsed content between builds

**Consequences:**
- Local development: every save triggers 2-5 minute rebuild
- CI/CD: builds timeout, need to increase runner resources (cost)
- Developers avoid editing multiple lessons (afraid of long builds)
- Deployment frequency decreases (batch changes to avoid rebuilds)
- Slow feedback loop kills momentum

**Prevention:**

1. **Cache parsed MDX content:**
   ```javascript
   // Hash-based caching
   import crypto from 'crypto';

   const contentHash = crypto.createHash('md5')
     .update(mdxFileContent)
     .digest('hex');

   const cacheFile = `.cache/parsed-${contentHash}.json`;

   if (fs.existsSync(cacheFile)) {
     return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
   }

   const parsed = await parseMDX(mdxFileContent);
   fs.writeFileSync(cacheFile, JSON.stringify(parsed));
   return parsed;
   ```

2. **Parallel processing:**
   ```javascript
   // Process lessons in parallel
   import pLimit from 'p-limit';

   const limit = pLimit(10);  // 10 concurrent

   const documents = await Promise.all(
     lessons.map(lesson =>
       limit(() => processLesson(lesson))
     )
   );
   ```

3. **Incremental indexing:**
   ```javascript
   // Only rebuild changed files
   const existingIndex = loadIndex();
   const changedFiles = getChangedFiles();  // git diff

   const updatedDocs = await Promise.all(
     changedFiles.map(f => parseAndIndex(f))
   );

   const newIndex = {
     ...existingIndex,
     documents: existingIndex.documents
       .filter(d => !changedFiles.includes(d.slug))
       .concat(updatedDocs)
   };
   ```

4. **Use faster search library:**
   | Library | Indexing Speed (65 docs) | Notes |
   |---------|-------------------------|-------|
   | **Pagefind** | 2-5 seconds | Rust-based, very fast |
   | **FlexSearch** | 5-10 seconds | Optimized JS |
   | **Lunr.js** | 15-30 seconds | Slower for Russian |
   | **Fuse.js** | 3-8 seconds | No stemming (faster but worse quality) |

5. **Limit indexed content strategically:**
   ```javascript
   // Don't index everything
   const indexableContent = {
     title: lesson.frontmatter.title,
     excerpt: lesson.content.slice(0, 300),
     headings: lesson.headings,
     // Skip: code blocks, component internals, metadata
   };
   ```

6. **Development vs production modes:**
   ```javascript
   // In development, use lightweight index
   if (import.meta.env.DEV) {
     // Index titles and headings only
     const devIndex = lessons.map(l => ({
       title: l.title,
       headings: l.headings,
       slug: l.slug
     }));
   } else {
     // Full index in production
     const prodIndex = await buildFullIndex(lessons);
   }
   ```

7. **Profile indexing performance:**
   ```javascript
   console.time('Parse MDX');
   const parsed = await parseMDX(content);
   console.timeEnd('Parse MDX');  // 150ms

   console.time('Tokenize Russian');
   const tokens = tokenizer.tokenize(content);
   console.timeEnd('Tokenize Russian');  // 300ms

   console.time('Build index');
   const index = buildSearchIndex(tokens);
   console.timeEnd('Build index');  // 500ms
   ```

**Detection:**
- Run `npm run build` and measure total time
- Time index generation specifically: `time npm run build:search-index`
- Check CI/CD logs for build duration trends
- Profile with `NODE_OPTIONS="--prof" npm run build`
- Ask: "Can I iterate on content in under 10 seconds?"

**Warning signs:**
- Build time > 2 minutes for 65 lessons
- Every content edit takes 1+ minute to rebuild
- CI/CD builds taking 5-10 minutes
- Developers complaining about slow builds

**Phase implications:**
- **Phase 1 (Research):** Choose fast indexing library (Pagefind preferred)
- **Phase 2 (Implementation):** Parallel processing, content caching
- **Phase 3 (Optimization):** Incremental indexing for dev mode
- **Phase 4 (Monitoring):** Track build time metrics

**Related to:** Pitfall 1 (Bundle size), Pitfall 5 (Stale index), Pitfall 6 (Component indexing)

---

### Pitfall 8: Code Block Noise in Search Results

**What goes wrong:** Code snippets from lessons get indexed as searchable text, flooding results with syntax noise. Users search for "connection" and get 50 results because every code block contains `connection.execute()`. Relevant conceptual explanations are buried under code spam. Relevance ranking breaks because code has high term frequency.

**Why it happens:**
- Indexer treats code blocks as normal text (sees `<pre><code>` as content)
- Programming syntax contains natural language words (function, connection, execute)
- Code examples are lengthy, dominating term frequency
- Developers assume "index everything" is better for discoverability
- No distinction between prose (useful for search) and syntax (noise)

**Consequences:**
- Search results overwhelmed by code matches instead of explanations
- Relevance ranking broken (code has higher term density than prose)
- Users searching for concepts get code, not explanations
- "Connection" query returns 60 results, all from code blocks
- Actual lesson content buried on page 3 of results
- Search feels useless: "I wanted to learn about X, not see code for X"

**Prevention:**

1. **Exclude code blocks from index entirely:**
   ```javascript
   // MDX AST processing
   import { visit } from 'unist-util-visit';

   function extractIndexableContent(tree) {
     let content = '';

     visit(tree, (node) => {
       // Skip code blocks
       if (node.type === 'code') return;

       // Index text nodes
       if (node.type === 'text') {
         content += node.value + ' ';
       }
     });

     return content;
   }
   ```

2. **Index only code comments:**
   ```javascript
   function extractCodeComments(codeBlock) {
     const lines = codeBlock.split('\n');
     const comments = lines
       .filter(line => line.trim().startsWith('//') || line.includes('/*'))
       .map(line => line.replace(/^\/\/|\/\*|\*\//g, '').trim())
       .join(' ');

     return comments;
   }
   ```

3. **Separate field with lower weight:**
   ```javascript
   // Index structure with field weights
   const document = {
     title: lesson.title,           // weight: 10
     content: lesson.prose,          // weight: 5
     headings: lesson.headings,      // weight: 8
     codeComments: lesson.comments,  // weight: 1 (low priority)
   };

   // Search library configuration
   index = lunr(function() {
     this.field('title', { boost: 10 });
     this.field('content', { boost: 5 });
     this.field('headings', { boost: 8 });
     this.field('codeComments', { boost: 1 });
   });
   ```

4. **Strip code-specific terms:**
   ```javascript
   const codeSyntaxStopWords = [
     'function', 'const', 'let', 'var', 'return',
     'if', 'else', 'for', 'while', 'try', 'catch',
     'class', 'extends', 'import', 'export',
     // Add language-specific keywords
   ];
   ```

5. **Visual indicator for code matches:**
   ```tsx
   // If code IS indexed, show badge
   <SearchResult>
     <span className="result-title">{result.title}</span>
     {result.matchedInCode && (
       <span className="badge">Found in code example</span>
     )}
   </SearchResult>
   ```

6. **User preference: "Include code in search":**
   ```tsx
   <SearchSettings>
     <label>
       <input type="checkbox" checked={includeCode} />
       Include code examples in search results
     </label>
   </SearchSettings>
   ```

7. **Test with code-heavy lesson:**
   ```javascript
   // Lesson with 10 code blocks containing "connection"
   // vs lesson with 1 paragraph explaining "connection concept"

   const results = searchIndex.search('connection');

   // Explanation lesson should rank higher than code-heavy lesson
   expect(results[0].slug).toBe('connection-concepts');
   expect(results[1].slug).not.toBe('connection-code-examples');
   ```

**Detection:**
- Search for common programming terms: "function", "connection", "execute"
- Check if results are dominated by lessons with lots of code
- Inspect search index JSON - is code content larger than prose?
- Ask: "Does searching for concept X return explanations or code?"
- Compare term frequency: code blocks vs explanatory text

**Warning signs:**
- Search for "подключение" returns 50+ results
- Top results are code-heavy lessons, not conceptual explanations
- Every result highlights code syntax, not prose
- Index size is 80% code, 20% prose

**Phase implications:**
- **Phase 1 (Index Strategy):** Decide to exclude code or use low weight
- **Phase 2 (Implementation):** AST processing to skip code nodes
- **Phase 3 (Testing):** Test relevance ranking with code-heavy queries
- **Phase 4 (Tuning):** Adjust field weights based on user feedback

**Related to:** Pitfall 1 (Bundle size - code increases index), Pitfall 6 (Component content), Pitfall 10 (Relevance ranking)

---

### Pitfall 9: Modal Focus Trap Broken

**What goes wrong:** Cmd+K search modal opens but keyboard focus isn't trapped inside. Users can Tab out of the modal and interact with page behind it. Screen readers announce background content. Escape key doesn't close modal reliably. Modal is half-functional, creating accessibility violations and poor UX.

**Why it happens:**
- Modal overlay doesn't prevent background interaction
- Focus management not implemented (no auto-focus on input)
- Keyboard navigation allows Tab to escape modal boundaries
- Click outside modal doesn't close it (or closes unintentionally)
- Scroll lock not applied to body (page scrolls behind modal)
- Screen readers can navigate to hidden content

**Consequences:**
- WCAG 2.2 violation: keyboard trap not implemented correctly
- Screen reader users confused (announces hidden page content)
- Users Tab out of modal accidentally, lose context
- Background page scrolls while modal is open
- Escape key inconsistent (sometimes works, sometimes doesn't)
- Accessibility audits fail

**Prevention:**

1. **Use headless UI library with focus trap:**
   ```tsx
   // Radix UI Dialog (recommended for glass design)
   import * as Dialog from '@radix-ui/react-dialog';

   <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
     <Dialog.Portal>
       <Dialog.Overlay className="glass-overlay" />
       <Dialog.Content className="search-modal">
         <input autoFocus />
         {/* Focus trapped automatically */}
       </Dialog.Content>
     </Dialog.Portal>
   </Dialog.Root>
   ```

2. **Manual focus trap implementation:**
   ```javascript
   import { useFocusTrap } from '@/hooks/useFocusTrap';

   function SearchModal({ isOpen }) {
     const modalRef = useRef(null);
     useFocusTrap(modalRef, isOpen);

     return (
       <div ref={modalRef} role="dialog" aria-modal="true">
         <input autoFocus />
       </div>
     );
   }

   // Hook implementation
   function useFocusTrap(ref, isActive) {
     useEffect(() => {
       if (!isActive || !ref.current) return;

       const focusableElements = ref.current.querySelectorAll(
         'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
       );

       const firstElement = focusableElements[0];
       const lastElement = focusableElements[focusableElements.length - 1];

       function handleTab(e) {
         if (e.key !== 'Tab') return;

         if (e.shiftKey && document.activeElement === firstElement) {
           e.preventDefault();
           lastElement.focus();
         } else if (!e.shiftKey && document.activeElement === lastElement) {
           e.preventDefault();
           firstElement.focus();
         }
       }

       ref.current.addEventListener('keydown', handleTab);
       firstElement.focus();

       return () => ref.current?.removeEventListener('keydown', handleTab);
     }, [isActive, ref]);
   }
   ```

3. **Lock body scroll:**
   ```css
   /* When modal is open */
   body.modal-open {
     overflow: hidden;
     padding-right: var(--scrollbar-width);  /* Prevent layout shift */
   }
   ```

4. **Escape key handling:**
   ```javascript
   useEffect(() => {
     function handleEscape(e) {
       if (e.key === 'Escape' && isOpen) {
         setIsOpen(false);
       }
     }

     document.addEventListener('keydown', handleEscape);
     return () => document.removeEventListener('keydown', handleEscape);
   }, [isOpen]);
   ```

5. **Click outside to close:**
   ```tsx
   <div className="modal-overlay" onClick={handleClose}>
     <div className="modal-content" onClick={(e) => e.stopPropagation()}>
       {/* Modal content - clicks don't propagate to overlay */}
     </div>
   </div>
   ```

6. **Screen reader announcements:**
   ```tsx
   <div
     role="dialog"
     aria-modal="true"
     aria-labelledby="search-title"
     aria-describedby="search-desc"
   >
     <h2 id="search-title" className="sr-only">Поиск по курсу</h2>
     <p id="search-desc" className="sr-only">
       Введите запрос для поиска по урокам
     </p>

     <input aria-label="Поисковый запрос" />
   </div>
   ```

7. **Return focus on close:**
   ```javascript
   const triggerRef = useRef(null);

   function openModal() {
     triggerRef.current = document.activeElement;  // Save current focus
     setIsOpen(true);
   }

   function closeModal() {
     setIsOpen(false);
     triggerRef.current?.focus();  // Restore focus to trigger button
   }
   ```

**Detection:**
- Open modal and press Tab repeatedly - can you escape?
- Open modal and try to click background page - does it respond?
- Use screen reader (VoiceOver, NVDA) - does it announce background?
- Press Escape - does modal close?
- Test with keyboard only (no mouse)
- Run axe DevTools accessibility audit

**Warning signs:**
- Tab key moves focus to background page
- Background scrolls while modal is open
- Escape key doesn't close modal
- Screen reader announces hidden content
- Click outside doesn't close (or closes accidentally)

**Phase implications:**
- **Phase 1 (Component Selection):** Choose UI library with built-in focus trap (Radix UI)
- **Phase 2 (Implementation):** Implement focus trap, scroll lock, escape handler
- **Phase 3 (Accessibility Testing):** Keyboard-only testing, screen reader testing
- **Phase 4 (WCAG Audit):** Run automated + manual accessibility checks

**Related to:** Pitfall 4 (Keyboard shortcuts), Pitfall 14 (Mobile accessibility)

---

### Pitfall 10: Poor Relevance Ranking for Russian

**What goes wrong:** Search results are ordered poorly for Russian queries. Generic high-frequency terms rank higher than specific technical explanations. Title matches are buried under content matches. Russian morphology causes false matches to rank higher than exact matches. Users get 50 results but the best one is on page 3.

**Why it happens:**
- Default TF-IDF scoring doesn't account for Russian stop words
- High-frequency Russian words ("это", "все", "для") boost irrelevant documents
- No field weighting (title = content = headings in importance)
- Stemming creates false positives: "репликатор" matches "репликация" (different concepts)
- Code block noise inflates term frequency for technical terms
- English technical terms (Kafka, Debezium) treated as high value despite being in every lesson

**Consequences:**
- Users search for specific topic, best lesson is result #15
- Generic lessons rank higher than specific deep-dives
- Title matches buried under vague content matches
- False positives from aggressive stemming
- Users give up after checking first 5 results
- Search feels "dumb" - doesn't understand intent

**Prevention:**

1. **Configure Russian stop words:**
   ```javascript
   const russianStopWords = [
     'а', 'без', 'более', 'бы', 'был', 'была', 'были', 'было',
     'быть', 'в', 'вам', 'вас', 'весь', 'во', 'вот', 'все',
     'всего', 'всех', 'вы', 'где', 'да', 'даже', 'для', 'до',
     'его', 'ее', 'если', 'есть', 'еще', 'же', 'за', 'здесь',
     'и', 'из', 'или', 'им', 'их', 'к', 'как', 'ко', 'когда',
     'кто', 'ли', 'либо', 'мне', 'может', 'мы', 'на', 'надо',
     'наш', 'не', 'него', 'нее', 'нет', 'ни', 'них', 'но',
     'ну', 'о', 'об', 'однако', 'он', 'она', 'они', 'оно',
     'от', 'очень', 'по', 'под', 'при', 'с', 'со', 'так',
     'также', 'такой', 'там', 'те', 'тем', 'то', 'того',
     'тоже', 'той', 'только', 'том', 'ты', 'у', 'уже',
     'хотя', 'чего', 'чей', 'чем', 'что', 'чтобы', 'чьё',
     'эта', 'эти', 'это', 'я',
   ];

   // Lunr.js
   lunr.Pipeline.registerFunction(function(token) {
     return russianStopWords.includes(token.toString()) ? undefined : token;
   }, 'russianStopWords');
   ```

2. **Field-weighted search:**
   ```javascript
   // Boost title matches heavily
   const index = new MiniSearch({
     fields: ['title', 'headings', 'content'],
     searchOptions: {
       boost: { title: 10, headings: 5, content: 1 },
       fuzzy: 0.2,
     }
   });
   ```

3. **Penalize overly common technical terms:**
   ```javascript
   const technicalStopWords = [
     'debezium', 'kafka', 'postgresql', 'mysql', 'connector',
     // Terms that appear in every lesson
   ];

   // Don't boost these terms
   ```

4. **Proximity scoring:**
   ```javascript
   // Boost results where query terms appear close together
   searchOptions: {
     prefix: true,
     fuzzy: 0.2,
     combineWith: 'AND',  // All terms must match
   }
   ```

5. **Custom relevance scoring:**
   ```javascript
   function customScore(result, query) {
     let score = result.score;

     // Boost exact title match
     if (result.title.toLowerCase() === query.toLowerCase()) {
       score *= 3;
     }

     // Boost if query is in first paragraph
     if (result.content.slice(0, 300).includes(query)) {
       score *= 1.5;
     }

     // Penalize very long documents (less focused)
     if (result.wordCount > 3000) {
       score *= 0.8;
     }

     return score;
   }
   ```

6. **BM25 ranking instead of TF-IDF:**
   ```javascript
   // FlexSearch with BM25
   const index = new FlexSearch.Document({
     document: {
       id: 'slug',
       index: ['title', 'content'],
     },
     tokenize: 'full',
     context: {
       resolution: 9,
       depth: 3,
       bidirectional: true,
     },
   });
   ```

7. **Test relevance with real queries:**
   ```javascript
   const testCases = [
     {
       query: 'настройка репликации postgresql',
       expectedTop3: [
         'postgresql-replication-setup',
         'logical-replication-config',
         'replication-slots',
       ]
     },
     {
       query: 'kafka connect развертывание',
       expectedTop3: [
         'kafka-connect-deployment',
         'distributed-mode',
         'standalone-vs-distributed',
       ]
     }
   ];

   for (const testCase of testCases) {
     const results = searchIndex.search(testCase.query);
     const topSlugs = results.slice(0, 3).map(r => r.slug);

     expect(topSlugs).toContain(testCase.expectedTop3[0]);
   }
   ```

**Detection:**
- Search for specific technical topic - is best lesson in top 3?
- Search for lesson title - is that lesson ranked #1?
- Compare ranking for "подключение" vs "подключение postgres" - does specificity help?
- Ask beta users: "Did you find what you were looking for in first 5 results?"
- Log search analytics: clicks on result #10+ indicate poor ranking

**Warning signs:**
- Best result is consistently beyond top 5
- Generic lessons rank higher than specific ones
- Title exact matches aren't #1
- Users click result #8 more than result #2

**Phase implications:**
- **Phase 1 (Library Selection):** Choose library with field weighting (MiniSearch, Lunr)
- **Phase 2 (Configuration):** Add Russian stop words, configure field weights
- **Phase 3 (Testing):** Relevance testing with real queries
- **Phase 4 (Tuning):** Iterate on weights based on user behavior

**Related to:** Pitfall 2 (Russian stemming), Pitfall 8 (Code noise), Pitfall 11 (Stop words)

---

## Minor Pitfalls

Mistakes that cause annoyance or suboptimal UX but are easily fixable.

### Pitfall 11: Character Range Issues with Cyrillic

**What goes wrong:** Search queries with special Cyrillic characters like "ё" (yo) don't match content with "е" (ye). Russian users often type without ё (keyboard layouts make it inconvenient), but content uses proper spelling with ё. Queries for "репликация" don't match "РЕПЛИКАЦИЯ" (case sensitivity). Regex patterns like `[а-я]` don't cover full Cyrillic range.

**Why it happens:**
- Russian keyboards make "ё" hard to type (requires extra key)
- Users habitually replace "ё" with "е" when typing
- Case folding doesn't work correctly for Cyrillic (toLowerCase() may miss edge cases)
- Regex character ranges `[а-я]` don't include "ё" (U+0451)
- Unicode normalization not applied (NFC vs NFD forms)

**Consequences:**
- Search for "подключение" misses "подключён" (valid word)
- Case-insensitive search doesn't work: "Репликация" vs "РЕПЛИКАЦИЯ"
- Regex validation fails for valid Russian input
- Users frustrated: "I typed it correctly but it didn't find anything"

**Prevention:**

1. **Normalize "ё" to "е" during indexing:**
   ```javascript
   function normalizeRussian(text) {
     return text
       .toLowerCase()
       .replace(/ё/g, 'е')
       .replace(/Ё/g, 'Е')
       .normalize('NFC');  // Unicode normalization
   }

   // Apply to both indexed content and search queries
   const indexedContent = normalizeRussian(content);
   const searchQuery = normalizeRussian(userInput);
   ```

2. **Proper case folding for Cyrillic:**
   ```javascript
   // Use locale-aware case folding
   const query = userInput.toLocaleLowerCase('ru-RU');

   // Or use library with proper Unicode handling
   import { fold } from 'unicode-case-folding';
   const normalized = fold(text);
   ```

3. **Full Cyrillic range in regex:**
   ```javascript
   // BAD: Misses ё and other characters
   const cyrillicPattern = /[а-я]/gi;

   // GOOD: Full Cyrillic range
   const cyrillicPattern = /[\u0400-\u04FF]/g;

   // Better: Use Unicode property escapes
   const cyrillicPattern = /\p{Script=Cyrillic}/gu;
   ```

4. **Test with problematic characters:**
   ```javascript
   const testCases = [
     { search: 'подключение', shouldMatch: 'подключён' },
     { search: 'Репликация', shouldMatch: 'РЕПЛИКАЦИЯ' },
     { search: 'новый', shouldMatch: 'Новый' },
   ];
   ```

**Detection:**
- Search for words with "е", check if "ё" variants match
- Test case-insensitive search with Cyrillic
- Try typing queries without "ё" (natural user behavior)

**Warning signs:**
- "подключён" doesn't match query "подключение"
- Case-sensitive behavior for Cyrillic
- Regex validation rejects valid Russian input

**Phase implications:**
- **Phase 2 (Indexing):** Apply normalization to all content
- **Phase 3 (Query Processing):** Apply normalization to user queries
- **Phase 4 (Testing):** Test with "ё" and case variations

**Related to:** Pitfall 2 (Russian stemming), Pitfall 3 (Encoding)

---

### Pitfall 12: Glass UI Search Results Illegible

**What goes wrong:** Search results displayed on glassmorphic modal have poor contrast. White/light text on translucent glass blurs into background. Code syntax highlighting in result snippets becomes unreadable. Hover states aren't visible enough. Users squint to read results.

**Why it happens:**
- Applying same glass opacity to search results as navigation
- Background blur insufficient for text readability
- No solid backing behind text content
- Glass design prioritized over accessibility
- Testing on high-contrast displays, not real-world conditions

**Consequences:**
- Users can't read search result snippets
- Hover state invisible (can't tell which result is focused)
- Code snippets in results illegible
- Accessibility violation (contrast ratio < 4.5:1)
- Search feels broken even though it works

**Prevention:**

1. **Increase opacity for search results:**
   ```css
   .search-modal {
     background: rgba(0, 0, 0, 0.1);
     backdrop-filter: blur(10px);
   }

   .search-result {
     /* Higher opacity for readability */
     background: rgba(0, 0, 0, 0.7);
     backdrop-filter: blur(6px);
     border: 1px solid rgba(255, 255, 255, 0.2);
   }

   .search-result:hover,
   .search-result[aria-selected="true"] {
     /* Solid hover state */
     background: rgba(0, 0, 0, 0.9);
   }
   ```

2. **Add text shadows for legibility:**
   ```css
   .search-result-title {
     color: rgba(255, 255, 255, 0.95);
     text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
   }
   ```

3. **Test contrast ratios:**
   - Use WebAIM Contrast Checker
   - Test against different backgrounds (glass reveals background)
   - Verify 4.5:1 minimum for body text
   - Verify 3:1 for UI components

4. **Solid backgrounds for code in results:**
   ```css
   .search-result code {
     background: rgba(0, 0, 0, 0.95);  /* Nearly solid */
     border: 1px solid rgba(255, 255, 255, 0.1);
   }
   ```

**Detection:**
- Open search modal, can you easily read all results?
- Hover over results - is hover state visible?
- Run axe DevTools contrast checker
- Test on low-brightness screen

**Warning signs:**
- Squinting to read result snippets
- Hover state barely visible
- Code in results illegible
- Contrast checker shows < 4.5:1

**Phase implications:**
- **Phase 3 (UI Implementation):** Test glass opacity on search results specifically
- **Phase 4 (Accessibility Audit):** Contrast testing

**Related to:** Existing glassmorphism pitfalls in PITFALLS.md (glassmorphism research)

---

### Pitfall 13: No Loading States or Empty States

**What goes wrong:** User opens search modal, starts typing, but no feedback during indexing/searching. Empty state when no results doesn't explain why (no matching results vs index still loading vs network error). User types query, waits, sees nothing, assumes search is broken.

**Why it happens:**
- Loading index asynchronously but not showing spinner
- No distinction between "no results" and "still searching"
- Error states not handled (network failure, parse error)
- Developer assumes search is instant (forgets 3G users)

**Consequences:**
- User thinks search is broken during loading
- No guidance when no results (did I misspell? Is content missing?)
- Errors fail silently (user never knows why search didn't work)
- Poor perceived performance even if search is fast

**Prevention:**

1. **Loading state while fetching index:**
   ```tsx
   {indexLoading && (
     <div className="search-loading">
       <Spinner />
       <p>Загрузка индекса поиска...</p>
     </div>
   )}
   ```

2. **Searching state:**
   ```tsx
   {query && searching && (
     <div className="search-progress">
       <Spinner size="sm" />
       <span>Поиск...</span>
     </div>
   )}
   ```

3. **Empty state with guidance:**
   ```tsx
   {query && !searching && results.length === 0 && (
     <div className="search-empty">
       <Icon name="search-off" />
       <p>Ничего не найдено по запросу "{query}"</p>
       <ul className="search-tips">
         <li>Проверьте правильность написания</li>
         <li>Попробуйте другие ключевые слова</li>
         <li>Используйте более общие термины</li>
       </ul>
     </div>
   )}
   ```

4. **Error state:**
   ```tsx
   {error && (
     <div className="search-error">
       <Icon name="alert" />
       <p>Ошибка при загрузке поиска</p>
       <button onClick={retry}>Попробовать снова</button>
     </div>
   )}
   ```

5. **Initial state (before user types):**
   ```tsx
   {!query && (
     <div className="search-suggestions">
       <p>Популярные темы:</p>
       <ul>
         <li><button onClick={() => search('репликация')}>Репликация</button></li>
         <li><button onClick={() => search('kafka connect')}>Kafka Connect</button></li>
         <li><button onClick={() => search('настройка')}>Настройка</button></li>
       </ul>
     </div>
   )}
   ```

**Detection:**
- Open search on slow 3G - do you see loading state?
- Type gibberish query - is empty state helpful?
- Disconnect network, open search - is error shown?

**Warning signs:**
- Blank modal during loading
- "No results" without explanation
- Errors fail silently

**Phase implications:**
- **Phase 3 (UI Implementation):** Design all states (loading, empty, error, initial)
- **Phase 4 (UX Polish):** Add helpful suggestions in empty state

---

### Pitfall 14: Mobile/Touch Experience Broken

**What goes wrong:** Cmd+K shortcut doesn't work on mobile (no Cmd key). Search button too small to tap (glass button with low contrast). Modal doesn't fill screen on mobile (tiny input field). Keyboard overlays results. Scrolling results conflicts with modal close gesture.

**Why it happens:**
- Desktop-first design with keyboard-centric UX
- Glass buttons have small tap targets (< 44px)
- Modal designed for desktop, not responsive
- No consideration for on-screen keyboard
- Touch gestures conflict with interactions

**Consequences:**
- Mobile users can't open search (no Cmd+K)
- Can't tap search button (too small, low contrast)
- Tiny input field hard to type in
- Results hidden behind keyboard
- Accidental modal closes while scrolling results

**Prevention:**

1. **Prominent search button for mobile:**
   ```tsx
   <button
     className="search-trigger"
     style={{ minWidth: '44px', minHeight: '44px' }}  // WCAG touch target
     aria-label="Открыть поиск"
   >
     <SearchIcon />
   </button>
   ```

2. **Full-screen modal on mobile:**
   ```css
   @media (max-width: 768px) {
     .search-modal {
       position: fixed;
       inset: 0;
       width: 100vw;
       height: 100vh;
       border-radius: 0;
     }
   }
   ```

3. **Account for on-screen keyboard:**
   ```css
   @media (max-width: 768px) {
     .search-results {
       max-height: 50vh;  /* Leave room for keyboard */
       overflow-y: auto;
     }
   }
   ```

4. **Prevent accidental close while scrolling:**
   ```tsx
   const handleBackdropClick = (e) => {
     // Only close if clicked directly on backdrop, not while scrolling
     if (e.target === e.currentTarget) {
       closeModal();
     }
   };
   ```

5. **Swipe-to-close gesture:**
   ```tsx
   // Optional: swipe down to close on mobile
   const handleTouchMove = (e) => {
     if (swipeDistance > 100) {
       closeModal();
     }
   };
   ```

**Detection:**
- Test on actual mobile device (iOS Safari, Android Chrome)
- Check tap target sizes (Chrome DevTools > Rendering > Show tap targets)
- Open on-screen keyboard, verify results visible
- Try scrolling results without closing modal

**Warning signs:**
- Search button hard to tap
- Modal tiny on mobile
- Results hidden behind keyboard
- Modal closes when scrolling

**Phase implications:**
- **Phase 3 (Mobile Testing):** Test on real devices
- **Phase 4 (Responsive Design):** Full-screen modal, proper tap targets

**Related to:** Pitfall 4 (Keyboard shortcuts), Pitfall 9 (Focus trap)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Research & Planning** | Choosing library without Russian support | Verify Russian stemming before deciding (Pagefind or Lunr.js recommended) |
| **Research & Planning** | No bundle size budget | Set 150KB gzipped limit for search index |
| **Index Generation** | Indexing all content naively | Truncate per-document, exclude code blocks, measure size |
| **Index Generation** | Encoding corruption (Cyrillic) | Explicit UTF-8 in all file operations, add test |
| **Index Generation** | Slow build times | Parallel processing, content caching, profile performance |
| **Index Generation** | MDX component content missed | Extract component props/children during indexing |
| **Implementation** | Modal focus trap broken | Use Radix UI Dialog or implement proper focus management |
| **Implementation** | Keyboard shortcut conflicts | Support Cmd+K + "/" fallback, don't intercept in inputs |
| **Implementation** | Glass UI illegible | Increase opacity for search results, test contrast |
| **Configuration** | Russian stemming not configured | Load lunr-languages or configure Pagefind lang="ru" |
| **Configuration** | No stop words for Russian | Add Russian stop word list |
| **Configuration** | Poor relevance ranking | Configure field weights (title: 10, headings: 5, content: 1) |
| **Configuration** | "ё" vs "е" mismatches | Normalize Russian text (replace ё with е) |
| **Testing** | Not testing with Russian morphology | Test query variations: подключение/подключения/подключений |
| **Testing** | Desktop-only testing | Test on mobile (full-screen modal, tap targets) |
| **Testing** | No loading/empty states | Design and test all states (loading, empty, error, initial) |
| **CI/CD** | Stale search index | Integrate index generation into build, cache-bust |
| **CI/CD** | Different encoding in CI vs local | Configure CI locale (LANG=en_US.UTF-8) |
| **Deployment** | CDN caching stale index | Set Cache-Control headers, bust cache on deploy |
| **Monitoring** | No tracking of zero-result queries | Log queries with no results to identify gaps |

---

## Testing Checklist

Before shipping search feature:

**Bundle & Performance:**
- [ ] Search index < 150KB gzipped
- [ ] Index loads in < 500ms on Fast 3G
- [ ] Search query responds in < 100ms after index loaded
- [ ] Build time with index generation < 2 minutes for 65 lessons
- [ ] Parallel index generation implemented

**Russian Language:**
- [ ] Russian stemming configured (Lunr.js + lunr-languages or Pagefind)
- [ ] Test queries: "репликация", "репликации", "репликацию" all match
- [ ] Russian stop words configured ("это", "все", "для", etc.)
- [ ] "ё" normalizes to "е" in both index and queries
- [ ] Case-insensitive search works for Cyrillic

**Encoding:**
- [ ] All file operations use explicit UTF-8 encoding
- [ ] Cyrillic displays correctly in search results (no mojibake)
- [ ] Build test verifies encoding roundtrip
- [ ] CI/CD locale set to UTF-8

**Content Indexing:**
- [ ] MDX component content indexed (Callout, Tabs)
- [ ] Code blocks excluded from index OR weighted very low
- [ ] Relevance ranking tested (specific > generic)
- [ ] Title matches rank higher than content matches

**Modal UX:**
- [ ] Cmd+K opens modal (macOS)
- [ ] Ctrl+K opens modal (Windows/Linux)
- [ ] "/" fallback shortcut works
- [ ] Shortcut doesn't intercept in input fields
- [ ] Escape closes modal reliably
- [ ] Focus trapped inside modal
- [ ] Body scroll locked when modal open
- [ ] Click outside closes modal

**Accessibility:**
- [ ] Search results readable on glass background (contrast 4.5:1)
- [ ] Keyboard navigation works (Tab, Arrow keys)
- [ ] Screen reader announces modal correctly (aria-modal, role="dialog")
- [ ] Focus returns to trigger button on close
- [ ] Loading/empty/error states have proper ARIA labels

**Mobile:**
- [ ] Search button tap target ≥ 44px
- [ ] Modal full-screen on mobile (not tiny desktop modal)
- [ ] On-screen keyboard doesn't hide results
- [ ] Scrolling results doesn't accidentally close modal
- [ ] Touch interactions work (tap to select result)

**States:**
- [ ] Loading state shown while fetching index
- [ ] Searching state shown during query
- [ ] Empty state with helpful guidance
- [ ] Error state with retry option
- [ ] Initial state with suggestions/popular searches

**CI/CD & Freshness:**
- [ ] Search index regenerates on every build
- [ ] Index generation integrated into Astro build hook
- [ ] Cache-Control headers set (max-age=3600, must-revalidate)
- [ ] CDN cache purged on deploy
- [ ] Newly published lessons searchable immediately after deploy

**Relevance:**
- [ ] Test query: "настройка репликации" returns relevant lessons in top 3
- [ ] Exact title match ranks #1
- [ ] Code-heavy lessons don't dominate results
- [ ] Technical stop words not over-boosting ("debezium", "kafka")

---

## Sources

**Authoritative (HIGH confidence):**
- [Static Site Search Made Easy With DocSearch](https://snipcart.com/blog/static-site-search)
- [How to add fast, client-side search to Astro static sites - Evil Martians](https://evilmartians.com/chronicles/how-to-add-fast-client-side-search-to-astro-static-sites)
- [Adding search to static Astro sites - Thomas Ledoux](https://www.thomasledoux.be/blog/search-static-astro-website)
- [Pagefind: Static Site Search](https://pagefind.app/)
- [Lunr.js Language Support](https://lunrjs.com/guides/language_support.html)
- [Russian stemming algorithm - Snowball](https://snowballstem.org/algorithms/russian/stemmer.html)

**Library Comparisons (MEDIUM confidence):**
- [fuse.js vs minisearch vs flexsearch vs elasticlunr - npm-compare](https://npm-compare.com/elasticlunr,flexsearch,fuse.js,minisearch)
- [Best Search Packages for JavaScript - Mattermost](https://mattermost.com/blog/best-search-packages-for-javascript/)
- [Comparing Static Site Generator Build Times - CSS-Tricks](https://css-tricks.com/comparing-static-site-generator-build-times/)

**Performance & Build (MEDIUM confidence):**
- [Scaling Astro to 10,000+ Pages - Astro Blog](https://astro.build/blog/experimental-static-build/)
- [Astro Build Speed Optimization - Bitdoze](https://www.bitdoze.com/astro-ssg-build-optimization/)
- [How We Cut Astro Build Time from 30 to 5 Minutes - Medium](https://medium.com/@mohdkhan.mk99/how-we-cut-astro-build-time-from-30-minutes-to-5-minutes-83-faster-115349727060)

**Keyboard Shortcuts (MEDIUM confidence):**
- [Conflicts with Browser Shortcut - GitHub Community Discussion](https://github.com/orgs/community/discussions/24057)
- [Shortcut Conflict for cmd+K - Cursor Forum](https://forum.cursor.com/t/shortcut-conflict-for-cmd-k-terminal-clear-and-ai-window/22693)
- [How to build a Cmd+K search modal - Hey World](https://world.hey.com/alexandre/how-to-build-a-cmd-k-search-modal-with-hotwire-981f5159)

**Unicode & Cyrillic (MEDIUM confidence):**
- [Search for Russian letter range misses ё - Vim Issue](https://github.com/vim/vim/issues/1751)
- [Unicode String Searching - Russian Text - NIST](https://cfreds-archive.nist.gov/utf-16-russ.html)
- [Unicode and Cyrillic: Copy/Paste problems](https://winrus.com/cp_e.htm)

**CI/CD & Caching (MEDIUM confidence):**
- [Static Site Search with Strapi, Next.js, FuseJs & Cloudflare](https://strapi.io/blog/client-side-search-for-static-sites-with-strapi-nextjs-fusejs-and-cloudflare)
- [Continuous Delivery for Static Sites - CloudBees](https://www.cloudbees.com/blog/continuous-delivery-for-static-sites)
- [A Step-by-Step Guide: Deploying A Static Site - Netlify](https://www.netlify.com/blog/2016/10/27/a-step-by-step-guide-deploying-a-static-site-or-single-page-app/)

**Community Experience (LOW confidence, anecdotal):**
- [Adding client side search to a static site - Tom Hazledine](https://tomhazledine.com/client-side-search-static-site/)
- [Adding search to static websites - DEV Community](https://dev.to/adaschevici/adding-search-to-static-websites-3del)
- [Static Search with Pagefind - David Bushell](https://dbushell.com/2024/11/21/static-search-page-find/)
