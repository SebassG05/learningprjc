# Graph Report - learningprjc  (2026-10-15)

## Corpus Check
- 258 files · ~608,919 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .http 10, .otf 4, .example 2)

## Summary
- 1199 nodes · 3023 edges · 74 communities (58 shown, 16 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 122 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00097e50`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- motion.js
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
- dotenv
- geo.js
- GlobeCanvas.jsx
- mongoose
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
- useUser
- cargarCursoCompletoModelizacionCarbono.js
- Header.jsx
- Router
- dependencies
- course.routes.js
- PrecacheStrategy
- react
- review.routes.js
- waitUntil
- Review Focus
- Footer.jsx
- jwt.js
- mailService.js
- PrecacheInstallReportPlugin
- Acceso (Iniciar sesión / Registrarse) — diseño
- DawnScene.jsx
- reviewFormat.js
- cargarTestAnforaTema6.js
- registerRoute
- scripts
- ReviewCard.jsx
- Test.js
- AuthGlobe.jsx
- cargarTestFinalAnfora.js
- useReviews.js
- cargarTestAnforaTema2.js
- vite.config.js
- reorganizarCursoCompleto.js
- autoprefixer
- README.md
- React Logo (cyan atom)
- AuthDialog.jsx
- ReviewComposer.jsx
- validation.js
- reviewsCopy.js
- ContactForm.jsx
- ReviewsSummary.jsx
- useReviewForm.js

## God Nodes (most connected - your core abstractions)
1. `react` - 84 edges
2. `framer-motion` - 57 edges
3. `mongoose` - 50 edges
4. `dotenv` - 45 edges
5. `lucide-react` - 45 edges
6. `ease` - 36 edges
7. `duration` - 36 edges
8. `react-router-dom` - 25 edges
9. `AnimatedRoutes()` - 25 edges
10. `AuthModal()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Favicon (Cloudinary-hosted PNG logo)` --semantically_similar_to--> `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS] [semantically similar]
  front_learningprjct/index.html → front_learningprjct/public/vite.svg
- `Task 3: Carga diferida y precarga` --references--> `LazyAuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → front_learningprjct/src/components/auth/LazyAuthModal.jsx
- `Tarea 5: `DawnScene` (CTA)` --references--> `Item()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-13-inicio-fondo-viaje.md → front_learningprjct/src/components/ui/Reveal.jsx
- `Acceso (Iniciar sesión / Registrarse) — plan de implementación` --references--> `AuthDialog()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → front_learningprjct/src/components/auth/AuthDialog.jsx
- `Acceso (Iniciar sesión / Registrarse) — plan de implementación` --references--> `AuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → front_learningprjct/src/components/auth/AuthModal.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google Translate i18n flow** — index_google_translate_script, index_googletranslateelementinit, index_google_translate_element, index_supported_languages, index_spanish_language_config [EXTRACTED 1.00]

## Communities (74 total, 16 thin omitted)

### Community 0 - "motion.js"
Cohesion: 0.17
Nodes (16): TestEvaluacion(), cards, OTHERS, tones, duration, ease, panel, press (+8 more)

### Community 1 - "Home.jsx"
Cohesion: 0.07
Nodes (62): Estructura de archivos, Fondo "Viaje de vuelta a la Tierra" — plan de implementación, Restricciones globales, Revisión: puntos de fallo, Tarea 0: rama y capturas "antes", Tarea 1: lienzo a nivel de página (`JourneyStage`), Tarea 3: `DeepSpaceScene` (FAQ), Tarea 6: reduced motion, móvil y gama baja (+54 more)

### Community 2 - "AuthModal.jsx"
Cohesion: 0.24
Nodes (15): AuthModal(), ServerAlert(), Swap(), AuthTabs(), TABS, AutoHeight(), PasswordField, PasswordMatchAnnouncer() (+7 more)

### Community 3 - "front_learningprjct/package.json"
Cohesion: 0.11
Nodes (20): name, private, type, version, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks (+12 more)

### Community 4 - "keyframes.js"
Cohesion: 0.11
Nodes (37): Tarea 2: trayectoria de cámara, Globo mientras el diálogo está abierto (`GlobeCanvas` → `Director`), Director(), StillInvalidator(), ARRIVAL, base, blendFrames(), CAMERA_Z (+29 more)

### Community 5 - "Contacto.jsx"
Cohesion: 0.08
Nodes (30): CampusRing(), ContactBackdrop(), COURSE_ICONS, Orbit(), Sevilla(), ContactChannel(), ContactChannels(), ContactHero() (+22 more)

### Community 6 - "index.html App Shell"
Cohesion: 0.18
Nodes (12): Vite Logo (purple-blue gradient bolt), Favicon (Cloudinary-hosted PNG logo), Hidden Google Translate Element, Google Translate element.js Script, googleTranslateElementInit(), index.html App Shell, /src/main.jsx Module Entry, Page Title: Evenor-Tech_Campus (+4 more)

### Community 7 - "App.jsx"
Cohesion: 0.14
Nodes (28): AnimatedRoutes(), App(), CorreccionesAdmin, CursoDetalle, CursoInscripcion, EntregaEjercicio, EstructuraCursoPage, ForgotPassword (+20 more)

### Community 8 - "ref_path"
Cohesion: 0.07
Nodes (16): __dirname, __filename, __dirname, __filename, __dirname, __filename, __dirname, __filename (+8 more)

### Community 9 - "Cursos.jsx"
Cohesion: 0.19
Nodes (13): Container(), ParallaxImage(), Item(), StickyIntro(), fadeUp, fadeUpSoft, inView, scrollSpring (+5 more)

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
Cohesion: 0.33
Nodes (6): LandDots(), isLand(), landPoints(), LAND_BITS, LAND_H, LAND_W

### Community 14 - "GlobeCanvas.jsx"
Cohesion: 0.13
Nodes (27): ARCS, LIGHT_DIR, Atmosphere(), Graticule(), NightShade(), Sphere(), tmp, Arcs() (+19 more)

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
Cohesion: 0.17
Nodes (18): Tarea 4: `OrbitScene` (Reseñas), GLOBE, HUB, ORBITS, QUALITY, journey, armGeo, bodyGeo (+10 more)

### Community 20 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 21 - "CookieBanner.jsx"
Cohesion: 0.20
Nodes (9): CookiePreferences(), CookieBanner(), CookieSettings(), Layout(), PageBackground(), CookieConsentContext, CookieConsentProvider(), useCookieConsent() (+1 more)

### Community 22 - "Reviews.jsx"
Cohesion: 0.14
Nodes (21): SAMPLES, ratingDistribution(), ReviewInvite(), ReviewList(), Skeleton(), SKELETON_HEIGHTS, ReviewsBackdrop(), SPARKLES (+13 more)

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

### Community 29 - "useUser"
Cohesion: 0.17
Nodes (13): 2. Estado actual relevante, EjercicioOptativo(), MaterialEstudio(), ObjetivosCurso(), ObjetivosSuelos(), ToastProvider(), UserContext, UserProvider() (+5 more)

### Community 30 - "cargarCursoCompletoModelizacionCarbono.js"
Cohesion: 0.24
Nodes (8): cargarTodoElCurso(), ejecutarScript(), execPromise, scripts, ejecutarPaso(), execPromise, pasos, recuperacionCompleta()

### Community 31 - "Header.jsx"
Cohesion: 0.15
Nodes (14): 11. Archivos, LazyAuthModal(), LoadBoundary, Avatar(), Header(), NavItem(), Logo(), MotionLink (+6 more)

### Community 33 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, framer-motion, lenis, lucide-react, react, react-dom, @react-oauth/google, react-router-dom (+3 more)

### Community 34 - "course.routes.js"
Cohesion: 0.17
Nodes (11): autenticar(), soloAdmin(), generateUniqueFilename(), handleMulterError(), storageDinamico, upload, router, uploadFieldsWrapper() (+3 more)

### Community 36 - "react"
Cohesion: 0.21
Nodes (10): AdminCursos(), EstructuraCurso(), ToastContext, useToast(), CorreccionesAdmin(), EstructuraCursoPage(), ForgotPassword(), ResetPassword() (+2 more)

### Community 37 - "review.routes.js"
Cohesion: 0.16
Nodes (21): cooldown(), createReview(), deleteReview(), getReviews(), getReviewStatus(), isOwner(), nextReviewAt(), REVIEW_COOLDOWN_MS (+13 more)

### Community 38 - "waitUntil"
Cohesion: 0.28
Nodes (4): cleanupOutdatedCaches(), NetworkFirst, printCleanupDetails(), waitUntil()

### Community 39 - "Review Focus"
Cohesion: 0.13
Nodes (16): Acceso (Iniciar sesión / Registrarse) — plan de implementación, Global Constraints, Review Focus, Task 0: Capturas "antes", Task 10: Verificación final, Task 1: Tokens y utilidades puras, Task 2: Puente `journey.overlay` y atenuación del globo, Task 3: Carga diferida y precarga (+8 more)

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
Cohesion: 0.12
Nodes (15): 10. Pendiente de decisión, 12. Verificación, 1. Objetivo y límites, 3. Composición, 4. Componentes (`src/components/auth/`), 5. Formularios, 6. Diálogo, 7. Movimiento (tokens de `lib/motion.js`) (+7 more)

### Community 45 - "DawnScene.jsx"
Cohesion: 0.22
Nodes (14): Tarea 5: `DawnScene` (CTA), Moon(), glowTexture(), pxToWorld(), silhouetteTop(), takePulse(), DawnScene(), SIDES (+6 more)

### Community 46 - "reviewFormat.js"
Cohesion: 0.17
Nodes (13): average, clock, formatNextTime(), full, initialsOf(), MAX_TEXT, relative, startOfDay() (+5 more)

### Community 48 - "registerRoute"
Cohesion: 0.40
Nodes (3): RegExpRoute, registerRoute(), Route

### Community 49 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 50 - "ReviewCard.jsx"
Cohesion: 0.22
Nodes (15): OwnActions(), OwnReview(), Avatar(), AVATAR_TONES, canHover(), ReviewCard(), useTilt(), formatFullDate() (+7 more)

### Community 51 - "Test.js"
Cohesion: 0.12
Nodes (7): opcionSchema, preguntaSchema, testSchema, __dirname, __filename, __dirname, __filename

### Community 52 - "AuthGlobe.jsx"
Cohesion: 0.29
Nodes (5): AuthGlobe(), CanvasBoundary, GlobeCanvas, hasWebGL(), Horizon()

### Community 54 - "useReviews.js"
Cohesion: 0.30
Nodes (13): idOf(), toDate(), token(), unwrap(), useReviews(), apiUrl(), deleteReview(), fetchReviews() (+5 more)

### Community 56 - "vite.config.js"
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

### Community 66 - "AuthDialog.jsx"
Cohesion: 0.21
Nodes (16): Task 4: `AuthDialog`, la estructura accesible, AuthDialog(), AuthGlobe, canReceiveFocus(), console_, fade, fadeStage(), inertOutside() (+8 more)

### Community 68 - "ReviewComposer.jsx"
Cohesion: 0.23
Nodes (13): SubmitButton(), GeneralError(), ReviewComposer(), ReviewSent(), Spark(), StarRatingInput(), Button, buttonClass() (+5 more)

### Community 69 - "validation.js"
Cohesion: 0.32
Nodes (7): refresh(), useNativeValidation(), customMessage(), fieldMessage(), firstInvalid(), MISSING, ok

### Community 70 - "reviewsCopy.js"
Cohesion: 0.21
Nodes (9): HEADLINE, HEADLINES, INVITE, PAGE_DESCRIPTION, PAGE_TITLE, SUBTITLE, SUMMARY_EMPTY, VOICES (+1 more)

### Community 71 - "ContactForm.jsx"
Cohesion: 0.31
Nodes (7): ContactForm, FormAlert(), SentPanel(), TopicPicker(), SentSignal(), Field, inputClass

### Community 72 - "ReviewsSummary.jsx"
Cohesion: 0.47
Nodes (8): formatAverage(), MAX_RATING, reviewsLabel(), CountUp(), Distribution(), ReviewsSummary(), StarRating(), StarShape()

### Community 73 - "useReviewForm.js"
Cohesion: 0.47
Nodes (5): COMPOSER, EMPTY, focusSoon(), useReviewForm(), without()

## Ambiguous Edges - Review These
- `Favicon (Cloudinary-hosted PNG logo)` → `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS]
  front_learningprjct/index.html · relation: semantically_similar_to

## Knowledge Gaps
- **18 isolated node(s):** `mongodb`, `nodemon`, `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 375 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mongoose` connect `mongoose` to `review.routes.js`, `ref_path`, `ref_fs`, `userController.js`, `dotenv`, `cargarTestAnforaTema6.js`, `backend_learningprjct/package.json`, `Test.js`, `cargarTestAnforaTema2.js`, `cargarTestFinalAnfora.js`, `routes/index.js`, `reorganizarCursoCompleto.js`, `User.js`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._
- **What connects `mongodb`, `nodemon`, `@tailwindcss/postcss` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06627175120325805 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `motion.js`, `Home.jsx`, `AuthModal.jsx`, `front_learningprjct/package.json`, `Contacto.jsx`, `App.jsx`, `Cursos.jsx`, `GlobeCanvas.jsx`, `Orbits.jsx`, `CookieBanner.jsx`, `Reviews.jsx`, `useUser`, `Header.jsx`, `Review Focus`, `DawnScene.jsx`, `ReviewCard.jsx`, `AuthGlobe.jsx`, `useReviews.js`, `AuthDialog.jsx`, `ReviewComposer.jsx`, `validation.js`, `ContactForm.jsx`, `ReviewsSummary.jsx`, `useReviewForm.js`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Should `front_learningprjct/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._
- **Why does `Global Constraints` connect `Review Focus` to `StrategyHandler`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Favicon (Cloudinary-hosted PNG logo)` and `Vite Logo (purple-blue gradient bolt)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._