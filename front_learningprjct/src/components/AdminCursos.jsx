import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Edit2, Trash2, Eye, EyeOff, Save, X,
  Upload, FileText, Video, Link as LinkIcon, AlertCircle,
  CheckCircle, Loader, ChevronDown, ChevronUp, Image as ImageIcon
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AdminCursos() {
  const { showToast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursoEditando, setCursoEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cursoExpandido, setCursoExpandido] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    image: '',
    imageFile: null,
    category: [],
    objetivosGenerales: [],
    objetivosEspecificos: [],
    isOpen: false
  });

  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevoObjetivoGeneral, setNuevoObjetivoGeneral] = useState('');
  const [nuevoObjetivoEspecifico, setNuevoObjetivoEspecifico] = useState('');

  // Cargar cursos
  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/courses`);
      if (!response.ok) throw new Error('Error al cargar cursos');
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar cursos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetFormulario = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      image: '',
      imageFile: null,
      category: [],
      objetivosGenerales: [],
      objetivosEspecificos: [],
      isOpen: false
    });
    setNuevaCategoria('');
    setNuevoObjetivoGeneral('');
    setNuevoObjetivoEspecifico('');
    setCursoEditando(null);
    setMostrarFormulario(false);
  };

  const abrirFormularioNuevo = () => {
    resetFormulario();
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (curso) => {
    setCursoEditando(curso);
    setFormData({
      title: curso.title || '',
      description: curso.description || '',
      duration: curso.duration || '',
      image: curso.image || '',
      imageFile: null,
      category: curso.category || [],
      objetivosGenerales: curso.objetivosGenerales || [],
      objetivosEspecificos: curso.objetivosEspecificos || [],
      isOpen: curso.isOpen || false
    });
    setMostrarFormulario(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen no debe superar los 5MB', 'error');
        return;
      }
      setFormData({ ...formData, imageFile: file });
    }
  };

  const agregarCategoria = () => {
    if (nuevaCategoria.trim() && !formData.category.includes(nuevaCategoria.trim())) {
      setFormData({
        ...formData,
        category: [...formData.category, nuevaCategoria.trim()]
      });
      setNuevaCategoria('');
    }
  };

  const eliminarCategoria = (cat) => {
    setFormData({
      ...formData,
      category: formData.category.filter(c => c !== cat)
    });
  };

  const agregarObjetivoGeneral = () => {
    if (nuevoObjetivoGeneral.trim()) {
      setFormData({
        ...formData,
        objetivosGenerales: [...formData.objetivosGenerales, nuevoObjetivoGeneral.trim()]
      });
      setNuevoObjetivoGeneral('');
    }
  };

  const eliminarObjetivoGeneral = (index) => {
    setFormData({
      ...formData,
      objetivosGenerales: formData.objetivosGenerales.filter((_, i) => i !== index)
    });
  };

  const agregarObjetivoEspecifico = () => {
    if (nuevoObjetivoEspecifico.trim()) {
      setFormData({
        ...formData,
        objetivosEspecificos: [...formData.objetivosEspecificos, nuevoObjetivoEspecifico.trim()]
      });
      setNuevoObjetivoEspecifico('');
    }
  };

  const eliminarObjetivoEspecifico = (index) => {
    setFormData({
      ...formData,
      objetivosEspecificos: formData.objetivosEspecificos.filter((_, i) => i !== index)
    });
  };

  const guardarCurso = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('El título y la descripción son obligatorios', 'error');
      return;
    }

    try {
      setGuardando(true);

      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('duration', formData.duration || '0 horas');
      formDataToSend.append('isOpen', formData.isOpen);
      formDataToSend.append('category', JSON.stringify(formData.category));
      formDataToSend.append('objetivosGenerales', JSON.stringify(formData.objetivosGenerales));
      formDataToSend.append('objetivosEspecificos', JSON.stringify(formData.objetivosEspecificos));

      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      } else if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = cursoEditando
        ? `${apiUrl}/api/courses/${cursoEditando._id}`
        : `${apiUrl}/api/courses`;
      
      const method = cursoEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje || 'Error al guardar curso');
      }

      showToast(
        cursoEditando ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente',
        'success'
      );
      
      resetFormulario();
      cargarCursos();
    } catch (error) {
      console.error('Error:', error);
      showToast(error.message || 'Error al guardar curso', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCurso = async (cursoId) => {
    if (!confirm('¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/courses/${cursoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar curso');

      showToast('Curso eliminado exitosamente', 'success');
      cargarCursos();
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar curso', 'error');
    }
  };

  const toggleCursoOpen = async (curso) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/courses/${curso._id}/toggle-open`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al cambiar estado del curso');

      showToast(
        `Curso ${curso.isOpen ? 'cerrado' : 'abierto'} exitosamente`,
        'success'
      );
      cargarCursos();
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cambiar estado del curso', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Cursos</h2>
            <p className="text-gray-600">Crear y administrar cursos de la plataforma</p>
          </div>
        </div>
        <button
          onClick={abrirFormularioNuevo}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Curso
        </button>
      </div>

      {/* Formulario de creación/edición */}
      <AnimatePresence>
        {mostrarFormulario && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {cursoEditando ? 'Editar Curso' : 'Nuevo Curso'}
              </h3>
              <button
                onClick={resetFormulario}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={guardarCurso} className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Curso *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: Modelización Dinámica de Carbono"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                  placeholder="Descripción detallada del curso..."
                  required
                />
              </div>

              {/* Duración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: 18 horas"
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Curso
                </label>
                <div className="flex gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {(formData.image || formData.imageFile) && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      Imagen seleccionada
                    </div>
                  )}
                </div>
                {formData.image && !formData.imageFile && (
                  <img
                    src={formData.image}
                    alt="Imagen actual"
                    className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                )}
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorías
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCategoria())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Ciencia del Suelo"
                  />
                  <button
                    type="button"
                    onClick={agregarCategoria}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.category.map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => eliminarCategoria(cat)}
                        className="hover:text-green-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Objetivos Generales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivos Generales
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nuevoObjetivoGeneral}
                    onChange={(e) => setNuevoObjetivoGeneral(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarObjetivoGeneral())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Añadir objetivo general..."
                  />
                  <button
                    type="button"
                    onClick={agregarObjetivoGeneral}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <ul className="space-y-2">
                  {formData.objetivosGenerales.map((obj, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="flex-1 text-sm text-gray-700">{obj}</span>
                      <button
                        type="button"
                        onClick={() => eliminarObjetivoGeneral(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Objetivos Específicos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivos Específicos
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nuevoObjetivoEspecifico}
                    onChange={(e) => setNuevoObjetivoEspecifico(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarObjetivoEspecifico())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Añadir objetivo específico..."
                  />
                  <button
                    type="button"
                    onClick={agregarObjetivoEspecifico}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <ul className="space-y-2">
                  {formData.objetivosEspecificos.map((obj, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="flex-1 text-sm text-gray-700">{obj}</span>
                      <button
                        type="button"
                        onClick={() => eliminarObjetivoEspecifico(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Estado (Abierto/Cerrado) */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isOpen"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                />
                <label htmlFor="isOpen" className="text-sm font-medium text-gray-700">
                  Curso abierto (visible para estudiantes)
                </label>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {cursoEditando ? 'Actualizar Curso' : 'Crear Curso'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetFormulario}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de cursos */}
      <div className="space-y-4">
        {cursos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No hay cursos creados
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primer curso
            </p>
            <button
              onClick={abrirFormularioNuevo}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Curso
            </button>
          </div>
        ) : (
          cursos.map((curso) => (
            <motion.div
              key={curso._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {curso.image && (
                    <img
                      src={curso.image}
                      alt={curso.title}
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {curso.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">{curso.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {curso.isOpen ? (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <Eye className="w-4 h-4" />
                            Abierto
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            <EyeOff className="w-4 h-4" />
                            Cerrado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <span>⏱️ {curso.duration || 'Sin duración'}</span>
                      <span>📚 {curso.temas?.length || 0} temas</span>
                      {curso.category && curso.category.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {curso.category.map((cat, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirFormularioEditar(curso)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => toggleCursoOpen(curso)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {curso.isOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {curso.isOpen ? 'Cerrar' : 'Abrir'}
                      </button>
                      <button
                        onClick={() => eliminarCurso(curso._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                      <button
                        onClick={() => setCursoExpandido(cursoExpandido === curso._id ? null : curso._id)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {cursoExpandido === curso._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        Detalles
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalles expandidos */}
                <AnimatePresence>
                  {cursoExpandido === curso._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      {curso.objetivosGenerales && curso.objetivosGenerales.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Objetivos Generales:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {curso.objetivosGenerales.map((obj, idx) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {curso.objetivosEspecificos && curso.objetivosEspecificos.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Objetivos Específicos:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {curso.objetivosEspecificos.map((obj, idx) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
