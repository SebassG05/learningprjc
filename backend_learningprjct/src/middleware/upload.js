import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Helper para generar nombres únicos
const generateUniqueFilename = (originalname) => {
  const name = originalname
    .split('.')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  return `${name}-${uniqueSuffix}`;
};

// Configuración dinámica que detecta el tipo de archivo según el fieldname
const storageDinamico = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    console.log('📤 Subiendo archivo:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });

    // Si el campo se llama 'image', es una imagen de portada
    if (file.fieldname === 'image') {
      return {
        folder: 'learning-platform/portadas',
        resource_type: 'image',
        public_id: generateUniqueFilename(file.originalname),
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 800, height: 450, crop: 'limit', quality: 'auto' }]
      };
    } 
    // Si es 'archivo' o 'archivoEn', es un documento PDF
    else {
      return {
        folder: 'learning-platform/materiales',
        resource_type: 'raw',
        public_id: generateUniqueFilename(file.originalname),
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx']
      };
    }
  }
});

// Filtro dinámico que detecta según el fieldname
const fileFilterDinamico = (req, file, cb) => {
  console.log('🔍 Validando archivo:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });

  const extension = file.originalname.split('.').pop().toLowerCase();

  if (file.fieldname === 'image') {
    // Para imágenes de portada
    const allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const isValidImage = allowedImageTypes.includes(extension);
    
    if (isValidImage) {
      console.log('✅ Imagen válida:', extension);
      return cb(null, true);
    } else {
      console.log('❌ Imagen inválida:', extension);
      return cb(new Error(`Solo se permiten imágenes: ${allowedImageTypes.join(', ')}`));
    }
  } else {
    // Para documentos PDF
    const allowedDocTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
    const isValidDoc = allowedDocTypes.includes(extension);
    
    if (isValidDoc) {
      console.log('✅ Documento válido:', extension);
      return cb(null, true);
    } else {
      console.log('❌ Documento inválido:', extension);
      return cb(new Error(`Solo se permiten documentos: ${allowedDocTypes.join(', ')}`));
    }
  }
};

// Configuración de multer con storage dinámico (DEFAULT)
const upload = multer({
  storage: storageDinamico,
  limits: {
    fileSize: 50 * 1024 * 1024 // Límite de 50MB
  },
  fileFilter: fileFilterDinamico
});

// Middleware para manejar errores de Multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Error de Multer:', err.message);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Archivo muy grande',
        mensaje: 'El archivo no debe superar los 50MB'
      });
    }
    
    return res.status(400).json({
      error: 'Error al subir archivo',
      mensaje: err.message
    });
  } else if (err) {
    console.error('❌ Error al procesar archivo:', err.message);
    return res.status(400).json({
      error: 'Error al procesar archivo',
      mensaje: err.message
    });
  }
  
  next();
};

export default upload;
