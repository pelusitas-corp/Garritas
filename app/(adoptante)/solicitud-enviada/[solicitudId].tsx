// PROVISIONAL (02-navegacion): ¡Solicitud enviada! (N-6). F-06 pone el contenido (RF-11).
import { router, useLocalSearchParams } from 'expo-router';

import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';

export default function SolicitudEnviada() {
  const { solicitudId } = useLocalSearchParams<{ solicitudId: string }>();

  return (
    <PantallaProvisional
      titulo="¡Solicitud enviada!"
      ruta={`/solicitud-enviada/${solicitudId}`}
      feature="F-06"
      botones={[
        // "Ver mis solicitudes": texto de Figma por confirmar (PO-21). dismissTo cierra Detalle y Match.
        { texto: 'Ver mis solicitudes', alPresionar: () => router.dismissTo(RUTAS.misSolicitudes) },
      ]}
    />
  );
}
