/**
 * Qué hace el Detalle con lo que leyó (spec F-03: flujo B, A4 a A6; G-8; RF-28).
 *
 * Función pura: recibe la lectura de `animales/{animalId}` y decide si se
 * muestra, si se regresa a Descubrir (G-8) o qué estado de error dibujar.
 */
import { ESTADO_ANIMAL } from '../../compartido/modelo';
import type { AnimalConId, LecturaAnimal } from '../../firebase/animales';

export type DecisionDetalle =
  | { accion: 'mostrar'; animal: AnimalConId }
  | { accion: 'no-disponible' }
  | { accion: 'error' }
  | { accion: 'sin-permiso' };

/**
 * Recibe la lectura del animal. Devuelve:
 * - `mostrar` si existe y está "Disponible" (RF-28 válido);
 * - `no-disponible` si ya no está "Disponible" o no existe (G-8, N-7);
 * - `error` sin conexión (A5) o `sin-permiso` si las reglas lo rechazan (A6).
 */
export function decidirDetalle(lectura: LecturaAnimal): DecisionDetalle {
  switch (lectura.estado) {
    case 'ok':
      return lectura.animal.estado === ESTADO_ANIMAL.disponible
        ? { accion: 'mostrar', animal: lectura.animal }
        : { accion: 'no-disponible' };
    case 'no-existe':
      return { accion: 'no-disponible' };
    case 'sin-permiso':
      return { accion: 'sin-permiso' };
    default:
      return { accion: 'error' };
  }
}
