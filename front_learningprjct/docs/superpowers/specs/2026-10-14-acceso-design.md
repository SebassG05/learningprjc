# Acceso (Iniciar sesión / Registrarse) — diseño

Fecha: 2026-10-14 · Rama: `feat/acceso` (desde `main`, que ya incluye el footer)
Dirección aprobada: **2 — Tarjeta única que se transforma**.
Figma: sin acceso (límite de llamadas MCP del plan Starter); este documento es la spec.

## 1. Objetivo y límites

Rediseño **solo visual y de accesibilidad** del diálogo de acceso. La autenticación no cambia:

- Mismos `fetch` (endpoints, cabeceras, `body` construido desde el estado de React), mismos toasts,
  mismas llamadas a `setUserLogin`, mismas navegaciones y mismos retardos (`10 ms` tras éxito,
  `350 ms` antes de ir a `/forgot-password`).
- Mismos campos y reglas: `required` y `type="email"` nativos. Ninguna regla nueva.
- Comprobado: ningún handler del acceso usa `FormData` ni `e.target.elements`, así que añadir
  `name` a los inputs no cambia lo que se envía.
- Sin dependencias nuevas. Sin un segundo Canvas.

## 2. Estado actual relevante

- `AuthModal` se monta en `Header` (siempre, import estático), `Home` (`{showLogin && …}`),
  `Cursos` (siempre montado) y la ruta `/login` (`Login.jsx`, import estático desde `App.jsx`).
  Hoy el modal entero va en el bundle inicial.
- El globo (`GlobeStage` → `GlobeCanvas`) solo existe en la home.
- Toasts: `ToastProvider` pinta el toast como hijo directo de `#root` (`role="status"`).
- Lenis ignora la rueda dentro de `[role="dialog"], [data-lenis-prevent]`.

## 3. Composición

Una única tarjeta centrada (escritorio) / hoja a pantalla completa (< 640 px).

```text
┌──────────────────────────────┐
│ [logo] Campus Evenor-Tech  × │  ← cabecera fina: logo 32 px + lema en una línea (ink-3)
│                              │
│ Bienvenido de nuevo          │  ← título (title-2, display) — fundido cruzado al cambiar
│ Accede para seguir con tus   │  ← subtítulo (ink-2)
│ cursos.                      │
│ ┌────────────┬─────────────┐ │
│ │▐Iniciar ses▌  Registrarse│ │  ← AuthTabs: píldora deslizante (layoutId) + peso semibold
│ └────────────┴─────────────┘ │
│ Correo electrónico           │
│ [                         ]  │
│ Contraseña   ¿Has olvidado…? │  ← enlace después del input en el orden de tabulación
│ [                     (👁) ]  │
│ ⚠ Bloq Mayús activado         │  ← solo si aplica
│ ┌ alerta del servidor ┐      │  ← role="alert", encima del botón
│ [        Acceder           ] │  ← SubmitButton h-14
│ ───────────  o  ───────────  │  ← AuthDivider legible
│ [ G  Iniciar sesión con Google ] │ ← iframe GIS, mismo ancho (≤ 400 px)
└──────────────────────────────┘
```

- Columna de contenido: `max-w-100` (400 px) — coincide con el ancho máximo del botón de Google.
  Tarjeta: `w-full max-w-120` (480 px) con `px-10` → 400 px de contenido; en móvil `px-5`.
- Material: `bg-surface/80` + `backdrop-blur` con el token `--blur-2xl`, borde `border-line`,
  `shadow-overlay`, `rounded-3xl`. En la home el globo atenuado se intuye a través del velo
  (`bg-black/60` + `backdrop-blur-sm`, como hoy) y de la tarjeta.
- El lema "El cambio comienza con la formación." pasa a una línea pequeña en la cabecera,
  junto al logo. La etiqueta "Campus Evenor-Tech" desaparece (redundante con el logo + lema).
- El divisor y el botón de Google quedan **fuera** de los paneles de pestaña: se comparten entre
  login y registro, así el iframe no se vuelve a montar al cambiar de pestaña y hay **una sola
  instancia** de `GoogleLogin` con `useOneTap` en la raíz del diálogo (autorizado).

### Textos

| Elemento | Login | Registro |
|---|---|---|
| Título | Bienvenido de nuevo | **pendiente** (ver §10) — hasta el OK: "Crea tu cuenta" (actual) |
| Subtítulo | Accede para seguir con tus cursos. *(aprobado)* | Empieza a formarte hoy. Solo te llevará un minuto. *(aprobado)* |
| Botón | Acceder / Accediendo… | Registrarse / Registrando… |

## 4. Componentes (`src/components/auth/`)

| Componente | Responsabilidad | Lógica nueva |
|---|---|---|
| `LazyAuthModal.jsx` | `React.lazy` del modal + `preloadAuthModal()`. No monta nada hasta el primer `open`. Misma API `{ open, onClose }`. | No |
| `AuthModal.jsx` | Estado y handlers actuales (movidos sin cambios), composición. | No |
| `AuthDialog.jsx` | Portal a `body`, velo, tarjeta/hoja, `role="dialog"`, `aria-modal`, `aria-labelledby`, foco inicial, ciclo de Tab, Escape, `inert` del fondo, bloqueo de scroll, retorno de foco, origen de la animación, `setOverlay`. | Solo UI |
| `AuthTabs.jsx` | `tablist`/`tab` con flechas, Inicio/Fin, `aria-controls`, píldora con `layoutId`. | Solo UI |
| `TextField.jsx` | `<label>` visible + input + mensaje de validación (`aria-describedby`, `aria-invalid`). Reutiliza `inputClass` de `ui/Field`. | No |
| `PasswordField.jsx` | `TextField` + botón mostrar/ocultar (44×44, `aria-pressed`) + aviso Bloq Mayús. Ranura opcional para el enlace "¿Has olvidado…?". | Solo UI |
| `SubmitButton.jsx` | `Button` `type="submit"` `size="lg"` `w-full`, spinner + texto de carga, `aria-busy`, `disabled`. | No |
| `AuthDivider.jsx` | Separador "o". | No |
| `useNativeValidation.js` | Lee la validación **nativa** del formulario al enviar (`noValidate` + `checkValidity()`), guarda el mensaje por campo, enfoca el primero inválido y limpia el error al corregir. Si es válido, llama al handler original intacto. | Solo presentación de reglas existentes |
| `validation.js` | Funciones puras (`fieldMessage(validity, fallback)`, `googleButtonWidth(px)`) con tests `node --test`. | No |

`GoogleAuthButton.jsx`: se quita `render` (no existe en `@react-oauth/google`) y `width` pasa a
número. Nada más de la inicialización cambia (`onSuccess`, `onError`, `locale`, `useOneTap`,
`theme="filled_black"`, `text="signin_with"`, `shape="pill"`, `logo_alignment="left"` se mantienen).

## 5. Formularios

- Un `<form noValidate>` por pestaña, un único `type="submit"`, Enter envía.
- Atributos:
  - Login: email `name="email" type="email" inputMode="email" autoComplete="email"
    autoCapitalize="off" spellCheck={false}`; contraseña `name="password"
    autoComplete="current-password"`.
  - Registro: `name="name" autoComplete="name"`; email igual que login; contraseñas
    `name="password"` / `name="confirmPassword"` con `autoComplete="new-password"`.
- Inputs `h-12 text-base` (17 px ≥ 16 px: sin zoom en iOS). Pegar no se bloquea.
- Registro: contraseña y repetir **apiladas** (hoy van en 2 columnas a ≥ 640 px; a 400 px de columna
  no caben con holgura).
- Estados del input (sobre `inputClass`, ampliado): reposo, hover, foco (anillo `brand` 4 px a 15 %
  + borde `brand-400/70`), relleno, error (`border-danger` + anillo `danger`), deshabilitado
  (`opacity-60`, `cursor-not-allowed`, durante el envío), autorrelleno (`:-webkit-autofill` con
  `box-shadow` interior `surface-3` y `-webkit-text-fill-color: ink`; transición larga del
  `background-color` para que no aparezca el amarillo).
- Validación nativa mostrada en línea: icono + texto `text-danger` bajo el campo,
  `id` enlazado por `aria-describedby`, `aria-invalid="true"`. Texto = `validationMessage` del
  navegador hasta que se aprueben los textos propios (§10).
- Error del servidor (`loginError` / `registerError`): zona `role="alert"` **encima** del botón,
  con icono, fondo `danger/10`, texto `danger`. Al aparecer, pequeño desplazamiento horizontal
  (§7). Contenido y condiciones idénticos a hoy.
- "¿Has olvidado tu contraseña?": misma acción; colocado a la derecha de la etiqueta pero **después
  del input en el DOM** (orden visual con `order`/grid), con zona clicable de 44 px de alto.
- Bloq Mayús: `getModifierState('CapsLock')` en `keydown`/`keyup` del campo de contraseña;
  aviso `text-ink-2` con icono, `aria-live="polite"`.

## 6. Diálogo

- Portal a `document.body`. Al abrir: guarda `document.activeElement`; aplica `inert` a los hijos
  directos de `#root` que existan en ese momento (un toast que aparezca después no queda inerte y
  se sigue anunciando); `html` con `overflow: hidden` + `scrollbar-gutter: stable` (sin salto por
  la barra, tampoco en la cabecera fija); `data-lenis-prevent` en el velo.
- Foco inicial: email de la pestaña activa. Tab/Shift+Tab ciclan dentro de la tarjeta (incluido el
  iframe de Google).
- Escape y × cierran. El clic en el velo **no** cierra (hoy tampoco), para no perder lo escrito.
- Cierre: anima la salida y **después** llama a `onClose` (equivale a los 350 ms actuales). Los
  cierres por éxito mantienen su secuencia actual (`onClose` inmediato + `navigate` a 10 ms).
- Retorno de foco: al elemento que lo abrió si sigue en el DOM y es enfocable; si no (caso
  `/login`), al botón `[data-auth-trigger]` de la cabecera si está visible; si no, a `<main>`
  (con `tabindex="-1"` temporal). En `/login` la navegación no cambia: se cierra y se queda en
  `/login` como hoy.
- Pestañas: `role="tablist"` con dos `role="tab"` (`aria-selected`, `aria-controls`,
  `tabIndex` itinerante), flechas ←/→ e Inicio/Fin cambian y enfocan; cada formulario es un
  `role="tabpanel"` con `aria-labelledby`. Justificación: son dos vistas excluyentes del mismo
  diálogo; el patrón de pestañas anuncia "pestaña 1 de 2, seleccionada" y el panel.
- `aria-labelledby` → el título (que cambia con la pestaña). El cambio de título se anuncia por el
  cambio de pestaña; no se añade otra región viva.
- Puente con el fondo: `setOverlay(true)` al abrir y `false` al cerrar/desmontar
  (`journey/store.js`). Fuera de la home no hay lienzo que lo lea: es una escritura en un objeto
  plano y un `notify()` sin oyentes.

### Globo mientras el diálogo está abierto (`GlobeCanvas` → `Director`)

- Muelle `dim` (0→1) con `stepSpring` dentro de `useFrame`, objetivo `journey.overlay ? 1 : 0`.
- Opacidad del lienzo × `(1 − 0.45·dim)`; giro y tiempo de shaders × `(1 − 0.8·dim)` (acumulador
  propio para `uTime`).
- Modo estático (reduced motion / gama baja): `dim` salta al objetivo y el `notify()` de
  `setOverlay` ya dispara `invalidate()` vía `StillInvalidator`.
- Ningún `setState`: cero re-renders del Canvas.

## 7. Movimiento (tokens de `lib/motion.js`)

| Nombre | Qué | Cómo |
|---|---|---|
| Aparición del diálogo | velo + tarjeta | velo: `overlay`; tarjeta: `scale .96→1` + `opacity`, `spring.gentle`, `transform-origin` en el centro del botón que lo abrió (relativo a la tarjeta; centro si no hay). Móvil: `y 24→0` + opacidad. Salida: `duration.fast`, `ease.exit`. Interrumpible (muelles). |
| Entrada escalonada | cabecera, pestañas, campos, botón | `y 8→0` + opacidad, `stagger.list` (50 ms), solo al abrir. |
| Píldora deslizante | indicador de pestaña | `layoutId`, `spring.glide`. |
| Fundido cruzado de título | título y subtítulo | `AnimatePresence mode="popLayout"`, opacidad + `y 4`, `duration.fast`. |
| Transformación de altura | tarjeta | `layout` en la tarjeta (transform, con corrección de hijos `layout="position"`), `spring.gentle`; paneles con `popLayout` + opacidad. |
| Foco de input | borde/anillo | CSS `transition` 200 ms `ease-standard` (ya en `inputClass`). |
| Error | alerta del servidor | `x: [0, −6, 5, −2, 0]` en `duration.base`, una vez por error nuevo. |
| Pulsación | botón principal | `whileTap scale .97` (ya en `Button`). |

`prefers-reduced-motion`: sin escala ni desplazamientos ni sacudida; solo opacidad con
`duration.fast`; la píldora cambia sin deslizar; la altura cambia sin animar.

## 8. Móvil (360–390 px)

- < 640 px: hoja a pantalla completa (`h-dvh`, `rounded-none`), cabecera con
  `pt-[max(1rem,env(safe-area-inset-top))]`, pie con `pb-[max(1.5rem,env(safe-area-inset-bottom))]`,
  contenido con scroll propio.
- Teclado virtual: la hoja toma su altura de `visualViewport.height` (escrita como variable CSS
  desde un listener, sin estado de React); al enfocar un campo, `scrollIntoView({ block: 'nearest' })`.
- Nada sobrepasa 360 px: Google con `width` medido del contenedor (≥ 200, ≤ 400).

## 9. Google

- `width = clamp(200, anchoContenedor, 400)` medido **una vez** al montar el diálogo
  (`getBoundingClientRect` del contenedor), no en cada redimensionado.
- Contenedor con alto reservado (`h-10`, 40 px = alto del botón `large`) y un esqueleto en forma de
  píldora (`bg-surface-3`) que se funde cuando aparece el iframe: sin salto.
- Mismo ancho que el botón principal cuando la columna mide 400 px; en columnas más estrechas
  ambos ocupan el ancho de la columna.
- Limitación conocida: el botón personalizado de Google ("Inicia sesión como…") lo pinta Google;
  su aspecto dentro de `filled_black` no se controla desde aquí.

## 10. Pendiente de decisión

1. **Título de registro** (pareja de "Bienvenido de nuevo"): propuesta principal
   **"Bienvenido al campus"**; alternativas "Empieza tu formación" o, neutra en género,
   "Te damos la bienvenida" (que obligaría a cambiar también el de login a "Hola de nuevo").
2. **Indicador de coincidencia de contraseñas** (no bloquea el envío, sin `aria-invalid`):
   bajo "Repetir contraseña", solo cuando tiene texto, en `aria-live="polite"`:
   "✓ Las contraseñas coinciden" (`text-brand`) / "Las contraseñas no coinciden" (`text-ink-2`
   con icono). No se implementa sin OK.
3. **Textos propios de validación** (sustituirían a `validationMessage` del navegador):
   vacío → "Escribe tu correo electrónico" / "Escribe tu contraseña" / "Escribe tu nombre";
   formato → "Revisa el correo: debe parecerse a nombre@dominio.com".
4. **Arrastrar para cerrar en móvil**: fuera; propuesta para cuando exista un componente de hoja.
5. **Página `/login` vacía de fondo**: al cerrar el diálogo queda una página en blanco (como hoy).
   Propuesta: que muestre la home detrás o un estado vacío con botón "Acceder". No se toca.
6. **Precarga en Cursos y en el hero**: la precarga es al pasar/enfocar "Acceder" de la cabecera
   (lo pedido). Abrir desde una tarjeta de curso o desde "Empezar" del hero espera la primera
   carga del chunk (pequeño). Propuesta: precargar también ahí o en `requestIdleCallback`.
7. **Clic en el velo**: hoy no cierra; se mantiene así. Confirmar.

## 11. Archivos

Nuevos: `src/components/auth/{LazyAuthModal,AuthDialog,AuthTabs,TextField,PasswordField,SubmitButton,AuthDivider}.jsx`,
`src/components/auth/{useNativeValidation,validation}.js`, `src/components/auth/validation.test.js`.

Modificados:
- `src/components/auth/AuthModal.jsx`, `src/components/auth/GoogleAuthButton.jsx`
- `src/index.css` (token `--color-danger`, estilos de autorrelleno)
- `src/lib/motion.js` (nombre para la sacudida de error)
- `src/components/globe/journey/store.js` (`overlay`, `setOverlay`)
- `src/components/globe/GlobeCanvas.jsx` (atenuación en `Director`)
- `src/components/layout/Header.jsx`, `src/pages/Home.jsx`, `src/pages/Cursos.jsx`,
  `src/pages/Login.jsx`: solo la importación (`LazyAuthModal`); `Header` además añade
  precarga (`onPointerEnter`/`onFocus`) y `data-auth-trigger` al botón "Acceder".

## 12. Verificación

- `npm run build`, `npm run lint`, `npm test` y `node --test src/components/auth/validation.test.js`.
- Bundle: comparar el chunk de entrada antes/después (debe bajar: el modal sale del inicial).
- Capturas antes/después (1440, 1024, 390, 360) de login, registro, error, carga y foco; vídeo del
  cambio de pestaña y de apertura/cierre.
- Flujos reales (login ok/ko, registro, olvido, Google), gestor de contraseñas, teclado, lector de
  pantalla, contraste AA, zoom 200 %, `git diff --name-only main`.
