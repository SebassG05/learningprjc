import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['usuario', 'admin', 'superadmin'],
    default: 'usuario'
  },
  activo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  // Primera vez que se entró con Google (correo verificado). En ese momento la contraseña se cambia por una
  // aleatoria; después ya no se toca, por si la usuaria se pone una con «He olvidado mi contraseña».
  googleLinkedAt: {
    type: Date
  },
  // Registro con contraseña desde que existe la verificación: true hasta que se confirma el código enviado al
  // correo. Mientras tanto no hay sesión. Las cuentas anteriores no lo tienen y siguen como estaban.
  emailPendiente: {
    type: Boolean
  },
  emailVerificadoAt: {
    type: Date
  },
  // Código de verificación en curso (solo su hash). Nunca sale en las consultas normales.
  verificacionCorreo: {
    type: new mongoose.Schema({
      codigoHash: String,
      expiresAt: Date,
      intentos: { type: Number, default: 0 },
      enviadoAt: Date,
    }, { _id: false }),
    select: false
  },
  // Última reseña publicada: limita a una reseña cada 24 h (borrarla no reabre el plazo)
  lastReviewAt: {
    type: Date
  }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Métodos de instancia para verificar roles
userSchema.methods.esSuperAdmin = function() {
  return this.role === 'superadmin';
};

userSchema.methods.esAdmin = function() {
  return this.role === 'admin' || this.role === 'superadmin';
};

userSchema.methods.esUsuario = function() {
  return this.role === 'usuario';
};

// Método estático para crear superadmin
userSchema.statics.crearSuperAdmin = async function(datos) {
  const superadmin = new this({
    ...datos,
    role: 'superadmin',
    activo: true
  });
  await superadmin.save();
  return superadmin;
};

export default mongoose.model('User', userSchema);
