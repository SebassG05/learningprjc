import mongoose from 'mongoose';
import { normalizeEmail } from '../utils/email.js';

// «Avísame de la próxima edición» de un curso privado: una fila por curso y email.
const courseInterestSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  email: { type: String, required: true, set: normalizeEmail },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: true, updatedAt: false } });

courseInterestSchema.index({ course: 1, email: 1 }, { unique: true });

export default mongoose.model('CourseInterest', courseInterestSchema);
