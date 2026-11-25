// Pruebas de la transacción de pre-aprobar y rechazar y de las lecturas del
// Detalle (spec F-08 T-3: RF-05, RF-21, RF-22, RF-12, RNF-02; RN-01, PA-2;
// A5, A7). Firebase se reemplaza por "dobles" (jest.mock), como en
// tests/firebase/animales.test.ts: no se lee ni se escribe nada real.
//
// `runTransaction` se reemplaza por una función que llama al trabajo con una
// transacción de mentira: su `get` responde con un pequeño "archivero"
// (ruta → datos) y su `update` solo anota lo que se pidió escribir.
// El nombre de cada prueba es su criterio de aceptación.
import { getDocFromServer } from 'firebase/firestore';

import { ESPERA_ESCRITURA_MS } from '../../src/firebase/acceso';
import {
  leerContacto,
  leerSolicitud,
  preAprobarSolicitud,
  rechazarSolicitud,
} from '../../src/firebase/decisionSolicitud';

jest.mock('../../src/firebase/config', () => ({ auth: {}, db: { nombre: 'db' } }));

jest.mock('firebase/app', () => ({
  FirebaseError: class FirebaseError extends Error {
    code: string;

    constructor(code: string) {
      super(code);
      this.code = code;
    }
  },
}));

jest.mock('firebase/auth', () => ({}));

jest.mock('firebase/firestore', () => ({
  doc: (_db: unknown, ...ruta: string[]) => ruta.join('/'),
  getDocFromServer: jest.fn(),
  runTransaction: jest.fn(),
  serverTimestamp: () => 'HORA_DEL_SERVIDOR',
}));

const { FirebaseError } = jest.requireMock<{
  FirebaseError: new (code: string) => Error;
}>('firebase/app');

/** Transacción de mentira: lee del archivero y anota las escrituras. */
interface TransaccionFalsa {
  get: jest.Mock<Promise<{ data: () => Record<string, unknown> | undefined }>, [string]>;
  update: jest.Mock<void, [string, Record<string, unknown>]>;
}

const { runTransaction } = jest.requireMock<{
  runTransaction: jest.Mock<
    Promise<unknown>,
    [unknown, (transaccion: TransaccionFalsa) => Promise<unknown>]
  >;
}>('firebase/firestore');

const leerDelServidor = jest.mocked(getDocFromServer);

/**
 * Prepara `runTransaction` con un archivero (ruta → datos) y devuelve la
 * transacción de mentira para revisar qué leyó y qué escribió.
 */
function conArchivero(documentos: Record<string, Record<string, unknown>>): TransaccionFalsa {
  const transaccion: TransaccionFalsa = {
    get: jest.fn(async (ruta: string) => ({ data: () => documentos[ruta] })),
    update: jest.fn(),
  };
  runTransaction.mockImplementation((_db, trabajo) => trabajo(transaccion));
  return transaccion;
}

const S1 = { animalId: 'wini', albergueId: 'refugio-patitas', estado: 'Pendiente' };
const S2 = { animalId: 'wini', albergueId: 'refugio-patitas', estado: 'Pendiente' };
const S4 = { animalId: 'rocky', albergueId: 'refugio-patitas', estado: 'Pre-aprobada' };
const S5 = { animalId: 'rocky', albergueId: 'refugio-patitas', estado: 'Pendiente' };
const S6 = { animalId: 'luna', albergueId: 'refugio-patitas', estado: 'Rechazada' };
const WINI = { nombre: 'Wini', estado: 'Disponible' };
const ROCKY = { nombre: 'Rocky', estado: 'En pre-adopción' };

beforeEach(() => {
  jest.resetAllMocks();
});

describe('F-08 · T-3 · Pre-aprobar con transacción (RF-05, RF-22, RN-01)', () => {
  test('CA-01 RF-05 válido: pre-aprobar s1 cambia s1 a "Pre-aprobada" y Wini a "En pre-adopción" en la misma transacción', async () => {
    const transaccion = conArchivero({ 'solicitudes/s1': S1, 'animales/wini': WINI });

    await expect(preAprobarSolicitud('s1')).resolves.toBe('ok');

    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(transaccion.update.mock.calls).toEqual([
      ['solicitudes/s1', { estado: 'Pre-aprobada', actualizadaEn: 'HORA_DEL_SERVIDOR' }],
      ['animales/wini', { estado: 'En pre-adopción' }],
    ]);
  });

  test('CA-02 RF-05 no válido: con la solicitud ya atendida no escribe nada y devuelve ya-atendida', async () => {
    const transaccion = conArchivero({ 'solicitudes/s4': S4, 'animales/rocky': ROCKY });

    await expect(preAprobarSolicitud('s4')).resolves.toBe('ya-atendida');
    expect(transaccion.update).not.toHaveBeenCalled();
  });

  test('RN-01: con la solicitud ya atendida no lee el animal', async () => {
    const transaccion = conArchivero({ 'solicitudes/s6': S6, 'animales/luna': WINI });

    await preAprobarSolicitud('s6');

    expect(transaccion.get.mock.calls).toEqual([['solicitudes/s6']]);
  });

  test('CA-06 RF-22 no válido: pre-aprobar s5 con Rocky en pre-adopción no escribe nada y devuelve preadopcion-en-curso', async () => {
    const transaccion = conArchivero({ 'solicitudes/s5': S5, 'animales/rocky': ROCKY });

    await expect(preAprobarSolicitud('s5')).resolves.toBe('preadopcion-en-curso');
    expect(transaccion.get.mock.calls).toEqual([['solicitudes/s5'], ['animales/rocky']]);
    expect(transaccion.update).not.toHaveBeenCalled();
  });

  test('RNF-02: una solicitud que no existe no se pre-aprueba', async () => {
    const transaccion = conArchivero({});

    await expect(preAprobarSolicitud('nadie')).resolves.toBe('sin-permiso');
    expect(transaccion.update).not.toHaveBeenCalled();
  });
});

describe('F-08 · T-3 · Rechazar con transacción (RF-21)', () => {
  test('CA-03 RF-21 válido: rechazar s2 solo cambia estado y actualizadaEn', async () => {
    const transaccion = conArchivero({ 'solicitudes/s2': S2, 'animales/wini': WINI });

    await expect(rechazarSolicitud('s2')).resolves.toBe('ok');
    expect(transaccion.update.mock.calls).toEqual([
      ['solicitudes/s2', { estado: 'Rechazada', actualizadaEn: 'HORA_DEL_SERVIDOR' }],
    ]);
    expect(transaccion.get.mock.calls).toEqual([['solicitudes/s2']]);
  });

  test('CA-05 RF-22 válido: con Rocky en pre-adopción, s5 sí se puede rechazar', async () => {
    const transaccion = conArchivero({ 'solicitudes/s5': S5, 'animales/rocky': ROCKY });

    await expect(rechazarSolicitud('s5')).resolves.toBe('ok');
    expect(transaccion.update).toHaveBeenCalledTimes(1);
  });

  test('CA-04 RF-21 no válido: rechazar una solicitud ya atendida no escribe nada', async () => {
    const transaccion = conArchivero({ 'solicitudes/s6': S6 });

    await expect(rechazarSolicitud('s6')).resolves.toBe('ya-atendida');
    expect(transaccion.update).not.toHaveBeenCalled();
  });
});

describe('F-08 · T-3 · Sin conexión y sin permiso al decidir (A5, A7)', () => {
  test('CA-12: si la transacción no responde en 10 s, el resultado es sin-conexion', async () => {
    jest.useFakeTimers();
    runTransaction.mockReturnValue(new Promise(jest.fn()));

    const decisiones = Promise.all([preAprobarSolicitud('s1'), rechazarSolicitud('s2')]);
    jest.advanceTimersByTime(ESPERA_ESCRITURA_MS);

    await expect(decisiones).resolves.toEqual(['sin-conexion', 'sin-conexion']);
    jest.useRealTimers();
  });

  test('CA-12: si la transacción falla por la red, el resultado es sin-conexion', async () => {
    runTransaction.mockRejectedValue(new FirebaseError('unavailable'));

    await expect(preAprobarSolicitud('s1')).resolves.toBe('sin-conexion');
    await expect(rechazarSolicitud('s2')).resolves.toBe('sin-conexion');
  });

  test('A7 RNF-02: permission-denied da sin-permiso', async () => {
    runTransaction.mockRejectedValue(new FirebaseError('permission-denied'));

    await expect(preAprobarSolicitud('s1')).resolves.toBe('sin-permiso');
    await expect(rechazarSolicitud('s2')).resolves.toBe('sin-permiso');
  });
});

describe('F-08 · T-3 · Lecturas del Detalle (RF-12, G-11)', () => {
  test('CA-07 RF-12 válido: leerContacto lee solicitudes/s4/privado/contacto del servidor', async () => {
    leerDelServidor.mockResolvedValue({
      id: 'contacto',
      data: () => ({ telefono: '6460000001', correo: 'ana.torres@example.com' }),
    } as never);

    await expect(leerContacto('s4')).resolves.toEqual({
      estado: 'ok',
      contacto: { telefono: '6460000001', correo: 'ana.torres@example.com' },
    });
    expect(leerDelServidor).toHaveBeenCalledWith('solicitudes/s4/privado/contacto');
  });

  test('CA-08 RF-12 no válido: si las reglas niegan el contacto, el resultado es sin-permiso', async () => {
    leerDelServidor.mockRejectedValue(new FirebaseError('permission-denied'));

    await expect(leerContacto('s2')).resolves.toEqual({ estado: 'sin-permiso' });
  });

  test('CA-11: leerSolicitud de una solicitud ajena da sin-permiso y la de un ID inexistente, no-existe', async () => {
    leerDelServidor.mockRejectedValueOnce(new FirebaseError('permission-denied'));
    await expect(leerSolicitud('ajena')).resolves.toEqual({ estado: 'sin-permiso' });

    leerDelServidor.mockResolvedValueOnce({ id: 'nadie', data: () => undefined } as never);
    await expect(leerSolicitud('nadie')).resolves.toEqual({ estado: 'no-existe' });
  });

  test('Detalle: leerSolicitud lee del servidor y devuelve la solicitud con su id', async () => {
    leerDelServidor.mockResolvedValue({ id: 's1', data: () => S1 } as never);

    await expect(leerSolicitud('s1')).resolves.toEqual({
      estado: 'ok',
      solicitud: { ...S1, id: 's1' },
    });
    expect(leerDelServidor).toHaveBeenCalledWith('solicitudes/s1');
  });

  test('A5: si una lectura del Detalle no responde en 10 s, el resultado es sin-conexion', async () => {
    jest.useFakeTimers();
    leerDelServidor.mockReturnValue(new Promise(jest.fn()) as never);

    const lecturas = Promise.all([leerSolicitud('s1'), leerContacto('s4')]);
    jest.advanceTimersByTime(ESPERA_ESCRITURA_MS);

    await expect(lecturas).resolves.toEqual([
      { estado: 'sin-conexion' },
      { estado: 'sin-conexion' },
    ]);
    jest.useRealTimers();
  });
});
