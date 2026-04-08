import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const actualizarDuracion = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    const result = await Course.updateOne(
      { _id: '69d50406663e8648d7ee1f08' },
      { $set: {
        objetivosGenerales: [
          'Comprender el funcionamiento interno de los modelos de carbono del suelo.',
          'Interpretar la dinámica temporal del carbono orgánico del suelo (SOC).',
          'Analizar las diferencias entre modelos bajo un mismo escenario ambiental para obtener estimaciones más robustas.',
          'Aprender los fundamentos teóricos de la dinámica del carbono y su aplicación práctica en modelización avanzada y sistemas socio-ecológicos.'
        ],
        objetivosEspecificos: [
          'Desarrollar competencias en modelización ambiental reproducible y manejo de datos climáticos y edáficos.',
          'Realizar un análisis crítico de resultados multimodelo.',
          'Familiarizarse con herramientas computacionales de investigación real, específicamente la ejecución de scripts en el lenguaje de programación R.',
          'Dominar la estructuración modular del código y la gestión de datos de entrada ("forcing data").',
          'Interpretar outputs gráficos y numéricos, como las trayectorias de stocks de SOC y los flujos de mineralización de CO2.',
          'Aprender el flujo estándar de modelización, incluyendo la preparación de datos, la fase de spin-up para estabilización y la simulación prospectiva.'
        ]
      } }
    );

    if (result.modifiedCount > 0) {
      console.log('✓ Título y descripción actualizados correctamente');
    } else {
      console.log('⚠️  No se modificó ningún documento (ya estaba en 18 horas o ID incorrecto)');
    }
  } catch (error) {
    console.error('✗ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Conexión cerrada');
    process.exit(0);
  }
};

actualizarDuracion();
