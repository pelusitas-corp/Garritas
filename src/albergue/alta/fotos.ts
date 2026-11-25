/**
 * Fotos del alta del animal: la parte PURA (F-02 RN-05, AL-3, AL-6; D-36).
 *
 * Aquí no hay cámara ni Firebase: solo medidas, orden y decisiones, para
 * probarlas con Jest (tests/alta/fotos.test.ts). La parte que usa la cámara,
 * la galería y el manipulador de imágenes está en `procesarFoto.ts`.
 */
import { MAX_FOTOS_ANIMAL } from '../../compartido/modelo';

/** Prefijo de las imágenes guardadas en Firestore (03-modelo-datos M-2). */
export const PREFIJO_JPEG = 'data:image/jpeg;base64,';

/** 1 KB = 1024 bytes (igual que la prueba de los datos de prueba). */
const KB = 1024;

/** Foto: 1080 px de ancho como máximo y ≤ 300 KB (AL-6, D-36). */
export const ANCHO_FOTO = 1080;
export const LIMITE_FOTO_BYTES = 300 * KB;

/** Miniatura: unos 300 px de ancho y como máximo 30 KB (AL-6; sin mínimo, plan Q2). */
export const ANCHO_MINIATURA = 300;
export const LIMITE_MINIATURA_BYTES = 30 * KB;

/** Calidades de JPEG que se prueban, de mayor a menor (AL-6). */
export const CALIDADES: readonly number[] = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];

/** Una foto ya procesada: la foto y su miniatura, con el prefijo de M-2. */
export interface FotoProcesada {
  datos: string;
  miniatura: string;
}

/** Lo que se guarda en `animales/{id}/fotos/foto-{orden}` (03 §4.4). */
export interface FotoParaGuardar {
  datos: string;
  orden: number;
}

/**
 * Recibe una imagen en base64 (con o sin el prefijo `data:…`).
 * Devuelve cuántos bytes mide la imagen real: cada 4 letras de base64 son
 * 3 bytes, menos el relleno `=` del final.
 */
export function bytesDeBase64(base64: string): number {
  const coma = base64.indexOf(',');
  const puro = base64.startsWith('data:') && coma >= 0 ? base64.slice(coma + 1) : base64;
  let relleno = 0;
  if (puro.endsWith('==')) {
    relleno = 2;
  } else if (puro.endsWith('=')) {
    relleno = 1;
  }
  return (puro.length * 3) / 4 - relleno;
}

/**
 * Comprime con calidades decrecientes hasta que la imagen quepa (AL-6).
 * Recibe:
 * - `comprimir`: función que, con una calidad de 0 a 1, devuelve el base64;
 * - `limiteBytes`: tamaño máximo;
 * - `calidades`: calidades a probar, de mayor a menor.
 * Devuelve el base64 de la primera calidad que cabe, o `null` si ninguna
 * cabe (la foto no se agrega y no hay mensaje, A7).
 */
export async function comprimirHastaLimite(
  comprimir: (calidad: number) => Promise<string>,
  limiteBytes: number,
  calidades: readonly number[] = CALIDADES,
): Promise<string | null> {
  const probar = async (posicion: number): Promise<string | null> => {
    if (posicion >= calidades.length) {
      return null;
    }
    const base64 = await comprimir(calidades[posicion]);
    return bytesDeBase64(base64) <= limiteBytes ? base64 : probar(posicion + 1);
  };
  return probar(0);
}

/** Recibe las fotos actuales. Devuelve `true` si todavía cabe otra (AL-3: máximo 3). */
export function puedeAgregarFoto<T>(fotos: readonly T[]): boolean {
  return fotos.length < MAX_FOTOS_ANIMAL;
}

/**
 * Recibe las fotos y una nueva. Devuelve la lista con la nueva al final
 * (RN-05: la primera que se añadió es la `orden: 0`). Si ya hay 3, no cambia.
 */
export function agregarFoto<T>(fotos: readonly T[], foto: T): T[] {
  return puedeAgregarFoto(fotos) ? [...fotos, foto] : [...fotos];
}

/**
 * Recibe las fotos y la posición de la que se quita con ✕. Devuelve la lista
 * sin ella; las demás se recorren (RN-05, CA-09).
 */
export function quitarFoto<T>(fotos: readonly T[], posicion: number): T[] {
  return fotos.filter((_foto, indice) => indice !== posicion);
}

/**
 * Recibe las fotos en el orden de la pantalla. Devuelve lo que se guarda en
 * Firestore: `orden` es su posición (0, 1, 2), sin huecos (RN-05).
 */
export function fotosParaGuardar(fotos: readonly FotoProcesada[]): FotoParaGuardar[] {
  return fotos.map((foto, orden) => ({ datos: foto.datos, orden }));
}

/** Situación del permiso de cámara (RI-02, CA-08). */
export type EstadoCamara = 'concedida' | 'preguntar' | 'negada';

/**
 * Recibe la respuesta del sistema sobre el permiso de cámara.
 * Devuelve:
 * - `concedida`: se puede abrir la cámara;
 * - `preguntar`: todavía se le puede pedir el permiso;
 * - `negada`: negado sin poder volver a preguntar → "Tomar foto" gris (CA-08).
 */
export function estadoCamara(permiso: { granted: boolean; canAskAgain: boolean }): EstadoCamara {
  if (permiso.granted) {
    return 'concedida';
  }
  return permiso.canAskAgain ? 'preguntar' : 'negada';
}
