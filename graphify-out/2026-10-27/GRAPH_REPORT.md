# Graph Report - learningprjc  (2026-10-22)

## Corpus Check
- 599 files · ~1,619,248 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2717 nodes · 7578 edges · 147 communities (117 shown, 30 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 248 edges (avg confidence: 0.89)
- Token cost: 113,439 input · 0 output

## Community Hubs (Navigation)
- Ficha de curso pública
- Librerías UI compartidas
- Correcciones: estado y notas
- Home y escena del globo
- Acceso a curso (servicio)
- Docs cohortes y vídeo
- Rutas API y JWT
- Globo 3D (canvas)
- App, rutas y scroll
- Ajustes y cookies
- Motion y botones
- API de cursos y términos
- Usuarios, login y mail
- Entregas y middleware de acceso
- Director de keyframes
- Admin: progreso
- Scripts carga tests (A)
- Modelos Mongo y scripts
- Scripts carga tests Ánfora
- Tests backend cohortes
- Materiales y proxy PDF
- Tests backend listados
- Términos y rate limit
- Perf: medición de rutas
- Admin: tabla de entregas
- Admin: reservas
- Query services listados
- API admin y hooks
- Página de reseñas
- Catálogo de cursos
- Docs inicio/acceso/perf
- Admin: inscripciones
- Admin: cohortes UI
- Contacto y admin tabs
- Header y menú móvil
- Admin: accesos y gestión
- Controlador admin cohortes
- Filtros de entregas
- Perf: bundles
- Reseñas backend
- Workbox (dev-dist A)
- Front package/eslint
- Front devDependencies
- Migraciones de cohortes
- Workbox (dev-dist B)
- Workbox estrategias A
- Perf: scroll Playwright
- Modal de acceso
- Editor de curso
- Toasts e invitación
- Órbitas 3D
- Sobre Nosotros
- Perf: Lighthouse
- Footer y JSON-LD
- Admin: filtros correcciones
- Editor de temas
- Invitaciones de cohorte
- Modelos cohorte
- Tests materiales/presupuestos
- Docs acceso (Google)
- Carga diferida AuthModal
- Perf: tablas
- Admin: progreso alumno
- Backend dependencies
- Plantillas email
- Perf: A/B build
- Perf: pipeline
- Vídeo del curso
- Escenas Dawn/DeepSpace
- Formato reseñas
- Hook y API reseñas
- Usuario y superadmin
- Membresía e interés
- Workbox precache A
- Workbox estrategias B
- Diálogo accesible
- Copy Sobre Nosotros
- Panel invitaciones
- Formularios contacto/reseña
- Mapa Sevilla
- Crítica Sobre Nosotros
- Workbox precache B
- Formulario curso
- Backend package
- Express bootstrap
- Validación formularios
- Tarjeta de reseña
- Estrellas de valoración
- Copy reseñas
- Carga curso Carbono
- Tests courseAccess
- Scripts npm front
- Valores Sobre Nosotros
- API simulada
- Fixtures cohortes
- Workbox router A
- Front dependencies
- Perf: hilo principal
- Globo en acceso
- Tests visuales escenas
- Workbox precache strat A
- Workbox precache strat B
- Workbox router B
- Horizonte contacto
- Canales de contacto
- Subida de ficheros
- Workbox NetworkFirst A
- Workbox NetworkFirst B
- Docs Sobre Nosotros
- Texto animado
- Perf: merge
- Formulario reseña hook
- Plan fondo viaje
- Escenas sticky
- Workbox report A
- Workbox report B
- Scripts npm backend
- Workbox rutas
- Vite config
- Crítica impeccable
- Workbox Strategy
- Test Ánfora tema 4
- Test tema 3
- Reorganizar curso
- Config mongodb-memory
- Backend devDeps
- Workbox Deferred
- Script final-ab
- Fragmento 128
- Fragmento 129
- Fragmento 146

## God Nodes (most connected - your core abstractions)
1. `react` - 182 edges
2. `lucide-react` - 102 edges
3. `framer-motion` - 77 edges
4. `mongoose` - 75 edges
5. `dotenv` - 49 edges
6. `ease` - 44 edges
7. `duration` - 42 edges
8. `react-router-dom` - 39 edges
9. `useToast()` - 34 edges
10. `courseName()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `Favicon (Cloudinary-hosted PNG logo)` --semantically_similar_to--> `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS] [semantically similar]
  front_learningprjct/index.html → front_learningprjct/public/vite.svg
- `Acceso (Iniciar sesión / Registrarse) — diseño` --references--> `main()`  [INFERRED]
  front_learningprjct/docs/superpowers/specs/2026-10-14-acceso-design.md → backend_learningprjct/scripts/asignarAreas.js
- `7. Pendiente de decisión` --references--> `main()`  [INFERRED]
  front_learningprjct/docs/superpowers/specs/2026-10-15-ajustes-design.md → backend_learningprjct/scripts/asignarAreas.js
- `Task 4: `AuthDialog`, la estructura accesible` --references--> `main()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-14-acceso.md → backend_learningprjct/scripts/asignarAreas.js
- `Sobre Nosotros — plan` --references--> `main()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-16-sobre-nosotros.md → backend_learningprjct/scripts/asignarAreas.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Home journey WebGL scenes** — front_learningprjct_docs_superpowers_plans_2026_10_13_inicio_fondo_viaje_journeystage, front_learningprjct_docs_superpowers_plans_2026_10_13_inicio_fondo_viaje_globecanvas, front_learningprjct_docs_superpowers_plans_2026_10_13_inicio_fondo_viaje_deepspacescene, front_learningprjct_docs_superpowers_plans_2026_10_13_inicio_fondo_viaje_orbitscene, front_learningprjct_docs_superpowers_plans_2026_10_13_inicio_fondo_viaje_dawnscene [EXTRACTED 1.00]
- **Cohort private-access control flow** — docs_superpowers_specs_2026_10_22_cohortes_design_resolveaccess, docs_superpowers_plans_2026_10_22_cohortes_requirecourseaccess, docs_superpowers_specs_2026_10_22_cohortes_design_cohort_model, docs_superpowers_specs_2026_10_22_cohortes_design_cohortinvite_model, docs_superpowers_specs_2026_10_22_cohortes_design_course_accessmode, docs_superpowers_specs_2026_10_22_cohortes_design_material_gateway_signed_urls [EXTRACTED 1.00]
- **Course video preview/full flow** — docs_superpowers_specs_2026_10_22_course_video_design_get_course_video_endpoint, docs_superpowers_specs_2026_10_22_course_video_design_videourls, docs_superpowers_specs_2026_10_22_course_video_design_coursevideos_config, docs_superpowers_specs_2026_10_22_course_video_design_usecoursevideo_hook, docs_superpowers_specs_2026_10_22_course_video_design_coursevideo_component, docs_superpowers_plans_2026_10_22_course_video_videoresume [INFERRED 0.85]

## Communities (147 total, 30 thin omitted)

### Community 0 - "Ficha de curso pública"
Cohesion: 0.06
Nodes (81): CourseCard(), IMG_WIDTHS, CourseFilters(), areaLabel(), buildSearchIndex(), courseHours(), courseLanguages(), courseMeta() (+73 more)

### Community 1 - "Librerías UI compartidas"
Cohesion: 0.08
Nodes (35): DRAWER_EASE, WIDTH, formatCohortDate(), EjercicioOptativo(), EstructuraCurso(), MaterialEstudio(), TestEvaluacion(), cards (+27 more)

### Community 2 - "Correcciones: estado y notas"
Cohesion: 0.10
Nodes (38): COPY, DEFAULT_TEMPLATES, STAT_FILTERS, FeedbackField(), GradeInput(), toText(), GradePanel(), ICON (+30 more)

### Community 3 - "Home y escena del globo"
Cohesion: 0.09
Nodes (46): Tarea 1: lienzo a nivel de página (`JourneyStage`), 2. Estado actual relevante, Card(), FloatingCards(), CanvasBoundary, FallbackImage(), GlobeAnchor(), GlobeCanvas (+38 more)

### Community 4 - "Acceso a curso (servicio)"
Cohesion: 0.08
Nodes (35): videoFor(), actualizarTema(), agregarTema(), eliminarTema(), obtenerCurso(), obtenerCursos(), reordenarTemas(), obtenerVideoCurso() (+27 more)

### Community 5 - "Docs cohortes y vídeo"
Cohesion: 0.07
Nodes (40): Subir Actividad Optativa (admin upload page), actividadForm submit handler (POST actividades-optativas), API_URL http://localhost:8547/api, cursoTemaForm submit handler (GET course temas), Admin upload pages send no Authorization header, selectTema(), showMessage(), Subir Material al Curso (admin upload page) (+32 more)

### Community 6 - "Rutas API y JWT"
Cohesion: 0.08
Nodes (32): assertJwtConfig(), getJwtSecret(), verifyToken(), actualizarEjercicio(), crearEjercicio(), eliminarEjercicio(), obtenerEjercicioPorId(), obtenerEjerciciosCurso() (+24 more)

### Community 7 - "Globo 3D (canvas)"
Cohesion: 0.08
Nodes (41): Tarea 5: `DawnScene` (CTA), ARCS, GLOBE, HUB, LIGHT_DIR, ORBITS, QUALITY, Atmosphere() (+33 more)

### Community 8 - "App, rutas y scroll"
Cohesion: 0.08
Nodes (43): Ajustes, AnimatedRoutes(), App(), AvisoLegal, Contacto, CorreccionesAdmin, CursoDetalle, CursoInscripcion (+35 more)

### Community 9 - "Ajustes y cookies"
Cohesion: 0.06
Nodes (36): Ajustes (/ajustes) - diseno, 1. Dirección, 2. Estructura, 3. Comportamiento que se mantiene, 4. Arreglo de lógica aprobado, 5. Presentación nueva derivada del estado existente, 6. Textos aplicados, 7. Pendiente de decisión (+28 more)

### Community 10 - "Motion y botones"
Cohesion: 0.10
Nodes (32): SEGMENTS, STARS, ConsentActions(), ConsentStatus, CookieCategoryRow, ICONS, PrivacySection(), SecuritySection() (+24 more)

### Community 11 - "API de cursos y términos"
Cohesion: 0.12
Nodes (36): isCourseId(), formatTermsDate(), TERMS_DIALOG, Dialog(), TermsDialog(), initialState(), takeEarly(), useCourseSheet() (+28 more)

### Community 12 - "Usuarios, login y mail"
Cohesion: 0.10
Nodes (33): signToken(), contactFormHandler(), changePreferredLanguage(), completeCourse(), completeTest(), getAdminCourseEnrollments(), getCurrentUser(), getEnrollmentStatus() (+25 more)

### Community 13 - "Entregas y middleware de acceso"
Cohesion: 0.10
Nodes (34): corregirEntrega(), __dirname, eliminarEntrega(), entregarEjercicio(), __filename, obtenerEntregasUsuarioCurso(), obtenerEntregaUsuario(), projectRoot (+26 more)

### Community 14 - "Director de keyframes"
Cohesion: 0.11
Nodes (37): Tarea 2: trayectoria de cámara, 6. Diálogo, Globo mientras el diálogo está abierto (`GlobeCanvas` → `Director`), Director(), StillInvalidator(), ARRIVAL, base, blendFrames() (+29 more)

### Community 15 - "Admin: progreso"
Cohesion: 0.12
Nodes (29): SubmissionToolbar, BANDS, collator, deleted(), displayName(), filterAndSort(), FINAL_TEST_ID, histogram() (+21 more)

### Community 16 - "Scripts carga tests (A)"
Cohesion: 0.06
Nodes (18): __dirname, __filename, __dirname, __filename, __dirname, __filename, __dirname, __filename (+10 more)

### Community 17 - "Modelos Mongo y scripts"
Cohesion: 0.09
Nodes (5): Ejercicio, ejercicioSchema, passwordResetTokenSchema, dotenv, mongoose

### Community 18 - "Scripts carga tests Ánfora"
Cohesion: 0.06
Nodes (17): opcionSchema, preguntaSchema, testSchema, __dirname, __filename, __dirname, __filename, __dirname (+9 more)

### Community 19 - "Tests backend cohortes"
Cohesion: 0.09
Nodes (10): base, END, START, UPLOADS, browserStorage(), pendingInvite(), pendingInviteStore(), UserProvider() (+2 more)

### Community 20 - "Materiales y proxy PDF"
Cohesion: 0.12
Nodes (25): servirMaterial(), escapeRegex(), FILE_FIELDS, proxyPdf(), sameAssetPattern(), noSharedCache(), apply, args (+17 more)

### Community 21 - "Tests backend listados"
Cohesion: 0.07
Nodes (9): COURSE_VIDEOS, entregaEjercicioSchema, apply, args, revert, accounts, sent, VIDEO (+1 more)

### Community 22 - "Términos y rate limit"
Cohesion: 0.13
Nodes (22): TERMS, acceptTerms(), getCurrentTerms(), getTermsStatus(), isProd(), enrollInCourse(), createRateLimit(), termsAcceptanceSchema (+14 more)

### Community 23 - "Perf: medición de rutas"
Cohesion: 0.12
Nodes (26): agg, CPU, dt, maps, total, analyzeTrace(), JS_EVENTS, maxScroll() (+18 more)

### Community 24 - "Admin: tabla de entregas"
Cohesion: 0.15
Nodes (23): Card, SubmissionCards, SubmissionDrawer(), SubmissionMeta, Row, SubmissionTable, absFmt, absoluteDate() (+15 more)

### Community 25 - "Admin: reservas"
Cohesion: 0.17
Nodes (24): isMissingEndpoint(), loadLegacyEnrollments(), STAT_FILTERS, dayKey(), ENROLLMENT_STATUS, fold(), groupByDay(), isMonth() (+16 more)

### Community 26 - "Query services listados"
Cohesion: 0.16
Nodes (27): obtenerTodasLasEntregas(), getAdminEnrollments(), buildListadoPipeline(), formatListado(), LIMIT_DEFAULT, LIMIT_MAX, ORDEN_SORT, ORDENES (+19 more)

### Community 27 - "API admin y hooks"
Cohesion: 0.17
Nodes (26): useCohorts(), pick(), SERVER_FIELDS, UNDO_WINDOW_MS, useDeferredGrades(), useTopics(), summarizeSubmissions(), useCourseProgress() (+18 more)

### Community 28 - "Página de reseñas"
Cohesion: 0.12
Nodes (23): SAMPLES, ratingDistribution(), ReviewInvite(), ReviewList(), Skeleton(), SKELETON_HEIGHTS, ReviewsBackdrop(), SPARKLES (+15 more)

### Community 29 - "Catálogo de cursos"
Cohesion: 0.11
Nodes (24): APPLY, args, FORCE, KEYWORDS, label(), main(), normalize(), suggestArea() (+16 more)

### Community 30 - "Docs inicio/acceso/perf"
Cohesion: 0.12
Nodes (20): DawnScene (CTA), DeepSpaceScene (FAQ), GlobeCanvas journey mode, journey/keyframes.js (stations, weights, blending), journey/store.js (mutable UI->canvas bridge), JourneyStage (fixed page-level WebGL canvas), OrbitScene (Resenas), AuthDialog (accessible dialog) (+12 more)

### Community 31 - "Admin: inscripciones"
Cohesion: 0.20
Nodes (21): ContactButton, cap(), dayFmt, EnrollmentCalendar(), longFmt, monthFmt, Card, EnrollmentCards (+13 more)

### Community 32 - "Admin: cohortes UI"
Cohesion: 0.18
Nodes (20): COPY, cohortPhase(), fromLocalInput(), inviteUsage(), normalize(), pad(), plural(), sortMembers() (+12 more)

### Community 33 - "Contacto y admin tabs"
Cohesion: 0.16
Nodes (19): AdminTabs(), ADMIN_TABS, DEFAULT_TAB, panelId(), tabByKey(), tabId(), KEYS, useAdminTab() (+11 more)

### Community 34 - "Header y menú móvil"
Cohesion: 0.13
Nodes (13): LazyAuthModal(), LoadBoundary, Avatar(), Header(), NavItem(), Logo(), MotionLink, MobileMenu() (+5 more)

### Community 35 - "Admin: accesos y gestión"
Cohesion: 0.16
Nodes (19): accesosFilters, AccesosTab(), InterestList(), MODES, CourseRow, CourseEditor, GestionCursosTab(), gestionFilters (+11 more)

### Community 36 - "Controlador admin cohortes"
Cohesion: 0.21
Nodes (23): actualizarCohorte(), anadirMiembros(), badRequest(), cambiarModoAcceso(), cohortInput(), counts(), crearCohorte(), crearInvitacion() (+15 more)

### Community 37 - "Filtros de entregas"
Cohesion: 0.15
Nodes (19): apiParams(), DEFAULT_FILTERS, filtersFromParams, fold(), hasActiveFilters, legacyPage(), PAGE_SIZE, paramsFromFilters (+11 more)

### Community 38 - "Perf: bundles"
Cohesion: 0.14
Nodes (20): add(), assets, chunks, closure(), DIST, entryKey, filesOf(), fmt() (+12 more)

### Community 39 - "Reseñas backend"
Cohesion: 0.19
Nodes (19): cooldown(), createReview(), deleteReview(), getReviews(), getReviewStatus(), isOwner(), nextReviewAt(), REVIEW_COOLDOWN_MS (+11 more)

### Community 40 - "Workbox (dev-dist A)"
Cohesion: 0.14
Nodes (16): addRoute(), cacheMatchIgnoreParams(), cacheWillUpdate(), canConstructResponseFromBodyStream(), copyResponse(), executeQuotaErrorCallbacks(), generateURLVariations(), precache() (+8 more)

### Community 41 - "Front package/eslint"
Cohesion: 0.11
Nodes (20): name, private, type, version, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks (+12 more)

### Community 42 - "Front devDependencies"
Cohesion: 0.09
Nodes (22): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+14 more)

### Community 43 - "Migraciones de cohortes"
Cohesion: 0.12
Nodes (7): userProgressSchema, apply, rollback, apply, migrateAccessMode(), rollbackCourseCohort(), setupCourseCohort()

### Community 44 - "Workbox (dev-dist B)"
Cohesion: 0.13
Nodes (13): addRoute(), cacheMatchIgnoreParams(), cacheWillUpdate(), canConstructResponseFromBodyStream(), copyResponse(), Deferred, executeQuotaErrorCallbacks(), generateURLVariations() (+5 more)

### Community 45 - "Workbox estrategias A"
Cohesion: 0.24
Nodes (3): Strategy, StrategyHandler, toRequest()

### Community 46 - "Perf: scroll Playwright"
Cohesion: 0.12
Nodes (17): BLOCK, browsers, CPU, CSS, GPU, launch(), median(), medianOf() (+9 more)

### Community 47 - "Modal de acceso"
Cohesion: 0.24
Nodes (14): AuthModal(), ServerAlert(), Swap(), AuthTabs(), TABS, AutoHeight(), PasswordField, PasswordMatchAnnouncer() (+6 more)

### Community 48 - "Editor de curso"
Cohesion: 0.27
Nodes (15): appendCatalogFields(), catalogFieldsError(), catalogFormValues(), CourseEditor(), blank(), courseFormData(), emptyCourseForm(), FIELD_ORDER (+7 more)

### Community 49 - "Toasts e invitación"
Cohesion: 0.19
Nodes (14): INVITE, DOT, ToastContext, ToastProvider(), ToastRegion(), useToast(), previewInvite(), CursoInvitacion() (+6 more)

### Community 50 - "Órbitas 3D"
Cohesion: 0.23
Nodes (15): Tarea 4: `OrbitScene` (Reseñas), journey, armGeo, bodyGeo, OrbitLine(), Orbits(), panelGeo, Satellite() (+7 more)

### Community 51 - "Sobre Nosotros"
Cohesion: 0.22
Nodes (15): Sobre Nosotros — plan, AboutBackdrop(), AboutClosing(), initialsOf(), TEAM, TEAM_TITLE, AboutEssence(), AboutHero() (+7 more)

### Community 52 - "Perf: Lighthouse"
Cohesion: 0.12
Nodes (11): FORMS, htmlDir, OUT, results, ROUTES, RUNS, BASE_URL, DEVICES (+3 more)

### Community 53 - "Footer y JSON-LD"
Cohesion: 0.18
Nodes (14): ORGANIZATION, contact, Footer(), FooterBottom(), FooterColumn(), legalLinks, navGroups, social (+6 more)

### Community 54 - "Admin: filtros correcciones"
Cohesion: 0.22
Nodes (12): CorreccionesTab(), focusSubmission(), ListSkeleton(), loadDrawer(), SubmissionDrawer, isTyping(), useReviewShortcuts(), useSubmissionFilters() (+4 more)

### Community 55 - "Editor de temas"
Cohesion: 0.35
Nodes (11): COPY, isPdf(), MaterialUpload(), Picker(), NewTopicForm(), TopicFields(), topicFormValues(), topicHasTitle() (+3 more)

### Community 56 - "Invitaciones de cohorte"
Cohesion: 0.24
Nodes (13): canjearInvitacion(), INVITE_ERRORS, verInvitacion(), activatePending(), createInvite(), findByToken(), frontendUrl(), hashToken() (+5 more)

### Community 57 - "Modelos cohorte"
Cohesion: 0.14
Nodes (8): AFTER_END, cohortSchema, MEMBER_SOURCE, MEMBER_STATUS, memberSchema, cohortInviteSchema, sent, sent

### Community 58 - "Tests materiales/presupuestos"
Cohesion: 0.14
Nodes (8): PDF, UPLOADS, CELLS, OUT, RUNS, budgets, RUNS, envFps()

### Community 59 - "Docs acceso (Google)"
Cohesion: 0.15
Nodes (16): Acceso (Iniciar sesión / Registrarse) — plan de implementación, Global Constraints, Review Focus, Task 0: Capturas "antes", Task 10: Verificación final, Task 1: Tokens y utilidades puras, Task 2: Puente `journey.overlay` y atenuación del globo, Task 3: Carga diferida y precarga (+8 more)

### Community 60 - "Carga diferida AuthModal"
Cohesion: 0.13
Nodes (15): 10. Pendiente de decisión, 11. Archivos, 12. Verificación, 1. Objetivo y límites, 3. Composición, 4. Componentes (`src/components/auth/`), 5. Formularios, 7. Movimiento (tokens de `lib/motion.js`) (+7 more)

### Community 61 - "Perf: tablas"
Cohesion: 0.15
Nodes (13): bun, cell(), CMP, delta(), DIR, lh, mem, mount (+5 more)

### Community 62 - "Admin: progreso alumno"
Cohesion: 0.36
Nodes (10): COPY, rowUser(), Card, StudentProgressCards, Row, StudentProgressTable, StudentSubmissions, TopicSegments (+2 more)

### Community 63 - "Backend dependencies"
Cohesion: 0.12
Nodes (16): dependencies, bcryptjs, cloudinary, cors, dotenv, express, express-validator, google-auth-library (+8 more)

### Community 64 - "Plantillas email"
Cohesion: 0.26
Nodes (14): buildCohortInviteEmail(), COPY, detailRow(), longDate(), buildContactEmail(), C, detailRow(), escapeHtml() (+6 more)

### Community 65 - "Perf: A/B build"
Cohesion: 0.12
Nodes (9): A, B, CPU, DEVICE, res, ROUTE, RUNS, r (+1 more)

### Community 66 - "Perf: pipeline"
Cohesion: 0.14
Nodes (14): agg, aggOk, CPU, DEVICE, frames, ok, open, reasons (+6 more)

### Community 67 - "Vídeo del curso"
Cohesion: 0.26
Nodes (9): VIDEO, CourseVideo(), CtaBlock(), FullPlayer(), PreviewPlayer(), clearResume(), readResume(), resumeKey() (+1 more)

### Community 68 - "Escenas Dawn/DeepSpace"
Cohesion: 0.25
Nodes (13): Moon(), clamp01(), pxToWorld(), silhouetteTop(), takePulse(), DawnScene(), SIDES, buildNetwork() (+5 more)

### Community 69 - "Formato reseñas"
Cohesion: 0.21
Nodes (13): average, clock, formatNextTime(), full, initialsOf(), MAX_TEXT, relative, startOfDay() (+5 more)

### Community 70 - "Hook y API reseñas"
Cohesion: 0.30
Nodes (13): idOf(), toDate(), token(), unwrap(), useReviews(), apiUrl(), deleteReview(), fetchReviews() (+5 more)

### Community 71 - "Usuario y superadmin"
Cohesion: 0.14
Nodes (8): __dirname, __filename, userSchema, crearSuperAdmin(), preguntarConfirmacion(), rl, SUPERADMIN_CONFIG, bcryptjs

### Community 72 - "Membresía e interés"
Cohesion: 0.30
Nodes (10): apuntarInteresado(), listarInteresados(), loadPrivateCourse(), courseInterestSchema, claimPendingMemberships(), pendingFilter(), parseEmailList(), isValidEmail() (+2 more)

### Community 73 - "Workbox precache A"
Cohesion: 0.19
Nodes (4): createCacheKey(), PrecacheController, PrecacheRoute, WorkboxError

### Community 75 - "Diálogo accesible"
Cohesion: 0.24
Nodes (13): Task 4: `AuthDialog`, la estructura accesible, AuthDialog(), canReceiveFocus(), console_, fade, fadeStage(), inertOutside(), isTabStop() (+5 more)

### Community 76 - "Copy Sobre Nosotros"
Cohesion: 0.21
Nodes (11): INTRO, MISSION, PAGE_DESCRIPTION, PAGE_TITLE, REVIEWS_LINK, TESTIMONIALS, TESTIMONIALS_LANG, TESTIMONIALS_NOTE (+3 more)

### Community 77 - "Panel invitaciones"
Cohesion: 0.25
Nodes (13): copyText(), dateInput(), InvitesPanel(), shortDate(), STATUS_TONE, ConfirmDialog(), Dialog(), Panel() (+5 more)

### Community 78 - "Formularios contacto/reseña"
Cohesion: 0.29
Nodes (11): SubmitButton(), ContactForm, FormAlert(), SentPanel(), TopicPicker(), SentSignal(), GeneralError(), ReviewComposer() (+3 more)

### Community 79 - "Mapa Sevilla"
Cohesion: 0.15
Nodes (10): ADDRESS, LocationCard(), COS, IBERIA, LAND, MALLORCA, SEA, SEVILLA (+2 more)

### Community 80 - "Crítica Sobre Nosotros"
Cohesion: 0.24
Nodes (11): Critique Sobre Nosotros (antes) 19/32, Design Health Score (Nielsen heuristics), English soil-services testimonials (trust break), Category-interchangeable About us verdict, Outlook-web deeplink instead of mailto, Critique Sobre Nosotros (despues) 21/28, Product-specific atmosphere (globe limb, aurora, constellation, dawn horizon), Sobre Nosotros - plan (+3 more)

### Community 81 - "Workbox precache B"
Cohesion: 0.21
Nodes (3): createCacheKey(), PrecacheController, WorkboxError

### Community 82 - "Formulario curso"
Cohesion: 0.33
Nodes (9): CourseCatalogFields(), CourseForm(), LANG_LABEL, Section(), CoverPicker(), useObjectUrl(), FormField(), ListInput() (+1 more)

### Community 83 - "Backend package"
Cohesion: 0.15
Nodes (12): author, description, keywords, license, main, name, type, version (+4 more)

### Community 84 - "Express bootstrap"
Cohesion: 0.23
Nodes (8): app, configureExpress(), errorHandler(), notFound(), router, cors, helmet, morgan

### Community 85 - "Validación formularios"
Cohesion: 0.29
Nodes (8): refresh(), useNativeValidation(), customMessage(), fieldMessage(), firstInvalid(), MISSING, shouldDismissSheet(), ok

### Community 86 - "Tarjeta de reseña"
Cohesion: 0.37
Nodes (11): OwnActions(), OwnReview(), Avatar(), AVATAR_TONES, canHover(), ReviewCard(), useTilt(), formatFullDate() (+3 more)

### Community 87 - "Estrellas de valoración"
Cohesion: 0.32
Nodes (10): formatAverage(), MAX_RATING, reviewsLabel(), SUMMARY_EMPTY, CountUp(), Distribution(), ReviewsSummary(), StarShape() (+2 more)

### Community 88 - "Copy reseñas"
Cohesion: 0.19
Nodes (10): HEADLINE, HEADLINES, INVITE, LATEST, MINE, NO_TEXT, PAGE_DESCRIPTION, PAGE_TITLE (+2 more)

### Community 89 - "Carga curso Carbono"
Cohesion: 0.24
Nodes (8): cargarTodoElCurso(), ejecutarScript(), execPromise, scripts, ejecutarPaso(), execPromise, pasos, recuperacionCompleta()

### Community 90 - "Tests courseAccess"
Cohesion: 0.17
Nodes (9): AFTER, ana, BEFORE, DURING, END, legacyCourse, privateCourse, publicCourse (+1 more)

### Community 91 - "Scripts npm front"
Cohesion: 0.17
Nodes (12): scripts, build, dev, lint, perf:build, perf:lhci, perf:measure, perf:serve (+4 more)

### Community 92 - "Valores Sobre Nosotros"
Cohesion: 0.24
Nodes (9): ESSENCE_TITLE, PHOTO, VALUES, VALUES_TITLE, cloudinary(), SRC_SET, ValueItem(), ValuesConstellation() (+1 more)

### Community 93 - "API simulada"
Cohesion: 0.17
Nodes (8): courses, here, LATENCY, NAMES, PORT, REVIEW_TEXTS, reviews, terms

### Community 94 - "Fixtures cohortes"
Cohesion: 0.20
Nodes (7): authHeader(), DAY, listen(), MATERIAL_URL, MATERIAL_URL_EN, tokenFor(), WINDOWS

### Community 96 - "Front dependencies"
Cohesion: 0.18
Nodes (11): dependencies, framer-motion, lenis, lucide-react, react, react-dom, @react-oauth/google, react-router-dom (+3 more)

### Community 97 - "Perf: hilo principal"
Cohesion: 0.18
Nodes (9): agg, byThread, list, mains, names, opts, self, stack (+1 more)

### Community 98 - "Globo en acceso"
Cohesion: 0.25
Nodes (6): AuthGlobe, AuthGlobe(), CanvasBoundary, GlobeCanvas, hasWebGL(), Horizon()

### Community 99 - "Tests visuales escenas"
Cohesion: 0.25
Nodes (7): finishAnimations(), open(), prime(), settle(), START, waitForGlobe(), WIDTHS

### Community 103 - "Horizonte contacto"
Cohesion: 0.33
Nodes (7): CLOSING, CampusRing(), ContactBackdrop(), COURSE_ICONS, Orbit(), Sevilla(), Horizon()

### Community 104 - "Canales de contacto"
Cohesion: 0.29
Nodes (8): ContactChannel(), ContactChannels(), EMAIL, LINKEDIN, PHONE, PRIVACY_SUMMARY, QUICK_ANSWERS, TOPICS

### Community 105 - "Subida de ficheros"
Cohesion: 0.28
Nodes (7): generateUniqueFilename(), isPrivateCourse(), storageDinamico, upload, uploadParams(), multer, multer-storage-cloudinary

### Community 106 - "Workbox NetworkFirst A"
Cohesion: 0.28
Nodes (4): cleanupOutdatedCaches(), NetworkFirst, printCleanupDetails(), waitUntil()

### Community 107 - "Workbox NetworkFirst B"
Cohesion: 0.28
Nodes (4): cleanupOutdatedCaches(), NetworkFirst, printCleanupDetails(), waitUntil()

### Community 108 - "Docs Sobre Nosotros"
Cohesion: 0.22
Nodes (9): 1. Decisiones aprobadas (2026-10-16), 2. Estructura y contenido, 3. Fondo y luz, 5. Rendimiento, 6. Cambios durante la implementación (con su motivo), 7. Pendiente de decisión, 8. Respuestas a los pendientes (2026-10-16), Sobre Nosotros — diseño (+1 more)

### Community 109 - "Texto animado"
Cohesion: 0.36
Nodes (7): 4. Movimiento, Reveal(), SectionHeading(), ScrubWord(), SplitText(), toWords(), wordVariants

### Community 110 - "Perf: merge"
Cohesion: 0.33
Nodes (8): args, dirs, lh, load(), median(), mergeCells(), mount, scroll

### Community 111 - "Formulario reseña hook"
Cohesion: 0.33
Nodes (8): COMPOSER, OWN, EMPTY, focusQuiet(), focusSoon(), neighbourOf(), useReviewForm(), without()

### Community 112 - "Plan fondo viaje"
Cohesion: 0.25
Nodes (8): Estructura de archivos, Fondo "Viaje de vuelta a la Tierra" — plan de implementación, Restricciones globales, Revisión: puntos de fallo, Tarea 0: rama y capturas "antes", Tarea 3: `DeepSpaceScene` (FAQ), Tarea 6: reduced motion, móvil y gama baja, Tarea 7: revisión y cierre

### Community 113 - "Escenas sticky"
Cohesion: 0.39
Nodes (4): useMediaQuery(), useSceneProgress(), useScenesEnabled(), scrollSpring

### Community 114 - "Workbox report A"
Cohesion: 0.29
Nodes (3): _nestedGroup(), PrecacheInstallReportPlugin, printInstallDetails()

### Community 115 - "Workbox report B"
Cohesion: 0.29
Nodes (3): _nestedGroup(), PrecacheInstallReportPlugin, printInstallDetails()

### Community 116 - "Scripts npm backend"
Cohesion: 0.33
Nodes (6): scripts, dev, reset-test, start, test, verificar-usuario

### Community 117 - "Workbox rutas"
Cohesion: 0.40
Nodes (3): RegExpRoute, registerRoute(), Route

### Community 118 - "Vite config"
Cohesion: 0.40
Nodes (4): routeModulePreload(), vite, vite-plugin-pwa, @vitejs/plugin-react

### Community 119 - "Crítica impeccable"
Cohesion: 0.33
Nodes (5): Design Health Score, Minor, Persona red flags, Priority issues, Specificity verdict

### Community 124 - "Config mongodb-memory"
Cohesion: 0.67
Nodes (3): config, mongodbMemoryServer, version

### Community 125 - "Backend devDeps"
Cohesion: 0.67
Nodes (3): devDependencies, mongodb-memory-server, nodemon

## Ambiguous Edges - Review These
- `Favicon (Cloudinary-hosted PNG logo)` → `Vite Logo (purple-blue gradient bolt)`  [AMBIGUOUS]
  front_learningprjct/index.html · relation: semantically_similar_to

## Knowledge Gaps
- **33 isolated node(s):** `Hidden Google Translate Element`, `Google Translate element.js Script`, `Page Title: Evenor-Tech_Campus`, `Supported Languages (en, es, fr, de, it, pt)`, `Responsive Viewport Meta` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 777 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Librerías UI compartidas` to `Ficha de curso pública`, `Correcciones: estado y notas`, `Home y escena del globo`, `Globo 3D (canvas)`, `App, rutas y scroll`, `Ajustes y cookies`, `Motion y botones`, `API de cursos y términos`, `Admin: progreso`, `Admin: tabla de entregas`, `Admin: reservas`, `API admin y hooks`, `Página de reseñas`, `Admin: inscripciones`, `Admin: cohortes UI`, `Contacto y admin tabs`, `Header y menú móvil`, `Admin: accesos y gestión`, `Filtros de entregas`, `Front package/eslint`, `Modal de acceso`, `Editor de curso`, `Toasts e invitación`, `Órbitas 3D`, `Sobre Nosotros`, `Admin: filtros correcciones`, `Editor de temas`, `Admin: progreso alumno`, `Vídeo del curso`, `Escenas Dawn/DeepSpace`, `Hook y API reseñas`, `Diálogo accesible`, `Panel invitaciones`, `Formularios contacto/reseña`, `Mapa Sevilla`, `Formulario curso`, `Validación formularios`, `Tarjeta de reseña`, `Estrellas de valoración`, `Globo en acceso`, `Canales de contacto`, `Texto animado`, `Formulario reseña hook`, `Escenas sticky`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **What connects `Hidden Google Translate Element`, `Google Translate element.js Script`, `Page Title: Evenor-Tech_Campus` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Ficha de curso pública` be split into smaller, more focused modules?**
  _Cohesion score 0.06161314413741598 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Catálogo de cursos` to `Ajustes y cookies`, `Diálogo accesible`, `Docs Sobre Nosotros`, `Sobre Nosotros`, `Carga diferida AuthModal`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `Librerías UI compartidas` be split into smaller, more focused modules?**
  _Cohesion score 0.0776255707762557 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Librerías UI compartidas` to `Ficha de curso pública`, `Correcciones: estado y notas`, `Home y escena del globo`, `App, rutas y scroll`, `Motion y botones`, `API de cursos y términos`, `Admin: progreso`, `Admin: tabla de entregas`, `Admin: reservas`, `Página de reseñas`, `Admin: inscripciones`, `Admin: cohortes UI`, `Contacto y admin tabs`, `Header y menú móvil`, `Admin: accesos y gestión`, `Front package/eslint`, `Modal de acceso`, `Editor de curso`, `Toasts e invitación`, `Sobre Nosotros`, `Footer y JSON-LD`, `Admin: filtros correcciones`, `Editor de temas`, `Admin: progreso alumno`, `Vídeo del curso`, `Copy Sobre Nosotros`, `Panel invitaciones`, `Formularios contacto/reseña`, `Mapa Sevilla`, `Formulario curso`, `Tarjeta de reseña`, `Estrellas de valoración`, `Copy reseñas`, `Horizonte contacto`, `Canales de contacto`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Favicon (Cloudinary-hosted PNG logo)` and `Vite Logo (purple-blue gradient bolt)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._