/**
 * Acceso de Adoptante, "Ingresa a tu cuenta" (F-01 §3 flujo B, RF-09;
 * ruta "/acceso-adoptante"). Con subtítulo y con "Crear cuenta".
 */
import FormularioAcceso from '../../src/compartido/acceso/FormularioAcceso';

export default function AccesoAdoptante() {
  return (
    <FormularioAcceso
      subtitulo="Inicia sesión para encontrar a tu compañero ideal."
      conCrearCuenta
    />
  );
}
