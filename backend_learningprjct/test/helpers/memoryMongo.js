// Mongo real en memoria para los tests que dependen del motor (updates con arrayFilters, índices únicos,
// carreras entre peticiones). La versión se fija en package.json → config.mongodbMemoryServer.
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function startMemoryMongo() {
  const server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri(), { dbName: 'test' });
  return {
    async reset() {
      const { collections } = mongoose.connection;
      await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
    },
    async stop() {
      await mongoose.disconnect();
      await server.stop();
    },
  };
}
