import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configuración de almacenamiento para documentos (PDFs, etc.)
const storageDocumentos = new CloudinaryStorage({
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

// Configuración de almacenamiento para imágenes (portadas de cursos)
const storageImagenes = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'learning-platform/portadas',
      resource_type: 'image',
      public_id: (() => {
        const name = file.originalname
          .split('.')[0]
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_');
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${name}-${uniqueSuffix}`;
      })(),
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 800, height: 450, crop: 'limit', quality: 'auto' }]
    };
  }
});

// Configuración dinámica que detecta el tipo de archivo según el fieldname
const storageDinamico = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Si el campo se llama 'image', es una imagen de portada
    if (file.fieldname === 'image') {
      return {
        folder: 'learning-platform/portadas',
        resource_type: 'image',
        public_id: (() => {
          const name = file.originalname
            .split('.')[0]
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_');
          
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          return `${name}-${uniqueSuffix}`;
        })(),
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 800, height: 450, crop: 'limit', quality: 'auto' }]
      };
    } 
    // Si es 'archivo' o 'archivoEn', es un documento PDF
    else {
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
  }
});

// Filtro para documentos (PDFs, etc.)
const fileFilterDocumentos = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx/;
  const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, DOC, DOCX, PPT, PPTX'));
  }
};

// Filtro para imágenes
const fileFilterImagenes = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp|gif/;
  const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPG, JPEG, PNG, WEBP, GIF'));
  }
};

// Filtro dinámico que detecta según el fieldname
const fileFilterDinamico = (req, file, cb) => {
  if (file.fieldname === 'image') {
    // Para imágenes de portada
    const allowedTypes = /jpg|jpeg|png|webp|gif/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      return cb(new Error('Solo se permiten imágenes JPG, JPEG, PNG, WEBP, GIF'));
    }
  } else {
    // Para documentos PDF
    const allowedTypes = /pdf|doc|docx|ppt|pptx/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      return cb(new Error('Solo se permiten archivos PDF, DOC, DOCX, PPT, PPTX'));
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

export default upload;
