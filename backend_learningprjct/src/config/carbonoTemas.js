// Temario de «Modelización de la dinámica del carbono del suelo» (edición octubre 2026), sacado de los
// PDFs de cada tema. Lo aplica scripts/actualizarTemasCarbono.js; el orden de los apartados y sus
// títulos siguen el índice de cada PDF.
export const CARBONO_COURSE_ID = '69d50406663e8648d7ee1f08';

const CLOUD = 'https://res.cloudinary.com/dgbmy60sc';

export const CARBONO_TEMAS = Object.freeze([
  {
    numeroTema: 1,
    titulo: 'Carbono del suelo',
    descripcion:
      'Qué medimos al hablar de carbono orgánico del suelo, cómo se pasa de una concentración a un stock y qué hace creíble una simulación: escalas, evaluación, incertidumbre y enfoque multimodelo, con un caso mediterráneo.',
    pdf: `${CLOUD}/image/upload/v1793020848/Tema_1_Carbono_del_Suelo_Ampliado_1_1_axmsja.pdf`,
    video: { publicId: 'tema01_mvwphs', version: 1793022076 },
    conceptosClave: ['Concentración y stock', 'Stocks y flujos', 'Compartimentos', 'Incertidumbre', 'Enfoque multimodelo'],
    apartados: [
      {
        titulo: 'Conceptos y unidades',
        items: [
          'Por qué estudiar el carbono orgánico del suelo',
          'Materia orgánica, carbono orgánico y carbono total',
          'De la concentración al stock: contar carbono correctamente',
          'Stocks, flujos, tasas y cambios acumulados',
          'El suelo como sistema: definir qué se cuenta',
        ],
      },
      {
        titulo: 'Modelos y evidencia',
        items: [
          'Qué aporta un modelo y qué pregunta debe responder',
          'Distintas herramientas para distintas necesidades',
          'Interpretar los compartimentos sin confundirlos con medidas',
          'Qué información sostiene una simulación creíble',
          'La escala condiciona lo que puede concluirse',
          'Calibrar, evaluar y comprobar: tres tareas distintas',
        ],
      },
      {
        titulo: 'Incertidumbre y comparación de modelos',
        items: [
          'La incertidumbre forma parte del resultado',
          'Por qué comparar modelos y cómo leer su acuerdo',
        ],
      },
      {
        titulo: 'Del secuestro al clima',
        items: [
          'De un aumento del SOC a una afirmación climática',
          'Por qué el carbono no aumenta indefinidamente',
          'Aplicación introductoria a sistemas mediterráneos',
        ],
      },
      {
        titulo: 'Caso práctico y comunicación',
        items: [
          'Caso didáctico: leer una comparación sin sobreinterpretarla',
          'Cómo reconocer y redactar una conclusión de calidad',
          'Dónde encaja la modelización en un sistema MRV',
        ],
      },
      {
        titulo: 'Repaso y consulta',
        items: ['Preguntas y ejercicios de repaso', 'Respuestas y criterios de interpretación', 'Glosario de consulta', 'Bibliografía y lecturas recomendadas'],
      },
    ],
  },
  {
    numeroTema: 2,
    titulo: 'Dinámica, formas y equilibrio del carbono',
    descripcion:
      'Cómo entra, se transforma y se pierde el carbono en el suelo: fracciones POM, MAOM y DOC, papel de los microorganismos y controles ambientales, y la base matemática de los compartimentos, el estado estacionario y la edad del carbono.',
    pdf: `${CLOUD}/image/upload/v1793020848/Tema_2_Dinamica_Formas_y_Equilibrio_del_Carbono_1_kvrlgm.pdf`,
    video: { publicId: 'tema02_ckaimu', version: 1793022078 },
    conceptosClave: ['POM y MAOM', 'Cinética de primer orden', 'Estado estacionario', 'Efecto priming', 'Edad y tiempo de tránsito'],
    apartados: [
      {
        titulo: 'Formas del carbono',
        items: [
          'Un sistema abierto con transformaciones internas',
          'Carbono orgánico, inorgánico y gases del suelo',
          'La diversidad molecular y sus límites explicativos',
          'POM y POC: fragmentos, localización y respuesta',
          'MAOM y MAOC: asociaciones y heterogeneidad',
          'DOC: transporte, transformación y asociaciones',
          'Un stock vivo que también controla procesos',
          'Necromasa: reciclaje y formación de materia orgánica',
          'Carbono pirogénico y el uso prudente de «inerte»',
        ],
      },
      {
        titulo: 'De la medida al modelo',
        items: ['El método define la fracción observada', 'De las fracciones a los pools: una relación contrastable'],
      },
      {
        titulo: 'Procesos y controles',
        items: [
          'De la producción vegetal al aporte efectivo al suelo',
          'De los polímeros al CO₂: etapas distintas',
          'Eficiencia de uso del carbono y limitación nutricional',
          'Agregados, poros y accesibilidad',
          'Retención, intercambio y desestabilización mineral',
          'Efecto priming: distinguir fuentes y mecanismos',
          'Temperatura: sensibilidad intrínseca y respuesta aparente',
          'Humedad, oxígeno y ciclos de secado-rehumectación',
        ],
      },
      {
        titulo: 'Equilibrio y compartimentos',
        items: [
          'Qué significa equilibrio de carbono en un suelo abierto',
          'Un pool de primer orden: equilibrio y solución analítica',
          'Entrada, velocidad y horizonte: ejemplo resuelto',
          'Varios pools: transferencias y conservación',
          'Dos compartimentos: solución estacionaria y balance',
          'El modo lento y la falsa convergencia del total',
          'El régimen periódico no es un stock constante',
        ],
      },
      {
        titulo: 'Más allá del primer orden',
        items: [
          'Cuando la biomasa modifica la utilización del sustrato',
          'Equilibrio, capacidad efectiva y saturación mineral',
          'Edad, tránsito y respuesta: relojes diferentes',
          'El perfil conecta reservas y condiciones distintas',
        ],
      },
      {
        titulo: 'Caso integrado y lectura crítica',
        items: [
          'De las fracciones al balance: un caso completo',
          'Cómo contrastar una explicación mecanística',
          'Afirmaciones frecuentes que necesitan matices',
        ],
      },
      {
        titulo: 'Ejercicios, soluciones y glosario',
        items: [
          'Equilibrio y pools: problemas de cálculo',
          'Mecanismos, medición y lectura crítica',
          'Solucionario cuantitativo',
          'Solucionario razonado de mecanismos',
          'Formas, procesos y métodos: glosario',
          'Equilibrio y compartimentos: glosario',
          'Bibliografía científica y lecturas recomendadas',
        ],
      },
    ],
  },
  {
    numeroTema: 3,
    titulo: 'Modelos de carbono del suelo',
    descripcion:
      'RothC, ICBM, Century, Yasso07, AMG y SG: qué representa cada estructura, qué datos necesita y cómo se inicializa, y cómo interpretar una síntesis multimodelo como la del ensemble HoliSoils.',
    pdf: `${CLOUD}/image/upload/v1793020848/Tema_3_Modelos_de_Carbono_del_Suelo_zorhae.pdf`,
    video: { publicId: 'Tema03_Modelos_carbono_suelo_aoavy1', version: 1793020851 },
    conceptosClave: ['Arquitecturas de pools', 'Modificadores ambientales', 'Spin-up y reescalado', 'Síntesis multimodelo', 'Ensemble HoliSoils'],
    apartados: [
      {
        titulo: 'Punto de partida',
        items: ['Guía de estudio', 'Una base compartimental común'],
      },
      {
        titulo: 'Seis modelos',
        items: [
          'RothC: residuos, reciclaje y textura',
          'ICBM: dos pools y una lectura transparente',
          'Century: calidad, localización y nutrientes',
          'Yasso07: química operacional y clima',
          'AMG: entradas agrícolas y carbono activo',
          'SG: modelos empíricos de flujos gaseosos',
        ],
      },
      {
        titulo: 'Comparar y combinar',
        items: ['Comparar sin equiparar los pools', 'Qué aporta una síntesis multimodelo'],
      },
      {
        titulo: 'Del dato al ensemble',
        items: [
          'Spin-up y reescalado: decisiones con efecto',
          'De los datos a una comparación interpretable',
          'Organización de HoliSoils y SoilR',
        ],
      },
      {
        titulo: 'Interpretación y repaso',
        items: ['Un ejemplo de lectura del ensemble', 'Preguntas para comprobar la comprensión', 'Bibliografía científica y técnica'],
      },
    ],
  },
  {
    numeroTema: 4,
    titulo: 'Práctica en R: SoilR y ensemble HoliSoils',
    descripcion:
      'De los once scripts R del curso a un resultado interpretable: forzamientos climáticos, parámetros del sitio, spin-up y reescalado, ejecución de los modelos y extracción de stocks y flujos sin perder sus unidades.',
    pdf: `${CLOUD}/image/upload/v1793020848/Tema_4_Practica_R_SoilR_y_Ensemble_HoliSoils_qozgct.pdf`,
    video: { publicId: 'Tema04_Practica_R_SoilR_HoliSoils_avxzfy', version: 1793020852 },
    conceptosClave: ['Forzamientos mensuales', 'SoilR', 'Spin-up y convergencia', 'Tasas y acumulados', 'Exportación reproducible'],
    apartados: [
      {
        titulo: 'Preparar los datos',
        items: [
          'Guía de la práctica',
          'Preparar el entorno y localizar los archivos',
          'Leer el clima y comprobar el calendario',
          'La conversión de precipitación requiere metadatos',
          'Configurar suelo, residuos y entradas de carbono',
        ],
      },
      {
        titulo: 'Simular',
        items: [
          'Distinguir duración, salida e integración',
          'Spin-up, convergencia y reescalado',
          'RothC, ICBM y Century en estos scripts',
          'AMG: reserva estable y forzamiento anual',
          'Yasso07: partición AWEN y salidas repetidas',
          'SG: qué entra y qué representa cada salida',
        ],
      },
      {
        titulo: 'Resultados',
        items: [
          'Extraer resultados sin perder su identidad',
          'Armonizar tasas antes de sumar en el tiempo',
          'Qué CSV genera realmente el lanzador',
          'Leer las curvas con una explicación verificable',
        ],
      },
      {
        titulo: 'Comparar y revisar',
        items: [
          'Una práctica breve de comparación controlada',
          'Revisar antes de interpretar',
          'Anexo: inventario de los once scripts',
          'Bibliografía científica y técnica',
        ],
      },
    ],
  },
]);
