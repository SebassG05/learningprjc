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
