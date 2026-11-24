// PROVISIONAL (02-navegacion): Solicitudes · lista de mis animales (N-5). F-07 pone la lista real.
import { router } from 'expo-router';

import MENSAJES from '../../../src/compartido/mensajes';
import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS, rutaSolicitudesAnimal } from '../../../src/compartido/navegacion/rutas';
import { useSesion } from '../../../src/compartido/navegacion/useSesion';

/** Animal de ejemplo del prototipo (D-35), solo para probar la navegación. */
const ANIMAL_DE_EJEMPLO = 'wini';

export default function Solicitudes() {
  const { cerrarSesion } = useSesion();

  return (
    <PantallaProvisional
      titulo="Solicitudes"
      ruta={RUTAS.solicitudes}
      feature="F-07"
      // Vacía: [PENDIENTE P-01, texto cuando aún no hay animales; lo fija F-07].
      estados={{ error: MENSAJES.ERROR_CONEXION }}
      botones={[
        { texto: 'Wini', alPresionar: () => router.push(rutaSolicitudesAnimal(ANIMAL_DE_EJEMPLO)) },
        // N-3: en F-07 va dentro del ícono de usuario del encabezado.
        { texto: 'Cerrar sesión', alPresionar: () => cerrarSesion(), variante: 'secundario' },
      ]}
    />
  );
}
