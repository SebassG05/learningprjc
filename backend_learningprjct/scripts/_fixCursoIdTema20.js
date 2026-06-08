import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const fix = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection.db.collection('tests').updateOne(
    { temaId: '6a196c3dd733b54cd47d752b' },
    { $set: { cursoId: '6a196249d733b54cd47d6e0a' } }
  );
  console.log('Modificados:', result.modifiedCount);
  await mongoose.disconnect();
};

fix().catch(err => { console.error(err); process.exit(1); });
