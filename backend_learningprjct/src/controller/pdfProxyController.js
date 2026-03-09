import https from 'https';
import http from 'http';

// Endpoint proxy para servir PDFs de Cloudinary con headers correctos
export const proxyPdf = async (req, res) => {
  try {
    const pdfUrl = req.query.url;
    
    if (!pdfUrl) {
      return res.status(400).json({ error: 'URL no proporcionada' });
    }

    // Validar que la URL sea de Cloudinary
    if (!pdfUrl.includes('cloudinary.com')) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const protocol = pdfUrl.startsWith('https') ? https : http;

    protocol.get(pdfUrl, (cloudinaryRes) => {
      // Establecer headers para visualización inline
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Pipe el contenido del PDF
      cloudinaryRes.pipe(res);
    }).on('error', (err) => {
      console.error('Error al obtener PDF de Cloudinary:', err);
      res.status(500).json({ error: 'Error al cargar el PDF' });
    });

  } catch (err) {
    console.error('Error en proxy PDF:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};
