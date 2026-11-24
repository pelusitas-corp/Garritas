/**
 * Sesión y rol del usuario (specs/02-navegacion.md §5 y §6; F-01 RN-05).
 *
 * Este archivo es la "ventanilla" con Firebase para la navegación:
 * - avisa cuando alguien inicia o cierra sesión;
 * - lee el rol en `usuarios/{uid}` y, si es adoptante, si su cuestionario
 *   está completo en `cuestionarios/{uid}`;
 * - cierra la sesión.
 *
 * Las pantallas no llaman a Firebase directamente: usan `useSesion()`
 * (src/compartido/navegacion/useSesion.tsx), que a su vez usa este archivo.
 */
import { FirebaseError } from 'firebase/app';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import type { EstadoSesion, Rol } from '../compartido/navegacion/guardas';
import { auth, db } from './config';

/**
 * Nombre del campo que indica que el cuestionario está completo
 * (arquitectura §4). [PENDIENTE P-02 de 02-navegacion: lo confirma
 * 03-modelo-datos.md; si cambia, solo se corrige aquí.]
 */
const CAMPO_CUESTIONARIO_COMPLETO = 'completo';

/** Revisa que el valor guardado en `usuarios/{uid}.rol` sea un rol válido. */
function esRol(valor: unknown): valor is Rol {
  return valor === 'adoptante' || valor === 'albergue';
}

/**
 * Escucha los cambios de sesión de Firebase Authentication.
 * Recibe una función que se llama con el `uid` del usuario, o con `null`
 * si no hay sesión. Firebase la llama al abrir la app (sesión guardada en
 * el teléfono, F-01 A5), al iniciar sesión y al cerrarla.
 * Devuelve una función para dejar de escuchar.
 */
export function escucharSesion(alCambiar: (uid: string | null) => void): () => void {
  return onAuthStateChanged(auth, (usuario) => alCambiar(usuario ? usuario.uid : null));
}

/** Lee si el cuestionario del adoptante está completo. Si no existe, no lo está. */
async function leerCuestionarioCompleto(uid: string): Promise<boolean> {
  const cuestionario = await getDoc(doc(db, 'cuestionarios', uid));
  return cuestionario.exists() && cuestionario.get(CAMPO_CUESTIONARIO_COMPLETO) === true;
}

/**
 * Lee el estado de la sesión de un usuario que ya inició sesión.
 * Recibe su `uid`.
 * Devuelve:
 * - `con-rol` con el rol y si el cuestionario está completo;
 * - `sin-permiso` si las reglas rechazan la lectura o `usuarios/{uid}` no
 *   existe o no tiene un rol válido (G-4, RNF-02);
 * - `error-conexion` si no hay internet (G-4b).
 */
export async function leerEstadoSesion(uid: string): Promise<EstadoSesion> {
  try {
    const usuario = await getDoc(doc(db, 'usuarios', uid));
    const rol: unknown = usuario.exists() ? usuario.get('rol') : undefined;
    if (!esRol(rol)) {
      return { tipo: 'sin-permiso' };
    }
    const cuestionarioCompleto = rol === 'adoptante' ? await leerCuestionarioCompleto(uid) : false;
    return { tipo: 'con-rol', rol, cuestionarioCompleto };
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return { tipo: 'sin-permiso' };
    }
    return { tipo: 'error-conexion' };
  }
}

/** Cierra la sesión y la borra del teléfono (F-01 RN-08, N-3). */
export function cerrarSesion(): Promise<void> {
  return signOut(auth);
}
