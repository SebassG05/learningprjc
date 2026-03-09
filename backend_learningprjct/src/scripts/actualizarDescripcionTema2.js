import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const actualizarDescripcionTema2 = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    const cursoId = '69a6a0a4c8289d012745af63';
    const temaId = '69aeaa6c7eae18944d9c89c6';
    
    const nuevaDescripcion = 'Este tema profundiza en los mecanismos fundamentales que regulan la dinámica del carbono orgánico del suelo (SOC), analizando cómo la materia orgánica se transforma y se estabiliza a través de diversos modelos compartimentales como RothC, Century e ICBM. Exploraremos la base matemática de estos procesos, representados mediante ecuaciones diferenciales matriciales donde la evolución del carbono C(t) está condicionada por las entradas de biomasa, las tasas de descomposición y las transferencias entre pools (como la biomasa microbiana o la materia orgánica humificada), todo ello modulado por factores ambientales como la temperatura, la humedad y la textura del suelo. Finalmente, el curso aborda el uso de multi-model ensembles para integrar diferentes estructuras de simulación, permitiendo una estimación más robusta de la evolución del carbono y los flujos de gases de efecto invernadero.';

    // Actualizar la descripción del tema 2
    const result = await Course.updateOne(
      { 
        _id: cursoId,
        'temas._id': temaId
      },
      {
        $set: {
          'temas.$.descripcion': nuevaDescripcion
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✓ Descripción del Tema 2 actualizada correctamente');
      console.log('\nNueva descripción:');
      console.log(nuevaDescripcion);
    } else {
      console.log('⚠️  No se encontró el tema o ya tenía esa descripción');
    }

  } catch (error) {
    console.error('✗ Error al actualizar la descripción:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);
  }
};

actualizarDescripcionTema2();
