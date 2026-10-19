// Valores y validación del formulario de un tema. Sin React.
export const topicFormValues = (t) => ({
  titulo: t?.titulo ?? '',
  tituloEn: t?.tituloEn ?? '',
  descripcion: t?.descripcion ?? '',
  descripcionEn: t?.descripcionEn ?? '',
});

export const topicHasTitle = (v) => Boolean(v.titulo.trim() || v.tituloEn.trim());

export const topicLabel = (t) => t.titulo || t.tituloEn || `Tema ${t.numeroTema}`;
