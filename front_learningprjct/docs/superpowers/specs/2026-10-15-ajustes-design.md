# Ajustes (`/ajustes`) — diseño

Rama `feat/ajustes`. Rediseño visual de la página de ajustes del alumno, sin cambiar lo que hacen el restablecimiento de contraseña ni el consentimiento de cookies (salvo el arreglo aprobado de la sección 4).

## 1. Dirección

"Hoja de cuenta" con dos guiños del "panel de estación": una columna de 672 px (`max-w-2xl`), con la cuenta del alumno arriba y grupos con su título fuera de una única superficie, sin tarjetas anidadas. Un halo verde muy tenue en CSS tras la cabecera y un resumen en lenguaje claro ("3 de 4 tipos de cookies activos"), calculado solo a partir de lo guardado.

Se descartó la columna lateral tipo macOS: con dos secciones sería decoración.

## 2. Estructura

| Archivo | Papel |
|---|---|
| `pages/Ajustes.jsx` | Página fina: `usePageMeta`, orquesta la entrada escalonada. |
| `components/ui/SettingsSection.jsx` | Genérico: `<section>` con `<h2>`, descripción, `aside`, superficie con filetes y `footer`. |
| `components/ui/SettingsRow.jsx` | Genérico: icono, título, insignia, descripción, `meta`, control (nodo o función que recibe los ids de nombre y descripción), `layout="stack"` y `onActivate`. |
| `components/ui/Switch.jsx` | Genérico: `role="switch"`, ✓ / candado, `locked` con `aria-disabled`, zona táctil de 44 px, muelle `snappy` (instantáneo con reduced motion). |
| `components/settings/SettingsHeader.jsx` | `<h1>`, subtítulo, cuenta (inicial, nombre y email como en el menú del usuario) y "Ir a cursos". |
| `components/settings/SecuritySection.jsx` | Fila "Contraseña" con un enlace a `/forgot-password` (mismo destino que el `navigate` de antes). |
| `components/settings/PrivacySection.jsx` | Contenedor con la lógica de siempre (antes `configuration/CookiePreferences.jsx`, movido con `git mv`). |
| `components/settings/CookieCategoryRow.jsx` | Fila memorizada por categoría. |
| `components/settings/ConsentStatus.jsx` | Resumen de solo lectura de lo guardado. |
| `components/settings/ConsentActions.jsx` | Barra: estado (`role="status"`), "Rechazar todas" y "Aceptar todas" con el mismo peso, "Guardar cambios" como primario, y "Restablecer preferencias de cookies". |
| `components/settings/settingsCopy.js` | Todos los textos. Los de las categorías se movieron sin cambios. |

## 3. Comportamiento que se mantiene

- La contraseña se restablece en `/forgot-password`. Ajustes no envía emails ni tiene estados de envío.
- Las cookies se guardan igual que antes: con "Guardar cambios", y "Aceptar todas" / "Rechazar todas" guardan en el momento. Mismo hook, mismas claves de `localStorage`, mismos valores, confirmación durante 3 s y "Restablecer" con el mismo `confirm()`.
- El banner de cookies (`components/cookies/`) no comparte componentes con esta página y no se ha tocado.

## 4. Arreglo de lógica aprobado

Los interruptores salían siempre apagados, porque la copia local se tomaba antes de que el hook leyera `localStorage`, y "Guardar" sobrescribía el consentimiento real. Ahora la copia se sincroniza con lo guardado (commit `61f120b`).

## 5. Presentación nueva derivada del estado existente

- **"Cambios sin guardar":** aparece cuando la copia local difiere de lo guardado. Solo se muestra; no cambia cuándo se guarda.
- **Barra de acciones fija abajo:** solo con cambios pendientes o mientras se ve la confirmación. En reposo queda en su sitio y no tapa nada.

## 6. Textos aplicados

| Elemento | Texto |
|---|---|
| `<title>` | "Ajustes · Evenor-Tech Campus" |
| `<h1>` | "Ajustes" |
| Subtítulo | "Tu cuenta en el campus" |
| Fila de contraseña | "Contraseña" / "Te enviaremos un enlace por email para crear una nueva." |
| Botón de contraseña | "Restablecer contraseña" (corrige la errata "Reestablecer") |
| Confirmación | "Preferencias guardadas" |
| Enlaces nuevos a rutas existentes | "Ir a cursos" → `/cursos`; "Política de cookies" → `/politica-cookies` |

## 7. Pendiente de decisión

1. **Proteger `/ajustes` por sesión.** Hoy cualquiera la abre; sin sesión se ve sin el bloque de cuenta.
2. **`noindex`** para la ruta privada (`usePageMeta` solo gestiona la descripción).
3. **"Cerrar sesión" dentro de Ajustes**, con la misma `logout` del header.
4. **Mostrar el email de destino o enviar el enlace desde la propia fila.** Hoy el email se escribe en `/forgot-password`; enviarlo desde aquí sería lógica nueva.
5. **"Restablecer preferencias" no vuelve a mostrar el banner hasta recargar.** Cada componente tiene su propia instancia de `useCookieConsent`; la solución sería un contexto compartido.
6. **`PoliticaCookies` lanza el evento `openCookieSettings` y nadie lo escucha.**
7. **Textos de las categorías (revisión legal).**
   - No coinciden entre el banner y Ajustes.
   - Los funcionales citan "tema oscuro/claro", que no existe.
   - La analítica y el marketing solo hacen `console.log`.
8. **`confirm()` nativo para "Restablecer preferencias".** Se podría sustituir por una confirmación en línea, lo que cambiaría la interacción.
9. **`viewport-fit=cover` en `index.html`**, para que `env(safe-area-inset-bottom)` tenga efecto en iPhone.
10. **Landmarks:** el footer se renderiza dentro de `<main>` (en `Layout`), así que sus `h2` cuelgan del contenido principal.
11. **Lighthouse:** el enlace del logo del header tiene un `aria-label` que no incluye su texto visible. Ya pasaba en `main`.
