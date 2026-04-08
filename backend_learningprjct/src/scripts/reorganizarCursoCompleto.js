import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import Course from '../models/Course.js';
import Test from '../models/Test.js';
import Ejercicio from '../models/Ejercicio.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURSO_ID = '69d50406663e8648d7ee1f08';
const DATA_DIR = path.join(__dirname, '../data');

const reorganizarCursoCompleto = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    // ─────────────────────────────────────────
    // 1. ACTUALIZAR ESTRUCTURA DE TEMAS
    // ─────────────────────────────────────────
    console.log('1️⃣  Restructurando temas del curso...');

    const nuevosTemas = [
      {
        numeroTema: 1,
        titulo: 'Introducción: Modelización de la dinámica del carbono orgánico del suelo',
        descripcion: 'Módulo introductorio que presenta los conceptos fundamentales del carbono orgánico del suelo (SOC), su papel en el ciclo biogeoquímico global y el contexto del cambio climático. Se exploran los enfoques de modelización compartimental y el enfoque multi-model ensemble como metodología robusta para proyectar la dinámica del carbono.',
        materiales: [
          {
            tipo: 'pdf',
            titulo: 'Introducción: Modelización de la Dinámica del Carbono Orgánico del Suelo mediante Modelos Compartimentales y Multi-Model Ensemble',
            descripcion: 'Material introductorio que establece las bases conceptuales del curso, explica la relevancia de la modelización del carbono en el contexto actual de cambio climático y presenta los principales enfoques metodológicos que se desarrollarán a lo largo del curso.',
            archivo: 'https://res.cloudinary.com/dgbmy60sc/raw/upload/v1773049865/learning-platform/materiales/IntroducciA_n__ModelizaciA_n_de_la_dinA_mica_del_carbono_orgA_nico_del_suelo_mediante_modelos_compartimentales_y_multi-model_ensemble__2_-1773049864756-378782325',
            orden: 1
          }
        ],
        actividadesOptativas: [],
        completado: false
      },
      {
        numeroTema: 2,
        titulo: 'Dinámica del carbono del suelo: procesos y mecanismos fundamentales',
        descripcion: 'Estudio en profundidad de los procesos biogeoquímicos que controlan la dinámica del carbono en el suelo: descomposición de materia orgánica, estabilización física y química, mineralización, humificación y los factores ambientales (temperatura, humedad, textura) que regulan las entradas y salidas de carbono al sistema.',
        materiales: [
          {
            tipo: 'pdf',
            titulo: 'Dinámica del Carbono del Suelo: Procesos y Mecanismos Fundamentales',
            descripcion: 'Material técnico que profundiza en los mecanismos físicos, químicos y biológicos que gobiernan el ciclo del carbono en el suelo. Incluye teorías de descomposición, formación de materia orgánica estable, y la influencia de factores como temperatura, humedad, textura del suelo y tipo de vegetación.',
            archivo: 'https://res.cloudinary.com/dgbmy60sc/raw/upload/v1773054595/learning-platform/materiales/DinA_mica_del_carbono_del_suelo__procesos_y_mecanismos_fundamentales-1773054595093-981863636',
            orden: 1
          }
        ],
        actividadesOptativas: [],
        completado: false
      },
      {
        numeroTema: 3,
        titulo: 'Modelos basados en procesos incluidos en el ensemble',
        descripcion: 'Presentación detallada de los principales modelos compartimentales de carbono del suelo incluidos en el ensemble: RothC, ICBM, Century, Yasso07, AMG y SG. Se analiza su estructura matemática, supuestos subyacentes, parametrización y cómo el enfoque multi-model ensemble integra sus predicciones para obtener estimaciones más robustas.',
        materiales: [
          {
            tipo: 'pdf',
            titulo: 'Modelos Basados en Procesos Incluidos en el Ensemble',
            descripcion: 'Documentación técnica de los modelos compartimentales más utilizados a nivel internacional. Cada modelo se describe en términos de su estructura de compartimentos, ecuaciones diferenciales, parámetros clave, requisitos de entrada y aplicaciones típicas en investigación y consultoría.',
            archivo: 'https://res.cloudinary.com/dgbmy60sc/raw/upload/v1773056219/learning-platform/materiales/Modelos_basados_en_procesos_incluidos_en_el_ensemble-1773056219042-352247372',
            orden: 1
          }
        ],
        actividadesOptativas: [],
        completado: false
      },
      {
        numeroTema: 4,
        titulo: 'Ejecución y práctica con el modelo',
        descripcion: 'Componente práctico donde se aprende a configurar y ejecutar el ensemble de modelos en R con el paquete SoilR, parametrizar con datos reales (forzamientos climáticos y edáficos), interpretar salidas gráficas y numéricas de stocks de SOC y flujos de CO₂, y reproducir el flujo completo de modelización científica, incluyendo la fase de spin-up y la simulación prospectiva.',
        materiales: [
          {
            tipo: 'pdf',
            titulo: 'Ejecución y Práctica con el Modelo',
            descripcion: 'Guía práctica paso a paso para configurar y ejecutar simulaciones del ensemble de modelos de carbono en R. Incluye instrucciones de instalación de paquetes, configuración de rutas, carga de forzamientos climáticos, ejecución del spin-up, simulación prospectiva e interpretación de resultados gráficos y numéricos.',
            archivo: 'https://res.cloudinary.com/dgbmy60sc/raw/upload/v1773057387/learning-platform/materiales/EjecuciA_n_y_prA_ctica_con_el_modelo-1773057386437-208442993',
            orden: 1
          }
        ],
        actividadesOptativas: [],
        completado: false
      }
    ];

    const cursoActualizado = await Course.findByIdAndUpdate(
      CURSO_ID,
      { $set: { temas: nuevosTemas } },
      { new: true }
    );

    if (!cursoActualizado) {
      throw new Error(`Curso no encontrado con ID: ${CURSO_ID}`);
    }

    // Capturar los IDs reales asignados a cada tema
    const temaIdPorNumero = {};
    cursoActualizado.temas.forEach(t => {
      temaIdPorNumero[t.numeroTema] = t._id.toString();
    });

    console.log('   ✓ 4 temas estructurados correctamente:');
    cursoActualizado.temas.forEach(t => {
      console.log(`     Tema ${t.numeroTema}: ${t.titulo}`);
      console.log(`     ID:     ${t._id}`);
    });

    // ─────────────────────────────────────────
    // 2. ELIMINAR TESTS EXISTENTES DEL CURSO
    // ─────────────────────────────────────────
    console.log('\n2️⃣  Eliminando tests anteriores del curso...');
    const eliminados = await Test.deleteMany({ cursoId: CURSO_ID });
    console.log(`   ✓ ${eliminados.deletedCount} tests eliminados`);

    // ─────────────────────────────────────────
    // 3. CREAR LOS 4 TESTS POR TEMA
    // ─────────────────────────────────────────
    console.log('\n3️⃣  Creando tests de evaluación por tema...');

    const testsConfig = [
      { archivo: 'test-tema1-introduccion.json',      temaNum: 1 },
      { archivo: 'test-tema2-entradas-salidas.json',  temaNum: 2 },
      { archivo: 'test-tema3-modelos-ensemble.json',  temaNum: 3 },
      { archivo: 'test-tema4-ejecucion-practica.json', temaNum: 4 }
    ];

    for (const { archivo, temaNum } of testsConfig) {
      const data = JSON.parse(readFileSync(path.join(DATA_DIR, archivo), 'utf-8'));
      await Test.create({
        cursoId: CURSO_ID,
        temaId:  temaIdPorNumero[temaNum],
        titulo:          data.titulo,
        descripcion:     data.descripcion,
        duracionMinutos: data.duracionMinutos,
        notaMinima:      data.notaMinima,
        preguntas:       data.preguntas
      });
      console.log(`   ✓ Test Tema ${temaNum}: "${data.titulo}" — ${data.preguntas.length} preguntas, ${data.duracionMinutos} min`);
    }

    // Test Final (temaId especial como string — reconocido por el controller para bloquear acceso)
    const finalData = JSON.parse(readFileSync(path.join(DATA_DIR, 'test-final-certificacion.json'), 'utf-8'));
    await Test.create({
      cursoId:         CURSO_ID,
      temaId:          'test-final-certificacion',
      titulo:          finalData.titulo,
      descripcion:     finalData.descripcion,
      duracionMinutos: finalData.duracionMinutos,
      notaMinima:      finalData.notaMinima,
      preguntas:       finalData.preguntas
    });
    console.log(`   ✓ Test Final: "${finalData.titulo}" — ${finalData.preguntas.length} preguntas, ${finalData.duracionMinutos} min`);
    console.log('   🔒 Bloqueado hasta aprobar los tests de los Temas 1–4');

    // ─────────────────────────────────────────
    // 4. EJERCICIO OPTATIVO
    // ─────────────────────────────────────────
    console.log('\n4️⃣  Verificando ejercicio optativo...');

    const ejercicioExistente = await Ejercicio.findOne({
      titulo: 'Simulación Avanzada de Dinámica de Carbono con RothC'
    });

    if (ejercicioExistente) {
      await Ejercicio.findByIdAndUpdate(ejercicioExistente._id, {
        $set: { cursoId: new mongoose.Types.ObjectId(CURSO_ID), temaId: null }
      });
      console.log('   ✓ Ejercicio optativo vinculado al curso correcto (temaId: null → aparece al final)');
    } else {
      console.log('   ⚠️  Ejercicio optativo no encontrado en la BD.');
      console.log('      Ejecuta: node src/scripts/agregarEjercicioRothCCompleto.js');
    }

    // ─────────────────────────────────────────
    // RESUMEN FINAL
    // ─────────────────────────────────────────
    console.log('\n✅ Reorganización completada con éxito');
    console.log('─'.repeat(55));
    console.log('📚 Estructura final del curso:');
    console.log('   Tema 1 ─ Introducción: Modelización de la dinámica del carbono orgánico del suelo');
    console.log('   Tema 2 ─ Dinámica del carbono del suelo: procesos y mecanismos fundamentales');
    console.log('   Tema 3 ─ Modelos basados en procesos incluidos en el ensemble');
    console.log('   Tema 4 ─ Ejecución y práctica con el modelo');
    console.log('   🔒 Test Final de Certificación (bloqueado hasta aprobar Temas 1–4)');
    console.log('   📝 Ejercicio Optativo: Simulación Avanzada de Dinámica de Carbono con RothC');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);
  }
};

reorganizarCursoCompleto();
