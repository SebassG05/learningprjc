import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

  useEffect(() => {
    cargarEntregaExistente();
  }, [ejercicioId]);

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
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10MB');
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
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10MB');
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
      const response = await fetch(
        `${apiUrl}/api/entregas/ejercicio/${ejercicioId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      console.log('📡 Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error al enviar el ejercicio');
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
      setError(error.message);
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
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <Loader className="w-12 h-12 text-[#5ec6a6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#23272f] to-[#1a1a1a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/curso/${cursoId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#5ec6a6] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al curso
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">
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
            className="bg-gradient-to-br from-[#5ec6a6]/10 to-[#4da992]/10 border border-[#5ec6a6]/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-6 h-6 text-[#5ec6a6]" />
                  <h3 className="text-xl font-bold text-[#5ec6a6]">
                    Ya has entregado este ejercicio
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="font-semibold">Archivo:</span> {entregaExistente.archivoPdf.nombreOriginal}</p>
                  <p><span className="font-semibold">Fecha de entrega:</span> {new Date(entregaExistente.fechaEntrega).toLocaleString('es-ES')}</p>
                  <p><span className="font-semibold">Estado:</span> 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      entregaExistente.estado === 'aprobado' ? 'bg-green-500/20 text-green-400' :
                      entregaExistente.estado === 'rechazado' ? 'bg-red-500/20 text-red-400' :
                      entregaExistente.estado === 'revisado' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {entregaExistente.estado.charAt(0).toUpperCase() + entregaExistente.estado.slice(1)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <a
                    href={entregaExistente.archivoPdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#5ec6a6]/20 text-[#5ec6a6] rounded-lg hover:bg-[#5ec6a6]/30 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </a>
                  <button
                    onClick={handleEliminarEntrega}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Puedes actualizar tu entrega subiendo un nuevo archivo PDF
            </p>
          </motion.div>
        )}

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#23272f]/80 rounded-2xl border border-[#5ec6a6]/20 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Área de subida */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Archivo PDF *
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  dragActive
                    ? 'border-[#5ec6a6] bg-[#5ec6a6]/5'
                    : 'border-gray-600 hover:border-[#5ec6a6]/50'
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
                      <FileText className="w-12 h-12 text-[#5ec6a6]" />
                      <div className="text-left">
                        <p className="text-white font-medium">{selectedFile.name}</p>
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
                      <p className="text-white font-medium mb-2">
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
              <label className="block text-white font-semibold mb-3">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                maxLength={2000}
                rows={6}
                placeholder="Agrega cualquier comentario o aclaración sobre tu trabajo..."
                className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5ec6a6] transition-colors"
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
                className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 font-semibold rounded-xl hover:border-[#5ec6a6]/50 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading || (!selectedFile && !entregaExistente)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#5ec6a6] to-[#4da992] text-[#1a1a1a] font-bold rounded-xl hover:shadow-xl hover:shadow-[#5ec6a6]/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}
