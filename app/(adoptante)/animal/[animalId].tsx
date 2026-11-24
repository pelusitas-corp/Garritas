// PROVISIONAL (02-navegacion): Detalle del animal. F-03 pone el detalle y G-8 (RF-28).
import { router, useLocalSearchParams } from 'expo-router';

import MENSAJES from '../../../src/compartido/mensajes';
import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';
import { rutaMatch } from '../../../src/compartido/navegacion/rutas';

export default function DetalleAnimal() {
  const { animalId } = useLocalSearchParams<{ animalId: string }>();

  return (
    <PantallaProvisional
      titulo="Detalle"
      ruta={`/animal/${animalId}`}
      feature="F-03"
      estados={{ error: MENSAJES.ERROR_CONEXION }}
      botones={[
        { texto: '¡Quiero adoptarlo!', alPresionar: () => router.push(rutaMatch(animalId)) },
      ]}
    />
  );
}
