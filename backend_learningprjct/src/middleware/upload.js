import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import Course from '../models/Course.js';

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

// Materiales de un curso privado: «authenticated» (sin URL pública; los sirve la pasarela del backend)
async function isPrivateCourse(courseId) {
  if (!mongoose.isValidObjectId(courseId)) return false;
  const course = await Course.findById(courseId).select('accessMode').lean();
  return course?.accessMode === 'private';
}

// Configuración dinámica que detecta el tipo de archivo según el fieldname
export async function uploadParams(req, file) {
    try {
      console.log('🚀 [UPLOAD MIDDLEWARE] Iniciando subida:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      // Foto del profesor: cuadrada, recortada sobre la cara
      if (file.fieldname === 'profesorFoto') {
        return {
          folder: 'learning-platform/profesores',
          resource_type: 'image',
          public_id: generateUniqueFilename(file.originalname),
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }]
        };
      }
      // Si el campo se llama 'image', es una imagen de portada
      if (file.fieldname === 'image') {
        const config = {
          folder: 'learning-platform/portadas',
          resource_type: 'image',
          public_id: generateUniqueFilename(file.originalname),
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          transformation: [{ width: 800, height: 450, crop: 'limit', quality: 'auto' }]
        };
        console.log('🖼️ [UPLOAD MIDDLEWARE] Configuración para imagen:', config);
        return config;
      } 
      // Si es 'archivo' o 'archivoEn', es un documento PDF
      else {
        const config = {
          folder: 'learning-platform/materiales',
          resource_type: 'raw',
          public_id: generateUniqueFilename(file.originalname),
          allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
          ...((await isPrivateCourse(req.params?.id)) && { type: 'authenticated' })
        };
        console.log('📄 [UPLOAD MIDDLEWARE] Configuración para documento:', config);
        return config;
      }
    } catch (error) {
      console.error('💥 [UPLOAD MIDDLEWARE] ERROR en params:', error);
      throw error;
    }
}

const storageDinamico = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: uploadParams,
});

// Filtro dinámico que detecta según el fieldname
const fileFilterDinamico = (req, file, cb) => {
  console.log('🔍 Validando archivo:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });

  const extension = file.originalname.split('.').pop().toLowerCase();

  if (file.fieldname === 'image' || file.fieldname === 'profesorFoto') {
    // Para imágenes de portada y fotos del profesor
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
    console.error('❌❌❌ [MULTER ERROR] ❌❌❌');
    console.error('Código:', err.code);
    console.error('Mensaje:', err.message);
    console.error('Campo:', err.field);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Archivo muy grande',
        mensaje: 'El archivo no debe superar los 50MB'
      });
    }
    
    return res.status(400).json({
      error: 'Error al subir archivo',
      mensaje: err.message,
      codigo: err.code
    });
  } else if (err) {
    console.error('❌❌❌ [UPLOAD ERROR] ❌❌❌');
    console.error('Tipo:', err.name);
    console.error('Mensaje:', err.message);
    console.error('Stack:', err.stack);
    
    // Error de Cloudinary (credenciales, cuota, parámetros inválidos, etc.)
    const isCloudinaryError =
      (err.message && err.message.toLowerCase().includes('cloudinary')) ||
      (err.message && err.message.toLowerCase().includes('api_key')) ||
      (err.message && err.message.toLowerCase().includes('api key')) ||
      (err.message && err.message.toLowerCase().includes('must supply')) ||
      (err.message && err.message.toLowerCase().includes('unauthorized')) ||
      err.http_code !== undefined; // cloudinary errors include http_code
    if (isCloudinaryError) {
      return res.status(500).json({
        error: 'Error al subir a Cloudinary',
        mensaje: `Error de Cloudinary: ${err.message}`
      });
    }

    return res.status(500).json({
      error: 'Error al procesar archivo',
      mensaje: err.message || 'Error desconocido al procesar el archivo'
    });
  }
  
  next();
};

export default upload;
