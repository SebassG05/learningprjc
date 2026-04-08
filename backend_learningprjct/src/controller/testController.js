import Test from '../models/Test.js';
import Course from '../models/Course.js';
import UserProgress from '../models/UserProgress.js';

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

    // Verificar si el usuario está autenticado (si hay token)
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        // Obtener el curso para verificar si es el test final
        const course = await Course.findById(cursoId);
        
        if (course && course.temas && course.temas.length > 0) {
          // Encontrar el tema actual
          const temaActual = course.temas.find(t => t._id.toString() === temaId);
          
          // Verificar si es el test final por temaId especial o por propiedades del tema
          const isTestFinal = temaId === 'test-final-certificacion' || (temaActual && (
            temaActual.numeroTema >= 5 ||
            temaActual.titulo?.toLowerCase().includes('test final') ||
            temaActual.titulo?.toLowerCase().includes('certificación')
          ));
          
          if (isTestFinal) {
            // Extraer userId del token
            const token = authHeader.split(' ')[1];
            const jwt = await import('jsonwebtoken');
            const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'clave-secreta-para-jwt-en-desarrollo');
            const userId = decoded.id;
            
            // Verificar enrollment del usuario
            const enrollment = await UserProgress.findOne({ 
              userId, 
              courseId: cursoId 
            });
            
            if (enrollment) {
              // Obtener los temas 1-4 del curso (los 4 temas principales)
              const temasDelCurso = course.temas.filter(t => t.numeroTema >= 1 && t.numeroTema <= 4);
              
              // Verificar si todos los tests de los temas 1-4 están completados
              const todosTestsCompletados = temasDelCurso.every(tema => 
                enrollment.completedTests && enrollment.completedTests.includes(tema._id.toString())
              );
              
              if (!todosTestsCompletados) {
                return res.status(403).json({ 
                  error: 'Test bloqueado',
                  mensaje: 'Debes completar todos los tests de los temas 1-4 para acceder al test final de certificación'
                });
              }
            }
          }
        }
      } catch (authError) {
        // Si hay error en la autenticación, continuar sin bloquear
        console.log('Error al verificar autenticación para bloqueo de test:', authError.message);
      }
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
