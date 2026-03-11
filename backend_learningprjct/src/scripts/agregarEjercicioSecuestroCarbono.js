import { config } from 'dotenv';
import { connect } from 'mongoose';
import Ejercicio from '../models/Ejercicio.js';

config();

const agregarEjercicioSecuestroCarbono = async () => {
  try {
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learningDB');
    console.log('✓ Conectado a MongoDB');

    // ID del curso de Modelización Dinámica de Carbono
    const cursoId = '69a6a0a4c8289d012745af63';

    const ejercicio = {
      cursoId,
      temaId: null, // null = se muestra al final como ejercicio optativo general
      orden: 1,
      titulo: 'Simulación de Secuestro de Carbono en Suelos Agrícolas',
      tipo: 'simulacion',
      contexto: 'Eres un consultor ambiental encargado de evaluar la sostenibilidad de una finca agrícola. El propietario quiere saber si sus prácticas actuales están ayudando a mitigar el cambio climático mediante el secuestro de carbono o si, por el contrario, está perdiendo materia orgánica.',
      enunciado: 'Utilizando la herramienta interactiva RothC de Evenor-Tech, realiza una simulación para un escenario de cultivo de cereales en una zona de clima mediterráneo. Deberás configurar los parámetros de entrada y analizar los resultados obtenidos.',
      pasos: [
        {
          numero: 1,
          titulo: 'Configuración de Escenario',
          descripcion: 'Accede a la plataforma y selecciona una ubicación',
          detalles: [
            'Puedes usar las coordenadas por defecto',
            'O elegir un punto específico en el mapa'
          ]
        },
        {
          numero: 2,
          titulo: 'Parámetros de Suelo',
          descripcion: 'Configura las características del suelo',
          detalles: [
            'Ajusta el contenido de arcilla al 25%',
            'Define un stock inicial de carbono de 40 t/ha'
          ]
        },
        {
          numero: 3,
          titulo: 'Manejo Agrícola',
          descripcion: 'Compara dos situaciones durante un periodo de 20 años',
          detalles: [
            'Escenario A (Convencional): Bajo aporte de residuos vegetales (0.5 t C/ha/año) y suelo desnudo en invierno',
            'Escenario B (Sostenible): Alto aporte de residuos (2.5 t C/ha/año) y uso de cultivos de cobertura (suelo cubierto todo el año)'
          ]
        },
        {
          numero: 4,
          titulo: 'Análisis de Resultados',
          descripcion: 'Observa la evolución del carbono en el suelo',
          detalles: [
            'Analiza la gráfica de evolución del Carbono Orgánico Total (TOC)',
            'Estudia las diferentes fracciones: DPM, RPM, BIO, HUM, IOM'
          ]
        }
      ],
      entregable: {
        descripcion: 'Redacta un breve informe técnico que responda a las siguientes preguntas',
        preguntas: [
          '¿Cuál es la diferencia final en toneladas de carbono por hectárea entre ambos escenarios tras los 20 años?',
          '¿Qué fracción del carbono (ej. el material vegetal resistente - RPM) muestra un mayor incremento en el escenario sostenible?',
          'Basándote en los resultados, ¿qué recomendación técnica le darías al agricultor para mejorar la salud de su suelo?'
        ],
        limiteCaracteres: 2000
      },
      recursos: [
        {
          tipo: 'herramienta',
          titulo: 'RothC - Evenor-Tech',
          url: 'https://rothc.evenor-tech.com/rothc',
          descripcion: 'Herramienta interactiva para simulación de dinámica de carbono en suelos'
        }
      ],
      duracionEstimada: '2-3 horas',
      dificultad: 'intermedio',
      esOptativo: true,
      activo: true
    };

    // Verificar si ya existe un ejercicio con el mismo título
    const existente = await Ejercicio.findOne({ 
      cursoId, 
      titulo: ejercicio.titulo 
    });

    if (existente) {
      console.log('⚠️  Ya existe un ejercicio con este título. Actualizando...');
      await Ejercicio.findByIdAndUpdate(existente._id, ejercicio);
      console.log('✓ Ejercicio actualizado correctamente');
    } else {
      await Ejercicio.create(ejercicio);
      console.log('✓ Ejercicio creado correctamente');
    }

    console.log('\n📋 Ejercicio de Secuestro de Carbono configurado:');
    console.log(`   Título: ${ejercicio.titulo}`);
    console.log(`   Tipo: ${ejercicio.tipo}`);
    console.log(`   Pasos: ${ejercicio.pasos.length}`);
    console.log(`   Duración estimada: ${ejercicio.duracionEstimada}`);
    console.log(`   Dificultad: ${ejercicio.dificultad}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

agregarEjercicioSecuestroCarbono();
