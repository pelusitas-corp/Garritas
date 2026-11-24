/**
 * Guardas de navegación (specs/02-navegacion.md §5 y §6).
 *
 * Analogía: son los porteros de cada ala del edificio. Antes de dejarte
 * pasar a una pantalla revisan quién eres (sesión y rol) y si ya terminaste
 * el cuestionario. Aquí solo vive la DECISIÓN del portero; quién la aplica
 * en pantalla son los _layout.tsx de cada grupo.
 *
 * Son funciones puras: no usan Firebase ni React. Reciben datos y devuelven
 * una decisión, así que se prueban con Jest (tests/navegacion/).
 */
import type { Href } from 'expo-router';

import { inicioDelRol } from './inicioDelRol';
import type { Rol } from './inicioDelRol';
import { RUTAS, rutaCuestionarioConAviso } from './rutas';

export type { Rol };

/** Ala del edificio: cada grupo de `app/`. */
export type Grupo = 'acceso' | 'adoptante' | 'albergue';

/** Lo que la app sabe de quien la está usando. */
export type EstadoSesion =
  /** Todavía se está leyendo la sesión o el rol. */
  | { tipo: 'cargando' }
  /** Nadie ha iniciado sesión. */
  | { tipo: 'sin-sesion' }
  /** Hay sesión, pero no se pudo leer `usuarios/{uid}` (G-4, RNF-02). */
  | { tipo: 'sin-permiso' }
  /** Hay sesión, pero no hay internet para leer el rol (G-4b). */
  | { tipo: 'error-conexion' }
  /** Hay sesión y se conoce el rol. */
  | { tipo: 'con-rol'; rol: Rol; cuestionarioCompleto: boolean };

/** Lo que el portero decide. */
export type Decision =
  /** Esperar: se muestra la pantalla de carga. */
  | { accion: 'esperar' }
  /** Dejar pasar a la pantalla pedida. */
  | { accion: 'mostrar' }
  /** Mandar a otra pantalla. */
  | { accion: 'redirigir'; destino: Href }
  /** Bloquear la pantalla y mostrar un mensaje en su lugar (G-3, G-4, G-4b). */
  | { accion: 'bloquear'; motivo: 'rol-equivocado' | 'sin-permiso' | 'error-conexion' };

/**
 * Pantallas del adoptante que necesitan el cuestionario completo porque
 * usan el % (G-5): Descubrir, Detalle (`animal`) y Match.
 */
const PANTALLAS_QUE_NECESITAN_CUESTIONARIO = ['descubrir', 'animal', 'match'];

/** Decisión para el ala de acceso (bienvenida, aviso, registro, inicio de sesión). */
function decidirEnAcceso(sesion: EstadoSesion): Decision {
  switch (sesion.tipo) {
    case 'sin-sesion':
      return { accion: 'mostrar' };
    case 'con-rol': // G-2
      return {
        accion: 'redirigir',
        destino: inicioDelRol(sesion.rol, sesion.cuestionarioCompleto),
      };
    case 'sin-permiso': // G-4
      return { accion: 'bloquear', motivo: 'sin-permiso' };
    case 'error-conexion': // G-4b
      return { accion: 'bloquear', motivo: 'error-conexion' };
    default:
      return { accion: 'esperar' };
  }
}

/** Decisión para las alas protegidas (adoptante y albergue). */
function decidirEnAlaProtegida(
  grupo: Rol,
  sesion: EstadoSesion,
  segmentos: readonly string[],
): Decision {
  switch (sesion.tipo) {
    case 'sin-sesion': // G-1
      return { accion: 'redirigir', destino: RUTAS.seleccionRol };
    case 'sin-permiso': // G-4
      return { accion: 'bloquear', motivo: 'sin-permiso' };
    case 'error-conexion': // G-4b
      return { accion: 'bloquear', motivo: 'error-conexion' };
    case 'con-rol':
      if (sesion.rol !== grupo) {
        return { accion: 'bloquear', motivo: 'rol-equivocado' }; // G-3, RF-24
      }
      if (
        grupo === 'adoptante' &&
        !sesion.cuestionarioCompleto &&
        segmentos.some((segmento) => PANTALLAS_QUE_NECESITAN_CUESTIONARIO.includes(segmento))
      ) {
        return { accion: 'redirigir', destino: rutaCuestionarioConAviso() }; // G-5, RF-02
      }
      return { accion: 'mostrar' };
    default:
      return { accion: 'esperar' };
  }
}

/**
 * Decide qué pasa cuando alguien abre una pantalla.
 * Recibe: el grupo (ala) de la pantalla, el estado de la sesión y los
 * segmentos de la ruta actual (los da `useSegments()` de Expo Router,
 * p. ej. `['(adoptante)', '(pestanas)', 'descubrir']`).
 * Devuelve: esperar, mostrar, redirigir o bloquear.
 */
export function decidirAcceso(
  grupo: Grupo,
  sesion: EstadoSesion,
  segmentos: readonly string[],
): Decision {
  if (sesion.tipo === 'cargando') {
    return { accion: 'esperar' };
  }
  if (grupo === 'acceso') {
    return decidirEnAcceso(sesion);
  }
  return decidirEnAlaProtegida(grupo, sesion, segmentos);
}
