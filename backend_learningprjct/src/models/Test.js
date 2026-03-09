import mongoose from 'mongoose';

const opcionSchema = new mongoose.Schema({
  id: String,
  texto: String
}, { _id: false });

const preguntaSchema = new mongoose.Schema({
  numero: Number,
  bloque: String,
  pregunta: String,
  opciones: [opcionSchema],
  respuestaCorrecta: String
}, { _id: false });

const testSchema = new mongoose.Schema({
  temaId: {
    type: String,
    required: true,
    index: true
  },
  cursoId: {
    type: String,
    required: true,
    index: true
  },
  titulo: {
    type: String,
    required: true
  },
  descripcion: String,
  preguntas: [preguntaSchema],
  duracionMinutos: Number,
  notaMinima: {
    type: Number,
    default: 60
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Test', testSchema);
