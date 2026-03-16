import { config } from 'dotenv';
import { connect } from 'mongoose';
import Ejercicio from '../models/Ejercicio.js';

config();

const agregarEjercicioRothCCompleto = async () => {
  try {
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learningDB');
    console.log('✓ Conectado a MongoDB');

    // ID del curso de Modelización Dinámica de Carbono
    const cursoId = '69a6a0a4c8289d012745af63';

    const ejercicio = {
      cursoId,
      temaId: null, // null = ejercicio optativo general
      orden: 1,
      titulo: 'Simulación Avanzada de Dinámica de Carbono con RothC',
      tipo: 'simulacion',
      contexto: 'Como consultor ambiental especializado en cambio climático y gestión sostenible de suelos, debes realizar un análisis exhaustivo de la evolución del carbono orgánico en un sistema agrícola. Tu cliente necesita un informe técnico fundamentado en datos reales y simulaciones científicas para tomar decisiones sobre prácticas de manejo que maximicen el secuestro de carbono.',
      enunciado: 'Utilizando la herramienta RothC (Rothamsted Carbon Model) y los datos climatológicos proporcionados, simularás la dinámica del carbono en el suelo durante un periodo de 20 años. Deberás configurar los parámetros de entrada, ejecutar diferentes escenarios de manejo y elaborar un informe técnico profesional en formato PDF con tus análisis, resultados y recomendaciones. Puedes realizar simulaciones para diferentes ubicaciones geográficas o parcelas de tu terreno (si trabajas en el sector agrícola/ambiental), comparando los resultados entre distintas zonas. Toda esta experimentación y análisis comparativo debe incluirse en el PDF a entregar.',
      pasos: [
        {
          numero: 1,
          titulo: 'Preparación y Descarga de Datos',
          descripcion: 'Descarga y familiarízate con los archivos de datos necesarios para la simulación',
          detalles: [
            'Excel 1 - Entradas de Carbono (C_Inputs): Contiene los aportes mensuales de materia orgánica al suelo (residuos de cultivos, estiércol, compost). Este archivo define cuánto carbono entra al sistema cada mes.',
            'Excel 2 - Evapotranspiración (Evapo): Datos mensuales de evapotranspiración potencial que afectan la actividad microbiana y la descomposición de la materia orgánica.',
            'Excel 3 - Temperatura (Tempe): Temperaturas medias mensuales que regulan la velocidad de descomposición del carbono en el suelo.',
            'Excel 4 - Precipitación (Precipi): Precipitaciones mensuales que influyen en la humedad del suelo y la actividad biológica.',
            'Revisa la estructura de cada archivo y comprende los datos que contienen antes de comenzar'
          ]
        },
        {
          numero: 2,
          titulo: 'Acceso a la Herramienta RothC',
          descripcion: 'Accede a la plataforma de simulación',
          detalles: [
            'Ingresa a https://rothc.evenor-tech.com/rothc',
            'Familiarízate con la interfaz y las opciones de configuración',
            'Lee las instrucciones y ayuda disponibles en la plataforma',
            'OPCIONAL: Si trabajas con terrenos agrícolas reales, puedes probar la herramienta con diferentes ubicaciones/parcelas de tu terreno (utilizando coordenadas GPS específicas de cada zona) y comparar los resultados en tu informe'
          ]
        },
        {
          numero: 3,
          titulo: 'Configuración de Parámetros Iniciales',
          descripcion: 'Establece los parámetros base del suelo y ubicación',
          detalles: [
            'Ubicación: Selecciona una localización en clima mediterráneo (puedes usar las coordenadas de ejemplo o seleccionar en el mapa)',
            'Características del suelo: Configura un contenido de arcilla del 25-30%',
            'Stock inicial de carbono: Establece 40-45 toneladas de C/ha como punto de partida',
            'Profundidad de referencia: 25 cm (estándar para RothC)',
            'Tipo de cultivo: Cereales de invierno (trigo/cebada)'
          ]
        },
        {
          numero: 4,
          titulo: 'Carga de Datos Climatológicos',
          descripcion: 'Importa los datos de los archivos Excel a la plataforma',
          detalles: [
            'Carga el archivo de temperaturas mensuales',
            'Importa los datos de precipitación',
            'Añade los valores de evapotranspiración',
            'Verifica que todos los datos se hayan cargado correctamente y no haya errores en el formato'
          ]
        },
        {
          numero: 5,
          titulo: 'Escenario 1 - Manejo Convencional',
          descripcion: 'Configura y ejecuta la primera simulación',
          detalles: [
            'Aportes de carbono: Utiliza valores BAJOS del archivo C_Inputs (aproximadamente 0.3-0.5 t C/ha/año)',
            'Manejo del suelo: Sin cultivos de cobertura (suelo desnudo en periodo de barbecho)',
            'Residuos de cosecha: Solo 30% incorporado al suelo',
            'Ejecuta la simulación para 20 años',
            'Guarda o exporta los resultados (gráfica y datos numéricos)'
          ]
        },
        {
          numero: 6,
          titulo: 'Escenario 2 - Manejo Sostenible',
          descripcion: 'Configura y ejecuta el escenario alternativo',
          detalles: [
            'Aportes de carbono: Utiliza valores ALTOS del archivo C_Inputs (2.0-2.5 t C/ha/año)',
            'Manejo del suelo: Con cultivos de cobertura todo el año',
            'Residuos de cosecha: 90% incorporado al suelo',
            'Adición periódica de compost: 5 t/ha cada 2 años',
            'Ejecuta la simulación para 20 años',
            'Guarda o exporta los resultados para comparación'
          ]
        },
        {
          numero: 7,
          titulo: 'Análisis de Resultados',
          descripcion: 'Analiza las diferencias entre ambos escenarios',
          detalles: [
            'Compara la evolución del Carbono Orgánico Total (TOC) en ambos escenarios',
            'Identifica en qué fracciones de carbono (DPM, RPM, BIO, HUM) hay mayores diferencias',
            'Analiza la tendencia: ¿el suelo gana o pierde carbono en cada escenario?',
            'Calcula la diferencia neta de carbono secuestrado/perdido tras 20 años',
            'Identifica los periodos del año donde hay mayor actividad de descomposición'
          ]
        },
        {
          numero: 8,
          titulo: 'Elaboración del Informe Técnico (PDF)',
          descripcion: 'Redacta un informe profesional con tus hallazgos',
          detalles: [
            'Estructura recomendada: Portada, Introducción, Metodología, Resultados, Discusión, Conclusiones y Recomendaciones',
            'Incluye capturas de pantalla de las gráficas de RothC',
            'Presenta tablas comparativas con los datos numéricos clave',
            'Si realizaste simulaciones en diferentes ubicaciones, incluye una sección comparativa entre las distintas parcelas/zonas analizadas',
            'Fundamenta tus conclusiones con evidencia científica',
            'Máximo 8-10 páginas (formato profesional), o hasta 15 páginas si incluyes análisis de múltiples ubicaciones'
          ]
        }
      ],
      entregable: {
        descripcion: 'Informe técnico en formato PDF que incluya análisis completo, resultados de ambos escenarios (convencional vs sostenible), comparativas visuales (gráficas) y recomendaciones fundamentadas para mejorar la gestión del carbono en el suelo. Opcionalmente, puedes incluir simulaciones de diferentes ubicaciones o parcelas de tu terreno, comparando los resultados entre distintas zonas geográficas o tipos de suelo.',
        preguntas: [
          '¿Cuál es la diferencia final en toneladas de carbono por hectárea entre el escenario convencional y el sostenible después de 20 años?',
          '¿Qué fracción de carbono (DPM, RPM, BIO, HUM, IOM) muestra el mayor incremento en el manejo sostenible y por qué?',
          'Basándote en los resultados de la simulación, ¿en qué meses del año es más crítico implementar medidas de conservación? Justifica tu respuesta con los datos climatológicos.',
          'Propón al menos 3 recomendaciones técnicas concretas y viables que el agricultor pueda implementar para maximizar el secuestro de carbono en su finca.',
          '¿Qué limitaciones tiene el modelo RothC para este tipo de análisis? ¿Qué otros factores deberían considerarse en un estudio real?'
        ],
        limiteCaracteres: null // Sin límite porque es PDF
      },
      recursos: [
        {
          tipo: 'herramienta',
          titulo: 'RothC - Simulador de Carbono en Suelos',
          url: 'https://rothc.evenor-tech.com/rothc',
          descripcion: 'Plataforma interactiva de Evenor-Tech para modelización de la dinámica del carbono orgánico en suelos agrícolas basada en el modelo científico RothC (Rothamsted Carbon Model)'
        },
        {
          tipo: 'documento',
          titulo: 'Excel 1: Entradas de Carbono (C_Inputs)',
          url: 'https://res.cloudinary.com/dktr2wcto/raw/upload/v1773662211/Prueba_C_Inputs_idgeht.xlsx',
          descripcion: 'Archivo con datos mensuales de los aportes de carbono al suelo (residuos de cultivos, materia orgánica, enmiendas). Incluye diferentes escenarios de manejo: bajo (convencional) y alto (sostenible) aporte de materia orgánica.'
        },
        {
          tipo: 'documento',
          titulo: 'Excel 2: Evapotranspiración Potencial (Evapo)',
          url: 'https://res.cloudinary.com/dktr2wcto/raw/upload/v1773662232/Evapo_pf1cf5.xlsx',
          descripcion: 'Datos mensuales de evapotranspiración potencial (mm/mes) que afectan la humedad del suelo y, consecuentemente, la actividad microbiana responsable de la descomposición de la materia orgánica.'
        },
        {
          tipo: 'documento',
          titulo: 'Excel 3: Temperatura Media Mensual (Tempe)',
          url: 'https://res.cloudinary.com/dktr2wcto/raw/upload/v1773662243/Tempe_uimw7n.xlsx',
          descripcion: 'Temperaturas medias mensuales (°C) para la zona de estudio. La temperatura es un factor clave que regula la velocidad de descomposición del carbono y la actividad biológica del suelo.'
        },
        {
          tipo: 'documento',
          titulo: 'Excel 4: Precipitación Mensual (Precipi)',
          url: 'https://res.cloudinary.com/dktr2wcto/raw/upload/v1773662250/Precipi_ymjyp1.xlsx',
          descripcion: 'Precipitaciones mensuales (mm/mes) que determinan la humedad del suelo y condicionan tanto la descomposición de la materia orgánica como el crecimiento de los cultivos y la producción de residuos vegetales.'
        }
      ],
      duracionEstimada: '4-6 horas',
      dificultad: 'avanzado',
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
      console.log(`   ID: ${existente._id}`);
    } else {
      const nuevoEjercicio = await Ejercicio.create(ejercicio);
      console.log('✓ Ejercicio creado correctamente');
      console.log(`   ID: ${nuevoEjercicio._id}`);
    }

    console.log('\n📋 Ejercicio RothC Completo configurado:');
    console.log(`   Título: ${ejercicio.titulo}`);
    console.log(`   Tipo: ${ejercicio.tipo}`);
    console.log(`   Dificultad: ${ejercicio.dificultad}`);
    console.log(`   Duración estimada: ${ejercicio.duracionEstimada}`);
    console.log(`   Recursos incluidos: ${ejercicio.recursos.length}`);
    console.log(`   Pasos del ejercicio: ${ejercicio.pasos.length}`);
    console.log(`   Entregable: Informe PDF con análisis completo`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el ejercicio:', error);
    process.exit(1);
  }
};

agregarEjercicioRothCCompleto();
