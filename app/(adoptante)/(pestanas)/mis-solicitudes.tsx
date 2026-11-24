// PROVISIONAL (02-navegacion): Mis Solicitudes. F-06 pone las tarjetas (RF-27). Sin navegación (N-4).
import MENSAJES from '../../../src/compartido/mensajes';
import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';

export default function MisSolicitudes() {
  return (
    <PantallaProvisional
      titulo="Mis solicitudes"
      ruta={RUTAS.misSolicitudes}
      feature="F-06"
      estados={{ vacia: MENSAJES.SIN_SOLICITUDES_ADOPTANTE, error: MENSAJES.ERROR_CONEXION }}
    />
  );
}
