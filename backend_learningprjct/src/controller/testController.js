import Test from '../models/Test.js';

// Obtener test de un tema específico
export const obtenerTestPorTema = async (req, res) => {
  try {
    const { cursoId, temaId } = req.params;

    const test = await Test.findOne({ cursoId, temaId });
    
    if (!test) {
      return res.status(404).json({ 
        error: 'Test no encontrado',
        mensaje: 'No existe un test para este tema'
      });
    }

    // Enviar preguntas sin las respuestas correctas
    const testSinRespuestas = {
      _id: test._id,
      titulo: test.titulo,
      descripcion: test.descripcion,
      duracionMinutos: test.duracionMinutos,
      notaMinima: test.notaMinima,
      preguntas: test.preguntas.map(p => ({
        numero: p.numero,
        bloque: p.bloque,
        pregunta: p.pregunta,
        opciones: p.opciones
      }))
    };

    res.json(testSinRespuestas);
  } catch (err) {
    console.error('Error al obtener test:', err);
    res.status(500).json({ error: 'Error al obtener el test' });
  }
};

// Validar respuestas del test
export const validarRespuestas = async (req, res) => {
  try {
    const { cursoId, temaId } = req.params;
    const { respuestas } = req.body; // Array de { numero, respuesta }

    const test = await Test.findOne({ cursoId, temaId });
    
    if (!test) {
      return res.status(404).json({ error: 'Test no encontrado' });
    }

    // Validar respuestas
    let correctas = 0;
    const resultados = test.preguntas.map(pregunta => {
      const respuestaUsuario = respuestas.find(r => r.numero === pregunta.numero);
      const esCorrecta = respuestaUsuario?.respuesta === pregunta.respuestaCorrecta;
      
      if (esCorrecta) correctas++;

      return {
        numero: pregunta.numero,
        pregunta: pregunta.pregunta,
        respuestaUsuario: respuestaUsuario?.respuesta || null,
        respuestaCorrecta: pregunta.respuestaCorrecta,
        esCorrecta
      };
    });

    const totalPreguntas = test.preguntas.length;
    const nota = (correctas / totalPreguntas) * 100;
    const aprobado = nota >= test.notaMinima;

    res.json({
      correctas,
      totalPreguntas,
      nota: Math.round(nota * 100) / 100,
      notaMinima: test.notaMinima,
      aprobado,
      resultados
    });

  } catch (err) {
    console.error('Error al validar respuestas:', err);
    res.status(500).json({ error: 'Error al validar las respuestas' });
  }
};

// Crear test (para administración)
export const crearTest = async (req, res) => {
  try {
    const test = new Test(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (err) {
    console.error('Error al crear test:', err);
    res.status(500).json({ error: 'Error al crear el test', detalle: err.message });
  }
};
