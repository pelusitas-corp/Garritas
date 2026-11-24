// PROVISIONAL (02-navegacion): Solicitudes de un animal. F-07 las ordena por % (RF-04); F-08 pone "Pre-aprobar" y "Rechazar".
import { router, useLocalSearchParams } from 'expo-router';

import MENSAJES from '../../../src/compartido/mensajes';
import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';
import { rutaSolicitud } from '../../../src/compartido/navegacion/rutas';

/** Solicitud de ejemplo (Ana Torres, dato ficticio del prototipo). */
const SOLICITUD_DE_EJEMPLO = 'solicitud-de-ejemplo';

export default function SolicitudesDeUnAnimal() {
  const { animalId } = useLocalSearchParams<{ animalId: string }>();

  return (
    <PantallaProvisional
      titulo={`Un hogar para ${animalId}`}
      ruta={`/solicitudes-animal/${animalId}`}
      feature="F-07"
      estados={{ vacia: MENSAJES.SIN_SOLICITUDES_ANIMAL, error: MENSAJES.ERROR_CONEXION }}
      botones={[
        {
          texto: 'Ana Torres',
          alPresionar: () => router.push(rutaSolicitud(SOLICITUD_DE_EJEMPLO)),
        },
      ]}
    />
  );
}
