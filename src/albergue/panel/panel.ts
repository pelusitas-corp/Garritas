/**
 * Lógica del panel de solicitudes del albergue (spec F-07, RN-01).
 *
 * Son FUNCIONES PURAS: reciben datos y devuelven un resultado, sin React ni
 * Firebase (solo se importan tipos). Así se prueban con Jest y siempre dan
 * lo mismo con los mismos datos.
 *
 * Analogía: es la persona que acomoda los expedientes. No va al archivero
 * (eso lo hace src/firebase/panelSolicitudes.ts): recibe las copias, las
 * ordena, las cuenta y decide qué letrero poner en la ventanilla.
 */
import MENSAJES from '../../compartido/mensajes';
import { ESTADO_SOLICITUD } from '../../compartido/modelo';
import type { ResumenHogar, Solicitud } from '../../compartido/modelo';
import type {
  AnimalConId,
  LecturaAnimal,
  LecturaAnimales,
  LecturaFallida,
} from '../../firebase/animales';
import type { LecturaNombre } from '../../firebase/usuarios';
import { PALABRAS_CONTEO, TEXTO_EXPERIENCIA, TEXTO_VIVIENDA, TEXTOS_PANEL } from './textos';

// ----- Tipos -----

/** Solicitud con el ID de su documento (el `solicitudId` de las rutas). */
export type SolicitudConId = Solicitud & { id: string };

/** Lo que devuelven las lecturas de solicitudes (src/firebase/panelSolicitudes.ts). */
export type LecturaSolicitudes = { estado: 'ok'; solicitudes: SolicitudConId[] } | LecturaFallida;

/** Cualquier fecha de Firestore (`Timestamp`): solo se necesita pasarla a milisegundos. */
interface Fecha {
  toMillis: () => number;
}

/** Una fila de "Tus animales": el animal y cuántas solicitudes tiene (PS-3). */
export interface FilaDeAnimal {
  animal: AnimalConId;
  conteo: number;
}

/** Fallo de la pantalla: sin conexión (A4) o sin permiso (A3, A5). */
type PantallaFallida =
  { tipo: 'error'; mensaje: string } | { tipo: 'sin-permiso'; mensaje: string };

/** Lo que dibuja "Solicitudes · lista de mis animales" (F-07 §6). */
export type PantallaLista =
  | { tipo: 'cargando' }
  | { tipo: 'con-datos'; nombreAlbergue: string; filas: FilaDeAnimal[] }
  | { tipo: 'vacia'; nombreAlbergue: string; mensaje: string }
  | PantallaFallida;

/**
 * Lo que va en el encabezado de "Solicitudes de un animal": el refugio, el
 * nombre del animal y su miniatura (F-13 AF-7: foto en círculo de 96).
 */
export interface EncabezadoAnimal {
  nombreAlbergue: string;
  nombreAnimal: string;
  miniaturaAnimal: string;
}

/** Lo que dibuja "Solicitudes de un animal" (F-07 §6). */
export type PantallaAnimal =
  | { tipo: 'cargando' }
  /** El animal ya se confirmó (PS-5): se ve el título mientras se leen sus solicitudes. */
  | ({ tipo: 'leer-solicitudes' } & EncabezadoAnimal)
  | ({ tipo: 'vacia'; mensaje: string } & EncabezadoAnimal)
  | ({
      tipo: 'con-datos';
      /** Ya ordenadas de mayor a menor % (RF-04, PS-1). */
      solicitudes: SolicitudConId[];
      /** Cuántas siguen "Pendiente" (PS-7). */
      nuevas: number;
    } & EncabezadoAnimal)
  | PantallaFallida;

// ----- Orden y conteos -----

/** Recibe una fecha (o nada). Devuelve sus milisegundos; sin fecha, "infinito" (va al final del orden por antigüedad). */
function milisegundos(fecha: Fecha | null | undefined): number {
  return fecha ? fecha.toMillis() : Number.POSITIVE_INFINITY;
}

/**
 * RF-04 y PS-1: recibe solicitudes. Devuelve una copia ordenada de mayor a
 * menor `porcentaje`; con el mismo %, primero la de `creadaEn` más antigua.
 * No cambia la lista original.
 */
export function ordenarSolicitudes<T extends { porcentaje: number; creadaEn: Fecha }>(
  solicitudes: readonly T[],
): T[] {
  return [...solicitudes].sort(
    (a, b) => b.porcentaje - a.porcentaje || milisegundos(a.creadaEn) - milisegundos(b.creadaEn),
  );
}

/**
 * PS-2: recibe animales. Devuelve una copia con el más reciente primero
 * (`creadoEn` de mayor a menor). Si dos tienen la misma fecha, quedan en el
 * orden en que llegaron. No cambia la lista original.
 */
export function ordenarAnimales<T extends { creadoEn: Fecha }>(animales: readonly T[]): T[] {
  const reciente = (fecha: Fecha | null | undefined) => (fecha ? fecha.toMillis() : 0);
  return [...animales].sort((a, b) => reciente(b.creadoEn) - reciente(a.creadoEn));
}

/**
 * PS-3 y M-3: recibe las solicitudes del albergue. Devuelve cuántas tiene
 * cada animal (`{ animalId: número }`), sin importar su estado.
 */
export function contarPorAnimal(
  solicitudes: readonly Pick<Solicitud, 'animalId'>[],
): Record<string, number> {
  return solicitudes.reduce<Record<string, number>>(
    (conteo, { animalId }) => ({ ...conteo, [animalId]: (conteo[animalId] ?? 0) + 1 }),
    {},
  );
}

/** PS-7: recibe las solicitudes de un animal. Devuelve cuántas siguen "Pendiente". */
export function contarNuevas(solicitudes: readonly Pick<Solicitud, 'estado'>[]): number {
  return solicitudes.filter(({ estado }) => estado === ESTADO_SOLICITUD.pendiente).length;
}

/**
 * PS-3 y PS-7: recibe un número y qué se cuenta. Devuelve el texto en
 * singular con 1 ("1 solicitud", "1 solicitud nueva") y en plural con
 * cualquier otro número, incluido 0 ("0 solicitudes", "2 solicitudes nuevas").
 */
export function textoConteo(cantidad: number, forma: keyof typeof PALABRAS_CONTEO): string {
  const palabras = PALABRAS_CONTEO[forma];
  return `${cantidad} ${cantidad === 1 ? palabras.singular : palabras.plural}`;
}

// ----- Tarjeta -----

/**
 * PS-9: recibe el nombre del adoptante. Devuelve la primera letra de sus
 * dos primeras palabras ("Ana Torres" → "AT").
 */
export function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join('');
}

/** PS-9: recibe `resumenHogar`. Devuelve "Casa"/"Departamento" · "tiene experiencia"/"primera vez". */
export function resumenDelHogar(resumen: Pick<ResumenHogar, 'p2' | 'p19'>): string {
  return `${TEXTO_VIVIENDA[resumen.p2]}${TEXTOS_PANEL.separador}${TEXTO_EXPERIENCIA[resumen.p19]}`;
}

// ----- Estado de las pantallas -----

/**
 * Recibe las lecturas de una pantalla cuando al menos una falló. Devuelve
 * "sin permiso" si alguna la rechazaron las reglas (gana, RNF-02); si no,
 * "error de conexión" (A4).
 */
function falloDe(...lecturas: readonly { estado: string }[]): PantallaFallida {
  return lecturas.some(({ estado }) => estado === 'sin-permiso')
    ? { tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO }
    : { tipo: 'error', mensaje: MENSAJES.ERROR_CONEXION };
}

/**
 * "Solicitudes · lista de mis animales" (F-07 §6, CA-05, CA-06, CA-08).
 * Recibe las lecturas del nombre del albergue, de sus animales y de sus
 * solicitudes. Devuelve:
 * - `sin-permiso` o `error` si alguna lectura falló (A4, A5);
 * - `vacia` con "Aún no tienes mascotas publicadas…" si no tiene animales (A1, PS-4);
 * - `con-datos` con las filas, el animal más reciente primero (PS-2) y su conteo (PS-3).
 */
export function decidirPantallaLista(
  nombre: LecturaNombre,
  animales: LecturaAnimales,
  solicitudes: LecturaSolicitudes,
): PantallaLista {
  if (nombre.estado !== 'ok' || animales.estado !== 'ok' || solicitudes.estado !== 'ok') {
    return falloDe(nombre, animales, solicitudes);
  }
  if (animales.animales.length === 0) {
    return {
      tipo: 'vacia',
      nombreAlbergue: nombre.nombre,
      mensaje: MENSAJES.SIN_ANIMALES_ALBERGUE,
    };
  }
  const conteo = contarPorAnimal(solicitudes.solicitudes);
  return {
    tipo: 'con-datos',
    nombreAlbergue: nombre.nombre,
    filas: ordenarAnimales(animales.animales).map((animal) => ({
      animal,
      conteo: conteo[animal.id] ?? 0,
    })),
  };
}

/**
 * "Solicitudes de un animal" (F-07 §6, PS-5, CA-01, CA-02, CA-07, CA-08).
 * Recibe el `uid` del albergue, la lectura de su nombre, la del animal y,
 * cuando ya se hizo, la de las solicitudes del animal. Devuelve:
 * - `sin-permiso` si el animal no existe o es de otro albergue (PS-5, G-11),
 *   o si las reglas rechazan una lectura (A5). En ese caso NO hay que leer
 *   las solicitudes: la consulta por `albergueId` daría una lista vacía;
 * - `error` si falla la red (A4);
 * - `leer-solicitudes` si el animal es suyo y faltan sus solicitudes;
 * - `vacia` con el mensaje de RF-04 si no tiene solicitudes (A2);
 * - `con-datos` con las solicitudes ordenadas (RF-04, PS-1) y las nuevas (PS-7).
 */
export function decidirPantallaAnimal(
  uid: string,
  nombre: LecturaNombre,
  animal: LecturaAnimal,
  solicitudes?: LecturaSolicitudes,
): PantallaAnimal {
  if (animal.estado === 'no-existe') {
    return { tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO };
  }
  if (nombre.estado !== 'ok' || animal.estado !== 'ok') {
    return falloDe(nombre, animal);
  }
  if (animal.animal.albergueId !== uid) {
    return { tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO };
  }
  const nombres: EncabezadoAnimal = {
    nombreAlbergue: nombre.nombre,
    nombreAnimal: animal.animal.nombre,
    miniaturaAnimal: animal.animal.miniatura,
  };
  if (!solicitudes) {
    return { tipo: 'leer-solicitudes', ...nombres };
  }
  if (solicitudes.estado !== 'ok') {
    return falloDe(solicitudes);
  }
  if (solicitudes.solicitudes.length === 0) {
    return { tipo: 'vacia', ...nombres, mensaje: MENSAJES.SIN_SOLICITUDES_ANIMAL };
  }
  return {
    tipo: 'con-datos',
    ...nombres,
    solicitudes: ordenarSolicitudes(solicitudes.solicitudes),
    nuevas: contarNuevas(solicitudes.solicitudes),
  };
}
