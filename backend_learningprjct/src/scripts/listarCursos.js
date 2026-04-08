import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const verificar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const cursos = await Course.find({}, { title: 1, duration: 1, _id: 1 });
    cursos.forEach(c => console.log(`ID: ${c._id} | ${c.title} | ${c.duration}`));
  } catch (error) {
    console.error('✗ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

verificar();
