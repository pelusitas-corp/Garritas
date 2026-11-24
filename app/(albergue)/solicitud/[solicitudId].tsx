// PROVISIONAL (02-navegacion): Detalle de Solicitud. F-08 pone "Pre-aprobar", "Rechazar" y el contacto (RF-05, RF-21, RF-12).
import { useLocalSearchParams } from 'expo-router';

import MENSAJES from '../../../src/compartido/mensajes';
import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';

export default function DetalleDeSolicitud() {
  const { solicitudId } = useLocalSearchParams<{ solicitudId: string }>();

  return (
    <PantallaProvisional
      titulo="Detalle de solicitud"
      ruta={`/solicitud/${solicitudId}`}
      feature="F-08"
      estados={{ error: MENSAJES.ERROR_CONEXION }}
    />
  );
}
