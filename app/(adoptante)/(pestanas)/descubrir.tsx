// PROVISIONAL (02-navegacion): Descubrir. F-03 pone las tarjetas reales (RF-10, RF-26, RF-28).
import { router } from 'expo-router';

import MENSAJES from '../../../src/compartido/mensajes';
import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS, rutaAnimal } from '../../../src/compartido/navegacion/rutas';

/** Animal de ejemplo del prototipo (D-35), solo para probar la navegación. */
const ANIMAL_DE_EJEMPLO = 'wini';

export default function Descubrir() {
  return (
    <PantallaProvisional
      titulo="Descubrir"
      ruta={RUTAS.descubrir}
      feature="F-03"
      estados={{
        vacia: MENSAJES.SIN_MASCOTAS_COMPATIBLES,
        error: MENSAJES.ERROR_CARGAR_MASCOTAS,
        siTarda: MENSAJES.CALCULANDO_COMPATIBILIDAD,
      }}
      botones={[
        // N-2: tocar la tarjeta, "ⓘ" o "Me encanta" abren el Detalle.
        { texto: 'Me encanta', alPresionar: () => router.push(rutaAnimal(ANIMAL_DE_EJEMPLO)) },
      ]}
    />
  );
}
