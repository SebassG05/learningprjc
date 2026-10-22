import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../components/admin/ui/StatusBadge';
import { authFetch, loadSubmissionFile } from '../lib/courseFiles';
import { PRIVATE } from '../components/courses/coursesCopy';
import { formatCohortDate } from '../components/courses/sheet/privateAccess';
import { 
  Upload, FileText, X, CheckCircle, AlertCircle, 
  ArrowLeft, Send, Loader, Download, Trash2 
} from 'lucide-react';

export default function EntregaEjercicio() {
  const { cursoId, ejercicioId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const ejercicio = location.state?.ejercicio;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [entregaExistente, setEntregaExistente] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comentarios, setComentarios] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Curso privado con la edición cerrada: se ve la entrega, pero no se envía ni se borra
  const [soloLectura, setSoloLectura] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

  useEffect(() => {
    cargarEntregaExistente();
  }, [ejercicioId]);

  // El backend decide el acceso; aquí solo se adapta la pantalla (y se sale si no hay acceso)
  useEffect(() => {
    authFetch(`${apiUrl}/api/courses/${cursoId}`)
      .then((res) => res.json())
      .then((curso) => {
        const level = curso?.accessMode === 'private' ? curso.access?.level : 'full';
        if (level === 'denied') navigate(`/curso/${cursoId}/inscripcion`, { replace: true });
        else setSoloLectura(level === 'readonly' ? { endsAt: curso.access?.endsAt } : null);
      })
      .catch(() => {});
  }, [apiUrl, cursoId, navigate]);

  // El PDF se pide con la sesión (ya no es un archivo público) y se descarga desde una URL blob:
  const descargarEntrega = async () => {
    try {
      const { url } = await loadSubmissionFile(entregaExistente._id);
      const a = document.createElement('a');
      a.href = url;
      a.download = entregaExistente.archivoPdf?.nombreOriginal || 'entrega.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      setError(err.message || 'No se pudo descargar el PDF');
    }
  };

  const cargarEntregaExistente = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiUrl}/api/entregas/ejercicio/${ejercicioId}/usuario`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (data.entregado) {
        setEntregaExistente(data.entrega);
        setComentarios(data.entrega.comentarios || '');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar entrega:', error);
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('El archivo no debe superar los 50MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('El archivo no debe superar los 50MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile && !entregaExistente) {
      setError('Debes seleccionar un archivo PDF');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('archivoPdf', selectedFile);
      }
      formData.append('cursoId', cursoId);
      formData.append('comentarios', comentarios);

      console.log('📤 Enviando ejercicio...', {
        ejercicioId,
        cursoId,
        fileSize: selectedFile?.size,
        fileName: selectedFile?.name
      });

      const token = localStorage.getItem('token');
      
      // Agregar timeout de 60 segundos para archivos grandes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(
        `${apiUrl}/api/entregas/ejercicio/${ejercicioId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);

      console.log('📡 Respuesta del servidor:', response.status);

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('El archivo supera el límite permitido por el servidor. Usa un PDF de menos de 10MB o comprime el archivo.');
        }
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al enviar el ejercicio');
        } else {
          throw new Error(`Error del servidor (${response.status}). Por favor, intenta más tarde.`);
        }
      }

      const data = await response.json();
      console.log('✅ Ejercicio enviado:', data);
      
      setSuccess(entregaExistente ? 'Ejercicio actualizado exitosamente' : 'Ejercicio entregado exitosamente');
      setSelectedFile(null);
      
      // Recargar entrega
      setTimeout(() => {
        cargarEntregaExistente();
        setSuccess('');
      }, 2000);

    } catch (error) {
      console.error('❌ Error al enviar ejercicio:', error);
      if (error.name === 'AbortError') {
        setError('La subida tardó demasiado. Por favor, intenta con un archivo más pequeño o verifica tu conexión.');
      } else {
        setError(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEliminarEntrega = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu entrega? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiUrl}/api/entregas/${entregaExistente._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Error al eliminar la entrega');
        return;
      }
      if (response.ok) {
        setSuccess('Entrega eliminada exitosamente');
        setEntregaExistente(null);
        setComentarios('');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (error) {
      console.error('Error al eliminar entrega:', error);
      setError('Error al eliminar la entrega');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-surface py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/curso/${cursoId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-brand-500 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al curso
          </button>

          <h1 className="text-3xl font-bold text-ink mb-2">
            {ejercicio?.titulo || 'Entrega de Ejercicio'}
          </h1>
          <p className="text-gray-400">
            Sube tu trabajo en formato PDF para su revisión
          </p>
        </div>

        {/* Entrega Existente */}
        {entregaExistente && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-brand-500/10 to-brand-600/10 border border-line rounded-xl p-6 mb-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-6 h-6 text-brand-500" />
                  <h3 className="text-xl font-bold text-brand-500">
                    Ya has entregado este ejercicio
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="font-semibold">Archivo:</span> {entregaExistente.archivoPdf.nombreOriginal}</p>
                  <p><span className="font-semibold">Fecha de entrega:</span> {new Date(entregaExistente.fechaEntrega).toLocaleString('es-ES')}</p>
                  <p className="flex items-center gap-2"><span className="font-semibold">Estado:</span>
                    {/* Mismas etiquetas y colores que el panel de correcciones («revisado» = «Requiere cambios») */}
                    <StatusBadge estado={entregaExistente.estado} audience="student" size="sm" />
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={descargarEntrega}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-500/20 text-brand-500 rounded-lg hover:bg-brand-500/30 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>
                  {soloLectura ? null : <button
                    onClick={handleEliminarEntrega}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Puedes actualizar tu entrega subiendo un nuevo archivo PDF
            </p>
          </motion.div>
        )}

        {soloLectura ? (
          <p role="note" className="flex items-start gap-3 rounded-2xl border border-line bg-surface/80 p-6 text-callout text-ink-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-dawn" aria-hidden="true" />
            <span>{PRIVATE.lead.readonly(formatCohortDate(soloLectura.endsAt))}</span>
          </p>
        ) : (
        /* Formulario */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface/80 rounded-2xl border border-line p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Área de subida */}
            <div>
              <label className="block text-ink font-semibold mb-3">
                Archivo PDF *
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  dragActive
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-gray-600 hover:border-brand-500/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-12 h-12 text-brand-500" />
                      <div className="text-left">
                        <p className="text-ink font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-ink font-medium mb-2">
                        Arrastra tu archivo PDF aquí
                      </p>
                      <p className="text-sm text-gray-400 mb-3">
                        o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500">
                        Tamaño máximo: 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Comentarios */}
            <div>
              <label className="block text-ink font-semibold mb-3">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                maxLength={2000}
                rows={6}
                placeholder="Agrega cualquier comentario o aclaración sobre tu trabajo..."
                className="w-full px-4 py-3 bg-surface/50 border border-gray-600 rounded-xl text-ink placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2 text-right">
                {comentarios.length}/2000 caracteres
              </p>
            </div>

            {/* Mensajes */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-400 text-sm">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/curso/${cursoId}`)}
                className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 font-semibold rounded-xl hover:border-brand-500/50 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading || (!selectedFile && !entregaExistente)}
                className="flex-1 px-6 py-3 bg-brand hover:bg-brand-300 text-on-brand font-bold rounded-xl hover:shadow-xl hover:shadow-brand-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {entregaExistente ? 'Actualizar Entrega' : 'Enviar Ejercicio'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        )}
      </div>
    </div>
  );
}
