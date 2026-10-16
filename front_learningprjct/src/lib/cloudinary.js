// Imágenes de Cloudinary al ancho pedido y en AVIF/WebP (f_auto). Otras URLs se devuelven tal cual.
const isCloudinary = (src) => typeof src === 'string' && src.includes('res.cloudinary.com/') && src.includes('/image/upload/');

export const cloudinaryUrl = (src, width) =>
  isCloudinary(src) ? src.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`) : src;

export const cloudinarySrcSet = (src, widths) =>
  isCloudinary(src) ? widths.map((w) => `${cloudinaryUrl(src, w)} ${w}w`).join(', ') : undefined;
