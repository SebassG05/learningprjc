import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const pasos = [
  {
    nombre: '🧹 PASO 1: Limpieza completa',
    descripcion: 'Eliminar todos los cursos, tests y ejercicios duplicados',
    comando: 'node src/scripts/limpiezaCompletaCurso.js'
  },
  {
    nombre: '📚 PASO 2: Crear curso desde cero',
    descripcion: 'Crear el curso con 4 temas y la imagen correcta',
    comando: 'node src/scripts/recuperarCursoModelizacionCarbono.js'
  },
  {
    nombre: '📝 PASO 3: Cargar tests y ejercicios',
    descripcion: 'Cargar los 5 tests y 2 ejercicios prácticos',
    comando: 'node src/scripts/cargarCursoCompletoModelizacionCarbono.js'
  },
  {
    nombre: '✅ PASO 4: Verificación final',
    descripcion: 'Verificar que todo esté correctamente configurado',
    comando: 'node src/scripts/verificarCursoModelizacionCarbono.js'
  }
];

const ejecutarPaso = async (paso, numero) => {
  console.log('\n' + '═'.repeat(70));
  console.log(`${paso.nombre}`);
  console.log('═'.repeat(70));
  console.log(`📋 ${paso.descripcion}\n`);
  
  try {
    const { stdout, stderr } = await execPromise(paso.comando);
    console.log(stdout);
    if (stderr && !stderr.includes('dotenv')) console.error(stderr);
    return true;
  } catch (error) {
    console.error(`❌ Error en el paso ${numero}:`, error.message);
    return false;
  }
};

const recuperacionCompleta = async () => {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║  🎓 RECUPERACIÓN COMPLETA DEL CURSO DE MODELIZACIÓN DE CARBONO 🎓   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  console.log('Este proceso realizará:');
  console.log('  1️⃣  Limpieza completa de cursos duplicados');
  console.log('  2️⃣  Creación del curso con 4 temas y materiales');
  console.log('  3️⃣  Carga de 5 tests de evaluación');
  console.log('  4️⃣  Carga de 2 ejercicios prácticos opcionales');
  console.log('  5️⃣  Verificación final de estructura\n');

  console.log('⏱️  Tiempo estimado: 30-60 segundos\n');

  // Pequeña pausa
  await new Promise(resolve => setTimeout(resolve, 2000));

  let todoExitoso = true;

  for (let i = 0; i < pasos.length; i++) {
    const exito = await ejecutarPaso(pasos[i], i + 1);
    if (!exito) {
      todoExitoso = false;
      console.log(`\n⚠️  El proceso se detuvo en el paso ${i + 1}`);
      break;
    }
    // Pequeña pausa entre pasos
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '═'.repeat(70));
  if (todoExitoso) {
    console.log('🎉 ¡RECUPERACIÓN COMPLETADA CON ÉXITO!');
    console.log('═'.repeat(70));
    console.log('\n✅ El curso está completamente configurado y listo para usar');
    console.log('\n📊 Resumen:');
    console.log('   • 4 temas con materiales PDF');
    console.log('   • 5 tests de evaluación');
    console.log('   • 2 ejercicios prácticos');
    console.log('   • Imagen configurada');
    console.log('   • 40 horas de duración');
    console.log('\n🚀 Puedes acceder al curso en la plataforma');
  } else {
    console.log('❌ RECUPERACIÓN INCOMPLETA');
    console.log('═'.repeat(70));
    console.log('\n⚠️  Algunos pasos fallaron. Revisa los errores arriba.');
  }
  console.log('');

  process.exit(todoExitoso ? 0 : 1);
};

recuperacionCompleta();
