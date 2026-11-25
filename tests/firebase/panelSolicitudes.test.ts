// Pruebas de las lecturas del panel de solicitudes (spec F-07 T-3: RF-04,
// RNF-02; 03-modelo-datos §7.1; A4, A5). Firebase se reemplaza por "dobles"
// (jest.mock), como en tests/firebase/animales.test.ts: no se lee nada real.
// El nombre de cada prueba es su criterio de aceptación.
import {
  addDoc,
  getDocs,
  getDocsFromServer,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import { ESPERA_GUARDAR_MS } from '../../src/firebase/cuestionario';
import {
  leerMisAnimales,
  leerSolicitudesDeAnimal,
  leerSolicitudesDelAlbergue,
  uidDelAlbergue,
} from '../../src/firebase/panelSolicitudes';

jest.mock('../../src/firebase/config', () => ({
  auth: { currentUser: { uid: 'refugio-patitas' } },
  db: { nombre: 'db' },
}));

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

// Las consultas se vuelven texto ("coleccion?filtro&filtro") para ver qué se pidió.
jest.mock('firebase/firestore', () => ({
  collection: (_db: unknown, ...ruta: string[]) => ruta.join('/'),
  query: (coleccion: string, ...filtros: string[]) => `${coleccion}?${filtros.join('&')}`,
  where: (campo: string, operador: string, valor: string) => `${campo} ${operador} ${valor}`,
  getDocs: jest.fn(),
  getDocsFromServer: jest.fn(),
  // Escrituras: existen solo para comprobar que F-07 nunca las usa.
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  writeBatch: jest.fn(),
}));

const { FirebaseError } = jest.requireMock<{
  FirebaseError: new (code: string) => Error;
}>('firebase/app');

const leerDelServidor = jest.mocked(getDocsFromServer);

/** Documento de Firestore de mentira. */
function documento(id: string, datos: Record<string, unknown>) {
  return { id, data: () => datos };
}

const S1 = { animalId: 'wini', albergueId: 'refugio-patitas', porcentaje: 90, noApto: false };
const S2 = { animalId: 'wini', albergueId: 'refugio-patitas', porcentaje: 70, noApto: false };
const WINI = { nombre: 'Wini', albergueId: 'refugio-patitas' };

beforeEach(() => {
  jest.resetAllMocks();
});

describe('F-07 · T-3 · Consultas de 03 §7.1', () => {
  test('CA-05: leerMisAnimales consulta animales donde albergueId == uid', async () => {
    leerDelServidor.mockResolvedValue({ docs: [documento('wini', WINI)] } as never);

    const lectura = await leerMisAnimales('refugio-patitas');

    expect(leerDelServidor).toHaveBeenCalledWith('animales?albergueId == refugio-patitas');
    expect(lectura).toEqual({ estado: 'ok', animales: [{ ...WINI, id: 'wini' }] });
  });

  test('CA-05: leerSolicitudesDelAlbergue consulta solicitudes donde albergueId == uid', async () => {
    leerDelServidor.mockResolvedValue({ docs: [] } as never);

    await expect(leerSolicitudesDelAlbergue('refugio-patitas')).resolves.toEqual({
      estado: 'ok',
      solicitudes: [],
    });
    expect(leerDelServidor).toHaveBeenCalledWith('solicitudes?albergueId == refugio-patitas');
  });

  test('CA-01: leerSolicitudesDeAnimal consulta albergueId == uid y animalId == wini', async () => {
    leerDelServidor.mockResolvedValue({ docs: [] } as never);

    await leerSolicitudesDeAnimal('refugio-patitas', 'wini');

    expect(leerDelServidor).toHaveBeenCalledWith(
      'solicitudes?albergueId == refugio-patitas&animalId == wini',
    );
  });

  test('CA-01: cada solicitud llega con su id', async () => {
    leerDelServidor.mockResolvedValue({
      docs: [documento('s1', S1), documento('s2', S2)],
    } as never);

    await expect(leerSolicitudesDeAnimal('refugio-patitas', 'wini')).resolves.toEqual({
      estado: 'ok',
      solicitudes: [
        { ...S1, id: 's1' },
        { ...S2, id: 's2' },
      ],
    });
  });

  test('CA-08: las lecturas preguntan al servidor y no a la copia del teléfono (PS-6)', async () => {
    leerDelServidor.mockResolvedValue({ docs: [] } as never);

    await leerMisAnimales('refugio-patitas');
    await leerSolicitudesDelAlbergue('refugio-patitas');
    await leerSolicitudesDeAnimal('refugio-patitas', 'wini');

    expect(leerDelServidor).toHaveBeenCalledTimes(3);
    expect(getDocs).not.toHaveBeenCalled();
  });
});

describe('F-07 · T-3 · Sin conexión y sin permiso (A4, A5)', () => {
  test('CA-08: si una lectura no responde en 10 s, el resultado es sin-conexion', async () => {
    jest.useFakeTimers();
    leerDelServidor.mockReturnValue(new Promise(jest.fn()) as never);

    const lecturas = Promise.all([
      leerMisAnimales('refugio-patitas'),
      leerSolicitudesDelAlbergue('refugio-patitas'),
      leerSolicitudesDeAnimal('refugio-patitas', 'wini'),
    ]);
    jest.advanceTimersByTime(ESPERA_GUARDAR_MS);

    await expect(lecturas).resolves.toEqual([
      { estado: 'sin-conexion' },
      { estado: 'sin-conexion' },
      { estado: 'sin-conexion' },
    ]);
    jest.useRealTimers();
  });

  test('CA-08: si una lectura falla por la red, el resultado es sin-conexion', async () => {
    leerDelServidor.mockRejectedValue(new FirebaseError('unavailable'));

    await expect(leerMisAnimales('refugio-patitas')).resolves.toEqual({ estado: 'sin-conexion' });
    await expect(leerSolicitudesDeAnimal('refugio-patitas', 'wini')).resolves.toEqual({
      estado: 'sin-conexion',
    });
  });

  test('A5 RNF-02: si las reglas rechazan la consulta, el resultado es sin-permiso', async () => {
    leerDelServidor.mockRejectedValue(new FirebaseError('permission-denied'));

    await expect(leerSolicitudesDelAlbergue('refugio-patitas')).resolves.toEqual({
      estado: 'sin-permiso',
    });
    await expect(leerSolicitudesDeAnimal('refugio-patitas', 'wini')).resolves.toEqual({
      estado: 'sin-permiso',
    });
  });

  test('F-07 solo lee: no escribe nada en Firestore', async () => {
    leerDelServidor.mockResolvedValue({ docs: [documento('s1', S1)] } as never);

    await leerMisAnimales('refugio-patitas');
    await leerSolicitudesDelAlbergue('refugio-patitas');
    await leerSolicitudesDeAnimal('refugio-patitas', 'wini');

    [addDoc, setDoc, updateDoc, writeBatch].forEach((escritura) => {
      expect(escritura).not.toHaveBeenCalled();
    });
  });

  test('uidDelAlbergue devuelve el uid de la sesión', () => {
    expect(uidDelAlbergue()).toBe('refugio-patitas');
  });
});
