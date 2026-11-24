/**
 * Pantalla de inicio de cada rol (specs/02-navegacion.md §5; cierra P-04
 * de F-01).
 *
 * Función pura: no usa Firebase ni React, así que se prueba con Jest.
 */
import { RUTAS } from './rutas';
import type { RutaFija } from './rutas';

/** Roles del MVP (arquitectura §3: `usuarios/{uid}.rol`). */
export type Rol = 'adoptante' | 'albergue';

/**
 * Recibe el rol y si el cuestionario del adoptante está completo.
 * Devuelve la ruta de inicio:
 * - albergue → Solicitudes;
 * - adoptante con cuestionario completo → Descubrir;
 * - adoptante sin terminar el cuestionario → Cuestionario (RF-02, RF-16).
 */
export function inicioDelRol(rol: Rol, cuestionarioCompleto: boolean): RutaFija {
  if (rol === 'albergue') {
    return RUTAS.solicitudes;
  }
  return cuestionarioCompleto ? RUTAS.descubrir : RUTAS.cuestionario;
}
