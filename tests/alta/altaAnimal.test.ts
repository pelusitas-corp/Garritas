// Pruebas de publicar el animal (F-02 CA-01, CA-03, CA-05, CA-10; RN-04, A9, A10).
// Firestore se reemplaza por "dobles" (jest.mock): no se escribe nada real.
// El nombre de cada prueba es su criterio de aceptación.
import { getDoc, getDocFromServer, writeBatch } from 'firebase/firestore';

import type { AnimalParaPublicar } from '../../src/firebase/altaAnimal';
import { idFoto, nuevoIdAnimal, publicarAnimal } from '../../src/firebase/altaAnimal';
import { ESPERA_ESCRITURA_MS } from '../../src/firebase/acceso';

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

jest.mock('firebase/firestore', () => ({
  collection: (_db: unknown, nombre: string) => nombre,
  // doc(colección) → ID nuevo; doc(db o ruta, ...partes) → ruta "a/b/c".
  doc: (base: unknown, ...partes: string[]) =>
    partes.length === 0
      ? { id: 'animal-nuevo' }
      : [typeof base === 'string' ? base : '', ...partes].filter(Boolean).join('/'),
  getDoc: jest.fn(),
  getDocFromServer: jest.fn(),
  serverTimestamp: () => 'HORA_DEL_SERVIDOR',
  Timestamp: { fromDate: (fecha: Date) => fecha },
  setDoc: jest.fn(),
  writeBatch: jest.fn(),
}));

const { FirebaseError } = jest.requireMock<{
  FirebaseError: new (code: string) => Error;
}>('firebase/app');

const PERFIL_WINI = {
  energia: 'media',
  espacio: 'casa',
  tiempo: 'unasHoras',
  experiencia: 'facil',
  convivencia: 'conNinosYMascotas',
  temperamento: 'sociable',
} as const;

/** CA-01: Max, Perro, "1 a 3 años", "Mediano", vacunado, 1 foto. */
const MAX: AnimalParaPublicar = {
  nombre: 'Max',
  especie: 'perro',
  edad: '1 a 3 años',
  tamano: 'Mediano',
  vacunado: true,
  esterilizado: false,
  perfilCompatibilidad: PERFIL_WINI,
  fotos: [{ datos: 'data:image/jpeg;base64,FOTO0', orden: 0 }],
  miniatura: 'data:image/jpeg;base64,MINI',
};

const lote = { set: jest.fn(), commit: jest.fn() };
const leerUsuario = jest.mocked(getDoc);
const leerDelServidor = jest.mocked(getDocFromServer);
const crearLote = jest.mocked(writeBatch);

/** Documento falso con `exists()` y `get(campo)`. */
function documento(datos: Record<string, unknown> | null) {
  return {
    exists: () => datos !== null,
    get: (campo: string) => (datos ? datos[campo] : undefined),
  } as never;
}

/** Lo que se escribió en una ruta dentro del lote. */
function escrito(ruta: string): unknown {
  const llamada = lote.set.mock.calls.find(([destino]) => destino === ruta);
  return llamada?.[1];
}

beforeEach(() => {
  jest.resetAllMocks();
  crearLote.mockReturnValue(lote as never);
  leerUsuario.mockResolvedValue(documento({ nombre: 'Refugio Patitas', rol: 'albergue' }));
  lote.commit.mockResolvedValue(undefined);
});

describe('CA-01 · RF-01 válido', () => {
  test('RF-01 válido: guarda la ficha de Max con estado "Disponible", albergueId y nombreAlbergue "Refugio Patitas"', async () => {
    await expect(publicarAnimal('animal-max', MAX)).resolves.toBe('ok');

    expect(escrito('animales/animal-max')).toEqual({
      albergueId: 'refugio-patitas',
      nombreAlbergue: 'Refugio Patitas',
      nombre: 'Max',
      especie: 'perro',
      edad: '1 a 3 años',
      tamano: 'Mediano',
      vacunado: true,
      esterilizado: false,
      perfilCompatibilidad: PERFIL_WINI,
      miniatura: 'data:image/jpeg;base64,MINI',
      estado: 'Disponible',
      creadoEn: 'HORA_DEL_SERVIDOR',
    });
  });

  test('AL-8: el ID del animal se genera en el teléfono, una vez por formulario', () => {
    expect(nuevoIdAnimal()).toBe('animal-nuevo');
  });
});

describe('CA-03 · RF-13 válido y CA-05 · RF-14 válido', () => {
  test('RF-13 válido: guarda la foto en fotos/foto-0 con orden 0 y la miniatura en la ficha', async () => {
    await publicarAnimal('animal-max', MAX);

    expect(escrito('animales/animal-max/fotos/foto-0')).toEqual({
      datos: 'data:image/jpeg;base64,FOTO0',
      orden: 0,
    });
    expect(escrito('animales/animal-max')).toMatchObject({
      miniatura: 'data:image/jpeg;base64,MINI',
    });
  });

  test('RF-14 válido: guarda el perfil de Wini en la misma operación que la ficha', async () => {
    await publicarAnimal('animal-wini', MAX);

    expect(escrito('animales/animal-wini')).toMatchObject({ perfilCompatibilidad: PERFIL_WINI });
    expect(lote.commit).toHaveBeenCalledTimes(1);
  });

  test('RN-04 · AL-13: la ficha y sus 3 fotos (foto-0 a foto-2) van en un solo writeBatch', async () => {
    const conTres = {
      ...MAX,
      fotos: [0, 1, 2].map((orden) => ({ datos: `F${orden}`, orden })),
    };
    await publicarAnimal('animal-max', conTres);

    expect(crearLote).toHaveBeenCalledTimes(1);
    expect(lote.set).toHaveBeenCalledTimes(4);
    expect(lote.commit).toHaveBeenCalledTimes(1);
    expect([0, 1, 2].map(idFoto)).toEqual(['foto-0', 'foto-1', 'foto-2']);
    expect(escrito('animales/animal-max/fotos/foto-2')).toEqual({ datos: 'F2', orden: 2 });
  });
});

describe('CA-10 · Sin conexión al publicar (AL-8)', () => {
  test('AL-8: si Firestore no confirma en 10 s devuelve sin conexión', async () => {
    jest.useFakeTimers();
    lote.commit.mockReturnValue(
      new Promise(() => {
        // Nunca termina: así se comporta Firestore sin internet.
      }),
    );

    const resultado = publicarAnimal('animal-max', MAX);
    await jest.advanceTimersByTimeAsync(ESPERA_ESCRITURA_MS);

    await expect(resultado).resolves.toBe('sin-conexion');
    jest.useRealTimers();
  });

  test('AL-8: si Firestore responde unavailable devuelve sin conexión', async () => {
    lote.commit.mockRejectedValue(new FirebaseError('unavailable'));
    await expect(publicarAnimal('animal-max', MAX)).resolves.toBe('sin-conexion');
  });

  test('Q3: cualquier otro error devuelve sin conexión', async () => {
    lote.commit.mockRejectedValue(new FirebaseError('internal'));
    await expect(publicarAnimal('animal-max', MAX)).resolves.toBe('sin-conexion');
  });
});

describe('A9 y A10 · Rechazo de las reglas', () => {
  test('A9 · AL-8: al reintentar con la misma ficha ya creada por este albergue cuenta como publicada', async () => {
    lote.commit.mockRejectedValue(new FirebaseError('permission-denied'));
    leerDelServidor.mockResolvedValue(documento({ albergueId: 'refugio-patitas' }));

    await expect(publicarAnimal('animal-max', MAX)).resolves.toBe('ok');
    expect(leerDelServidor).toHaveBeenCalledWith('animales/animal-max');
  });

  test('A10 · RNF-02: si las reglas rechazan y la ficha no existe devuelve sin permiso', async () => {
    lote.commit.mockRejectedValue(new FirebaseError('permission-denied'));
    leerDelServidor.mockResolvedValue(documento(null));

    await expect(publicarAnimal('animal-max', MAX)).resolves.toBe('sin-permiso');
  });

  test('A10 · RNF-02: si la ficha existe pero es de otro albergue devuelve sin permiso', async () => {
    lote.commit.mockRejectedValue(new FirebaseError('permission-denied'));
    leerDelServidor.mockResolvedValue(documento({ albergueId: 'otro-albergue' }));

    await expect(publicarAnimal('animal-max', MAX)).resolves.toBe('sin-permiso');
  });
});
