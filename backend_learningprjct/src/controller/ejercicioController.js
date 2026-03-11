import Ejercicio from '../models/Ejercicio.js';

// Obtener ejercicios de un curso
export const obtenerEjerciciosCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { temaId } = req.query;

    const filtro = { cursoId, activo: true };
    
    // Si se especifica temaId, filtrar por ese tema
    // Si temaId es 'final', buscar ejercicios sin tema asignado (post-test-final)
    if (temaId) {
      if (temaId === 'final') {
        filtro.temaId = null;
      } else {
        filtro.temaId = temaId;
      }
    }

    const ejercicios = await Ejercicio.find(filtro).sort({ orden: 1 });

    res.json(ejercicios);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
};

// Obtener un ejercicio específico
export const obtenerEjercicioPorId = async (req, res) => {
  try {
    const { ejercicioId } = req.params;

    const ejercicio = await Ejercicio.findById(ejercicioId);

    if (!ejercicio) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }

    res.json(ejercicio);
  } catch (error) {
    console.error('Error al obtener ejercicio:', error);
    res.status(500).json({ error: 'Error al obtener ejercicio' });
  }
};

// Crear un ejercicio nuevo (admin)
export const crearEjercicio = async (req, res) => {
  try {
    const ejercicio = new Ejercicio(req.body);
    await ejercicio.save();

    res.status(201).json({
      message: 'Ejercicio creado exitosamente',
      ejercicio
    });
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    res.status(500).json({ 
      error: 'Error al crear ejercicio',
      detalle: error.message 
    });
  }
};

// Actualizar un ejercicio (admin)
export const actualizarEjercicio = async (req, res) => {
  try {
    const { ejercicioId } = req.params;

    const ejercicio = await Ejercicio.findByIdAndUpdate(
      ejercicioId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!ejercicio) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }

    res.json({
      message: 'Ejercicio actualizado exitosamente',
      ejercicio
    });
  } catch (error) {
    console.error('Error al actualizar ejercicio:', error);
    res.status(500).json({ 
      error: 'Error al actualizar ejercicio',
      detalle: error.message 
    });
  }
};

// Eliminar un ejercicio (admin)
export const eliminarEjercicio = async (req, res) => {
  try {
    const { ejercicioId } = req.params;

    const ejercicio = await Ejercicio.findByIdAndUpdate(
      ejercicioId,
      { activo: false },
      { new: true }
    );

    if (!ejercicio) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }

    res.json({
      message: 'Ejercicio desactivado exitosamente',
      ejercicio
    });
  } catch (error) {
    console.error('Error al eliminar ejercicio:', error);
    res.status(500).json({ 
      error: 'Error al eliminar ejercicio',
      detalle: error.message 
    });
  }
};
