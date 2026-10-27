# Despliegue: temario nuevo de Carbono (rama `feat/carbono-temas`)

Temario de octubre de 2026 en los 4 temas de «Modelización de la dinámica del carbono del suelo»: PDF y vídeo por tema, escenas en el aula y paso de los PDF y vídeos a Cloudinary `authenticated` (opción A: solo los ve quien tiene acceso por cohorte).

El orden importa. Cada script tiene simulacro: ejecútalo **sin** `--apply`, revisa la salida y guárdala. La salida del simulacro es la copia de los valores anteriores.

## 0. Antes

- [ ] Backend: `npm test` pasa (307 tests).
- [ ] Front: `npm test` (107) y `npm run build` pasan.
- [ ] Están desplegados los cambios de cohortes (293d5d5, 390b7b4), porque esta rama depende de ellos.

## 1. Desplegar backend y front juntos

- [ ] Backend en el VPS: `git pull`, `npm ci --omit=dev` y reiniciar **`campus-backend.service`** (no `gestiona-backend`).
- [ ] Front: build y publicación.
- [ ] Comprobar que `GET /api/courses/69d50406663e8648d7ee1f08` responde. Mientras los temas no tengan vídeo ni índice, el aula sigue mostrando la lista de siempre.

## 2. Contenido de los temas

```bash
node src/scripts/actualizarTemasCarbono.js            # simulacro: 24 cambios (6 por tema)
node src/scripts/actualizarTemasCarbono.js --apply
```

- [ ] Ningún aviso de «el tema N no existe».
- [ ] El aula muestra las 4 escenas. En este momento los PDF y los vídeos aún son públicos (`upload`).

## 3. Pasar PDF y vídeos a `authenticated`

```bash
node src/scripts/moverMaterialesAAuthenticated.js            # simulacro: 4 PDF (image) + 4 vídeos
node src/scripts/moverMaterialesAAuthenticated.js --apply
```

- [ ] Todos en `✓`. Si alguno falla, repite el script: es idempotente.
- [ ] Las URLs públicas de Cloudinary de los PDF y los vídeos dejan de funcionar (404). **Es lo esperado.**
- [ ] Repetir el paso 2 con `--apply` no vuelve a poner nada en público (comprobado en los tests).

## 4. Generar las versiones de los vídeos

```bash
node src/scripts/calentarVideosTemas.js
```

Pide cada vídeo en 720p y en original como Chrome, Safari (iOS) y Firefox, más los pósters. La primera vez puede tardar varios minutos por vídeo. Debe terminar en «Todo generado».

## 5. Verificar en producción

- [ ] Como alumno con plaza activa: los 4 vídeos se reproducen, «Ver temario» abre el visor y «Descargar PDF» descarga.
- [ ] En un **iPhone real**: «Ver temario» abre el PDF en una pestaña con el visor de iOS, y el vídeo se reproduce sin pantalla completa forzada.
- [ ] Como usuario sin plaza: la ficha de inscripción no muestra vídeos ni PDF. `POST …/materiales/:id/enlace` y `GET …/temas/:id/video` devuelven 403.

## Vuelta atrás

- Cloudinary: `node src/scripts/moverMaterialesAAuthenticated.js --revert`.
- Contenido: restaurar a mano con los valores de la salida del simulacro del paso 2.
- Código: desplegar el commit anterior. Si los temas tienen `video` o `apartados`, el front anterior los ignora y muestra la lista.

## Pendiente fuera de esta rama

- Los PDF del temario **anterior** (`raw/upload/…`) siguen públicos en Cloudinary aunque ya no se usen. Borrarlos o moverlos solo con el OK del usuario.
- El vídeo de la ficha de inscripción (`config/courseVideos.js`) sigue en `upload`. Su migración es `migrarVideoAuthenticated.js`, todavía pendiente de OK (ver la memoria de *curso-video*).
- Los títulos y descripciones en inglés de los temas no se han tocado. El script avisa si existen.
