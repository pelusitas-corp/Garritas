/**
 * Datos del usuario que se muestran en pantalla: `usuarios/{uid}.nombre`
 * (spec F-04 §4 y §6, Mi perfil; arquitectura §4). Lo escribe F-01 al crear
 * la cuenta (RF-23); aquí solo se lee.
 */
import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';

import { db } from './config';

export type LecturaNombre =
  { estado: 'ok'; nombre: string } | { estado: 'sin-conexion' } | { estado: 'sin-permiso' };

/**
 * Lee el nombre del usuario. Recibe su `uid`.
 * Devuelve el nombre (vacío si no tiene), `sin-conexion`, o `sin-permiso`
 * si las reglas lo rechazan (RNF-02).
 */
export async function leerNombreUsuario(uid: string): Promise<LecturaNombre> {
  try {
    const usuario = await getDoc(doc(db, 'usuarios', uid));
    const nombre: unknown = usuario.exists() ? usuario.get('nombre') : '';
    return { estado: 'ok', nombre: typeof nombre === 'string' ? nombre : '' };
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return { estado: 'sin-permiso' };
    }
    return { estado: 'sin-conexion' };
  }
}
