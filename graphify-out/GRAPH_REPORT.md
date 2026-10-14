# Graph Report - front_learningprjct  (2026-10-13)

## Corpus Check
- 70 files · ~63,063 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .otf 4, .example 1, (none) 1)

## Summary
- 385 nodes · 999 edges · 20 communities (14 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.82)
- Token cost: 56,000 input · 0 output

## Community Hubs (Navigation)
- Course Pages & Icons
- App Routing & Smooth Scroll
- UI Primitives (Button, Container)
- Runtime Dependencies
- Workbox Strategies
- Auth & Header
- HTML Shell & Branding
- Dev Tooling
- Layout & Cookie Consent
- Workbox Utilities
- Precache Controller
- SW Route Registration
- SW Router
- Precache Install Reporting
- Cache Cleanup
- Precache Cache Keys
- Deferred Helper

## God Nodes (most connected - your core abstractions)
1. `react` - 47 edges
2. `framer-motion` - 33 edges
3. `lucide-react` - 26 edges
4. `AnimatedRoutes()` - 25 edges
5. `react-router-dom` - 23 edges
6. `ease` - 22 edges
7. `duration` - 22 edges
8. `useUser()` - 21 edges
9. `StrategyHandler` - 15 edges
10. `SplitText()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Favicon (Cloudinary-hosted PNG logo)` --semantically_similar_to--> `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS] [semantically similar]
  index.html → public/vite.svg
- `React + Vite Template` --conceptually_related_to--> `Vite Logo (purple-blue gradient bolt)`  [INFERRED]
  README.md → public/vite.svg
- `React + Vite Template` --conceptually_related_to--> `React Logo (cyan atom)`  [INFERRED]
  README.md → src/assets/react.svg
- `AnimatedRoutes()` --calls--> `Ajustes()`  [EXTRACTED]
  src/App.jsx → src/pages/Ajustes.jsx
- `AnimatedRoutes()` --calls--> `Home()`  [EXTRACTED]
  src/App.jsx → src/pages/Home.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google Translate i18n flow** — index_google_translate_script, index_googletranslateelementinit, index_google_translate_element, index_supported_languages, index_spanish_language_config [EXTRACTED 1.00]
- **React Fast Refresh toolchain options** — readme_vitejs_plugin_react, readme_vitejs_plugin_react_swc, readme_babel, readme_swc, readme_fast_refresh [EXTRACTED 1.00]

## Communities (20 total, 6 thin omitted)

### Community 0 - "Course Pages & Icons"
Cohesion: 0.10
Nodes (35): framer-motion, lucide-react, react, react-router-dom, EjercicioOptativo(), EstructuraCurso(), MaterialEstudio(), ObjetivosCurso() (+27 more)

### Community 1 - "App Routing & Smooth Scroll"
Cohesion: 0.09
Nodes (38): lenis, AnimatedRoutes(), App(), CorreccionesAdmin, CursoDetalle, CursoInscripcion, EntregaEjercicio, EstructuraCursoPage (+30 more)

### Community 2 - "UI Primitives (Button, Container)"
Cohesion: 0.11
Nodes (38): Button, buttonClass(), MotionLink, sizes, variants, Container(), Reveal(), SectionHeading() (+30 more)

### Community 3 - "Runtime Dependencies"
Cohesion: 0.06
Nodes (35): dependencies, framer-motion, lenis, lucide-react, react, react-dom, @react-oauth/google, react-router-dom (+27 more)

### Community 4 - "Workbox Strategies"
Cohesion: 0.14
Nodes (6): NetworkFirst, PrecacheStrategy, Strategy, StrategyHandler, toRequest(), WorkboxError

### Community 5 - "Auth & Header"
Cohesion: 0.13
Nodes (21): react-dom, @react-oauth/google, AdminCursos(), AuthModal(), GoogleAuthButton(), Header(), menuItems, MotionLink (+13 more)

### Community 6 - "HTML Shell & Branding"
Cohesion: 0.12
Nodes (20): Favicon (Cloudinary-hosted PNG logo), Hidden Google Translate Element, Google Translate element.js Script, googleTranslateElementInit(), index.html App Shell, /src/main.jsx Module Entry, Page Title: Evenor-Tech_Campus, #root React Mount Point (+12 more)

### Community 7 - "Dev Tooling"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 8 - "Layout & Cookie Consent"
Cohesion: 0.20
Nodes (9): CookiePreferences(), CookieBanner(), CookieSettings(), Layout(), PageBackground(), CookieConsentContext, CookieConsentProvider(), useCookieConsent() (+1 more)

### Community 9 - "Workbox Utilities"
Cohesion: 0.19
Nodes (9): cacheMatchIgnoreParams(), cacheWillUpdate(), canConstructResponseFromBodyStream(), copyResponse(), executeQuotaErrorCallbacks(), generateURLVariations(), removeIgnoredSearchParams(), stripParams() (+1 more)

### Community 10 - "Precache Controller"
Cohesion: 0.21
Nodes (3): createCacheKey(), PrecacheController, PrecacheRoute

### Community 11 - "SW Route Registration"
Cohesion: 0.25
Nodes (6): addRoute(), precache(), precacheAndRoute(), RegExpRoute, registerRoute(), Route

### Community 13 - "Precache Install Reporting"
Cohesion: 0.29
Nodes (3): _nestedGroup(), PrecacheInstallReportPlugin, printInstallDetails()

### Community 14 - "Cache Cleanup"
Cohesion: 0.40
Nodes (3): cleanupOutdatedCaches(), printCleanupDetails(), waitUntil()

## Ambiguous Edges - Review These
- `Favicon (Cloudinary-hosted PNG logo)` → `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS]
  index.html · relation: semantically_similar_to

## Knowledge Gaps
- **18 isolated node(s):** `@tailwindcss/postcss`, `@types/react`, `@types/react-dom`, `eslint`, `postcss` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 110 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Course Pages & Icons` to `App Routing & Smooth Scroll`, `UI Primitives (Button, Container)`, `Runtime Dependencies`, `Auth & Header`, `Layout & Cookie Consent`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **What connects `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Course Pages & Icons` be split into smaller, more focused modules?**
  _Cohesion score 0.10316066725197541 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Dev Tooling` to `Runtime Dependencies`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `App Routing & Smooth Scroll` be split into smaller, more focused modules?**
  _Cohesion score 0.08668076109936575 - nodes in this community are weakly interconnected._
- **Why does `framer-motion` connect `Course Pages & Icons` to `App Routing & Smooth Scroll`, `UI Primitives (Button, Container)`, `Runtime Dependencies`, `Auth & Header`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Favicon (Cloudinary-hosted PNG logo)` and `Vite Logo (purple-blue gradient bolt)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._