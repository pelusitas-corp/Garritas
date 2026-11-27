/**
 * Foto de la tarjeta de Descubrir (spec F-13 §4.3, AF-4; F-03 v1.4; decisión
 * del equipo, no está en el SRS).
 *
 * La tarjeta muestra primero la `miniatura` y, en cuanto llega, la foto
 * completa `foto-0` del animal, como ya hace el Detalle (F-03 RN-07). Solo se
 * lee la foto del animal visible y la del siguiente, y nunca dos veces la
 * misma.
 *
 * Funciones puras: no leen Firestore ni dibujan nada. `useFotosCompletas`
 * les pasa lo que ya tiene y lee lo que le devuelven.
 */
import type { EstadoMazo, TarjetaMazo } from './mazo';

/** Fotos completas que ya llegaron, por `animalId` (texto base64 con el prefijo de M-2). */
export type FotosCompletas = Readonly<Record<string, string>>;

/**
 * Recibe la tarjeta y las fotos completas que ya llegaron. Devuelve la foto
 * completa del animal si ya está; si no (todavía no llega o la lectura
 * falló), su miniatura.
 */
export function fotoDeTarjeta(
  tarjeta: Pick<TarjetaMazo, 'animalId' | 'miniatura'>,
  fotos: FotosCompletas,
): string {
  return fotos[tarjeta.animalId] ?? tarjeta.miniatura;
}

/**
 * Recibe el mazo y los `animalId` cuya foto ya se tiene o ya se está leyendo.
 * Devuelve a quiénes hay que leerles `foto-0`: el animal visible y, como
 * mucho, el siguiente, sin los que ya se tienen o se están leyendo.
 */
export function animalesPorLeer(mazo: EstadoMazo, yaPedidos: ReadonlySet<string>): string[] {
  return mazo.tarjetas
    .slice(mazo.indice, mazo.indice + 2)
    .map((tarjeta) => tarjeta.animalId)
    .filter((animalId) => !yaPedidos.has(animalId));
}
