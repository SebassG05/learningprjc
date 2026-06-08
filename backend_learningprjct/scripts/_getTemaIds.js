import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const course = await mongoose.connection.db.collection('courses').findOne(
    { _id: new mongoose.Types.ObjectId('6a196249d733b54cd47d6e0a') },
    { projection: { 'temas._id': 1, 'temas.titulo': 1, 'temas.numero': 1 } }
  );
  console.log('Temas del curso:');
  course.temas.forEach(t => console.log(`  ${t.numero ?? ''} | ${t._id} | ${t.titulo}`));
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
