# Graph Report - learningprjc  (2026-10-15)

## Corpus Check
- 248 files · ~602,895 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .http 10, .otf 4, .example 2)

## Summary
- 1140 nodes · 2822 edges · 68 communities (52 shown, 16 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 119 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c2a5dc10`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- Home.jsx
- AuthModal.jsx
- front_learningprjct/package.json
- keyframes.js
- Contacto.jsx
- index.html App Shell
- App.jsx
- ref_path
- Cursos.jsx
- ref_fs
- userController.js
- mongoose
- GlobeCanvas.jsx
- Extras.jsx
- dotenv
- backend_learningprjct/package.json
- workbox-4772ad73.js
- StrategyHandler
- Orbits.jsx
- devDependencies
- CookieBanner.jsx
- Reviews.jsx
- routes/index.js
- dependencies
- entregaEjercicioController.js
- User.js
- WorkboxError
- courseController.js
- express.js
- cargarCursoCompletoModelizacionCarbono.js
- Acceso (Iniciar sesión / Registrarse) — diseño
- Router
- dependencies
- course.routes.js
- PrecacheStrategy
- reviewFormat.js
- review.routes.js
- waitUntil
- Estructura de archivos
- Footer.jsx
- testController.js
- mailService.js
- PrecacheInstallReportPlugin
- LazyAuthModal.jsx
- DeepSpaceScene.jsx
- GlobeStage.jsx
- store.js
- registerRoute
- scripts
- CTAScene
- Test.js
- AuthGlobe.jsx
- HeroScene
- fetchReviews
- cargarTestAnforaTema2.js
- vite.config.js
- cargarTestTema1.js
- autoprefixer
- README.md
- React Logo (cyan atom)
- cargarTestTema3.js
- cargarTestTema4.js

## God Nodes (most connected - your core abstractions)
1. `react` - 79 edges
2. `framer-motion` - 52 edges
3. `mongoose` - 50 edges
4. `dotenv` - 45 edges
5. `lucide-react` - 43 edges
6. `ease` - 33 edges
7. `duration` - 33 edges
8. `react-router-dom` - 25 edges
9. `AnimatedRoutes()` - 25 edges
10. `AuthModal()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Favicon (Cloudinary-hosted PNG logo)` --semantically_similar_to--> `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS] [semantically similar]
  front_learningprjct/index.html → front_learningprjct/public/vite.svg
- `2. Estado actual relevante` --references--> `AuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/specs/2026-10-14-acceso-design.md → front_learningprjct/src/components/auth/AuthModal.jsx
- `Acceso (Iniciar sesión / Registrarse) — plan de implementación` --references--> `LazyAuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → front_learningprjct/src/components/auth/LazyAuthModal.jsx
- `Task 3: Carga diferida y precarga` --references--> `LazyAuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → front_learningprjct/src/components/auth/LazyAuthModal.jsx
- `11. Archivos` --references--> `LazyAuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/specs/2026-10-14-acceso-design.md → front_learningprjct/src/components/auth/LazyAuthModal.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google Translate i18n flow** — index_google_translate_script, index_googletranslateelementinit, index_google_translate_element, index_supported_languages, index_spanish_language_config [EXTRACTED 1.00]

## Communities (68 total, 16 thin omitted)

### Community 0 - "react"
Cohesion: 0.06
Nodes (61): AdminCursos(), ContactForm, FormAlert(), SentPanel(), TopicPicker(), SentSignal(), EjercicioOptativo(), EstructuraCurso() (+53 more)

### Community 1 - "Home.jsx"
Cohesion: 0.16
Nodes (21): emitPulse(), notify(), setReviewCount(), useJourneySection(), disclose, AmbientBackdrop(), bento, FAQSection() (+13 more)

### Community 2 - "AuthModal.jsx"
Cohesion: 0.07
Nodes (53): Acceso (Iniciar sesión / Registrarse) — plan de implementación, Global Constraints, Review Focus, Task 0: Capturas "antes", Task 10: Verificación final, Task 1: Tokens y utilidades puras, Task 2: Puente `journey.overlay` y atenuación del globo, Task 4: `AuthDialog`, la estructura accesible (+45 more)

### Community 3 - "front_learningprjct/package.json"
Cohesion: 0.10
Nodes (21): name, private, type, version, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks (+13 more)

### Community 4 - "keyframes.js"
Cohesion: 0.12
Nodes (31): Tarea 2: trayectoria de cámara, Director(), ARRIVAL, base, blendFrames(), CAMERA_Z, carryAt(), centerForHorizon() (+23 more)

### Community 5 - "Contacto.jsx"
Cohesion: 0.08
Nodes (30): CampusRing(), ContactBackdrop(), COURSE_ICONS, Orbit(), Sevilla(), ContactChannel(), ContactChannels(), ContactHero() (+22 more)

### Community 6 - "index.html App Shell"
Cohesion: 0.18
Nodes (12): Vite Logo (purple-blue gradient bolt), Favicon (Cloudinary-hosted PNG logo), Hidden Google Translate Element, Google Translate element.js Script, googleTranslateElementInit(), index.html App Shell, /src/main.jsx Module Entry, Page Title: Evenor-Tech_Campus (+4 more)

### Community 7 - "App.jsx"
Cohesion: 0.11
Nodes (31): 2. Estado actual relevante, AnimatedRoutes(), App(), CorreccionesAdmin, CursoDetalle, CursoInscripcion, EntregaEjercicio, EstructuraCursoPage (+23 more)

### Community 8 - "ref_path"
Cohesion: 0.08
Nodes (14): __dirname, __filename, __dirname, __filename, __dirname, __filename, __dirname, __filename (+6 more)

### Community 9 - "Cursos.jsx"
Cohesion: 0.18
Nodes (18): Container(), ParallaxImage(), Reveal(), SectionHeading(), ScrubWord(), SplitText(), toWords(), wordVariants (+10 more)

### Community 10 - "ref_fs"
Cohesion: 0.12
Nodes (8): __dirname, __filename, __dirname, __filename, __dirname, __filename, __dirname, __filename

### Community 11 - "userController.js"
Cohesion: 0.12
Nodes (25): changePreferredLanguage(), completeCourse(), completeTest(), enrollInCourse(), getAdminCourseEnrollments(), getCurrentUser(), getEnrollmentStatus(), getUserEnrollments() (+17 more)

### Community 12 - "mongoose"
Cohesion: 0.14
Nodes (6): Ejercicio, ejercicioSchema, entregaEjercicioSchema, DATA_DIR, __dirname, mongoose

### Community 13 - "GlobeCanvas.jsx"
Cohesion: 0.16
Nodes (21): Atmosphere(), Graticule(), LandDots(), NightShade(), Sphere(), tmp, Arcs(), Dawn() (+13 more)

### Community 14 - "Extras.jsx"
Cohesion: 0.19
Nodes (14): coreGeo, ringGeo, Z, glowTexture(), pxToWorld(), silhouetteTop(), LAND_BITS, LAND_H (+6 more)

### Community 15 - "dotenv"
Cohesion: 0.09
Nodes (6): courseSchema, materialSchema, temaSchema, __dirname, __filename, dotenv

### Community 16 - "backend_learningprjct/package.json"
Cohesion: 0.11
Nodes (18): author, description, devDependencies, nodemon, keywords, license, main, name (+10 more)

### Community 17 - "workbox-4772ad73.js"
Cohesion: 0.13
Nodes (13): addRoute(), cacheMatchIgnoreParams(), cacheWillUpdate(), canConstructResponseFromBodyStream(), copyResponse(), Deferred, executeQuotaErrorCallbacks(), generateURLVariations() (+5 more)

### Community 18 - "StrategyHandler"
Cohesion: 0.24
Nodes (3): Strategy, StrategyHandler, toRequest()

### Community 19 - "Orbits.jsx"
Cohesion: 0.14
Nodes (21): Tarea 4: `OrbitScene` (Reseñas), ARCS, GLOBE, HUB, LIGHT_DIR, ORBITS, QUALITY, useNearSections() (+13 more)

### Community 20 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 21 - "CookieBanner.jsx"
Cohesion: 0.20
Nodes (9): CookiePreferences(), CookieBanner(), CookieSettings(), Layout(), PageBackground(), CookieConsentContext, CookieConsentProvider(), useCookieConsent() (+1 more)

### Community 22 - "Reviews.jsx"
Cohesion: 0.11
Nodes (27): ratingDistribution(), ReviewInvite(), ReviewList(), Skeleton(), SKELETON_HEIGHTS, ReviewsBackdrop(), COMPOSER, EMPTY (+19 more)

### Community 23 - "routes/index.js"
Cohesion: 0.16
Nodes (12): actualizarEjercicio(), crearEjercicio(), eliminarEjercicio(), obtenerEjercicioPorId(), obtenerEjerciciosCurso(), proxyPdf(), router, router (+4 more)

### Community 24 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, bcryptjs, cloudinary, cors, dotenv, express, express-validator, google-auth-library (+8 more)

### Community 25 - "entregaEjercicioController.js"
Cohesion: 0.19
Nodes (14): corregirEntrega(), __dirname, eliminarEntrega(), entregarEjercicio(), __filename, obtenerEntregasUsuarioCurso(), obtenerEntregaUsuario(), obtenerTodasLasEntregas() (+6 more)

### Community 26 - "User.js"
Cohesion: 0.14
Nodes (8): __dirname, __filename, userSchema, crearSuperAdmin(), preguntarConfirmacion(), rl, SUPERADMIN_CONFIG, bcryptjs

### Community 27 - "WorkboxError"
Cohesion: 0.19
Nodes (4): createCacheKey(), PrecacheController, PrecacheRoute, WorkboxError

### Community 29 - "express.js"
Cohesion: 0.26
Nodes (8): app, configureExpress(), errorHandler(), notFound(), router, cors, helmet, morgan

### Community 30 - "cargarCursoCompletoModelizacionCarbono.js"
Cohesion: 0.24
Nodes (8): cargarTodoElCurso(), ejecutarScript(), execPromise, scripts, ejecutarPaso(), execPromise, pasos, recuperacionCompleta()

### Community 31 - "Acceso (Iniciar sesión / Registrarse) — diseño"
Cohesion: 0.17
Nodes (11): 10. Pendiente de decisión, 12. Verificación, 1. Objetivo y límites, 3. Composición, 5. Formularios, 6. Diálogo, 7. Movimiento (tokens de `lib/motion.js`), 8. Móvil (360–390 px) (+3 more)

### Community 33 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, framer-motion, lenis, lucide-react, react, react-dom, @react-oauth/google, react-router-dom (+3 more)

### Community 34 - "course.routes.js"
Cohesion: 0.17
Nodes (11): autenticar(), soloAdmin(), generateUniqueFilename(), handleMulterError(), storageDinamico, upload, router, uploadFieldsWrapper() (+3 more)

### Community 36 - "reviewFormat.js"
Cohesion: 0.14
Nodes (25): Avatar(), AVATAR_TONES, ReviewCard(), average, formatAverage(), formatFullDate(), formatRelativeDate(), full (+17 more)

### Community 37 - "review.routes.js"
Cohesion: 0.16
Nodes (14): createReview(), getReviews(), serverError(), toPublic(), obtenerTestPorTema(), authenticateJWT(), optionalAuth(), clientIp() (+6 more)

### Community 38 - "waitUntil"
Cohesion: 0.28
Nodes (4): cleanupOutdatedCaches(), NetworkFirst, printCleanupDetails(), waitUntil()

### Community 39 - "Estructura de archivos"
Cohesion: 0.22
Nodes (8): Estructura de archivos, Fondo "Viaje de vuelta a la Tierra" — plan de implementación, Restricciones globales, Revisión: puntos de fallo, Tarea 0: rama y capturas "antes", Tarea 3: `DeepSpaceScene` (FAQ), Tarea 6: reduced motion, móvil y gama baja, Tarea 7: revisión y cierre

### Community 40 - "Footer.jsx"
Cohesion: 0.31
Nodes (8): contact, Footer(), FooterBottom(), FooterColumn(), legalLinks, navGroups, social, SocialLink()

### Community 42 - "mailService.js"
Cohesion: 0.24
Nodes (13): contactFormHandler(), buildContactEmail(), C, detailRow(), escapeHtml(), firstName(), formatDate(), link() (+5 more)

### Community 43 - "PrecacheInstallReportPlugin"
Cohesion: 0.29
Nodes (3): _nestedGroup(), PrecacheInstallReportPlugin, printInstallDetails()

### Community 44 - "LazyAuthModal.jsx"
Cohesion: 0.21
Nodes (7): Task 3: Carga diferida y precarga, 4. Componentes (`src/components/auth/`), LazyAuthModal(), LoadBoundary, createLoader(), loadAuthModal, preloadAuthModal()

### Community 45 - "DeepSpaceScene.jsx"
Cohesion: 0.36
Nodes (8): Moon(), takePulse(), buildNetwork(), DeepSpaceScene(), outCubic(), QUESTION_NODES, usePrecompile(), @react-three/fiber

### Community 46 - "GlobeStage.jsx"
Cohesion: 0.21
Nodes (11): CanvasBoundary, FallbackImage(), GlobeAnchor(), GlobeCanvas, GlobeStage(), hasWebGL(), Placeholder(), getStatus() (+3 more)

### Community 47 - "store.js"
Cohesion: 0.20
Nodes (11): 11. Archivos, Globo mientras el diálogo está abierto (`GlobeCanvas` → `Director`), StillInvalidator(), journeyPosition(), stepSpring(), journey, listeners, progressOf() (+3 more)

### Community 48 - "registerRoute"
Cohesion: 0.40
Nodes (3): RegExpRoute, registerRoute(), Route

### Community 49 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 50 - "CTAScene"
Cohesion: 0.26
Nodes (9): Tarea 5: `DawnScene` (CTA), setCtaBoost(), useJourneyHorizon(), Item(), useMediaQuery(), useSceneProgress(), useScenesEnabled(), scrollSpring (+1 more)

### Community 51 - "Test.js"
Cohesion: 0.14
Nodes (7): opcionSchema, preguntaSchema, testSchema, __dirname, __filename, __dirname, __filename

### Community 52 - "AuthGlobe.jsx"
Cohesion: 0.29
Nodes (5): AuthGlobe(), CanvasBoundary, GlobeCanvas, hasWebGL(), Horizon()

### Community 53 - "HeroScene"
Cohesion: 0.38
Nodes (7): Tarea 1: lienzo a nivel de página (`JourneyStage`), Card(), FloatingCards(), FeatureCard(), HeroScene(), HeroVeil(), RisingCard()

### Community 54 - "fetchReviews"
Cohesion: 0.60
Nodes (4): apiUrl(), fetchReviews(), postReview(), ReviewApiError

### Community 56 - "vite.config.js"
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

## Ambiguous Edges - Review These
- `Favicon (Cloudinary-hosted PNG logo)` → `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS]
  front_learningprjct/index.html · relation: semantically_similar_to

## Knowledge Gaps
- **18 isolated node(s):** `mongodb`, `nodemon`, `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 364 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Router` connect `Router` to `workbox-4772ad73.js`?**
  _High betweenness centrality (0.429) - this node is a cross-community bridge._
- **What connects `mongodb`, `nodemon`, `@tailwindcss/postcss` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.060142711518858305 - nodes in this community are weakly interconnected._
- **Why does `configureExpress()` connect `express.js` to `Router`?**
  _High betweenness centrality (0.423) - this node is a cross-community bridge._
- **Should `AuthModal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06603346901854365 - nodes in this community are weakly interconnected._
- **Why does `Global Constraints` connect `AuthModal.jsx` to `StrategyHandler`?**
  _High betweenness centrality (0.384) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Favicon (Cloudinary-hosted PNG logo)` and `Vite Logo (purple-blue gradient bolt)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._