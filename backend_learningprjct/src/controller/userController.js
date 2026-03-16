import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Course from '../models/Course.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { sendPasswordResetEmail, sendCourseCompletionEmailToUser, sendCourseCompletionNotificationToAdmin } from '../service/mailService.js';
import { verifyGoogleToken, findOrCreateGoogleUser, generateJWT } from '../service/googleAuthService.js';

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};

export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );
    
    // Actualizar lastLogin
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role || 'usuario'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};

export const logoutUser = async (req, res) => {
  // El logout en JWT se realiza eliminando el token en el frontend.
  // Para mantener la misma estructura que login, respondemos con un mensaje y el usuario (si lo deseas, puedes enviar el usuario desde el token).
  res.json({
    message: 'Sesión cerrada correctamente'
  });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // No revelar si el email existe o no
      return res.status(200).json({ message: 'Si el email está registrado, se enviará un correo con instrucciones.' });
    }
    // Eliminar tokens previos
    await PasswordResetToken.deleteMany({ userId: user._id });
    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
    await PasswordResetToken.create({ userId: user._id, token, expiresAt });
    // Aquí se debe enviar el email con el enlace (pendiente)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;
    await sendPasswordResetEmail(user.email, resetLink);
    return res.status(200).json({ message: 'Si el email está registrado, se enviará un correo con instrucciones.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token, newPassword } = req.body;
  if (process.env.NODE_ENV !== 'production') {
    console.log('resetPassword body:', { userId, token, newPassword });
  }
  if (!userId || !token || !newPassword) {
    console.error('Datos incompletos:', { userId, token, newPassword });
    return res.status(400).json({ error: 'Datos incompletos.' });
  }
  try {
    const resetToken = await PasswordResetToken.findOne({ userId, token });
    if (process.env.NODE_ENV !== 'production') {
      console.log('resetToken encontrado:', resetToken);
    }
    if (!resetToken || resetToken.expiresAt < new Date()) {
      console.error('Token inválido o expirado:', resetToken);
      return res.status(400).json({ error: 'Token inválido o expirado.' });
    }
    const user = await User.findById(userId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Usuario encontrado:', user);
    }
    if (!user) {
      console.error('Usuario no encontrado:', userId);
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    user.password = newPassword;
    await user.save();
    await PasswordResetToken.deleteMany({ userId });
    if (process.env.NODE_ENV !== 'production') {
      console.log('Contraseña actualizada y tokens eliminados');
    }
    return res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error('Error en resetPassword:', err);
    return res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};

/**
 * Login/Register user with Google OAuth
 * @route POST /auth/google
 * @param {string} req.body.credential - Google ID token
 */
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'No credential provided' });
    }
    // 1. Verificar el token de Google
    let googlePayload;
    try {
      googlePayload = await verifyGoogleToken(credential);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid Google token', error: err.message });
    }
    // 2. Buscar o crear usuario
    const user = await findOrCreateGoogleUser(googlePayload);
    // 3. Generar JWT propio
    const token = generateJWT(user);
    // 4. Actualizar lastLogin
    user.lastLogin = new Date();
    await user.save();
    
    // 5. Responder con datos de usuario y token
    return res.status(200).json({
      message: 'Inicio de sesión con Google exitoso',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar,
        role: user.role || 'usuario'
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============= GESTIÓN DE INSCRIPCIÓN A CURSOS =============

/**
 * Inscribir usuario a un curso
 * @route POST /api/users/enroll/:courseId
 * @access Private
 */
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id; // Del middleware authenticateJWT

    // Verificar si ya está inscrito
    const existingEnrollment = await UserProgress.findOne({ userId, courseId });

    if (existingEnrollment) {
      return res.status(400).json({ 
        error: 'Ya estás inscrito en este curso',
        enrollment: existingEnrollment
      });
    }

    // Crear nueva inscripción
    const enrollment = new UserProgress({
      userId,
      courseId,
      status: 'enrolled',
      progress: 0
    });

    await enrollment.save();

    res.status(200).json({
      message: 'Inscripción exitosa',
      enrollment
    });
  } catch (error) {
    console.error('Error en enrollInCourse:', error);
    
    // Manejar error de índice único
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
    }
    
    res.status(500).json({ error: 'Error al inscribirse al curso', details: error.message });
  }
};

/**
 * Verificar estado de inscripción del usuario en un curso
 * @route GET /api/users/enrollment/:courseId
 * @access Private
 */
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await UserProgress.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(200).json({ 
        enrolled: false,
        status: 'not_enrolled'
      });
    }

    res.status(200).json({
      enrolled: true,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      progress: enrollment.progress,
      completedMaterials: enrollment.completedMaterials || [],
      completedTests: enrollment.completedTests || []
    });
  } catch (error) {
    console.error('Error en getEnrollmentStatus:', error);
    res.status(500).json({ error: 'Error al verificar inscripción', details: error.message });
  }
};

/**
 * Actualizar progreso del curso
 * @route PUT /api/users/enrollment/:courseId/progress
 * @access Private
 */
export const updateCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress, completedMaterials } = req.body;
    const userId = req.user.id;

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({ error: 'El progreso debe estar entre 0 y 100' });
    }

    const enrollment = await UserProgress.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({ error: 'No estás inscrito en este curso' });
    }

    // Actualizar progreso si se proporciona
    if (progress !== undefined) {
      enrollment.progress = progress;
    }

    // Actualizar materiales completados si se proporcionan
    if (completedMaterials) {
      enrollment.completedMaterials = completedMaterials;
    }

    // Si el progreso llega a 100%, marcar como completado
    if (enrollment.progress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    res.status(200).json({
      message: 'Progreso actualizado',
      enrollment
    });
  } catch (error) {
    console.error('Error en updateCourseProgress:', error);
    res.status(500).json({ error: 'Error al actualizar progreso', details: error.message });
  }
};

/**
 * Marcar curso como completado
 * @route PUT /api/users/enrollment/:courseId/complete
 * @access Private
 */
export const completeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await UserProgress.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({ error: 'No estás inscrito en este curso' });
    }

    if (enrollment.status === 'completed') {
      return res.status(400).json({ error: 'El curso ya está completado' });
    }

    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
    enrollment.progress = 100;

    await enrollment.save();

    res.status(200).json({
      message: 'Curso completado exitosamente',
      enrollment
    });
  } catch (error) {
    console.error('Error en completeCourse:', error);
    res.status(500).json({ error: 'Error al completar curso', details: error.message });
  }
};

/**
 * Marcar un test como completado
 * @route POST /api/users/enrollment/:courseId/test/:temaId/complete
 * @access Private
 */
export const completeTest = async (req, res) => {
  try {
    const { courseId, temaId } = req.params;
    const userId = req.user.id;

    const enrollment = await UserProgress.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({ error: 'No estás inscrito en este curso' });
    }

    // Verificar si el test ya está completado
    if (!enrollment.completedTests) {
      enrollment.completedTests = [];
    }

    const isAlreadyCompleted = enrollment.completedTests.includes(temaId);

    if (!isAlreadyCompleted) {
      enrollment.completedTests.push(temaId);
      await enrollment.save();
    }

    // Verificar si es el test final del curso (tema 5 o con "Test Final" en título)
    let isFinalTest = false;
    
    try {
      const course = await Course.findById(courseId);
      
      if (course && course.temas && course.temas.length > 0) {
        // Encontrar el tema actual
        const temaActual = course.temas.find(t => t._id.toString() === temaId);
        
        // Verificar si es el test final (tema 5 o superior, o contiene "Test Final" en el título)
        isFinalTest = temaActual && (
          temaActual.numeroTema >= 5 ||
          temaActual.titulo?.toLowerCase().includes('test final') ||
          temaActual.titulo?.toLowerCase().includes('certificación')
        );
      }
    } catch (courseError) {
      console.error('⚠️ Error al verificar si es test final:', courseError);
    }

    // Si es el test final y no había sido completado previamente, enviar correos
    if (isFinalTest && !isAlreadyCompleted) {
      try {
        // Obtener datos del usuario
        const user = await User.findById(userId);
        
        if (user && user.email && user.name) {
          // Enviar correo al usuario
          await sendCourseCompletionEmailToUser(user.name, user.email);
          console.log(`✅ Correo de finalización enviado a ${user.email}`);

          // Enviar notificación a administradores
          await sendCourseCompletionNotificationToAdmin(user.name, user.email);
          console.log(`✅ Notificación de finalización enviada a administradores`);
        }
      } catch (emailError) {
        // Log del error pero no fallar la petición
        console.error('⚠️ Error al enviar correos de finalización:', emailError);
        // Continuamos con la respuesta exitosa ya que el test sí se marcó como completado
      }
    }

    res.status(200).json({
      message: 'Test completado exitosamente',
      enrollment,
      isFinalTest
    });
  } catch (error) {
    console.error('Error en completeTest:', error);
    res.status(500).json({ error: 'Error al marcar test como completado', details: error.message });
  }
};

/**
 * Obtener todos los cursos inscritos del usuario
 * @route GET /api/users/enrollments
 * @access Private
 */
export const getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await UserProgress.find({ userId }).populate('courseId');

    res.status(200).json({
      enrollments
    });
  } catch (error) {
    console.error('Error en getUserEnrollments:', error);
    res.status(500).json({ error: 'Error al obtener cursos inscritos', details: error.message });
  }
};

/**
 * Obtener datos del usuario actual
 * @route GET /api/users/me
 * @access Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'usuario',
        avatar: user.avatar,
        activo: user.activo
      }
    });
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario', details: error.message });
  }
};
