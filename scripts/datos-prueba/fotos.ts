/**
 * Qué fotos de prueba tiene cada animal (03-modelo-datos v1.8 §8.2, M-7;
 * F-12 AE-14; decisión del equipo, no está en el SRS).
 *
 * Es una FUNCIÓN PURA: no lee archivos por su cuenta, sino que pregunta con
 * la función `existe` que le pasan. El script le pasa una que mira la carpeta
 * `scripts/datos-prueba/` y las pruebas le pasan una lista inventada.
 *
 * Analogía: es como revisar un álbum página por página (foto 1, foto 2,
 * foto 3) y parar en la primera página vacía.
 */
import { MAX_FOTOS_ANIMAL } from '../../src/compartido/modelo';

/** Una foto de prueba: su archivo en la carpeta y su `orden` en Firestore (0 a 2). */
export interface ArchivoFoto {
  archivo: string;
  orden: number;
}

/**
 * Recibe el `id` del animal y una función que dice si un archivo existe.
 * Revisa `{id}-1.jpg`, `{id}-2.jpg` y `{id}-3.jpg` en ese orden (hasta
 * `MAX_FOTOS_ANIMAL`) y se detiene en el primero que falta, así no quedan
 * huecos en el `orden`. Devuelve la lista de fotos con su `orden`
 * (`{id}-1.jpg` → 0). Si falta `{id}-1.jpg`, lanza un error: todo animal
 * lleva al menos una foto (RF-13).
 */
export function archivosDeFotos(id: string, existe: (archivo: string) => boolean): ArchivoFoto[] {
  const fotos: ArchivoFoto[] = [];
  for (let orden = 0; orden < MAX_FOTOS_ANIMAL; orden += 1) {
    const archivo = `${id}-${orden + 1}.jpg`;
    if (!existe(archivo)) {
      break;
    }
    fotos.push({ archivo, orden });
  }
  if (fotos.length === 0) {
    throw new Error(`Falta la primera foto de ${id}: ${id}-1.jpg (RF-13 pide al menos una).`);
  }
  return fotos;
}

export default archivosDeFotos;
