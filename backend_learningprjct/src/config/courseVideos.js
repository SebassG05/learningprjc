// Vídeo de presentación de cada curso: courseId → asset de Cloudinary (resource_type video).
// Solo lo lee el backend: el front recibe una URL ya decidida por GET /api/courses/:id/video.
// Para añadir un vídeo: subirlo a Cloudinary, copiar su public_id y versión aquí y desplegar.
export const COURSE_VIDEOS = Object.freeze({
  // Modelización de carbono
  '69d50406663e8648d7ee1f08': Object.freeze({ publicId: 'Carbono_modelos_con_intro_pyzhch', version: 1792652270 }),
});

export const videoFor = (courseId) => (Object.hasOwn(COURSE_VIDEOS, courseId) ? COURSE_VIDEOS[courseId] : null);
