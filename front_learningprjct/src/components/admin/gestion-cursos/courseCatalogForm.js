// Campos de área, nivel y profesor en el formulario de Gestión de cursos: valores iniciales, envío y validación.

// Valores del formulario a partir de un curso (o vacíos para uno nuevo)
export const catalogFormValues = (curso) => ({
  area: curso?.area || '',
  nivel: curso?.nivel || '',
  profesorNombre: curso?.profesor?.nombre || '',
  profesorBio: curso?.profesor?.bio || '',
  profesorFoto: curso?.profesor?.foto || '',
  profesorFotoFile: null,
  profesorQuitarFoto: false,
});

// Añade los campos al FormData del envío. Cadena vacía = borrar en el backend.
export function appendCatalogFields(formData, v) {
  formData.append('area', v.area);
  formData.append('nivel', v.nivel);
  formData.append('profesorNombre', v.profesorNombre.trim());
  formData.append('profesorBio', v.profesorBio.trim());
  if (v.profesorFotoFile) formData.append('profesorFoto', v.profesorFotoFile);
  else if (v.profesorQuitarFoto) formData.append('profesorQuitarFoto', 'true');
}

// El profesor necesita nombre si se rellena algo más
export const catalogFieldsError = (v) =>
  !v.profesorNombre.trim() && (v.profesorBio.trim() || v.profesorFotoFile) ? 'Añade el nombre del profesor o deja vacíos la bio y la foto' : null;
