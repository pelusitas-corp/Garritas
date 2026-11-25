// Pruebas de crear la cuenta e iniciar sesión (F-01 CA-03, CA-05, RN-11, RN-13).
// Firebase se reemplaza por "dobles" (jest.mock): no se crea ninguna cuenta real.
// El nombre de cada prueba es su criterio de aceptación.
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { setDoc } from 'firebase/firestore';

import { ERROR_USUARIO_NO_GUARDADO } from '../../src/compartido/acceso/errores';
import {
  ESPERA_ESCRITURA_MS,
  crearCuentaAdoptante,
  iniciarSesion,
} from '../../src/firebase/acceso';

jest.mock('../../src/firebase/config', () => ({ auth: { nombre: 'auth' }, db: { nombre: 'db' } }));

jest.mock('firebase/app', () => ({
  FirebaseError: class FirebaseError extends Error {
    code: string;

    constructor(code: string) {
      super(code);
      this.code = code;
    }
  },
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  deleteUser: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  Timestamp: { fromDate: (fecha: Date) => ({ fecha }) },
  doc: (_db: unknown, coleccion: string, id: string) => `${coleccion}/${id}`,
  serverTimestamp: () => 'HORA_DEL_SERVIDOR',
  setDoc: jest.fn(),
}));

const { FirebaseError } = jest.requireMock<{
  FirebaseError: new (code: string) => Error;
}>('firebase/app');

const USUARIO = { uid: 'uid-ana', email: 'ana.torres@example.com' };
const FECHA = new Date('2026-11-25T10:00:00Z');
const DATOS = {
  nombre: '  Ana Torres ',
  correo: 'Ana.Torres@example.com ',
  telefono: ' 6461234567 ',
  contrasena: 'secreta',
  fechaAceptacion: FECHA,
};

const crearUsuario = jest.mocked(createUserWithEmailAndPassword);
const escribir = jest.mocked(setDoc);
const borrar = jest.mocked(deleteUser);
const salir = jest.mocked(signOut);
const entrar = jest.mocked(signInWithEmailAndPassword);

beforeEach(() => {
  jest.resetAllMocks();
  crearUsuario.mockResolvedValue({ user: USUARIO } as never);
  salir.mockResolvedValue();
});

describe('CA-03 · RF-23 válido', () => {
  test('RF-23 válido: crea la cuenta con el rol Adoptante, su consentimiento e inicia su sesión', async () => {
    escribir.mockResolvedValue();

    const resultado = await crearCuentaAdoptante(DATOS);

    expect(resultado).toEqual({ ok: true, uid: 'uid-ana' });
    expect(crearUsuario).toHaveBeenCalledWith(
      { nombre: 'auth' },
      'Ana.Torres@example.com',
      'secreta',
    );
    expect(escribir).toHaveBeenCalledWith('usuarios/uid-ana', {
      rol: 'adoptante',
      nombre: 'Ana Torres',
      correo: 'ana.torres@example.com',
      telefono: '6461234567',
      consentimiento: { aceptado: true, fecha: { fecha: FECHA } },
      creadoEn: 'HORA_DEL_SERVIDOR',
    });
    expect(borrar).not.toHaveBeenCalled();
  });

  test('RN-13: no termina hasta que usuarios/{uid} está escrito', async () => {
    let terminarEscritura: () => void = () => undefined;
    escribir.mockReturnValue(
      new Promise<void>((resolver) => {
        terminarEscritura = resolver;
      }),
    );
    let termino = false;

    const promesa = crearCuentaAdoptante(DATOS).then((resultado) => {
      termino = true;
      return resultado;
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(termino).toBe(false);

    terminarEscritura();
    await expect(promesa).resolves.toEqual({ ok: true, uid: 'uid-ana' });
  });
});

describe('CA-04 · RF-23 no válido', () => {
  test('RF-23 no válido: con un correo ya registrado no crea la cuenta y devuelve el código de Firebase', async () => {
    crearUsuario.mockRejectedValue(new FirebaseError('auth/email-already-in-use'));

    const resultado = await crearCuentaAdoptante(DATOS);

    expect(resultado).toEqual({ ok: false, codigo: 'auth/email-already-in-use' });
    expect(escribir).not.toHaveBeenCalled();
  });
});

describe('RN-11 · Si falla escribir usuarios/{uid} se borra la cuenta', () => {
  test('RN-11: si Firestore rechaza la escritura borra la cuenta y devuelve el error de conexión', async () => {
    escribir.mockRejectedValue(new FirebaseError('permission-denied'));
    borrar.mockResolvedValue();

    const resultado = await crearCuentaAdoptante(DATOS);

    expect(resultado).toEqual({ ok: false, codigo: ERROR_USUARIO_NO_GUARDADO });
    expect(borrar).toHaveBeenCalledWith(USUARIO);
  });

  test('RN-11: si la escritura no termina en 10 s borra la cuenta', async () => {
    jest.useFakeTimers();
    // Promesa que nunca termina: así se comporta Firestore sin internet.
    escribir.mockReturnValue(
      new Promise<void>(() => {
        // Nunca se resuelve.
      }),
    );
    borrar.mockResolvedValue();

    const promesa = crearCuentaAdoptante(DATOS);
    await jest.advanceTimersByTimeAsync(ESPERA_ESCRITURA_MS);

    await expect(promesa).resolves.toEqual({ ok: false, codigo: ERROR_USUARIO_NO_GUARDADO });
    expect(borrar).toHaveBeenCalledWith(USUARIO);
    jest.useRealTimers();
  });

  test('RN-11 · P2: si tampoco se puede borrar la cuenta, cierra la sesión', async () => {
    escribir.mockRejectedValue(new FirebaseError('unavailable'));
    borrar.mockRejectedValue(new FirebaseError('auth/network-request-failed'));

    const resultado = await crearCuentaAdoptante(DATOS);

    expect(resultado).toEqual({ ok: false, codigo: ERROR_USUARIO_NO_GUARDADO });
    expect(salir).toHaveBeenCalled();
  });
});

describe('CA-05 y CA-06 · RF-09', () => {
  test('RF-09 válido: con correo y contraseña registrados inicia sesión', async () => {
    entrar.mockResolvedValue({ user: { uid: 'uid-patitas' } } as never);

    await expect(iniciarSesion(' patitas@example.com ', 'secreta')).resolves.toEqual({
      ok: true,
      uid: 'uid-patitas',
    });
    expect(entrar).toHaveBeenCalledWith({ nombre: 'auth' }, 'patitas@example.com', 'secreta');
  });

  test('RF-09 no válido: con contraseña incorrecta devuelve el código de Firebase', async () => {
    entrar.mockRejectedValue(new FirebaseError('auth/invalid-credential'));

    await expect(iniciarSesion('ana.torres@example.com', 'otra')).resolves.toEqual({
      ok: false,
      codigo: 'auth/invalid-credential',
    });
  });
});
