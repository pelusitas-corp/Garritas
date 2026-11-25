/**
 * Cámara, galería y compresión de fotos (F-02 AL-4 a AL-6; RI-02, RF-13).
 *
 * Es la parte que usa módulos de Expo (no se prueba con Jest; se prueba en
 * el celular). Las decisiones puras (tamaños, calidades, permiso) están en
 * `fotos.ts`.
 *
 * - `expo-image-picker`: abre la cámara o la galería y pide el permiso de
 *   cámara. La galería no pide permiso (usa el selector del sistema).
 * - `expo-image-manipulator`: reduce la foto y la guarda como JPEG en base64.
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { ImageRef } from 'expo-image-manipulator';
import {
  getCameraPermissionsAsync,
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
} from 'expo-image-picker';
import type { ImagePickerOptions, ImagePickerResult } from 'expo-image-picker';

import {
  ANCHO_FOTO,
  ANCHO_MINIATURA,
  LIMITE_FOTO_BYTES,
  LIMITE_MINIATURA_BYTES,
  PREFIJO_JPEG,
  comprimirHastaLimite,
  estadoCamara,
} from './fotos';
import type { EstadoCamara, FotoProcesada } from './fotos';

/** Resultado de tomar o elegir una foto. */
export type Seleccion =
  /** El permiso de cámara está negado (CA-08). */
  | { tipo: 'negada' }
  /** Canceló, o no se pudo abrir (A6): no pasa nada. */
  | { tipo: 'cancelada' }
  /** Eligió una foto: su dirección en el teléfono y su ancho en píxeles. */
  | { tipo: 'elegida'; uri: string; ancho: number };

/** Solo imágenes, sin recortar (fuera de alcance) y a calidad completa: se comprime después. */
const OPCIONES_SELECTOR: ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };

/** No recibe nada. Devuelve cómo está el permiso de cámara, sin preguntar (CA-08). */
export async function revisarCamara(): Promise<EstadoCamara> {
  try {
    return estadoCamara(await getCameraPermissionsAsync());
  } catch {
    return 'preguntar';
  }
}

/** Recibe la respuesta del selector. Devuelve la foto elegida o "cancelada" (A6). */
function aSeleccion(resultado: ImagePickerResult): Seleccion {
  const foto = resultado.canceled ? undefined : resultado.assets[0];
  return foto ? { tipo: 'elegida', uri: foto.uri, ancho: foto.width } : { tipo: 'cancelada' };
}

/**
 * "Tomar foto" (AL-4). Pide el permiso de cámara si hace falta.
 * Devuelve `negada` si el sistema lo niega (CA-08), o la foto tomada.
 */
export async function tomarFoto(): Promise<Seleccion> {
  try {
    let estado = await revisarCamara();
    if (estado === 'preguntar') {
      estado = estadoCamara(await requestCameraPermissionsAsync());
    }
    if (estado !== 'concedida') {
      return { tipo: 'negada' };
    }
    return aSeleccion(await launchCameraAsync(OPCIONES_SELECTOR));
  } catch {
    return { tipo: 'cancelada' };
  }
}

/** "Elegir de la galería" (AL-4). Devuelve la foto elegida o "cancelada". */
export async function elegirDeGaleria(): Promise<Seleccion> {
  try {
    return aSeleccion(await launchImageLibraryAsync(OPCIONES_SELECTOR));
  } catch {
    return { tipo: 'cancelada' };
  }
}

/** Recibe la foto y un ancho máximo. Devuelve la imagen reducida (nunca la agranda). */
function reducir(uri: string, anchoOriginal: number, anchoMaximo: number): Promise<ImageRef> {
  const contexto = ImageManipulator.manipulate(uri);
  if (anchoOriginal > anchoMaximo) {
    contexto.resize({ width: anchoMaximo });
  }
  return contexto.renderAsync();
}

/** Recibe una imagen ya reducida. Devuelve una función que la guarda en JPEG con cierta calidad. */
function compresor(imagen: ImageRef) {
  return async (calidad: number): Promise<string> => {
    const { base64 } = await imagen.saveAsync({
      format: SaveFormat.JPEG,
      compress: calidad,
      base64: true,
    });
    return base64 ?? '';
  };
}

/**
 * Reduce y comprime la foto elegida (AL-6).
 * Recibe su `uri` y su ancho en píxeles.
 * Devuelve la foto (≤ 300 KB, máx. 1080 px) y su miniatura (≤ 30 KB,
 * 300 px), con el prefijo `data:image/jpeg;base64,`; o `null` si no se pudo
 * procesar (A7: la foto no se agrega y no hay mensaje).
 */
export async function procesarFoto(uri: string, ancho: number): Promise<FotoProcesada | null> {
  try {
    const foto = await reducir(uri, ancho, ANCHO_FOTO);
    const chica = await reducir(uri, ancho, ANCHO_MINIATURA);
    const datos = await comprimirHastaLimite(compresor(foto), LIMITE_FOTO_BYTES);
    const miniatura = await comprimirHastaLimite(compresor(chica), LIMITE_MINIATURA_BYTES);
    if (!datos || !miniatura) {
      return null;
    }
    return { datos: `${PREFIJO_JPEG}${datos}`, miniatura: `${PREFIJO_JPEG}${miniatura}` };
  } catch {
    return null;
  }
}
