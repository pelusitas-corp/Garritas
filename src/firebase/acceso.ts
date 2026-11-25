/**
 * Crear la cuenta del adoptante e iniciar sesión (F-01: RF-23, RF-25, RF-09;
 * RN-11 y RN-13).
 *
 * Es la "ventanilla" con Firebase Authentication y con `usuarios/{uid}`
 * para las pantallas de acceso. Las pantallas no llaman a Firebase: usan
 * `iniciarSesion` de aquí y `crearCuenta` de `useSesion()`.
 *
 * Ninguna función lanza errores: devuelven `{ ok: false, codigo }` y la
 * pantalla traduce el código con `src/compartido/acceso/errores.ts`.
 */
import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Timestamp, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { ERROR_USUARIO_NO_GUARDADO } from '../compartido/acceso/errores';
import { COLECCIONES } from '../compartido/modelo';
import { auth, db } from './config';

/** Tiempo máximo para escribir `usuarios/{uid}` (RN-11, P2: 10 s). */
export const ESPERA_ESCRITURA_MS = 10_000;

/** Resultado de crear la cuenta o iniciar sesión. */
export type ResultadoAcceso = { ok: true; uid: string } | { ok: false; codigo: string };

/** Lo que captura el adoptante en "Crea tu cuenta" más la fecha de aceptación del aviso. */
export interface DatosRegistro {
  nombre: string;
  correo: string;
  telefono: string;
  contrasena: string;
  /** Momento en que presionó "Continuar" en el aviso (RF-25). */
  fechaAceptacion: Date;
}

/** Recibe un error cualquiera. Devuelve su código de Firebase, o `'desconocido'`. */
function codigoDe(error: unknown): string {
  return error instanceof FirebaseError ? error.code : 'desconocido';
}

/**
 * Recibe una promesa y un tiempo en milisegundos. Devuelve la misma promesa,
 * pero falla si no termina a tiempo. Hace falta porque Firestore, sin
 * internet, no falla al escribir: se queda esperando (RN-11).
 * También la usa el alta del animal (F-02 AL-8).
 */
export function conTiempoLimite<T>(promesa: Promise<T>, milisegundos: number): Promise<T> {
  return new Promise<T>((resolver, rechazar) => {
    const temporizador = setTimeout(() => rechazar(new Error('Tiempo agotado')), milisegundos);
    promesa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolver(valor);
      },
      (error: unknown) => {
        clearTimeout(temporizador);
        rechazar(error);
      },
    );
  });
}

/**
 * Escribe `usuarios/{uid}` del adoptante (03-modelo-datos §4.1).
 * El correo es el que guardó Authentication (en minúsculas), para que
 * coincida con la regla `correo == request.auth.token.email`.
 */
function escribirUsuario(usuario: User, datos: DatosRegistro): Promise<void> {
  const ficha = {
    rol: 'adoptante',
    nombre: datos.nombre.trim(),
    correo: usuario.email ?? datos.correo.trim(),
    telefono: datos.telefono.trim(),
    consentimiento: { aceptado: true, fecha: Timestamp.fromDate(datos.fechaAceptacion) },
    creadoEn: serverTimestamp(),
  };
  return conTiempoLimite(
    setDoc(doc(db, COLECCIONES.usuarios, usuario.uid), ficha),
    ESPERA_ESCRITURA_MS,
  );
}

/**
 * RN-11: borra la cuenta recién creada para que el correo se pueda volver a
 * usar. Si tampoco se puede (sin internet), cierra la sesión: la cuenta
 * queda huérfana en Authentication y el equipo la borra desde la consola (P2).
 */
async function deshacerCuenta(usuario: User): Promise<void> {
  try {
    await deleteUser(usuario);
  } catch {
    await signOut(auth).catch(() => undefined);
  }
}

/**
 * Crea la cuenta del adoptante (RF-23) con su consentimiento (RF-25).
 * Recibe los datos del formulario y la fecha de aceptación.
 * Devuelve `{ ok: true, uid }` cuando YA existe `usuarios/{uid}` (RN-13), o
 * `{ ok: false, codigo }` si Firebase rechazó la cuenta o no se pudo
 * escribir la ficha (RN-11, código `ERROR_USUARIO_NO_GUARDADO`).
 */
export async function crearCuentaAdoptante(datos: DatosRegistro): Promise<ResultadoAcceso> {
  let usuario: User;
  try {
    const credencial = await createUserWithEmailAndPassword(
      auth,
      datos.correo.trim(),
      datos.contrasena,
    );
    usuario = credencial.user;
  } catch (error) {
    return { ok: false, codigo: codigoDe(error) };
  }

  try {
    await escribirUsuario(usuario, datos);
  } catch {
    await deshacerCuenta(usuario);
    return { ok: false, codigo: ERROR_USUARIO_NO_GUARDADO };
  }
  return { ok: true, uid: usuario.uid };
}

/**
 * Inicia sesión con correo y contraseña (RF-09), para adoptante o albergue.
 * Recibe el correo y la contraseña. Devuelve `{ ok: true, uid }` o
 * `{ ok: false, codigo }`. La pantalla de inicio la decide después el rol
 * (`useSesion`, RN-05), no esta función.
 */
export async function iniciarSesion(correo: string, contrasena: string): Promise<ResultadoAcceso> {
  try {
    const credencial = await signInWithEmailAndPassword(auth, correo.trim(), contrasena);
    return { ok: true, uid: credencial.user.uid };
  } catch (error) {
    return { ok: false, codigo: codigoDe(error) };
  }
}
