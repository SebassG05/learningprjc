import mongoose from 'mongoose';

// Enlace de invitación a una cohorte. El token en claro solo se devuelve al crearlo: aquí se guarda
// su SHA-256, así que una copia de la base de datos no sirve para canjear invitaciones.
const cohortInviteSchema = new mongoose.Schema({
  cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  email: { type: String, trim: true, lowercase: true }, // destinatario previsto (informativo / envío por email)
  expiresAt: { type: Date, required: true },
  maxUses: { type: Number, default: 1, min: 1, max: 10000 },
  uses: { type: Number, default: 0, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = enviada por el sistema
  revokedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('CohortInvite', cohortInviteSchema);
