# Graph Report - front_learningprjct  (2026-10-13)

## Corpus Check
- 81 files · ~481,901 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .otf 4, .example 1, (none) 1)

## Summary
- 452 nodes · 1193 edges · 22 communities (16 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `08c2c909`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- GlobeCanvas.jsx
- Header.jsx
- react
- package.json
- App.jsx
- Home.jsx
- Cursos.jsx
- workbox-4772ad73.js
- StrategyHandler
- devDependencies
- CookieBanner.jsx
- WorkboxError
- Router
- PrecacheStrategy
- GlobeStage.jsx
- waitUntil
- PrecacheInstallReportPlugin
- registerRoute
- README.md

## God Nodes (most connected - your core abstractions)
1. `react` - 53 edges
2. `framer-motion` - 36 edges
3. `lucide-react` - 28 edges
4. `AnimatedRoutes()` - 25 edges
5. `react-router-dom` - 24 edges
6. `ease` - 24 edges
7. `duration` - 24 edges
8. `useUser()` - 21 edges
9. `StrategyHandler` - 15 edges
10. `Header()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `AnimatedRoutes()` --calls--> `Ajustes()`  [EXTRACTED]
  front_learningprjct/src/App.jsx → front_learningprjct/src/pages/Ajustes.jsx
- `AnimatedRoutes()` --calls--> `Cursos()`  [EXTRACTED]
  front_learningprjct/src/App.jsx → front_learningprjct/src/pages/Cursos.jsx
- `AnimatedRoutes()` --calls--> `Home()`  [EXTRACTED]
  front_learningprjct/src/App.jsx → front_learningprjct/src/pages/Home.jsx
- `AnimatedRoutes()` --calls--> `LoginPage()`  [EXTRACTED]
  front_learningprjct/src/App.jsx → front_learningprjct/src/pages/Login.jsx
- `AnimatedRoutes()` --calls--> `SobreNosotros()`  [EXTRACTED]
  front_learningprjct/src/App.jsx → front_learningprjct/src/pages/SobreNosotros.jsx

## Import Cycles
- None detected.

## Communities (22 total, 6 thin omitted)

### Community 0 - "GlobeCanvas.jsx"
Cohesion: 0.09
Nodes (45): @react-three/fiber, three, ARCS, GLOBE, HUB, LIGHT_DIR, ORBITS, QUALITY (+37 more)

### Community 1 - "Header.jsx"
Cohesion: 0.09
Nodes (35): react-dom, @react-oauth/google, react-router-dom, AdminCursos(), AuthModal(), GoogleAuthButton(), Avatar(), Header() (+27 more)

### Community 2 - "react"
Cohesion: 0.13
Nodes (23): framer-motion, lucide-react, react, EjercicioOptativo(), EstructuraCurso(), MaterialEstudio(), ObjetivosCurso(), TestEvaluacion() (+15 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (39): dependencies, framer-motion, lenis, lucide-react, react, react-dom, @react-oauth/google, react-router-dom (+31 more)

### Community 4 - "App.jsx"
Cohesion: 0.10
Nodes (35): lenis, AnimatedRoutes(), App(), CorreccionesAdmin, CursoDetalle, CursoInscripcion, EntregaEjercicio, EstructuraCursoPage (+27 more)

### Community 5 - "Home.jsx"
Cohesion: 0.14
Nodes (32): Card(), FloatingCards(), Button, Reveal(), SectionHeading(), useMediaQuery(), useSceneProgress(), useScenesEnabled() (+24 more)

### Community 6 - "Cursos.jsx"
Cohesion: 0.15
Nodes (20): Container(), ParallaxImage(), ScrubWord(), SplitText(), toWords(), wordVariants, StickyIntro(), fadeUp (+12 more)

### Community 7 - "workbox-4772ad73.js"
Cohesion: 0.13
Nodes (13): addRoute(), cacheMatchIgnoreParams(), cacheWillUpdate(), canConstructResponseFromBodyStream(), copyResponse(), Deferred, executeQuotaErrorCallbacks(), generateURLVariations() (+5 more)

### Community 8 - "StrategyHandler"
Cohesion: 0.24
Nodes (3): Strategy, StrategyHandler, toRequest()

### Community 9 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 10 - "CookieBanner.jsx"
Cohesion: 0.20
Nodes (9): CookiePreferences(), CookieBanner(), CookieSettings(), Layout(), PageBackground(), CookieConsentContext, CookieConsentProvider(), useCookieConsent() (+1 more)

### Community 11 - "WorkboxError"
Cohesion: 0.19
Nodes (4): createCacheKey(), PrecacheController, PrecacheRoute, WorkboxError

### Community 14 - "GlobeStage.jsx"
Cohesion: 0.33
Nodes (6): CanvasBoundary, FallbackImage(), GlobeCanvas, GlobeStage(), hasWebGL(), Placeholder()

### Community 15 - "waitUntil"
Cohesion: 0.28
Nodes (4): cleanupOutdatedCaches(), NetworkFirst, printCleanupDetails(), waitUntil()

### Community 16 - "PrecacheInstallReportPlugin"
Cohesion: 0.29
Nodes (3): _nestedGroup(), PrecacheInstallReportPlugin, printInstallDetails()

### Community 17 - "registerRoute"
Cohesion: 0.40
Nodes (3): RegExpRoute, registerRoute(), Route

## Knowledge Gaps
- **9 isolated node(s):** `@tailwindcss/postcss`, `@types/react`, `@types/react-dom`, `eslint`, `postcss` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 121 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `GlobeCanvas.jsx`, `Header.jsx`, `package.json`, `App.jsx`, `Home.jsx`, `Cursos.jsx`, `CookieBanner.jsx`, `GlobeStage.jsx`?**
  _High betweenness centrality (0.216) - this node is a cross-community bridge._
- **What connects `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GlobeCanvas.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08686868686868687 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `Header.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08853410740203194 - nodes in this community are weakly interconnected._
- **Why does `framer-motion` connect `react` to `Header.jsx`, `package.json`, `App.jsx`, `Home.jsx`, `Cursos.jsx`, `GlobeStage.jsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.13434343434343435 - nodes in this community are weakly interconnected._