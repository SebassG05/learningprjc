import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Edit2, Trash2, Eye, EyeOff, Save, X,
  Upload, FileText, Video, Link as LinkIcon, AlertCircle,
  CheckCircle, Loader, ChevronDown, ChevronUp, ChevronLeft, Image as ImageIcon
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
  
  // Estados para el sistema de dos fases
  const [fase, setFase] = useState(1); // 1: Info básica, 2: Temas y materiales
  const [cursoCreado, setCursoCreado] = useState(null); // Curso recién creado para agregar temas

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    duration: '',
    image: '',
    imageFile: null,
    category: [],
    objetivosGenerales: [],
    objetivosGeneralesEn: [],
    objetivosEspecificos: [],
    objetivosEspecificosEn: [],
    idiomasDisponibles: ['es'],
    isOpen: false
  });

  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevoObjetivoGeneral, setNuevoObjetivoGeneral] = useState('');
  const [nuevoObjetivoGeneralEn, setNuevoObjetivoGeneralEn] = useState('');
  const [nuevoObjetivoEspecifico, setNuevoObjetivoEspecifico] = useState('');
  const [nuevoObjetivoEspecificoEn, setNuevoObjetivoEspecificoEn] = useState('');
  
  // Estados para agregar temas (Fase 2)
  const [formTema, setFormTema] = useState({
    titulo: '',
    tituloEn: '',
    descripcion: '',
    descripcionEn: '',
    orden: 1
  });
  const [subiendoMaterial, setSubiendoMaterial] = useState(false);

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
      titleEn: '',
      description: '',
      descriptionEn: '',
      duration: '',
      image: '',
      imageFile: null,
      category: [],
      objetivosGenerales: [],
      objetivosGeneralesEn: [],
      objetivosEspecificos: [],
      objetivosEspecificosEn: [],
      idiomasDisponibles: ['es'],
      isOpen: false
    });
    setNuevaCategoria('');
    setNuevoObjetivoGeneral('');
    setNuevoObjetivoGeneralEn('');
    setNuevoObjetivoEspecifico('');
    setNuevoObjetivoEspecificoEn('');
    setCursoEditando(null);
    setMostrarFormulario(false);
    setFase(1);
    setCursoCreado(null);
    setFormTema({
      titulo: '',
      tituloEn: '',
      descripcion: '',
      descripcionEn: '',
      orden: 1
    });
  };

  const abrirFormularioNuevo = () => {
    resetFormulario();
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (curso) => {
    setCursoEditando(curso);
    setFormData({
      title: curso.title || '',
      titleEn: curso.titleEn || '',
      description: curso.description || '',
      descriptionEn: curso.descriptionEn || '',
      duration: curso.duration || '',
      image: curso.image || '',
      imageFile: null,
      category: curso.category || [],
      objetivosGenerales: curso.objetivosGenerales || [],
      objetivosGeneralesEn: curso.objetivosGeneralesEn || [],
      objetivosEspecificos: curso.objetivosEspecificos || [],
      objetivosEspecificosEn: curso.objetivosEspecificosEn || [],
      idiomasDisponibles: curso.idiomasDisponibles || ['es'],
      isOpen: curso.isOpen || false
    });
    setCursoCreado(curso);
    setFase(1);
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

  const agregarObjetivoGeneralEn = () => {
    if (nuevoObjetivoGeneralEn.trim()) {
      setFormData({
        ...formData,
        objetivosGeneralesEn: [...formData.objetivosGeneralesEn, nuevoObjetivoGeneralEn.trim()]
      });
      setNuevoObjetivoGeneralEn('');
    }
  };

  const eliminarObjetivoGeneralEn = (index) => {
    setFormData({
      ...formData,
      objetivosGeneralesEn: formData.objetivosGeneralesEn.filter((_, i) => i !== index)
    });
  };

  const agregarObjetivoEspecificoEn = () => {
    if (nuevoObjetivoEspecificoEn.trim()) {
      setFormData({
        ...formData,
        objetivosEspecificosEn: [...formData.objetivosEspecificosEn, nuevoObjetivoEspecificoEn.trim()]
      });
      setNuevoObjetivoEspecificoEn('');
    }
  };

  const eliminarObjetivoEspecificoEn = (index) => {
    setFormData({
      ...formData,
      objetivosEspecificosEn: formData.objetivosEspecificosEn.filter((_, i) => i !== index)
    });
  };

  const guardarCurso = async (e) => {
    e.preventDefault();
    
    // Validación dinámica según idiomas seleccionados
    const hasSpanish = formData.idiomasDisponibles.includes('es');
    const hasEnglish = formData.idiomasDisponibles.includes('en');
    
    if (hasSpanish && (!formData.title.trim() || !formData.description.trim())) {
      showToast('El título y la descripción en español son obligatorios', 'error');
      return;
    }
    
    if (hasEnglish && (!formData.titleEn.trim() || !formData.descriptionEn.trim())) {
      showToast('El título y la descripción en inglés son obligatorios', 'error');
      return;
    }

    try {
      setGuardando(true);

      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Solo agregar campos que tienen valor
      if (formData.title && formData.title.trim()) {
        formDataToSend.append('title', formData.title.trim());
      }
      if (formData.titleEn && formData.titleEn.trim()) {
        formDataToSend.append('titleEn', formData.titleEn.trim());
      }
      if (formData.description && formData.description.trim()) {
        formDataToSend.append('description', formData.description.trim());
      }
      if (formData.descriptionEn && formData.descriptionEn.trim()) {
        formDataToSend.append('descriptionEn', formData.descriptionEn.trim());
      }
      
      formDataToSend.append('duration', formData.duration || '0 horas');
      formDataToSend.append('isOpen', formData.isOpen);
      formDataToSend.append('category', JSON.stringify(formData.category));
      formDataToSend.append('objetivosGenerales', JSON.stringify(formData.objetivosGenerales));
      formDataToSend.append('objetivosGeneralesEn', JSON.stringify(formData.objetivosGeneralesEn));
      formDataToSend.append('objetivosEspecificos', JSON.stringify(formData.objetivosEspecificos));
      formDataToSend.append('objetivosEspecificosEn', JSON.stringify(formData.objetivosEspecificosEn));
      formDataToSend.append('idiomasDisponibles', JSON.stringify(formData.idiomasDisponibles));

      // Agregar imagen SOLO si hay un archivo
      if (formData.imageFile) {
        console.log('📸 Agregando imagen:', formData.imageFile.name, formData.imageFile.type);
        formDataToSend.append('image', formData.imageFile);
      }

      console.log('📤 Enviando datos del curso:', {
        hasTitle: !!formData.title,
        hasTitleEn: !!formData.titleEn,
        hasImage: !!formData.imageFile,
        imageType: formData.imageFile?.type,
        idiomas: formData.idiomasDisponibles
      });

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

      const cursoGuardado = await response.json();

      if (cursoEditando) {
        // Si estamos editando, actualizamos y pasamos a Fase 2 para gestionar temas
        showToast('Curso actualizado exitosamente', 'success');
        setCursoCreado(cursoGuardado);
        setFase(2);
        cargarCursos();
      } else {
        // Si es nuevo, pasamos a la Fase 2 para agregar temas
        showToast('Curso creado exitosamente. Ahora puedes agregar temas y materiales', 'success');
        setCursoCreado(cursoGuardado);
        setFase(2);
      }
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

  // Funciones para gestión de temas (Fase 2)
  const agregarTema = async () => {
    if (!cursoCreado) return;
    
    const hasSpanish = cursoCreado.idiomasDisponibles?.includes('es');
    const hasEnglish = cursoCreado.idiomasDisponibles?.includes('en');
    
    if (hasSpanish && !formTema.titulo.trim()) {
      showToast('El título del tema en español es obligatorio', 'error');
      return;
    }
    
    if (hasEnglish && !formTema.tituloEn.trim()) {
      showToast('El título del tema en inglés es obligatorio', 'error');
      return;
    }

    try {
      setGuardando(true);
      const token = localStorage.getItem('token');
      
      const temaData = {
        numeroTema: cursoCreado.temas?.length + 1 || 1,
        titulo: formTema.titulo,
        tituloEn: formTema.tituloEn,
        descripcion: formTema.descripcion,
        descripcionEn: formTema.descripcionEn,
        orden: formTema.orden
      };

      const response = await fetch(`${apiUrl}/api/courses/${cursoCreado._id}/temas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(temaData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje || 'Error al agregar tema');
      }

      const cursoActualizado = await response.json();
      setCursoCreado(cursoActualizado);
      
      showToast('Tema agregado exitosamente', 'success');
      
      // Reset form tema
      setFormTema({
        titulo: '',
        tituloEn: '',
        descripcion: '',
        descripcionEn: '',
        orden: (cursoActualizado.temas?.length || 0) + 1
      });
    } catch (error) {
      console.error('Error:', error);
      showToast(error.message || 'Error al agregar tema', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarTema = async (temaId) => {
    if (!cursoCreado || !confirm('¿Eliminar este tema?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/courses/${cursoCreado._id}/temas/${temaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar tema');

      const cursoActualizado = await response.json();
      setCursoCreado(cursoActualizado);
      showToast('Tema eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar tema', 'error');
    }
  };

  const agregarMaterial = async (temaId, archivos) => {
    if (!cursoCreado) return;

    try {
      setSubiendoMaterial(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // archivos = { es: File | null, en: File | null }
      if (archivos.es) {
        formData.append('archivo', archivos.es);
        formData.append('idioma', archivos.en ? 'both' : 'es');
      }
      if (archivos.en) {
        formData.append('archivoEn', archivos.en);
        if (!archivos.es) {
          formData.append('idioma', 'en');
        }
      }

      const response = await fetch(
        `${apiUrl}/api/courses/${cursoCreado._id}/temas/${temaId}/materiales`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje || 'Error al subir material');
      }

      const cursoActualizado = await response.json();
      setCursoCreado(cursoActualizado);
      showToast('Material agregado exitosamente', 'success');
    } catch (error) {
      console.error('Error:', error);
      showToast(error.message || 'Error al subir material', 'error');
    } finally {
      setSubiendoMaterial(false);
    }
  };

  const finalizarCreacionCurso = () => {
    showToast('¡Curso completado! Ya está disponible para los estudiantes', 'success');
    resetFormulario();
    cargarCursos();
  };

  // Componente TemaCard para mostrar temas en Fase 2
  const TemaCard = ({ tema, index, cursoCreado, agregarMaterial, eliminarTema, subiendoMaterial }) => {
    const [archivoEs, setArchivoEs] = useState(null);
    const [archivoEn, setArchivoEn] = useState(null);
    const [nombreArchivoEs, setNombreArchivoEs] = useState('');
    const [nombreArchivoEn, setNombreArchivoEn] = useState('');

    const handleSubirMateriales = async () => {
      if (!archivoEs && !archivoEn) {
        showToast('Selecciona al menos un archivo PDF', 'error');
        return;
      }

      await agregarMaterial(tema._id, { es: archivoEs, en: archivoEn });
      setArchivoEs(null);
      setArchivoEn(null);
      setNombreArchivoEs('');
      setNombreArchivoEn('');
      // Reset file inputs
      const fileInputs = document.querySelectorAll(`input[type="file"][data-tema="${tema._id}"]`);
      fileInputs.forEach(input => input.value = '');
    };

    return (
      <div className="bg-[#1a2e1f]/80 border-2 border-green-900/40 rounded-xl p-6 shadow-lg hover:border-green-700/60 transition-all">
        {/* Header del tema */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1 p-2 bg-green-600/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-600/30 text-green-300 text-xs font-bold rounded">
                  TEMA {index + 1}
                </span>
              </div>
              <h5 className="text-lg font-bold text-white mb-2">
                {tema.titulo || tema.tituloEn}
              </h5>
              {tema.descripcion && (
                <p className="text-sm text-gray-400 leading-relaxed">{tema.descripcion}</p>
              )}
              {!tema.descripcion && tema.descripcionEn && (
                <p className="text-sm text-gray-400 leading-relaxed">{tema.descripcionEn}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => eliminarTema(tema._id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-all"
            title="Eliminar tema"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Materiales existentes */}
        {tema.materiales && tema.materiales.length > 0 && (
          <div className="mb-6 bg-[#0f1a12]/50 rounded-lg p-4 border border-green-900/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-sm font-semibold text-green-300">Material de Estudio Disponible</p>
            </div>
            <div className="space-y-2">
              {tema.materiales.map((material, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-gray-300 bg-[#1a2e1f] p-3 rounded-lg border border-green-900/20">
                  <FileText className="w-5 h-5 text-green-400" />
                  <span className="flex-1 font-medium">PDF Material {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    {material.idioma === 'both' && (
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs font-semibold rounded">
                        🇪🇸 🇬🇧 Bilingüe
                      </span>
                    )}
                    {material.idioma === 'es' && (
                      <span className="px-2 py-1 bg-green-600/20 text-green-300 text-xs font-semibold rounded">
                        🇪🇸 Español
                      </span>
                    )}
                    {material.idioma === 'en' && (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs font-semibold rounded">
                        🇬🇧 English
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subir nuevos materiales */}
        <div className="space-y-4 pt-4 border-t-2 border-dashed border-green-900/30">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-400" />
            <p className="text-sm font-semibold text-purple-300">Subir Material de Estudio (PDF)</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* PDF Español */}
            {cursoCreado.idiomasDisponibles?.includes('es') && (
              <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🇪🇸</span>
                  <label className="text-sm font-semibold text-green-300">
                    PDF en Español
                  </label>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  data-tema={tema._id}
                  onChange={(e) => {
                    setArchivoEs(e.target.files[0]);
                    setNombreArchivoEs(e.target.files[0]?.name || '');
                  }}
                  className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer file:transition-colors"
                />
                {nombreArchivoEs && (
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {nombreArchivoEs}
                  </p>
                )}
              </div>
            )}

            {/* PDF Inglés */}
            {cursoCreado.idiomasDisponibles?.includes('en') && (
              <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🇬🇧</span>
                  <label className="text-sm font-semibold text-blue-300">
                    PDF in English
                  </label>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  data-tema={tema._id}
                  onChange={(e) => {
                    setArchivoEn(e.target.files[0]);
                    setNombreArchivoEn(e.target.files[0]?.name || '');
                  }}
                  className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer file:transition-colors"
                />
                {nombreArchivoEn && (
                  <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {nombreArchivoEn}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSubirMateriales}
            disabled={subiendoMaterial || (!archivoEs && !archivoEn)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
          >
            {subiendoMaterial ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Subiendo material...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Subir PDF al Tema
              </>
            )}
          </button>
          
          {!archivoEs && !archivoEn && (
            <p className="text-xs text-center text-gray-500">
              Selecciona al menos un archivo PDF para subir
            </p>
          )}
        </div>
      </div>
    );
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
            <h2 className="text-2xl font-bold text-white">Gestión de Cursos</h2>
            <p className="text-gray-400">Crear y administrar cursos de la plataforma</p>
          </div>
        </div>
        <button
          onClick={abrirFormularioNuevo}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
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
            className="bg-[#0f1a12] rounded-xl shadow-lg border border-green-900/30 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {fase === 2
                    ? (cursoEditando ? 'Editar Curso - Temas y Materiales' : 'Fase 2: Agregar Temas y Materiales')
                    : (cursoEditando ? 'Editar Curso' : 'Nuevo Curso - Fase 1: Información Básica')}
                </h3>
                {fase === 2 && cursoCreado && (
                  <p className="text-sm text-gray-400 mt-1">
                    Curso: <span className="text-green-400">{cursoCreado.title || cursoCreado.titleEn}</span>
                  </p>
                )}
              </div>
              <button
                onClick={resetFormulario}
                className="p-2 hover:bg-green-900/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* FASE 1: Información Básica del Curso */}
            {fase === 1 && (
            <form onSubmit={guardarCurso} className="space-y-6">
              {/* Idiomas Disponibles */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-300 mb-3">
                  🌍 Idiomas Disponibles para este Curso
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.idiomasDisponibles.includes('es')}
                      onChange={(e) => {
                        const idiomas = e.target.checked
                          ? [...formData.idiomasDisponibles, 'es']
                          : formData.idiomasDisponibles.filter(i => i !== 'es');
                        setFormData({ ...formData, idiomasDisponibles: idiomas.length > 0 ? idiomas : ['es'] });
                      }}
                      className="w-5 h-5 text-blue-600 bg-[#1a2e1f] border-blue-900/30 rounded focus:ring-blue-500/50"
                    />
                    <span className="text-white">🇪🇸 Español</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.idiomasDisponibles.includes('en')}
                      onChange={(e) => {
                        const idiomas = e.target.checked
                          ? [...formData.idiomasDisponibles, 'en']
                          : formData.idiomasDisponibles.filter(i => i !== 'en');
                        setFormData({ ...formData, idiomasDisponibles: idiomas.length > 0 ? idiomas : ['en'] });
                      }}
                      className="w-5 h-5 text-blue-600 bg-[#1a2e1f] border-blue-900/30 rounded focus:ring-blue-500/50"
                    />
                    <span className="text-white">🇬🇧 English</span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Los estudiantes podrán elegir en qué idioma ver el contenido del curso
                </p>
              </div>

              {/* Título Español */}
              {formData.idiomasDisponibles.includes('es') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título del Curso (Español) {formData.idiomasDisponibles.length === 2 && '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1a2e1f] border border-green-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                    placeholder="Ej: Modelización Dinámica de Carbono"
                    required={formData.idiomasDisponibles.includes('es')}
                  />
                </div>
              )}

              {/* Título Inglés */}
              {formData.idiomasDisponibles.includes('en') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título del Curso (English) {formData.idiomasDisponibles.length === 2 && '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1a2e1f] border border-blue-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    placeholder="Ex: Dynamic Carbon Modeling"
                    required={formData.idiomasDisponibles.includes('en')}
                  />
                </div>
              )}

              {/* Descripción Español */}
              {formData.idiomasDisponibles.includes('es') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción (Español) {formData.idiomasDisponibles.length === 2 && '*'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1a2e1f] border border-green-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors min-h-[100px]"
                    placeholder="Descripción detallada del curso..."
                    required={formData.idiomasDisponibles.includes('es')}
                  />
                </div>
              )}

              {/* Descripción Inglés */}
              {formData.idiomasDisponibles.includes('en') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción (English) {formData.idiomasDisponibles.length === 2 && '*'}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1a2e1f] border border-blue-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors min-h-[100px]"
                    placeholder="Detailed course description..."
                    required={formData.idiomasDisponibles.includes('en')}
                  />
                </div>
              )}

              {/* Duración */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duración
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a2e1f] border border-green-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                  placeholder="Ej: 18 horas"
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen del Curso
                </label>
                <div className="flex gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 px-4 py-2 bg-[#1a2e1f] border border-green-900/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                  />
                  {(formData.image || formData.imageFile) && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      Imagen seleccionada
                    </div>
                  )}
                </div>
                {formData.image && !formData.imageFile && (
                  <img
                    src={formData.image}
                    alt="Imagen actual"
                    className="mt-2 w-32 h-32 object-cover rounded-lg border border-green-900/30"
                  />
                )}
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categorías
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCategoria())}
                    className="flex-1 px-4 py-2 bg-[#1a2e1f] border border-green-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                    placeholder="Ej: Ciencia del Suelo"
                  />
                  <button
                    type="button"
                    onClick={agregarCategoria}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.category.map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-500/30 text-green-300 rounded-full text-sm"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => eliminarCategoria(cat)}
                        className="hover:text-green-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Objetivos Generales - Español */}
              {formData.idiomasDisponibles.includes('es') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Objetivos Generales (Español) {formData.idiomasDisponibles.length === 2 && '*'}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={nuevoObjetivoGeneral}
                      onChange={(e) => setNuevoObjetivoGeneral(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarObjetivoGeneral())}
                      className="flex-1 px-4 py-2 bg-[#1a2e1f] border border-green-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                      placeholder="Añadir objetivo general..."
                    />
                    <button
                      type="button"
                      onClick={agregarObjetivoGeneral}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {formData.objetivosGenerales.map((obj, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 p-3 bg-[#1a2e1f]/60 border border-green-900/20 rounded-lg"
                      >
                        <span className="flex-1 text-sm text-gray-300">{obj}</span>
                        <button
                          type="button"
                          onClick={() => eliminarObjetivoGeneral(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Objetivos Generales - English */}
              {formData.idiomasDisponibles.includes('en') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Objetivos Generales (English) {formData.idiomasDisponibles.length === 2 && '*'}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={nuevoObjetivoGeneralEn}
                      onChange={(e) => setNuevoObjetivoGeneralEn(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarObjetivoGeneralEn())}
                      className="flex-1 px-4 py-2 bg-[#1a2e1f] border border-blue-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                      placeholder="Add general objective..."
                    />
                    <button
                      type="button"
                      onClick={agregarObjetivoGeneralEn}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {formData.objetivosGeneralesEn.map((obj, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 p-3 bg-[#1a2e1f]/60 border border-blue-900/20 rounded-lg"
                      >
                        <span className="flex-1 text-sm text-gray-300">{obj}</span>
                        <button
                          type="button"
                          onClick={() => eliminarObjetivoGeneralEn(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Objetivos Específicos - Español */}
              {formData.idiomasDisponibles.includes('es') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Objetivos Específicos (Español) {formData.idiomasDisponibles.length === 2 && '*'}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={nuevoObjetivoEspecifico}
                      onChange={(e) => setNuevoObjetivoEspecifico(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarObjetivoEspecifico())}
                      className="flex-1 px-4 py-2 bg-[#1a2e1f] border border-green-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                      placeholder="Añadir objetivo específico..."
                    />
                    <button
                      type="button"
                      onClick={agregarObjetivoEspecifico}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {formData.objetivosEspecificos.map((obj, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 p-3 bg-[#1a2e1f]/60 border border-green-900/20 rounded-lg"
                      >
                        <span className="flex-1 text-sm text-gray-300">{obj}</span>
                        <button
                          type="button"
                          onClick={() => eliminarObjetivoEspecifico(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Objetivos Específicos - English */}
              {formData.idiomasDisponibles.includes('en') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Objetivos Específicos (English) {formData.idiomasDisponibles.length === 2 && '*'}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={nuevoObjetivoEspecificoEn}
                      onChange={(e) => setNuevoObjetivoEspecificoEn(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarObjetivoEspecificoEn())}
                      className="flex-1 px-4 py-2 bg-[#1a2e1f] border border-blue-900/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                      placeholder="Add specific objective..."
                    />
                    <button
                      type="button"
                      onClick={agregarObjetivoEspecificoEn}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {formData.objetivosEspecificosEn.map((obj, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 p-3 bg-[#1a2e1f]/60 border border-blue-900/20 rounded-lg"
                      >
                        <span className="flex-1 text-sm text-gray-300">{obj}</span>
                        <button
                          type="button"
                          onClick={() => eliminarObjetivoEspecificoEn(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estado (Abierto/Cerrado) */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isOpen"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="w-5 h-5 text-green-600 bg-[#1a2e1f] border-green-900/30 rounded focus:ring-green-500/50"
                />
                <label htmlFor="isOpen" className="text-sm font-medium text-gray-300">
                  Curso abierto (visible para estudiantes)
                </label>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4 border-t border-green-900/30">
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/30"
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
                {cursoEditando && (
                  <button
                    type="button"
                    onClick={() => setFase(2)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
                  >
                    <BookOpen className="w-5 h-5" />
                    Gestionar Temas
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetFormulario}
                  className="px-6 py-3 border border-green-900/30 text-gray-300 rounded-lg hover:bg-[#1a2e1f]/60 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
            )}

            {/* FASE 2: Agregar Temas y Materiales */}
            {fase === 2 && cursoCreado && (
              <div className="space-y-6">
                {/* Indicador de progreso */}
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{cursoEditando ? 'Editando temas' : 'Paso 1 completado'}</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Ahora agrega los temas y materiales del curso. Puedes subir PDFs en {cursoCreado.idiomasDisponibles?.includes('es') && cursoCreado.idiomasDisponibles?.includes('en') ? 'español e inglés' : cursoCreado.idiomasDisponibles?.includes('en') ? 'inglés' : 'español'}.
                      </p>
                    </div>
                    {cursoEditando && (
                      <button
                        type="button"
                        onClick={() => setFase(1)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1a2e1f] border border-green-900/40 text-gray-300 rounded-lg hover:bg-green-900/20 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Información básica
                      </button>
                    )}
                  </div>
                </div>

                {/* Formulario para agregar tema */}
                <div className="bg-[#1a2e1f]/60 border-2 border-green-500/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-600/20 rounded-lg">
                      <FileText className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Agregar Nuevo Tema</h4>
                      <p className="text-sm text-gray-400">Completa la información del tema en los idiomas seleccionados</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Sección Español */}
                    {cursoCreado.idiomasDisponibles?.includes('es') && (
                      <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">🇪🇸</span>
                          <h5 className="text-lg font-semibold text-green-300">Versión en Español</h5>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              📝 Título del Tema *
                            </label>
                            <input
                              type="text"
                              value={formTema.titulo}
                              onChange={(e) => setFormTema({ ...formTema, titulo: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0f1a12] border border-green-900/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-base"
                              placeholder="Ej: Introducción: Modelización de la dinámica del carbono orgánico del suelo"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              📄 Descripción del Tema
                            </label>
                            <textarea
                              value={formTema.descripcion}
                              onChange={(e) => setFormTema({ ...formTema, descripcion: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0f1a12] border border-green-900/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all min-h-[100px] text-base resize-none"
                              placeholder="Módulo introductorio que presenta los conceptos fundamentales del carbono orgánico del suelo (SOC), su papel en el ciclo biogeoquímico global..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Esta descripción se mostrará a los estudiantes</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sección Inglés */}
                    {cursoCreado.idiomasDisponibles?.includes('en') && (
                      <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">🇬🇧</span>
                          <h5 className="text-lg font-semibold text-blue-300">English Version</h5>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              📝 Theme Title *
                            </label>
                            <input
                              type="text"
                              value={formTema.tituloEn}
                              onChange={(e) => setFormTema({ ...formTema, tituloEn: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0f1a12] border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                              placeholder="Ex: Introduction: Modeling the dynamics of soil organic carbon"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              📄 Theme Description
                            </label>
                            <textarea
                              value={formTema.descripcionEn}
                              onChange={(e) => setFormTema({ ...formTema, descripcionEn: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0f1a12] border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px] text-base resize-none"
                              placeholder="Introductory module that presents the fundamental concepts of soil organic carbon (SOC), its role in the global biogeochemical cycle..."
                            />
                            <p className="text-xs text-gray-500 mt-1">This description will be shown to students</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botón de agregar */}
                    <button
                      type="button"
                      onClick={agregarTema}
                      disabled={guardando}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/50 hover:shadow-xl hover:shadow-green-900/60"
                    >
                      {guardando ? (
                        <>
                          <Loader className="w-6 h-6 animate-spin" />
                          Creando tema...
                        </>
                      ) : (
                        <>
                          <Plus className="w-6 h-6" />
                          Crear Tema y Continuar con Material
                        </>
                      )}
                    </button>
                    
                    <p className="text-xs text-center text-gray-500">
                      💡 Después de crear el tema, podrás subir los archivos PDF del material de estudio
                    </p>
                  </div>
                </div>

                {/* Lista de temas agregados */}
                {cursoCreado.temas && cursoCreado.temas.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-600/20 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">
                              Temas del Curso
                            </h4>
                            <p className="text-sm text-gray-400">
                              {cursoCreado.temas.length} {cursoCreado.temas.length === 1 ? 'tema creado' : 'temas creados'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">📤 Sube los PDFs</p>
                          <p className="text-xs text-gray-500">de cada tema</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {cursoCreado.temas.map((tema, index) => (
                        <TemaCard
                          key={tema._id}
                          tema={tema}
                          index={index}
                          cursoCreado={cursoCreado}
                          agregarMaterial={agregarMaterial}
                          eliminarTema={eliminarTema}
                          subiendoMaterial={subiendoMaterial}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Botones de finalización */}
                <div className="space-y-3 pt-6">
                  {cursoCreado.temas && cursoCreado.temas.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                        <p className="text-sm font-semibold text-blue-300">
                          {cursoCreado.temas.length} {cursoCreado.temas.length === 1 ? 'tema creado' : 'temas creados'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        Ya puedes finalizar y publicar el curso. Los temas sin material podrás completarlos después editando el curso.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={finalizarCreacionCurso}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-900/40 hover:shadow-2xl hover:shadow-blue-900/50"
                    >
                      <CheckCircle className="w-6 h-6" />
                      Finalizar y Publicar Curso
                    </button>
                    <button
                      type="button"
                      onClick={resetFormulario}
                      className="px-6 py-4 border-2 border-red-900/30 text-red-300 rounded-lg hover:bg-red-900/20 hover:border-red-700/50 transition-all font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Puedes agregar más temas y materiales después desde la lista de cursos
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de cursos */}
      <div className="space-y-4">
        {cursos.length === 0 ? (
          <div className="text-center py-12 bg-[#0f1a12] rounded-xl border border-green-900/30">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No hay cursos creados
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primer curso
            </p>
            <button
              onClick={abrirFormularioNuevo}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
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
              className="bg-[#0f1a12] rounded-xl shadow-lg border border-green-900/30 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {curso.image && (
                    <img
                      src={curso.image}
                      alt={curso.title}
                      className="w-32 h-32 object-cover rounded-lg border border-green-900/30"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {curso.title}
                        </h3>
                        <p className="text-gray-400 line-clamp-2">{curso.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {curso.isOpen ? (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-600/20 border border-green-500/30 text-green-300 rounded-full text-sm font-medium">
                            <Eye className="w-4 h-4" />
                            Abierto
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-3 py-1 bg-gray-800/40 border border-gray-700/50 text-gray-400 rounded-full text-sm font-medium">
                            <EyeOff className="w-4 h-4" />
                            Cerrado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <span>⏱️ {curso.duration || 'Sin duración'}</span>
                      <span>📚 {curso.temas?.length || 0} temas</span>
                      {curso.category && curso.category.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {curso.category.map((cat, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded text-xs">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirFormularioEditar(curso)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => toggleCursoOpen(curso)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {curso.isOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {curso.isOpen ? 'Cerrar' : 'Abrir'}
                      </button>
                      <button
                        onClick={() => eliminarCurso(curso._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                      <button
                        onClick={() => setCursoExpandido(cursoExpandido === curso._id ? null : curso._id)}
                        className="flex items-center gap-2 px-4 py-2 border border-green-900/30 text-gray-300 rounded-lg hover:bg-[#1a2e1f]/60 transition-colors"
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
                      className="mt-4 pt-4 border-t border-green-900/30"
                    >
                      {curso.objetivosGenerales && curso.objetivosGenerales.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-white mb-2">Objetivos Generales:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                            {curso.objetivosGenerales.map((obj, idx) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {curso.objetivosEspecificos && curso.objetivosEspecificos.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Objetivos Específicos:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
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
