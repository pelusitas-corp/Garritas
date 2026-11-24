// PROVISIONAL (02-navegacion): Acceso de Albergue. F-01 pone el formulario e "Iniciar sesión" (RF-09).
import PantallaProvisional from '../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../src/compartido/navegacion/rutas';

export default function AccesoAlbergue() {
  return (
    <PantallaProvisional titulo="Ingresa a tu cuenta" ruta={RUTAS.accesoAlbergue} feature="F-01" />
  );
}
