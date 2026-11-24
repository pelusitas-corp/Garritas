// PROVISIONAL (02-navegacion): Match. F-06 crea la solicitud y aplica G-9 y G-10 (RF-11, RF-17).
import { router, useLocalSearchParams } from 'expo-router';

import MENSAJES from '../../../src/compartido/mensajes';
import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';
import { rutaSolicitudEnviada } from '../../../src/compartido/navegacion/rutas';

/** Id de ejemplo: F-06 lo reemplaza por el id real de la solicitud creada. */
const SOLICITUD_DE_EJEMPLO = 'solicitud-de-ejemplo';

export default function Match() {
  const { animalId } = useLocalSearchParams<{ animalId: string }>();

  return (
    <PantallaProvisional
      titulo="¡Es un match!"
      ruta={`/match/${animalId}`}
      feature="F-06"
      estados={{ error: MENSAJES.ERROR_CONEXION, siTarda: MENSAJES.CALCULANDO_COMPATIBILIDAD }}
      botones={[
        {
          texto: 'Enviar solicitud',
          // replace: desde "¡Solicitud enviada!", atrás no regresa a Match (CA-08).
          alPresionar: () => router.replace(rutaSolicitudEnviada(SOLICITUD_DE_EJEMPLO)),
        },
      ]}
    />
  );
}
