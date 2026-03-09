import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configuración de almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'learning-platform/materiales',
      resource_type: 'raw',
      public_id: (() => {
        const name = file.originalname
          .split('.')[0]
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_');
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${name}-${uniqueSuffix}`;
      })(),
      allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx']
    };
  }
});

// Filtro para aceptar solo ciertos tipos de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx/;
  const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, DOC, DOCX, PPT, PPTX'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // Límite de 50MB
  },
  fileFilter: fileFilter
});

export default upload;
