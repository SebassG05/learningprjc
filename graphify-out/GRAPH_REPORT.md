# Graph Report - learningprjc  (2026-10-14)

## Corpus Check
- 215 files · ~593,994 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .http 10, .otf 4, .example 2)

## Summary
- 989 nodes · 2397 edges · 66 communities (47 shown, 19 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 116 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8e61e1ab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- Home.jsx
- AuthModal.jsx
- front_learningprjct/package.json
- keyframes.js
- react-router-dom
- index.html App Shell
- App.jsx
- ref_path
- motion.js
- Test.js
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
- Header.jsx
- routes/index.js
- dependencies
- entregaEjercicioController.js
- User.js
- WorkboxError
- express.js
- cargarCursoCompletoModelizacionCarbono.js
- Acceso (Iniciar sesión / Registrarse) — diseño
- Router
- dependencies
- course.routes.js
- PrecacheStrategy
- useUser
- review.routes.js
- waitUntil
- Estructura de archivos
- Footer.jsx
- testController.js
- mailService.js
- PrecacheInstallReportPlugin
- LazyAuthModal.jsx
- DeepSpaceScene.jsx
- geo.js
- scripts
- registerRoute
- scripts
- cargarTestAnforaTema1.js
- cargarTestAnforaTema5.js
- cargarTestAnforaTema6.js
- cargarTestTema2.js
- reorganizarCursoCompleto.js
- Button.jsx
- vite.config.js
- autoprefixer
- README.md
- React Logo (cyan atom)

## God Nodes (most connected - your core abstractions)
1. `react` - 67 edges
2. `mongoose` - 50 edges
3. `dotenv` - 45 edges
4. `framer-motion` - 41 edges
5. `lucide-react` - 33 edges
6. `ease` - 26 edges
7. `duration` - 26 edges
8. `AnimatedRoutes()` - 25 edges
9. `react-router-dom` - 24 edges
10. `AuthModal()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Favicon (Cloudinary-hosted PNG logo)` --semantically_similar_to--> `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS] [semantically similar]
  front_learningprjct/index.html → front_learningprjct/public/vite.svg
- `Task 3: Carga diferida y precarga` --references--> `LazyAuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → front_learningprjct/src/components/auth/LazyAuthModal.jsx
- `2. Estado actual relevante` --references--> `AuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/specs/2026-10-14-acceso-design.md → front_learningprjct/src/components/auth/AuthModal.jsx
- `Acceso (Iniciar sesión / Registrarse) — plan de implementación` --references--> `LazyAuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → front_learningprjct/src/components/auth/LazyAuthModal.jsx
- `11. Archivos` --references--> `LazyAuthModal()`  [INFERRED]
  front_learningprjct/docs/superpowers/specs/2026-10-14-acceso-design.md → front_learningprjct/src/components/auth/LazyAuthModal.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google Translate i18n flow** — index_google_translate_script, index_googletranslateelementinit, index_google_translate_element, index_supported_languages, index_spanish_language_config [EXTRACTED 1.00]

## Communities (66 total, 19 thin omitted)

### Community 0 - "react"
Cohesion: 0.17
Nodes (14): EstructuraCurso(), TestEvaluacion(), cards, duration, ease, EstructuraCursoPage(), cookiesPropias, cookiesTerceros (+6 more)

### Community 1 - "Home.jsx"
Cohesion: 0.07
Nodes (59): Tarea 1: lienzo a nivel de página (`JourneyStage`), 2. Estado actual relevante, 4. Componentes (`src/components/auth/`), createLoader(), loadAuthModal, preloadAuthModal(), Card(), FloatingCards() (+51 more)

### Community 2 - "AuthModal.jsx"
Cohesion: 0.06
Nodes (56): Acceso (Iniciar sesión / Registrarse) — plan de implementación, Global Constraints, Review Focus, Task 0: Capturas "antes", Task 10: Verificación final, Task 1: Tokens y utilidades puras, Task 2: Puente `journey.overlay` y atenuación del globo, Task 3: Carga diferida y precarga (+48 more)

### Community 3 - "front_learningprjct/package.json"
Cohesion: 0.11
Nodes (20): name, private, type, version, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks (+12 more)

### Community 4 - "keyframes.js"
Cohesion: 0.12
Nodes (34): Tarea 2: trayectoria de cámara, Director(), ARRIVAL, base, blendFrames(), carryAt(), centerForHorizon(), clamp01() (+26 more)

### Community 5 - "react-router-dom"
Cohesion: 0.18
Nodes (12): AdminCursos(), ToastContext, ToastProvider(), useToast(), UserContext, UserProvider(), CorreccionesAdmin(), ForgotPassword() (+4 more)

### Community 6 - "index.html App Shell"
Cohesion: 0.18
Nodes (12): Vite Logo (purple-blue gradient bolt), Favicon (Cloudinary-hosted PNG logo), Hidden Google Translate Element, Google Translate element.js Script, googleTranslateElementInit(), index.html App Shell, /src/main.jsx Module Entry, Page Title: Evenor-Tech_Campus (+4 more)

### Community 7 - "App.jsx"
Cohesion: 0.13
Nodes (31): AnimatedRoutes(), App(), CorreccionesAdmin, CursoDetalle, CursoInscripcion, EntregaEjercicio, EstructuraCursoPage, ForgotPassword (+23 more)

### Community 8 - "ref_path"
Cohesion: 0.07
Nodes (16): __dirname, __filename, __dirname, __filename, __dirname, __filename, __dirname, __filename (+8 more)

### Community 9 - "motion.js"
Cohesion: 0.14
Nodes (23): tones, Container(), ParallaxImage(), ScrubWord(), SplitText(), toWords(), wordVariants, StickyIntro() (+15 more)

### Community 10 - "Test.js"
Cohesion: 0.08
Nodes (15): opcionSchema, preguntaSchema, testSchema, __dirname, __filename, __dirname, __filename, __dirname (+7 more)

### Community 11 - "userController.js"
Cohesion: 0.13
Nodes (23): obtenerTestPorTema(), changePreferredLanguage(), completeCourse(), enrollInCourse(), getAdminCourseEnrollments(), getCurrentUser(), getEnrollmentStatus(), getUserEnrollments() (+15 more)

### Community 12 - "mongoose"
Cohesion: 0.14
Nodes (9): actualizarEjercicio(), crearEjercicio(), eliminarEjercicio(), obtenerEjercicioPorId(), obtenerEjerciciosCurso(), Ejercicio, ejercicioSchema, entregaEjercicioSchema (+1 more)

### Community 13 - "GlobeCanvas.jsx"
Cohesion: 0.14
Nodes (24): 6. Diálogo, Globo mientras el diálogo está abierto (`GlobeCanvas` → `Director`), Atmosphere(), Graticule(), LandDots(), NightShade(), Sphere(), tmp (+16 more)

### Community 14 - "Extras.jsx"
Cohesion: 0.12
Nodes (21): Tarea 5: `DawnScene` (CTA), ARCS, GLOBE, HUB, LIGHT_DIR, ORBITS, QUALITY, coreGeo (+13 more)

### Community 15 - "dotenv"
Cohesion: 0.12
Nodes (4): courseSchema, materialSchema, temaSchema, dotenv

### Community 16 - "backend_learningprjct/package.json"
Cohesion: 0.10
Nodes (18): author, description, devDependencies, nodemon, keywords, license, main, name (+10 more)

### Community 17 - "workbox-4772ad73.js"
Cohesion: 0.13
Nodes (13): addRoute(), cacheMatchIgnoreParams(), cacheWillUpdate(), canConstructResponseFromBodyStream(), copyResponse(), Deferred, executeQuotaErrorCallbacks(), generateURLVariations() (+5 more)

### Community 18 - "StrategyHandler"
Cohesion: 0.24
Nodes (3): Strategy, StrategyHandler, toRequest()

### Community 19 - "Orbits.jsx"
Cohesion: 0.21
Nodes (16): Tarea 4: `OrbitScene` (Reseñas), journey, armGeo, bodyGeo, OrbitLine(), Orbits(), panelGeo, Satellite() (+8 more)

### Community 20 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 21 - "CookieBanner.jsx"
Cohesion: 0.20
Nodes (9): CookiePreferences(), CookieBanner(), CookieSettings(), Layout(), PageBackground(), CookieConsentContext, CookieConsentProvider(), useCookieConsent() (+1 more)

### Community 22 - "Header.jsx"
Cohesion: 0.24
Nodes (11): Avatar(), Header(), NavItem(), Logo(), MotionLink, MobileMenu(), accountLinks, baseLinks (+3 more)

### Community 23 - "routes/index.js"
Cohesion: 0.17
Nodes (10): contactFormHandler(), proxyPdf(), router, router, router, router, router, router (+2 more)

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
Nodes (11): 10. Pendiente de decisión, 11. Archivos, 12. Verificación, 1. Objetivo y límites, 3. Composición, 5. Formularios, 7. Movimiento (tokens de `lib/motion.js`), 8. Móvil (360–390 px) (+3 more)

### Community 33 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, framer-motion, lenis, lucide-react, react, react-dom, @react-oauth/google, react-router-dom (+3 more)

### Community 34 - "course.routes.js"
Cohesion: 0.29
Nodes (6): autenticar(), soloAdmin(), handleMulterError(), router, uploadFieldsWrapper(), uploadSingleWrapper()

### Community 36 - "useUser"
Cohesion: 0.38
Nodes (7): EjercicioOptativo(), MaterialEstudio(), ObjetivosCurso(), ObjetivosSuelos(), useUser(), CursoDetalle(), CursoInscripcion()

### Community 37 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getReviews(), authenticateJWT(), reviewSchema, express-validator

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
Cohesion: 0.43
Nodes (5): completeTest(), sendCourseCompletionEmailToUser(), sendCourseCompletionNotificationToAdmin(), transporter, nodemailer

### Community 43 - "PrecacheInstallReportPlugin"
Cohesion: 0.29
Nodes (3): _nestedGroup(), PrecacheInstallReportPlugin, printInstallDetails()

### Community 45 - "DeepSpaceScene.jsx"
Cohesion: 0.48
Nodes (6): Moon(), takePulse(), buildNetwork(), DeepSpaceScene(), outCubic(), QUESTION_NODES

### Community 46 - "geo.js"
Cohesion: 0.43
Nodes (4): isLand(), LAND_BITS, LAND_H, LAND_W

### Community 47 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, dev, reset-test, start, test, verificar-usuario

### Community 48 - "registerRoute"
Cohesion: 0.40
Nodes (3): RegExpRoute, registerRoute(), Route

### Community 49 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 55 - "Button.jsx"
Cohesion: 0.50
Nodes (3): MotionLink, sizes, variants

### Community 56 - "vite.config.js"
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

## Ambiguous Edges - Review These
- `Favicon (Cloudinary-hosted PNG logo)` → `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS]
  front_learningprjct/index.html · relation: semantically_similar_to

## Knowledge Gaps
- **18 isolated node(s):** `mongodb`, `nodemon`, `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 336 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Router` connect `Router` to `workbox-4772ad73.js`?**
  _High betweenness centrality (0.422) - this node is a cross-community bridge._
- **What connects `mongodb`, `nodemon`, `@tailwindcss/postcss` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06812291743798593 - nodes in this community are weakly interconnected._
- **Why does `configureExpress()` connect `express.js` to `Router`?**
  _High betweenness centrality (0.414) - this node is a cross-community bridge._
- **Should `AuthModal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0593607305936073 - nodes in this community are weakly interconnected._
- **Why does `Global Constraints` connect `AuthModal.jsx` to `StrategyHandler`?**
  _High betweenness centrality (0.358) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Favicon (Cloudinary-hosted PNG logo)` and `Vite Logo (purple-blue gradient bolt)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._