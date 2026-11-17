# Dudas del curso y profesores por correo — diseño

Fecha: 2026-11-17 · Estado: aprobado (pasos 0 y 2 del encargo) · Rama de trabajo: `feature/dudas`

## 1. Qué se construye

Preguntas y respuestas ligadas a cada tema («Dudas de este tema»), una página que las reúne
(`/curso/:id/dudas`, «Dudas del curso»), una página para profesores («Mis dudas pendientes»), una
pestaña «Dudas» en `/admin/correcciones` y, en la edición del curso, la sección «Profesores».
No es un foro de hilos libres. No cuenta para el anillo de progreso.

## 2. Decisiones

| Tema | Decisión |
|---|---|
| Profesores | Lista por curso en `Course.profesores`, por correo. No es un rol global de `User`. |
| Verificación | La app no verifica correos con contraseña. Se vincula solo por enlace de un solo uso enviado al correo invitado, o por Google con `email_verified === true` y el mismo correo. Una cuenta existente con ese correo **no** basta. |
| Cuenta distinta | Se puede canjear el enlace con una cuenta de otro correo, tras confirmar. El admin ve la cuenta vinculada y se manda un correo a la dirección invitada: «El acceso se activó en la cuenta X». |
| Enlace | 14 días, un solo uso, `sha256` en BD, reenviar invalida el anterior, quitar a un pendiente borra `tokenHash`. Límite de intentos en vista previa y canje. El token va en el fragmento (`/profesor/invitacion#token=…`), la vista previa es `POST /api/profesor/invitacion/vista` (no `GET /:token`), y la página lo lee y lo borra con `history.replaceState`: no llega a los registros del servidor ni al Referer. |
| Límite | 10 profesores por curso. |
| Acceso del profesor | `isCourseTeacher(viewer, course)` en `service/courseAccess.js`, única regla. Curso privado sin cohorte → `{ level: 'readonly', reason: 'teacher' }`; con cohorte gana el mejor. Siempre se devuelve `teacher: boolean`. El front solo lee `curso.access.teacher`. |
| Condiciones | El profesor las acepta con el mismo `TermsGate` la primera vez; se guarda igual que la de un alumno. |
| Visibilidad | Todo el que puede leer el curso, de todas las cohortes. En un curso **público**, solo los inscritos (`UserProgress`), los profesores activos del curso y los admins (anónimo 401, con sesión sin inscripción 403); el resto de reglas se aplican igual. Las ocultas solo las ven profesores del curso y admins. |
| Quién publica | Preguntar y responder: escritura en el curso (`allows(level,'write')`), o profesor del curso, o admin. Cohorte cerrada: solo lee. |
| Firma | Alumno: «Nombre I.» (nunca sale el apellido completo). Profesor del curso: nombre real + «Profesor». Admin que no es profesor del curso: nombre real + «Equipo docente». Se guarda al publicar; quitar a un profesor no cambia sus respuestas. |
| Estado | `abierta` → `respondida` (solo con respuesta visible de profesor o equipo) → `resuelta` (autor, profesor o admin). Reabrir vuelve a `respondida`/`abierta`. |
| Moderación | Profesores del curso y admins: fijar, ocultar (sin borrar), resolver, ver reportes (cuántos, el motivo y cuándo; nunca quién reportó). Un profesor de otro curso no modera. |
| Editar y borrar | Lo propio. Una duda sin respuestas se borra; con respuestas se **retira**: se borran de la BD `titulo`, `texto`, `autorNombre` y `autorId`, y se muestra «Duda retirada por su autor»; las respuestas siguen. Las respuestas propias se editan («editada») o se borran. |
| Idioma | `lang` (`es`/`en`) en cada duda; se mezclan en la lista. |
| Avisos | Pregunta nueva → correo a los profesores vinculados del curso (si no hay, a `EMAIL_USER`). Respuesta de profesor o equipo → correo al autor, una vez por respuesta. «Respuesta nueva» en la app hasta que el autor la ve. |
| Aviso de privacidad | En los formularios de preguntar y responder, encima del botón, sin casilla: «Tu duda la verán los alumnos y profesores de este curso, también los de próximas ediciones, con tu nombre y la inicial de tu apellido. No incluyas datos personales. Puedes editarla o retirarla cuando quieras.» (Para responder: «Tu respuesta la verán…»). El punto 8 de las condiciones queda para la próxima revisión legal; **no** se sube la versión. |
| Límites | Preguntas 10/h, respuestas 30/h, ediciones 30/h, reportes 10/h, vista previa de invitación 30/15 min, canje 10/15 min (`createRateLimit`, por IP). Título ≤120, texto ≤2000, respuesta ≤2000, motivo de reporte ≤300. Texto plano. |

## 3. Fuera de alcance

Adjuntos, minuto del vídeo, votos, buscador, resumen diario, centro de notificaciones, réplica en
correcciones. No se tocan el anillo de progreso, la corrección ni las reglas de cohortes (salvo la
lectura de profesores). Sin dependencias nuevas. Sin despliegue.
