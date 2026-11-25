/**
 * Acceso de Albergue (F-01 §3 flujo B, RF-09; ruta "/acceso-albergue").
 * Igual que "Ingresa a tu cuenta", sin subtítulo y sin "¿Aún no tienes
 * cuenta?" / "Crear cuenta": las cuentas de albergue las crea el equipo (P-05, D-18).
 */
import FormularioAcceso from '../../src/compartido/acceso/FormularioAcceso';

export default function AccesoAlbergue() {
  return <FormularioAcceso />;
}
