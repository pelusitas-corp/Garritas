/**
 * Rutas de la app (specs/02-navegacion.md §4).
 *
 * Analogía: es el directorio de números de cuarto del edificio. Las
 * pantallas nunca escriben una dirección "a mano": la toman de aquí, así
 * que si una ruta cambia, solo se corrige en este archivo.
 *
 * Recuerda: los grupos (acceso), (adoptante) y (albergue) NO forman parte
 * de la dirección; por eso cada nombre es único en toda la app.
 */
import type { Href } from 'expo-router';

/** Rutas fijas (sin parámetro). */
export const RUTAS = {
  // (acceso) · F-01
  seleccionRol: '/',
  avisoPrivacidad: '/aviso-privacidad',
  avisoIntegral: '/aviso-integral',
  registro: '/registro',
  accesoAdoptante: '/acceso-adoptante',
  accesoAlbergue: '/acceso-albergue',
  // (adoptante) · F-04, F-03, F-06
  cuestionario: '/cuestionario',
  perfilGarritas: '/perfil-garritas',
  descubrir: '/descubrir',
  misSolicitudes: '/mis-solicitudes',
  miPerfil: '/mi-perfil',
  // (albergue) · F-02, F-07
  solicitudes: '/solicitudes',
  nuevaMascota: '/nueva-mascota',
} as const;

export type RutaFija = (typeof RUTAS)[keyof typeof RUTAS];

/**
 * Cuestionario mostrando el mensaje de RF-02 ("Termina tu cuestionario para
 * ver tus matches"). Lo usa la guarda G-5.
 */
export function rutaCuestionarioConAviso(): Href {
  return { pathname: '/cuestionario', params: { aviso: 'incompleto' } };
}

/** Valor de `?aviso=` con el que G-8 regresa a Descubrir (F-03 DE-4). */
export const AVISO_NO_DISPONIBLE = 'no-disponible';

/**
 * Descubrir mostrando arriba del mazo el mensaje de RF-28 ("Esta mascota ya
 * no está disponible para adopción"). Lo usa el Detalle en G-8 (F-03 DE-4).
 */
export function rutaDescubrirConAviso(): Href {
  return { pathname: '/descubrir', params: { aviso: AVISO_NO_DISPONIBLE } };
}

/** Detalle de un animal (RF-28). Recibe el id del animal. */
export function rutaAnimal(animalId: string): Href {
  return { pathname: '/animal/[animalId]', params: { animalId } };
}

/** Pantalla "Match" de un animal (RF-20, RF-11). Recibe el id del animal. */
export function rutaMatch(animalId: string): Href {
  return { pathname: '/match/[animalId]', params: { animalId } };
}

/** "¡Solicitud enviada!" (RF-11). Recibe el id de la solicitud creada. */
export function rutaSolicitudEnviada(solicitudId: string): Href {
  return { pathname: '/solicitud-enviada/[solicitudId]', params: { solicitudId } };
}

/** Solicitudes de un animal del albergue (RF-04). Recibe el id del animal. */
export function rutaSolicitudesAnimal(animalId: string): Href {
  return { pathname: '/solicitudes-animal/[animalId]', params: { animalId } };
}

/** Detalle de una solicitud (RF-05, RF-21, RF-12). Recibe el id de la solicitud. */
export function rutaSolicitud(solicitudId: string): Href {
  return { pathname: '/solicitud/[solicitudId]', params: { solicitudId } };
}
