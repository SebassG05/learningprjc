import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

// Compila los shaders de una escena nada más montarla (con sus grupos visibles un instante), para
// que el primer frame en el que aparece no provoque un tirón en mitad de la transición
export default function usePrecompile(...refs) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const groups = refs.map((r) => r.current).filter(Boolean);
    const was = groups.map((g) => g.visible);
    groups.forEach((g) => { g.visible = true; });
    gl.compile(scene, camera);
    groups.forEach((g, i) => { g.visible = was[i]; });
  }, [gl, scene, camera]); // eslint-disable-line react-hooks/exhaustive-deps -- refs estables
}
