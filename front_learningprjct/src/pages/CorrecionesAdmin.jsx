import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, CheckCircle, XCircle, Clock, 
  Search, Filter, Eye, Save, Loader, AlertCircle, User,
  Calendar, BookOpen
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function CorreccionesAdmin() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  const [calificacion, setCalificacion] = useState('');
  const [feedback, setFeedback] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

  useEffect(() => {
    // Verificar que el usuario sea admin o superadmin
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      showToast('No tienes permisos para acceder a esta página', 'error');
      navigate('/');
      return;
    }
    cargarEntregas();
  }, [user]);

  const cargarEntregas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/entregas/admin/todas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al cargar entregas');
      
      const data = await response.json();
      setEntregas(data.entregas || []);
    } catch (error) {
      console.error('Error al cargar entregas:', error);
      showToast('Error al cargar las entregas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (entrega) => {
    setEntregaSeleccionada(entrega);
    setCalificacion(entrega.calificacion || '');
    setFeedback(entrega.feedbackProfesor || '');
  };

  const cerrarModal = () => {
    setEntregaSeleccionada(null);
    setCalificacion('');
    setFeedback('');
  };

  const abrirPdfModal = (url) => {
    setPdfUrl(url);
    setPdfModalOpen(true);
  };

  const cerrarPdfModal = () => {
    setPdfModalOpen(false);
    setPdfUrl('');
  };

  const guardarCorreccion = async (nuevoEstado) => {
    if (!entregaSeleccionada) return;

    try {
      setGuardando(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${apiUrl}/api/entregas/${entregaSeleccionada._id}/corregir`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            calificacion: calificacion ? parseFloat(calificacion) : undefined,
            feedbackProfesor: feedback,
            estado: nuevoEstado
          })
        }
      );

      if (!response.ok) throw new Error('Error al guardar corrección');

      showToast('Corrección guardada exitosamente', 'success');
      cerrarModal();
      cargarEntregas(); // Recargar la lista
    } catch (error) {
      console.error('Error al guardar corrección:', error);
      showToast('Error al guardar la corrección', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const entregasFiltradas = entregas.filter(entrega => {
    const cumpleFiltro = filtroEstado === 'todos' || entrega.estado === filtroEstado;
    const cumpleBusqueda = 
      busqueda === '' ||
      entrega.userId?.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      entrega.userId?.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      entrega.ejercicioId?.titulo?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltro && cumpleBusqueda;
  });

  const estadisticas = {
    total: entregas.length,
    enviado: entregas.filter(e => e.estado === 'enviado').length,
    revisado: entregas.filter(e => e.estado === 'revisado').length,
    aprobado: entregas.filter(e => e.estado === 'aprobado').length,
    rechazado: entregas.filter(e => e.estado === 'rechazado').length,
  };

  const obtenerColorEstado = (estado) => {
    const colores = {
      'enviado': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'revisado': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      'aprobado': 'bg-green-500/10 text-green-400 border-green-500/30',
      'rechazado': 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return colores[estado] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'enviado': return <Clock className="w-4 h-4" />;
      case 'revisado': return <Eye className="w-4 h-4" />;
      case 'aprobado': return <CheckCircle className="w-4 h-4" />;
      case 'rechazado': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f0d] via-[#0f1812] to-[#0a0f0d] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-green-200">Cargando entregas...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f0d] via-[#0f1812] to-[#0a0f0d] py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Panel de Correcciones
          </h1>
          <p className="text-gray-400">
            Revisa y califica las entregas de ejercicios de los estudiantes
          </p>
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-[#1a2e1f]/40 border border-green-900/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{estadisticas.total}</p>
          </div>
          <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Enviados</p>
            <p className="text-2xl font-bold text-blue-400">{estadisticas.enviado}</p>
          </div>
          <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Revisados</p>
            <p className="text-2xl font-bold text-yellow-400">{estadisticas.revisado}</p>
          </div>
          <div className="bg-green-950/20 border border-green-900/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Aprobados</p>
            <p className="text-2xl font-bold text-green-400">{estadisticas.aprobado}</p>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Rechazados</p>
            <p className="text-2xl font-bold text-red-400">{estadisticas.rechazado}</p>
          </div>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a2e1f]/40 border border-green-900/30 rounded-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por alumno o ejercicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-[#0f1a12] border border-green-900/30 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors"
              />
            </div>

            {/* Filtro de estado */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="bg-[#0f1a12] border border-green-900/30 rounded-lg pl-12 pr-10 py-3 text-white focus:outline-none focus:border-green-500/50 transition-colors cursor-pointer appearance-none"
              >
                <option value="todos">Todos los estados</option>
                <option value="enviado">Enviado</option>
                <option value="revisado">Revisado</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Lista de entregas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {entregasFiltradas.length === 0 ? (
            <div className="bg-[#1a2e1f]/40 border border-green-900/30 rounded-xl p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No se encontraron entregas{busqueda && ' que coincidan con tu búsqueda'}
              </p>
            </div>
          ) : (
            entregasFiltradas.map((entrega, index) => (
              <motion.div
                key={entrega._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1a2e1f]/40 border border-green-900/30 rounded-xl p-6 hover:border-green-700/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Información del ejercicio y estudiante */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-green-900/30 rounded-lg p-2">
                        <FileText className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {entrega.ejercicioId?.titulo || 'Ejercicio sin título'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {entrega.userId?.name || entrega.userId?.email || 'Usuario desconocido'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(entrega.fechaEntrega).toLocaleDateString('es-ES')}
                          </span>
                          {entrega.cursoId?.titulo && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {entrega.cursoId.titulo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Estado y calificación */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${obtenerColorEstado(entrega.estado)}`}>
                        {obtenerIconoEstado(entrega.estado)}
                        {entrega.estado.charAt(0).toUpperCase() + entrega.estado.slice(1)}
                      </span>
                      {entrega.calificacion !== undefined && entrega.calificacion !== null && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-sm font-medium">
                          Calificación: {entrega.calificacion}/10
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-3">
                    {entrega.archivoPdf?.url && (
                      <button
                        onClick={() => abrirPdfModal(`${apiUrl}${entrega.archivoPdf.url}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Vista Previa
                      </button>
                    )}
                    <button
                      onClick={() => abrirModal(entrega)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg border border-green-500/30 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Corregir
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Modal de corrección */}
        {entregaSeleccionada && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f1a12] border border-green-900/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Corregir Entrega</h2>

              {/* Información del estudiante */}
              <div className="bg-[#1a2e1f]/40 border border-green-900/30 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Información del Estudiante</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-500">Nombre:</span>{' '}
                    {entregaSeleccionada.userId?.name || 'N/A'}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Email:</span>{' '}
                    {entregaSeleccionada.userId?.email || 'N/A'}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Ejercicio:</span>{' '}
                    {entregaSeleccionada.ejercicioId?.titulo || 'N/A'}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Fecha de entrega:</span>{' '}
                    {new Date(entregaSeleccionada.fechaEntrega).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              {/* Comentarios del estudiante */}
              {entregaSeleccionada.comentarios && (
                <div className="bg-[#1a2e1f]/40 border border-green-900/30 rounded-xl p-4 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Comentarios del Estudiante</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{entregaSeleccionada.comentarios}</p>
                </div>
              )}

              {/* Calificación */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Calificación (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={calificacion}
                  onChange={(e) => setCalificacion(e.target.value)}
                  className="w-full bg-[#1a2e1f] border border-green-900/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-colors"
                  placeholder="Ej: 8.5"
                />
              </div>

              {/* Feedback del profesor */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Feedback para el Estudiante
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  className="w-full bg-[#1a2e1f] border border-green-900/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-colors resize-none"
                  placeholder="Escribe tu retroalimentación aquí..."
                />
                <p className="text-gray-500 text-sm mt-1">{feedback.length}/1000 caracteres</p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => guardarCorreccion('aprobado')}
                  disabled={guardando}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Aprobar
                </button>
                <button
                  onClick={() => guardarCorreccion('rechazado')}
                  disabled={guardando}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? <Loader className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Rechazar
                </button>
                <button
                  onClick={() => guardarCorreccion('revisado')}
                  disabled={guardando}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Marcar Revisado
                </button>
                <button
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Vista Previa PDF */}
        {pdfModalOpen && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={cerrarPdfModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f1a12] border border-green-900/30 rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-green-900/30">
                <h2 className="text-2xl font-bold text-white">Vista Previa del PDF</h2>
                <button
                  onClick={cerrarPdfModal}
                  className="p-2 hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <div className="h-[calc(90vh-100px)]">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Vista Previa PDF"
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
