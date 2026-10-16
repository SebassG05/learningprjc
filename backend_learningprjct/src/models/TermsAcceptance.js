import mongoose from 'mongoose';

// Prueba de que un alumno aceptó una versión concreta de los términos para un curso.
// Los registros no se editan: una versión nueva genera un registro nuevo.
const termsAcceptanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    termsVersion: { type: String, required: true },
    acceptedAt: { type: Date, required: true, default: Date.now },
    ip: { type: String, maxlength: 64 },
    forwardedFor: { type: String, maxlength: 256 }, // Cabecera X-Forwarded-For completa, por si hay que auditar
    userAgent: { type: String, maxlength: 512 },
  },
  { versionKey: false }
);

termsAcceptanceSchema.index({ userId: 1, courseId: 1, termsVersion: 1 }, { unique: true });

export default mongoose.model('TermsAcceptance', termsAcceptanceSchema);
