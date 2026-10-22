import mongoose from 'mongoose';
import { isValidEmail, normalizeEmail } from '../utils/email.js';

// Grupo de personas con acceso a un curso privado durante una ventana de fechas.
// Un miembro añadido por email sin cuenta queda 'pending' (user: null) hasta que entra con ese email.

export const AFTER_END = ['revoke', 'readonly'];
export const MEMBER_STATUS = ['pending', 'active'];
export const MEMBER_SOURCE = ['email', 'invite'];

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email: {
    type: String,
    required: true,
    set: normalizeEmail,
    validate: { validator: isValidEmail, message: 'Email no válido' }
  },
  status: { type: String, enum: MEMBER_STATUS, default: 'pending' },
  addedAt: { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, enum: MEMBER_SOURCE, required: true }
}, { _id: true });

const cohortSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  startsAt: { type: Date, required: true },
  endsAt: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
        // En updates (findOneAndUpdate con runValidators) `this` no es el documento: lo valida el controlador
        return !(this instanceof mongoose.Document) || !this.startsAt || value > this.startsAt;
      },
      message: 'La fecha de fin debe ser posterior a la de inicio'
    }
  },
  afterEnd: { type: String, enum: AFTER_END, default: 'readonly' },
  members: [memberSchema]
}, { timestamps: true });

cohortSchema.index({ course: 1 });
cohortSchema.index({ 'members.user': 1 });
cohortSchema.index({ 'members.email': 1 });

export default mongoose.model('Cohort', cohortSchema);
