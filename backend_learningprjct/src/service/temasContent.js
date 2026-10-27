// Actualiza el contenido de los temas de un curso (título, descripción, índice, conceptos clave, vídeo y
// PDF del temario) a partir de una definición como config/carbonoTemas.js. Idempotente: solo escribe lo
// que difiere, y un PDF o vídeo que ya apunta al mismo asset (aunque ya esté migrado a «authenticated»)
// no se toca, así que repetirlo tras moverMaterialesAAuthenticated.js no devuelve nada a público.
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import { cloudinaryFileAsset } from './materialFiles.js';

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const assetId = (url) => cloudinaryFileAsset(url)?.publicId ?? url ?? null;
const plain = (value) => (value?.toObject ? value.toObject() : value);

// Material que hace de temario: el primer PDF del tema (o el primer material si no hay ninguno marcado)
const temarioOf = (tema) => tema.materiales.find((m) => m.tipo === 'pdf') ?? tema.materiales[0] ?? null;

function planTema(tema, def) {
  const changes = [];
  const set = (field, to, apply) => {
    changes.push({ tema: def.numeroTema, field, from: field === 'pdf' ? null : plain(tema[field]) ?? null, to });
    apply();
  };

  for (const field of ['titulo', 'descripcion']) {
    if (tema[field] !== def[field]) set(field, def[field], () => { tema[field] = def[field]; });
  }
  for (const field of ['apartados', 'conceptosClave']) {
    if (!same(plain(tema[field]), def[field])) set(field, def[field], () => { tema[field] = def[field]; });
  }
  if (tema.video?.publicId !== def.video.publicId) {
    set('video', def.video.publicId, () => { tema.video = { ...def.video, type: 'upload' }; });
  }

  const titulo = `Temario · Tema ${def.numeroTema}`;
  const material = temarioOf(tema);
  if (!material) {
    set('pdf', def.pdf, () => tema.materiales.push({ tipo: 'pdf', titulo, archivo: def.pdf, idioma: 'es' }));
  } else if (assetId(material.archivo) !== assetId(def.pdf)) {
    const before = material.archivo ?? null;
    set('pdf', def.pdf, () => Object.assign(material, { tipo: 'pdf', titulo, archivo: def.pdf }));
    changes.at(-1).from = before;
  }
  return changes;
}

/**
 * @param {{ courseId, temas: Array, apply?: boolean }} input
 * @returns {Promise<{ course: { _id, title }, changes: Array<{ tema, field, from, to }>, missing: number[], warnings: string[] }>}
 */
export async function applyTemasContent({ courseId, temas, apply = false }) {
  if (!mongoose.isValidObjectId(courseId)) throw new Error(`Id de curso no válido: ${courseId}`);
  const course = await Course.findById(courseId);
  if (!course) throw new Error(`El curso ${courseId} no existe`);

  const changes = [];
  const missing = [];
  const warnings = [];
  for (const def of temas) {
    const tema = course.temas.find((t) => t.numeroTema === def.numeroTema);
    if (!tema) {
      missing.push(def.numeroTema);
      continue;
    }
    changes.push(...planTema(tema, def));
    if (tema.tituloEn || tema.descripcionEn) {
      warnings.push(`Tema ${def.numeroTema}: el título o la descripción en inglés siguen siendo los anteriores`);
    }
    const material = temarioOf(tema);
    if (material?.archivoEn && assetId(material.archivoEn) !== assetId(def.pdf)) {
      warnings.push(`Tema ${def.numeroTema}: el temario en inglés (archivoEn) sigue siendo el PDF anterior`);
    }
  }
  if (apply && changes.length) await course.save();
  return { course: { _id: String(course._id), title: course.title }, changes, missing, warnings };
}
