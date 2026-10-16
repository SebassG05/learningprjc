# Graph Report - learningprjc  (2026-10-16)

## Corpus Check
- 268 files · ~611,467 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .http 10, .otf 4, .example 2)

## Summary
- 1236 nodes · 3149 edges · 67 communities (50 shown, 17 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 127 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d8a132d1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- motion.js
- Home.jsx
- AuthModal.jsx
- front_learningprjct/package.json
- keyframes.js
- ContactForm.jsx
- index.html App Shell
- App.jsx
- ref_path
- Cursos.jsx
- ref_fs
- userController.js
- dotenv
- geo.js
- GlobeCanvas.jsx
- mongoose
- backend_learningprjct/package.json
- workbox-4772ad73.js
- StrategyHandler
- Orbits.jsx
- devDependencies
- PrivacySection.jsx
- Reviews.jsx
- routes/index.js
- dependencies
- entregaEjercicioController.js
- User.js
- WorkboxError
- courseController.js
- react
- cargarCursoCompletoModelizacionCarbono.js
- Header.jsx
- Router
- dependencies
- course.routes.js
- PrecacheStrategy
- react-router-dom
- review.routes.js
- waitUntil
- Estructura de archivos
- Footer.jsx
- jwt.js
- mailService.js
- PrecacheInstallReportPlugin
- Acceso (Iniciar sesión / Registrarse) — diseño
- DawnScene.jsx
- store.js
- cargarTestAnforaTema6.js
- registerRoute
- scripts
- LazyAuthModal.jsx
- Test.js
- Ajustes.jsx
- cargarTestFinalAnfora.js
- useReviews.js
- cargarTestAnforaTema2.js
- vite.config.js
- reorganizarCursoCompleto.js
- autoprefixer
- README.md
- React Logo (cyan atom)

## God Nodes (most connected - your core abstractions)
1. `react` - 89 edges
2. `framer-motion` - 62 edges
3. `mongoose` - 50 edges
4. `lucide-react` - 49 edges
5. `dotenv` - 45 edges
6. `ease` - 38 edges
7. `duration` - 38 edges
8. `Button` - 29 edges
9. `react-router-dom` - 25 edges
10. `AnimatedRoutes()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Favicon (Cloudinary-hosted PNG logo)` --semantically_similar_to--> `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS] [semantically similar]
  front_learningprjct/index.html → front_learningprjct/public/vite.svg
- `Task 3: Carga diferida y precarga` --references--> `LazyAuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → front_learningprjct/src/components/auth/LazyAuthModal.jsx
- `2. Estructura` --references--> `usePageMeta()`  [INFERRED]
  front_learningprjct/docs/superpowers/specs/2026-10-15-ajustes-design.md → front_learningprjct/src/hooks/usePageMeta.js
- `2. Estado actual relevante` --references--> `AuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/specs/2026-10-14-acceso-design.md → front_learningprjct/src/components/auth/AuthModal.jsx
- `Acceso (Iniciar sesión / Registrarse) — plan de implementación` --references--> `LazyAuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → front_learningprjct/src/components/auth/LazyAuthModal.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google Translate i18n flow** — index_google_translate_script, index_googletranslateelementinit, index_google_translate_element, index_supported_languages, index_spanish_language_config [EXTRACTED 1.00]

## Communities (67 total, 17 thin omitted)

### Community 0 - "motion.js"
Cohesion: 0.16
Nodes (17): TestEvaluacion(), cards, OTHERS, tones, fade, duration, ease, panel (+9 more)

### Community 1 - "Home.jsx"
Cohesion: 0.10
Nodes (41): Tarea 1: lienzo a nivel de página (`JourneyStage`), ContactHero(), Card(), FloatingCards(), emitPulse(), setReviewCount(), useJourneyHorizon(), useJourneySection() (+33 more)

### Community 2 - "AuthModal.jsx"
Cohesion: 0.06
Nodes (56): Acceso (Iniciar sesión / Registrarse) — plan de implementación, Global Constraints, Review Focus, Task 0: Capturas "antes", Task 10: Verificación final, Task 1: Tokens y utilidades puras, Task 3: Carga diferida y precarga, Task 4: `AuthDialog`, la estructura accesible (+48 more)

### Community 3 - "front_learningprjct/package.json"
Cohesion: 0.11
Nodes (19): name, private, type, version, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks (+11 more)

### Community 4 - "keyframes.js"
Cohesion: 0.11
Nodes (35): Tarea 2: trayectoria de cámara, Task 2: Puente `journey.overlay` y atenuación del globo, 11. Archivos, Director(), ARRIVAL, base, blendFrames(), carryAt() (+27 more)

### Community 5 - "ContactForm.jsx"
Cohesion: 0.07
Nodes (39): CampusRing(), ContactBackdrop(), COURSE_ICONS, Orbit(), Sevilla(), ContactChannel(), ContactChannels(), ContactForm (+31 more)

### Community 6 - "index.html App Shell"
Cohesion: 0.18
Nodes (12): Vite Logo (purple-blue gradient bolt), Favicon (Cloudinary-hosted PNG logo), Hidden Google Translate Element, Google Translate element.js Script, googleTranslateElementInit(), index.html App Shell, /src/main.jsx Module Entry, Page Title: Evenor-Tech_Campus (+4 more)

### Community 7 - "App.jsx"
Cohesion: 0.11
Nodes (30): AnimatedRoutes(), App(), CorreccionesAdmin, CursoDetalle, CursoInscripcion, EntregaEjercicio, EstructuraCursoPage, ForgotPassword (+22 more)

### Community 8 - "ref_path"
Cohesion: 0.07
Nodes (16): __dirname, __filename, __dirname, __filename, __dirname, __filename, __dirname, __filename (+8 more)

### Community 9 - "Cursos.jsx"
Cohesion: 0.16
Nodes (14): Container(), ParallaxImage(), wordVariants, StickyIntro(), fadeUp, fadeUpSoft, inView, scrollSpring (+6 more)

### Community 10 - "ref_fs"
Cohesion: 0.12
Nodes (8): __dirname, __filename, __dirname, __filename, __dirname, __filename, __dirname, __filename

### Community 11 - "userController.js"
Cohesion: 0.12
Nodes (25): changePreferredLanguage(), completeCourse(), completeTest(), enrollInCourse(), getAdminCourseEnrollments(), getCurrentUser(), getEnrollmentStatus(), getUserEnrollments() (+17 more)

### Community 12 - "dotenv"
Cohesion: 0.15
Nodes (8): actualizarEjercicio(), crearEjercicio(), eliminarEjercicio(), obtenerEjercicioPorId(), obtenerEjerciciosCurso(), Ejercicio, ejercicioSchema, dotenv

### Community 13 - "geo.js"
Cohesion: 0.53
Nodes (3): LAND_BITS, LAND_H, LAND_W

### Community 14 - "GlobeCanvas.jsx"
Cohesion: 0.11
Nodes (33): ARCS, GLOBE, HUB, LIGHT_DIR, ORBITS, QUALITY, Atmosphere(), Graticule() (+25 more)

### Community 15 - "mongoose"
Cohesion: 0.08
Nodes (8): courseSchema, materialSchema, temaSchema, entregaEjercicioSchema, userProgressSchema, __dirname, __filename, mongoose

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
Cohesion: 0.24
Nodes (14): Tarea 4: `OrbitScene` (Reseñas), armGeo, bodyGeo, OrbitLine(), Orbits(), panelGeo, Satellite(), circleGeometry() (+6 more)

### Community 20 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 21 - "PrivacySection.jsx"
Cohesion: 0.08
Nodes (31): 1. Dirección, 2. Estructura, 3. Comportamiento que se mantiene, 4. Arreglo de lógica aprobado, 5. Presentación nueva derivada del estado existente, 6. Textos aplicados, 7. Pendiente de decisión, Ajustes (`/ajustes`) — diseño (+23 more)

### Community 22 - "Reviews.jsx"
Cohesion: 0.05
Nodes (80): SubmitButton(), SAMPLES, OwnActions(), OwnReview(), Avatar(), AVATAR_TONES, canHover(), ReviewCard() (+72 more)

### Community 23 - "routes/index.js"
Cohesion: 0.13
Nodes (14): app, proxyPdf(), configureExpress(), errorHandler(), notFound(), router, router, router (+6 more)

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

### Community 29 - "react"
Cohesion: 0.18
Nodes (12): EjercicioOptativo(), MaterialEstudio(), ObjetivosCurso(), ObjetivosSuelos(), UserContext, UserProvider(), useUser(), CursoDetalle() (+4 more)

### Community 30 - "cargarCursoCompletoModelizacionCarbono.js"
Cohesion: 0.24
Nodes (8): cargarTodoElCurso(), ejecutarScript(), execPromise, scripts, ejecutarPaso(), execPromise, pasos, recuperacionCompleta()

### Community 31 - "Header.jsx"
Cohesion: 0.24
Nodes (11): Avatar(), Header(), NavItem(), Logo(), MotionLink, MobileMenu(), accountLinks, baseLinks (+3 more)

### Community 33 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, framer-motion, lenis, lucide-react, react, react-dom, @react-oauth/google, react-router-dom (+3 more)

### Community 34 - "course.routes.js"
Cohesion: 0.17
Nodes (11): autenticar(), soloAdmin(), generateUniqueFilename(), handleMulterError(), storageDinamico, upload, router, uploadFieldsWrapper() (+3 more)

### Community 36 - "react-router-dom"
Cohesion: 0.29
Nodes (9): 2. Estado actual relevante, AdminCursos(), ToastContext, ToastProvider(), useToast(), CorreccionesAdmin(), ForgotPassword(), ResetPassword() (+1 more)

### Community 37 - "review.routes.js"
Cohesion: 0.16
Nodes (21): cooldown(), createReview(), deleteReview(), getReviews(), getReviewStatus(), isOwner(), nextReviewAt(), REVIEW_COOLDOWN_MS (+13 more)

### Community 38 - "waitUntil"
Cohesion: 0.28
Nodes (4): cleanupOutdatedCaches(), NetworkFirst, printCleanupDetails(), waitUntil()

### Community 39 - "Estructura de archivos"
Cohesion: 0.17
Nodes (11): Estructura de archivos, Fondo "Viaje de vuelta a la Tierra" — plan de implementación, Restricciones globales, Revisión: puntos de fallo, Tarea 0: rama y capturas "antes", Tarea 3: `DeepSpaceScene` (FAQ), Tarea 5: `DawnScene` (CTA), Tarea 6: reduced motion, móvil y gama baja (+3 more)

### Community 40 - "Footer.jsx"
Cohesion: 0.31
Nodes (8): contact, Footer(), FooterBottom(), FooterColumn(), legalLinks, navGroups, social, SocialLink()

### Community 41 - "jwt.js"
Cohesion: 0.18
Nodes (8): assertJwtConfig(), getJwtSecret(), signToken(), verifyToken(), obtenerTestPorTema(), authenticateJWT(), optionalAuth(), jsonwebtoken

### Community 42 - "mailService.js"
Cohesion: 0.21
Nodes (14): contactFormHandler(), router, buildContactEmail(), C, detailRow(), escapeHtml(), firstName(), formatDate() (+6 more)

### Community 43 - "PrecacheInstallReportPlugin"
Cohesion: 0.29
Nodes (3): _nestedGroup(), PrecacheInstallReportPlugin, printInstallDetails()

### Community 44 - "Acceso (Iniciar sesión / Registrarse) — diseño"
Cohesion: 0.13
Nodes (14): 10. Pendiente de decisión, 12. Verificación, 1. Objetivo y límites, 3. Composición, 4. Componentes (`src/components/auth/`), 5. Formularios, 7. Movimiento (tokens de `lib/motion.js`), 8. Móvil (360–390 px) (+6 more)

### Community 45 - "DawnScene.jsx"
Cohesion: 0.21
Nodes (14): Moon(), glowTexture(), CAMERA_Z, pxToWorld(), silhouetteTop(), takePulse(), DawnScene(), SIDES (+6 more)

### Community 46 - "store.js"
Cohesion: 0.13
Nodes (21): 6. Diálogo, Globo mientras el diálogo está abierto (`GlobeCanvas` → `Director`), StillInvalidator(), CanvasBoundary, FallbackImage(), GlobeAnchor(), GlobeCanvas, GlobeStage() (+13 more)

### Community 48 - "registerRoute"
Cohesion: 0.40
Nodes (3): RegExpRoute, registerRoute(), Route

### Community 49 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 51 - "Test.js"
Cohesion: 0.12
Nodes (7): opcionSchema, preguntaSchema, testSchema, __dirname, __filename, __dirname, __filename

### Community 52 - "Ajustes.jsx"
Cohesion: 0.60
Nodes (3): SettingsHeader(), Ajustes(), page

### Community 54 - "useReviews.js"
Cohesion: 0.30
Nodes (13): idOf(), toDate(), token(), unwrap(), useReviews(), apiUrl(), deleteReview(), fetchReviews() (+5 more)

### Community 56 - "vite.config.js"
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

## Ambiguous Edges - Review These
- `Favicon (Cloudinary-hosted PNG logo)` → `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS]
  front_learningprjct/index.html · relation: semantically_similar_to

## Knowledge Gaps
- **18 isolated node(s):** `mongodb`, `nodemon`, `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 384 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `motion.js`, `Home.jsx`, `AuthModal.jsx`, `front_learningprjct/package.json`, `react-router-dom`, `ContactForm.jsx`, `App.jsx`, `Cursos.jsx`, `DawnScene.jsx`, `GlobeCanvas.jsx`, `store.js`, `LazyAuthModal.jsx`, `Orbits.jsx`, `PrivacySection.jsx`, `Reviews.jsx`, `useReviews.js`, `Header.jsx`?**
  _High betweenness centrality (0.227) - this node is a cross-community bridge._
- **What connects `mongodb`, `nodemon`, `@tailwindcss/postcss` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10083256244218317 - nodes in this community are weakly interconnected._
- **Why does `mongoose` connect `mongoose` to `review.routes.js`, `ref_path`, `ref_fs`, `userController.js`, `dotenv`, `cargarTestAnforaTema6.js`, `backend_learningprjct/package.json`, `Test.js`, `cargarTestAnforaTema2.js`, `cargarTestFinalAnfora.js`, `routes/index.js`, `reorganizarCursoCompleto.js`, `User.js`?**
  _High betweenness centrality (0.170) - this node is a cross-community bridge._
- **Should `AuthModal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.055855855855855854 - nodes in this community are weakly interconnected._
- **Why does `Global Constraints` connect `AuthModal.jsx` to `StrategyHandler`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Favicon (Cloudinary-hosted PNG logo)` and `Vite Logo (purple-blue gradient bolt)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._