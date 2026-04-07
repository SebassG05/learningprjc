import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const scripts = [
  { name: 'Test Tema 1', path: 'src/scripts/cargarTestTema1.js' },
  { name: 'Test Tema 2', path: 'src/scripts/cargarTestTema2.js' },
  { name: 'Test Tema 3', path: 'src/scripts/cargarTestTema3.js' },
  { name: 'Test Tema 4', path: 'src/scripts/cargarTestTema4.js' },
  { name: 'Test Final', path: 'src/scripts/cargarTestFinal.js' },
  { name: 'Ejercicio Secuestro Carbono', path: 'src/scripts/agregarEjercicioSecuestroCarbono.js' },
  { name: 'Ejercicio RothC Completo', path: 'src/scripts/agregarEjercicioRothCCompleto.js' }
];

const ejecutarScript = async (script) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📝 Ejecutando: ${script.name}`);
  console.log('='.repeat(70));
  
  try {
    const { stdout, stderr } = await execPromise(`node ${script.path}`);
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ ${script.name} completado`);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${script.name}:`, error.message);
    return false;
  }
};

const cargarTodoElCurso = async () => {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   🎓 CARGA COMPLETA DEL CURSO DE MODELIZACIÓN DE CARBONO 🎓         ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log('\nEste script cargará:');
  console.log('  • 5 Tests de evaluación (1 por cada tema + Test Final de Certificación)');
  console.log('  • 2 Ejercicios prácticos opcionales');
  console.log('  • Curso con 4 temas principales\n');
  
  const resultados = [];
  
  for (const script of scripts) {
    const exito = await ejecutarScript(script);
    resultados.push({ nombre: script.name, exito });
    
    // Pequeña pausa entre scripts
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                      📊 RESUMEN DE EJECUCIÓN                         ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
  
  const exitosos = resultados.filter(r => r.exito).length;
  const fallidos = resultados.filter(r => !r.exito).length;
  
  resultados.forEach(r => {
    const icono = r.exito ? '✅' : '❌';
    console.log(`${icono} ${r.nombre}`);
  });
  
  console.log('\n' + '─'.repeat(70));
  console.log(`Total: ${exitosos}/${resultados.length} exitosos`);
  
  if (fallidos > 0) {
    console.log(`\n⚠️  ${fallidos} script(s) fallaron. Revisa los errores arriba.`);
  } else {
    console.log('\n🎉 ¡Todos los scripts se ejecutaron correctamente!');
    console.log('\n✅ El curso de Modelización de Carbono está completamente recuperado:');
    console.log('   • Información del curso configurada');
    console.log('   • 4 temas principales con materiales PDF');
    console.log('   • 5 tests de evaluación (1 por tema + test final)');
    console.log('   • 2 ejercicios prácticos opcionales');
    console.log('\n🚀 El curso está listo para usar en la plataforma.');
  }
  
  console.log('\n' + '═'.repeat(70) + '\n');
  
  process.exit(fallidos > 0 ? 1 : 0);
};

cargarTodoElCurso();
