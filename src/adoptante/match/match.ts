/**
 * Decisiones de Match y del envío de la solicitud (spec F-06 RN-02: flujo A,
 * flujo B, A1 a A4; RF-20, RF-11, RF-17, RF-18; 03-modelo-datos §4.5).
 *
 * Son funciones puras: reciben lo que se leyó de Firestore y deciden qué
 * se muestra o qué se escribe, sin hablar con Firebase ni dibujar nada. Así
 * se prueban con Jest.
 *
 * RN-01: Match no calcula nada por su cuenta. El % y la explicación salen
 * de `evaluarAnimales` y el filtro de `revisarPostulacion` (F-05, D-50).
 */
import MENSAJES from '../../compartido/mensajes';
import { ESTADO_ANIMAL, ESTADO_SOLICITUD } from '../../compartido/modelo';
import type { Contacto, ResumenHogar, Solicitud } from '../../compartido/modelo';
import type { AnimalConId, LecturaAnimal } from '../../firebase/animales';
import { evaluarAnimales, revisarPostulacion, tienePerfilCompleto } from '../../matchmaking';
import type { AnimalParaMatch, ResultadoMatch, Respuestas } from '../../matchmaking';
import type { LecturaRemota } from '../cuestionario/recuperacion';

/** Lo que devuelve `leerCuestionario` (F-04). */
export type LecturaCuestionario = LecturaRemota | { estado: 'sin-permiso' };

/** Qué muestra Match al abrir. */
export type DecisionMatch =
  /** RF-20: el % y su explicación, con lo que hace falta para enviar. */
  | { tipo: 'match'; animal: AnimalConId; respuestas: Respuestas; resultado: ResultadoMatch }
  /** A1 (MS-11, G-8): no existe o ya no está "Disponible". Regresa a Descubrir. */
  | { tipo: 'no-disponible' }
  /** A2 (G-9, MS-2): un filtro lo excluye. Sin "Enviar solicitud". */
  | { tipo: 'no-compatible'; mensaje: string }
  /** G-5: el cuestionario no está completo. Lleva al cuestionario. */
  | { tipo: 'cuestionario-incompleto' }
  /** A5: sin conexión o sin respuesta en 10 s. */
  | { tipo: 'error' }
  /** A6 (RNF-02): las reglas rechazaron una lectura. */
  | { tipo: 'sin-permiso' };

/** Recibe la ficha del animal. Devuelve lo que necesita el motor (F-05). */
function animalParaMatch(animal: AnimalConId): AnimalParaMatch {
  return {
    animalId: animal.id,
    especie: animal.especie,
    perfilCompatibilidad: animal.perfilCompatibilidad,
  };
}

/**
 * Flujo A, pasos 3 a 6. Recibe la lectura del cuestionario y la del animal.
 * Revisa en este orden: lecturas fallidas → el animal existe y está
 * "Disponible" (A1) → cuestionario completo (G-5) → perfil completo
 * (decisión 1 del plan: si no, como A1) → filtros (A2) → motor (RF-20).
 * Devuelve un `DecisionMatch`.
 */
export function decidirMatch(
  cuestionario: LecturaCuestionario,
  lecturaAnimal: LecturaAnimal,
): DecisionMatch {
  if (cuestionario.estado === 'sin-permiso' || lecturaAnimal.estado === 'sin-permiso') {
    return { tipo: 'sin-permiso' };
  }
  if (cuestionario.estado === 'sin-conexion' || lecturaAnimal.estado === 'sin-conexion') {
    return { tipo: 'error' };
  }
  if (
    lecturaAnimal.estado === 'no-existe' ||
    lecturaAnimal.animal.estado !== ESTADO_ANIMAL.disponible
  ) {
    return { tipo: 'no-disponible' };
  }
  if (cuestionario.estado === 'no-existe' || !cuestionario.completo) {
    return { tipo: 'cuestionario-incompleto' };
  }
  const { animal } = lecturaAnimal;
  const { respuestas } = cuestionario;
  const paraMatch = animalParaMatch(animal);
  if (!tienePerfilCompleto(paraMatch)) {
    return { tipo: 'no-disponible' };
  }
  const revision = revisarPostulacion(respuestas, paraMatch);
  if (!revision.permitida) {
    return { tipo: 'no-compatible', mensaje: revision.mensaje };
  }
  const evaluacion = evaluarAnimales({ respuestas, completo: true }, [paraMatch]);
  if (!evaluacion.completo) {
    return { tipo: 'cuestionario-incompleto' };
  }
  const [resultado] = evaluacion.resultados;
  // Ya se revisaron el perfil y los filtros, así que el motor siempre lo devuelve.
  return resultado ? { tipo: 'match', animal, respuestas, resultado } : { tipo: 'no-disponible' };
}

/** Qué pasa al presionar "Enviar solicitud". */
export type DecisionEnvio = { permitida: true } | { permitida: false; mensaje: string };

/**
 * Flujo B, paso 3. Recibe el animal releído del servidor (`null` si ya no
 * existe), las solicitudes del adoptante y el `animalId` de Match.
 * Devuelve:
 * - bloqueada con "Esta mascota ya no está disponible para adopción" si el
 *   animal no existe o no está "Disponible" (A3, G-10, RF-11 no válido);
 * - bloqueada con `SOLICITUD_YA_ENVIADA` si ya hay una solicitud para ese
 *   animal, en cualquier estado (A4, MS-1);
 * - permitida en los demás casos.
 */
export function decidirEnvio(
  animal: Pick<AnimalConId, 'estado'> | null,
  misSolicitudes: readonly Pick<Solicitud, 'animalId'>[],
  animalId: string,
): DecisionEnvio {
  if (!animal || animal.estado !== ESTADO_ANIMAL.disponible) {
    return { permitida: false, mensaje: MENSAJES.MASCOTA_NO_DISPONIBLE };
  }
  if (misSolicitudes.some((solicitud) => solicitud.animalId === animalId)) {
    return { permitida: false, mensaje: MENSAJES.SOLICITUD_YA_ENVIADA };
  }
  return { permitida: true };
}

/** Datos de `usuarios/{uid}` que se copian a la solicitud y al contacto. */
export type CuentaAdoptante = Contacto & { nombre: string };

/** Solicitud lista para escribir; las horas las pone el servidor (`src/firebase/solicitudes.ts`). */
export type SolicitudNueva = Omit<Solicitud, 'creadaEn' | 'actualizadaEn'>;

/**
 * M-1: recibe las respuestas del cuestionario. Devuelve `{ p2, p12, p19 }`,
 * o `null` si falta alguna (no debería: esas preguntas no tienen salto).
 */
export function resumenDelHogar(respuestas: Respuestas): ResumenHogar | null {
  const { p2, p12, p19 } = respuestas;
  return p2 && p12 && p19 ? { p2, p12, p19 } : null;
}

/** Lo que recibe `armarSolicitud`. */
export interface DatosSolicitud {
  uid: string;
  /** Animal releído del servidor al enviar (copias de 03 §4.5). */
  animal: AnimalConId;
  /** El mismo resultado que muestra Match (RN-01). */
  resultado: Pick<ResultadoMatch, 'porcentaje' | 'noApto'>;
  respuestas: Respuestas;
  cuenta: CuentaAdoptante;
}

/**
 * Flujo B, paso 4 (RF-11, RF-18, M-1). Recibe los datos de `DatosSolicitud`.
 * Devuelve la solicitud con `estado: "Pendiente"`, el % y `noApto` que se ven
 * en pantalla, las copias del animal y de la cuenta y el `resumenHogar`, más
 * el contacto (`privado/contacto`). Devuelve `null` si falta alguna
 * respuesta del resumen.
 */
export function armarSolicitud(
  datos: DatosSolicitud,
): { solicitud: SolicitudNueva; contacto: Contacto } | null {
  const resumenHogar = resumenDelHogar(datos.respuestas);
  if (!resumenHogar) {
    return null;
  }
  const { animal, cuenta, resultado } = datos;
  return {
    solicitud: {
      animalId: animal.id,
      albergueId: animal.albergueId,
      adoptanteId: datos.uid,
      nombreAdoptante: cuenta.nombre,
      nombreAnimal: animal.nombre,
      nombreAlbergue: animal.nombreAlbergue,
      miniaturaAnimal: animal.miniatura,
      porcentaje: resultado.porcentaje,
      noApto: resultado.noApto,
      resumenHogar,
      estado: ESTADO_SOLICITUD.pendiente,
    },
    contacto: { telefono: cuenta.telefono, correo: cuenta.correo },
  };
}
