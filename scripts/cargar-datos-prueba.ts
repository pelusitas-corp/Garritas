/**
 * Carga los datos de prueba de specs/03-modelo-datos.md §8 en Firebase (M-5).
 *
 * Uso (en la carpeta del repo):  npm run datos:prueba
 *
 * - Corre en la computadora, NUNCA dentro de la app: usa `firebase-admin`,
 *   que se salta las reglas de seguridad.
 * - Necesita la llave de servicio en `scripts/llave-servicio.json`
 *   (consola de Firebase → Configuración del proyecto → Cuentas de servicio →
 *   "Generar nueva clave privada"). La llave está en `.gitignore`: no se sube.
 * - Pide en la terminal la contraseña de las 3 cuentas de prueba. No se
 *   guarda en ningún archivo.
 * - Se puede correr varias veces: deja los datos igual que en la spec
 *   (útil antes de una demo).
 * - Fotos (03 v1.8 M-7, F-12 AE-14): de cada animal escribe todas las que
 *   encuentre, hasta 3 (`{id}-1.jpg` a `{id}-3.jpg` → `foto-0` a `foto-2`), y
 *   borra los `foto-N` que ya no tienen archivo. Con los datos de la spec
 *   quedan 36 documentos: 3 usuarios, 2 cuestionarios, 9 animales, 10 fotos,
 *   6 solicitudes y 6 contactos.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { WriteBatch } from 'firebase-admin/firestore';

import { COLECCIONES, ID_CONTACTO, MAX_FOTOS_ANIMAL } from '../src/compartido/modelo';
import type {
  Animal,
  Contacto,
  DocumentoCuestionario,
  Foto,
  Solicitud,
  Usuario,
} from '../src/compartido/modelo';
import { esNoApto } from '../src/matchmaking';
import { ADOPTANTES, ALBERGUE, ANIMALES, SOLICITUDES } from './datos-prueba/datos';
import type { AdoptantePrueba } from './datos-prueba/datos';
import { archivosDeFotos } from './datos-prueba/fotos';

const CARPETA_IMAGENES = join(__dirname, 'datos-prueba');
const RUTA_LLAVE = join(__dirname, 'llave-servicio.json');
const LARGO_MINIMO_CONTRASENA = 6;

/** Los campos de fecha que en la app son `Timestamp` aquí se escriben con el SDK de administrador. */
type FechaAdmin = FieldValue | Timestamp;
type ConFechas<T, K extends keyof T> = Omit<T, K> & Record<K, FechaAdmin>;

function escribir(texto: string): void {
  stdout.write(`${texto}\n`);
}

/** Lee un JPEG de la carpeta de datos de prueba y lo devuelve listo para `<Image>` (M-2). */
function leerImagen(nombreArchivo: string): string {
  const base64 = readFileSync(join(CARPETA_IMAGENES, nombreArchivo)).toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

async function pedirContrasena(): Promise<string> {
  const terminal = createInterface({ input: stdin, output: stdout });
  const contrasena = await terminal.question(
    `Contraseña para las 3 cuentas de prueba (mínimo ${LARGO_MINIMO_CONTRASENA} caracteres): `,
  );
  terminal.close();
  return contrasena.trim();
}

/** Crea la cuenta en Authentication con su `uid` fijo, o la actualiza si ya existe. */
async function prepararCuenta(uid: string, correo: string, nombre: string, contrasena: string) {
  const auth = getAuth();
  try {
    await auth.getUser(uid);
    await auth.updateUser(uid, { email: correo, password: contrasena, displayName: nombre });
    escribir(`  · Cuenta actualizada: ${correo}`);
  } catch (error) {
    const codigo = (error as { code?: string }).code;
    if (codigo !== 'auth/user-not-found') {
      throw error;
    }
    await auth.createUser({ uid, email: correo, password: contrasena, displayName: nombre });
    escribir(`  · Cuenta creada: ${correo}`);
  }
}

function agregarAlbergue(lote: WriteBatch): void {
  const db = getFirestore();
  const usuario: ConFechas<Usuario, 'creadoEn'> = {
    rol: 'albergue',
    nombre: ALBERGUE.nombre,
    correo: ALBERGUE.correo,
    creadoEn: FieldValue.serverTimestamp(),
  };
  lote.set(db.collection(COLECCIONES.usuarios).doc(ALBERGUE.uid), usuario);
}

function agregarAdoptante(lote: WriteBatch, adoptante: AdoptantePrueba): void {
  const db = getFirestore();
  const usuario: Omit<Usuario, 'creadoEn' | 'consentimiento'> & {
    creadoEn: FechaAdmin;
    consentimiento: { aceptado: true; fecha: FechaAdmin };
  } = {
    rol: 'adoptante',
    nombre: adoptante.nombre,
    correo: adoptante.correo,
    telefono: adoptante.telefono,
    consentimiento: { aceptado: true, fecha: Timestamp.now() },
    creadoEn: FieldValue.serverTimestamp(),
  };
  const cuestionario: ConFechas<DocumentoCuestionario, 'actualizadoEn'> = {
    respuestas: adoptante.cuestionario.respuestas,
    completo: true,
    perfilGarritas: adoptante.perfilGarritas,
    actualizadoEn: FieldValue.serverTimestamp(),
  };
  lote.set(db.collection(COLECCIONES.usuarios).doc(adoptante.uid), usuario);
  lote.set(db.collection(COLECCIONES.cuestionarios).doc(adoptante.uid), cuestionario);
}

/** Dice si un archivo está en la carpeta de datos de prueba. */
function existeImagen(nombreArchivo: string): boolean {
  return existsSync(join(CARPETA_IMAGENES, nombreArchivo));
}

/**
 * Agrega al lote cada animal con sus fotos (M-7): `foto-{orden}` para cada
 * foto que encuentra `archivosDeFotos`, y borra los `foto-N` que sobran (si no
 * existen, borrar no hace nada). Devuelve cuántas fotos escribió.
 */
function agregarAnimales(lote: WriteBatch): number {
  const db = getFirestore();
  let totalFotos = 0;
  ANIMALES.forEach(({ id, ...datos }) => {
    const animal: ConFechas<Animal, 'creadoEn'> = {
      ...datos,
      albergueId: ALBERGUE.uid,
      nombreAlbergue: ALBERGUE.nombre,
      miniatura: leerImagen(`${id}-miniatura.jpg`),
      creadoEn: FieldValue.serverTimestamp(),
    };
    const referencia = db.collection(COLECCIONES.animales).doc(id);
    lote.set(referencia, animal);
    const fotos = archivosDeFotos(id, existeImagen);
    Array.from({ length: MAX_FOTOS_ANIMAL }, (_, orden) => orden).forEach((orden) => {
      const documento = referencia.collection(COLECCIONES.fotos).doc(`foto-${orden}`);
      const archivo = fotos.find((candidata) => candidata.orden === orden);
      if (archivo) {
        const foto: Foto = { datos: leerImagen(archivo.archivo), orden };
        lote.set(documento, foto);
      } else {
        lote.delete(documento);
      }
    });
    totalFotos += fotos.length;
  });
  return totalFotos;
}

function agregarSolicitudes(lote: WriteBatch): void {
  const db = getFirestore();
  SOLICITUDES.forEach(({ id, animalId, adoptante: clave, porcentaje, estado }) => {
    const animal = ANIMALES.find((a) => a.id === animalId);
    if (!animal) {
      throw new Error(`La solicitud ${id} apunta a un animal que no existe: ${animalId}`);
    }
    const adoptante = ADOPTANTES[clave];
    const solicitud: ConFechas<Solicitud, 'creadaEn' | 'actualizadaEn'> = {
      animalId,
      albergueId: ALBERGUE.uid,
      adoptanteId: adoptante.uid,
      nombreAdoptante: adoptante.nombre,
      nombreAnimal: animal.nombre,
      nombreAlbergue: ALBERGUE.nombre,
      miniaturaAnimal: leerImagen(`${animalId}-miniatura.jpg`),
      porcentaje,
      noApto: esNoApto(porcentaje),
      resumenHogar: adoptante.resumenHogar,
      estado,
      creadaEn: FieldValue.serverTimestamp(),
      actualizadaEn: FieldValue.serverTimestamp(),
    };
    const contacto: Contacto = { telefono: adoptante.telefono, correo: adoptante.correo };
    const referencia = db.collection(COLECCIONES.solicitudes).doc(id);
    lote.set(referencia, solicitud);
    lote.set(referencia.collection(COLECCIONES.privado).doc(ID_CONTACTO), contacto);
  });
}

async function principal(): Promise<void> {
  if (!existsSync(RUTA_LLAVE)) {
    escribir('No encontré scripts/llave-servicio.json.');
    escribir('Descárgala en la consola de Firebase → Configuración del proyecto →');
    escribir('Cuentas de servicio → "Generar nueva clave privada", y guárdala con ese nombre.');
    process.exitCode = 1;
    return;
  }
  initializeApp({ credential: cert(RUTA_LLAVE) });

  const contrasena = await pedirContrasena();
  if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
    escribir(`La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`);
    process.exitCode = 1;
    return;
  }

  escribir('1/2 Cuentas en Authentication (03-modelo-datos §8.1)');
  await prepararCuenta(ALBERGUE.uid, ALBERGUE.correo, ALBERGUE.nombre, contrasena);
  await prepararCuenta(ADOPTANTES.a.uid, ADOPTANTES.a.correo, ADOPTANTES.a.nombre, contrasena);
  await prepararCuenta(ADOPTANTES.b.uid, ADOPTANTES.b.correo, ADOPTANTES.b.nombre, contrasena);

  escribir('2/2 Documentos en Firestore (§8.1 a §8.3)');
  const lote = getFirestore().batch();
  agregarAlbergue(lote);
  agregarAdoptante(lote, ADOPTANTES.a);
  agregarAdoptante(lote, ADOPTANTES.b);
  const fotos = agregarAnimales(lote);
  agregarSolicitudes(lote);
  await lote.commit();

  const animales = ANIMALES.length;
  const solicitudes = SOLICITUDES.length;
  // 3 usuarios + 2 cuestionarios + animales + fotos + solicitudes + sus contactos.
  const documentos = 3 + 2 + animales + fotos + solicitudes * 2;
  escribir(`Listo: 3 cuentas y ${documentos} documentos (3 usuarios, 2 cuestionarios,`);
  escribir(
    `${animales} animales, ${fotos} fotos, ${solicitudes} solicitudes y ${solicitudes} contactos).`,
  );
  escribir('Revísalos en la consola de Firebase.');
}

principal().catch((error: unknown) => {
  escribir(`Error al cargar los datos de prueba: ${String(error)}`);
  process.exitCode = 1;
});
