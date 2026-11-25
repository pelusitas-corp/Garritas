// Pruebas de las lecturas de animales y fotos (spec F-03 T-2: RF-10, RF-28, RNF-02, RN-08).
// Firebase se reemplaza por "dobles" (jest.mock): no se lee nada real.
// El nombre de cada prueba es su criterio de aceptación.
import { getDoc, getDocs } from 'firebase/firestore';

import { ESPERA_GUARDAR_MS } from '../../src/firebase/cuestionario';
import {
  leerAnimal,
  leerAnimalesDisponibles,
  leerFotos,
  ordenarFotos,
} from '../../src/firebase/animales';

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

jest.mock('firebase/auth', () => ({}));

jest.mock('firebase/firestore', () => ({
  collection: (_db: unknown, ...ruta: string[]) => ruta.join('/'),
  doc: (_db: unknown, ...ruta: string[]) => ruta.join('/'),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: (coleccion: string, filtro: string) => `${coleccion}?${filtro}`,
  where: (campo: string, operador: string, valor: string) => `${campo} ${operador} ${valor}`,
}));

const { FirebaseError } = jest.requireMock<{
  FirebaseError: new (code: string) => Error;
}>('firebase/app');

const leerDocumento = jest.mocked(getDoc);
const leerDocumentos = jest.mocked(getDocs);

/** Documento de Firestore de mentira. */
function documento(id: string, datos: Record<string, unknown>) {
  return { id, data: () => datos };
}

const WINI = { nombre: 'Wini', especie: 'perro', estado: 'Disponible' };

beforeEach(() => {
  jest.resetAllMocks();
});

describe('F-03 · T-2 · Lecturas de Descubrir (RF-10)', () => {
  test('RF-10 válido: consulta solo animales con estado == Disponible y devuelve su id', async () => {
    leerDocumentos.mockResolvedValue({ docs: [documento('wini', WINI)] } as never);

    const lectura = await leerAnimalesDisponibles();

    expect(leerDocumentos).toHaveBeenCalledWith('animales?estado == Disponible');
    expect(lectura).toEqual({ estado: 'ok', animales: [{ ...WINI, id: 'wini' }] });
  });

  test('RF-10 no válido: si la lectura falla por la red, el resultado es sin-conexion', async () => {
    leerDocumentos.mockRejectedValue(new FirebaseError('unavailable'));

    await expect(leerAnimalesDisponibles()).resolves.toEqual({ estado: 'sin-conexion' });
  });

  test('RF-10 no válido: si la lectura no responde en 10 s, el resultado es sin-conexion (RN-08)', async () => {
    jest.useFakeTimers();
    leerDocumentos.mockReturnValue(new Promise(jest.fn()) as never);

    const lectura = leerAnimalesDisponibles();
    jest.advanceTimersByTime(ESPERA_GUARDAR_MS);

    await expect(lectura).resolves.toEqual({ estado: 'sin-conexion' });
    jest.useRealTimers();
  });

  test('RNF-02: si las reglas rechazan la lectura, el resultado es sin-permiso', async () => {
    leerDocumentos.mockRejectedValue(new FirebaseError('permission-denied'));

    await expect(leerAnimalesDisponibles()).resolves.toEqual({ estado: 'sin-permiso' });
  });
});

describe('F-03 · T-2 · Lecturas del Detalle (RF-28)', () => {
  test('RF-28 válido: lee animales/{animalId} y devuelve la ficha con su id', async () => {
    leerDocumento.mockResolvedValue(documento('wini', WINI) as never);

    await expect(leerAnimal('wini')).resolves.toEqual({
      estado: 'ok',
      animal: { ...WINI, id: 'wini' },
    });
    expect(leerDocumento).toHaveBeenCalledWith('animales/wini');
  });

  test('RF-28 no válido: un animalId que no existe da no-existe', async () => {
    leerDocumento.mockResolvedValue({ id: 'nadie', data: () => undefined } as never);

    await expect(leerAnimal('nadie')).resolves.toEqual({ estado: 'no-existe' });
  });

  test('RF-28 válido: las fotos llegan ordenadas por orden (RN-07)', async () => {
    leerDocumentos.mockResolvedValue({
      docs: [
        documento('foto-2', { datos: 'c', orden: 2 }),
        documento('foto-0', { datos: 'a', orden: 0 }),
        documento('foto-1', { datos: 'b', orden: 1 }),
      ],
    } as never);

    const lectura = await leerFotos('wini');

    expect(leerDocumentos).toHaveBeenCalledWith('animales/wini/fotos');
    expect(lectura).toEqual({
      estado: 'ok',
      fotos: [
        { datos: 'a', orden: 0 },
        { datos: 'b', orden: 1 },
        { datos: 'c', orden: 2 },
      ],
    });
  });

  test('A5: si fallan las fotos por la red, el resultado es sin-conexion', async () => {
    leerDocumentos.mockRejectedValue(new Error('offline'));

    await expect(leerFotos('wini')).resolves.toEqual({ estado: 'sin-conexion' });
  });

  test('RN-07: ordenarFotos no cambia la lista original', () => {
    const fotos = [
      { datos: 'b', orden: 1 },
      { datos: 'a', orden: 0 },
    ];
    expect(ordenarFotos(fotos).map((foto) => foto.orden)).toEqual([0, 1]);
    expect(fotos[0].orden).toBe(1);
  });
});
