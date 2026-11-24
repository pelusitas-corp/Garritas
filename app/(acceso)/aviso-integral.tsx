// PROVISIONAL (02-navegacion): Aviso integral dentro de la app (F-01, P-01). Atrás regresa al aviso.
import PantallaProvisional from '../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../src/compartido/navegacion/rutas';

export default function AvisoIntegral() {
  return (
    <PantallaProvisional titulo="Aviso de privacidad" ruta={RUTAS.avisoIntegral} feature="F-01" />
  );
}
