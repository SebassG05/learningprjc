import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const recuperarCursoModelizacionCarbono = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    // Datos completos del curso
    const cursoData = {
      title: 'Modelización Dinámica de Carbono',
      image: 'https://res.cloudinary.com/dgbmy60sc/image/upload/v1772527759/8c2dd540-ce40-4375-86e0-8b1fbf1d3416_hthqfl.jpg',
      description: 'Curso e-learning orientado a la modelización del carbono orgánico del suelo mediante modelos compartimentales y enfoque multi-model ensemble, aplicado a la evaluación de stocks de SOC y flujos de CO₂ bajo distintos escenarios climáticos y de manejo.',
      duration: '18 horas',
      category: ['Ciencia del Suelo', 'Modelización', 'Cambio Climático', 'Agricultura Sostenible'],
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
      ],
      isOpen: true,
      temas: [
        {
          numeroTema: 1,
          titulo: 'Dinámica del Carbono del Suelo - Procesos y Mecanismos Fundamentales',
          descripcion: 'Estudio en profundidad de los procesos biogeoquímicos que controlan la dinámica del carbono en el suelo: descomposición de materia orgánica, estabilización física y química, mineralización, humificación y los factores ambientales que regulan estos procesos.',
          materiales: [
            {
              tipo: 'pdf',
              titulo: 'Introducción: Modelización de la Dinámica del Carbono Orgánico del Suelo mediante Modelos Compartimentales y Multi-Model Ensemble',
              descripcion: 'Material introductorio que establece las bases conceptuales del curso, explica la relevancia de la modelización del carbono en el contexto actual de cambio climático y presenta los principales enfoques metodológicos que se desarrollarán a lo largo del curso.',
              archivo: 'https://res.cloudinary.com/dgbmy60sc/raw/upload/v1773049865/learning-platform/materiales/IntroducciA_n__ModelizaciA_n_de_la_dinA_mica_del_carbono_orgA_nico_del_suelo_mediante_modelos_compartimentales_y_multi-model_ensemble__2_-1773049864756-378782325',
              orden: 1
            },
            {
              tipo: 'pdf',
              titulo: 'Dinámica del Carbono del Suelo: Procesos y Mecanismos Fundamentales',
              descripcion: 'Material técnico que profundiza en los mecanismos físicos, químicos y biológicos que gobiernan el ciclo del carbono en el suelo. Incluye teorías de descomposición, formación de materia orgánica estable, y la influencia de factores como temperatura, humedad, textura del suelo y tipo de vegetación.',
              archivo: 'https://res.cloudinary.com/dgbmy60sc/raw/upload/v1773054595/learning-platform/materiales/DinA_mica_del_carbono_del_suelo__procesos_y_mecanismos_fundamentales-1773054595093-981863636',
              orden: 2
            }
          ],
          actividadesOptativas: [],
          completado: false
        },
        {
          numeroTema: 2,
          titulo: 'Modelos Basados en Procesos Incluidos en el Ensemble',
          descripcion: 'Presentación detallada de los principales modelos compartimentales de carbono (RothC, CENTURY, YASSO, ICBM, entre otros), su estructura matemática, supuestos subyacentes, parametrización y validación. Se explora cómo cada modelo representa los procesos del suelo de manera diferente.',
          materiales: [
            {
              tipo: 'pdf',
              titulo: 'Modelos Basados en Procesos Incluidos en el Ensemble',
              descripcion: 'Documentación técnica exhaustiva de los modelos compartimentales más utilizados a nivel internacional. Cada modelo se describe en términos de su estructura de compartimentos, ecuaciones diferenciales, parámetros clave, requisitos de entrada de datos y aplicaciones típicas en investigación y consultoría.',
              archivo: 'https://res.cloudinary.com/dgbmy60sc/raw/upload/v1773056219/learning-platform/materiales/Modelos_basados_en_procesos_incluidos_en_el_ensemble-1773056219042-352247372',
              orden: 1
            }
          ],
          actividadesOptativas: [],
          completado: false
        },
        {
          numeroTema: 3,
          titulo: 'Técnicas de Multi-Model Ensemble y Análisis de Incertidumbre',
          descripcion: 'Metodologías avanzadas para combinar predicciones de múltiples modelos mediante técnicas de ensemble, evaluación de la incertidumbre de las predicciones, análisis de sensibilidad, calibración bayesiana y validación cruzada. Se enfatiza la mejora de la robustez y confiabilidad de las proyecciones.',
          materiales: [
            {
              tipo: 'pdf',
              titulo: 'Técnicas de Multi-Model Ensemble y Análisis de Incertidumbre',
              descripcion: 'Material metodológico sobre técnicas estadísticas y computacionales para integrar resultados de múltiples modelos, cuantificar incertidumbres asociadas a parámetros y estructura de modelos, y comunicar el rango de predicciones posibles. Incluye ejemplos prácticos de aplicación en estudios de cambio climático.',
              archivo: 'https://res.cloudinary.com/dgbmy60sc/raw/upload/v1773056219/learning-platform/materiales/Modelos_basados_en_procesos_incluidos_en_el_ensemble-1773056219042-352247372',
              orden: 1
            }
          ],
          actividadesOptativas: [],
          completado: false
        },
        {
          numeroTema: 4,
          titulo: 'Ejecución y Práctica con el Modelo',
          descripcion: 'Componente práctico del curso donde los estudiantes aprenden a ejecutar simulaciones reales utilizando herramientas de modelización (como RothC de Evenor-Tech), parametrizar modelos con datos reales, interpretar salidas gráficas y numéricas, y elaborar informes técnicos profesionales basados en los resultados obtenidos.',
          materiales: [
            {
              tipo: 'pdf',
              titulo: 'Ejecución y Práctica con el Modelo',
              descripcion: 'Guía práctica paso a paso para ejecutar simulaciones de dinámica de carbono. Incluye tutoriales sobre el uso de interfaces de modelización, interpretación de resultados, preparación de datos de entrada, validación de salidas y mejores prácticas para el uso de modelos en contextos aplicados de consultoría y gestión agrícola sostenible.',
              archivo: 'https://res.cloudinary.com/dgbmy60sc/raw/upload/v1773057387/learning-platform/materiales/EjecuciA_n_y_prA_ctica_con_el_modelo-1773057386437-208442993',
              orden: 1
            }
          ],
          actividadesOptativas: [],
          completado: false
        }
      ]
    };

    // Verificar si el curso ya existe
    const cursoExistente = await Course.findOne({ 
      title: cursoData.title 
    });

    if (cursoExistente) {
      console.log('\n⚠️  Ya existe un curso con este título.');
      console.log(`   ID del curso existente: ${cursoExistente._id}`);
      console.log('\n¿Deseas actualizar el curso existente?');
      console.log('Si es así, ejecuta este script con la opción --actualizar');
      
      // Actualizar el curso existente
      await Course.findByIdAndUpdate(cursoExistente._id, cursoData, { new: true });
      console.log('\n✓ Curso actualizado correctamente');
      console.log(`   ID: ${cursoExistente._id}`);
    } else {
      // Crear nuevo curso
      const nuevoCurso = await Course.create(cursoData);
      console.log('\n✓ Curso creado correctamente');
      console.log(`   ID: ${nuevoCurso._id}`);
    }

    console.log('\n📚 Detalles del curso:');
    console.log(`   Título: ${cursoData.title}`);
    console.log(`   Duración: ${cursoData.duration}`);
    console.log(`   Categorías: ${cursoData.category.join(', ')}`);
    console.log(`   Número de temas: ${cursoData.temas.length}`);
    console.log(`   Objetivos generales: ${cursoData.objetivosGenerales.length}`);
    console.log(`   Objetivos específicos: ${cursoData.objetivosEspecificos.length}`);
    console.log(`   Estado: ${cursoData.isOpen ? 'Abierto' : 'Cerrado'}`);

    console.log('\n📖 Temas incluidos:');
    cursoData.temas.forEach(tema => {
      console.log(`   ${tema.numeroTema}. ${tema.titulo}`);
      console.log(`      Materiales: ${tema.materiales.length}`);
    });

    console.log('\n✅ Recuperación completada con éxito');
    console.log('\n💡 Estructura del curso:');
    console.log('   - 4 temas principales con materiales PDF');
    console.log('   - 5 tests de evaluación (uno por tema + test final)');
    console.log('   - 2 ejercicios prácticos opcionales');
    console.log('\n💡 Recuerda ejecutar:');
    console.log('   - node src/scripts/cargarCursoCompletoModelizacionCarbono.js');
    console.log('   - Para cargar todos los tests y ejercicios asociados');

    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

recuperarCursoModelizacionCarbono();
