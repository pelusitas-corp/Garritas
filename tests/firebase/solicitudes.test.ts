// Pruebas de las solicitudes del adoptante en Firestore (spec F-06 T-4:
// RF-11, RF-27, RNF-02; MS-4, MS-6; A5, A6). Firebase se reemplaza por
// "dobles" (jest.mock), como en tests/alta/altaAnimal.test.ts: no se lee ni
// se escribe nada real.
//
// `writeBatch` devuelve un lote de mentira: su `set` anota en qué ruta se
// pidió escribir y qué, y su `commit` responde lo que diga cada prueba.
// El nombre de cada prueba es su criterio de aceptación.
import { getDocFromServer, getDocsFromServer, writeBatch } from 'firebase/firestore';

import type { SolicitudNueva } from '../../src/adoptante/match/match';
import { ESPERA_ESCRITURA_MS } from '../../src/firebase/acceso';
import { ESPERA_GUARDAR_MS } from '../../src/firebase/cuestionario';
import {
  enviarSolicitud,
  leerCuentaAdoptante,
  leerMisSolicitudes,
} from '../../src/firebase/solicitudes';

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

/** Referencia falsa: un ID y su ruta "a/b/c". */
interface ReferenciaFalsa {
  id: string;
  ruta: string;
}

jest.mock('firebase/firestore', () => ({
  collection: (_db: unknown, ...ruta: string[]) => ruta.join('/'),
  // doc(colección) → ID nuevo; doc(db, ...partes) o doc(referencia, ...partes) → ruta.
  doc: (base: unknown, ...partes: string[]) => {
    if (partes.length === 0) {
      return { id: 'solicitud-nueva', ruta: `${String(base)}/solicitud-nueva` };
    }
    const inicio = typeof base === 'object' && base && 'ruta' in base ? [String(base.ruta)] : [];
    return { id: partes[partes.length - 1], ruta: [...inicio, ...partes].join('/') };
  },
  getDocFromServer: jest.fn(),
  getDocsFromServer: jest.fn(),
  query: (coleccion: string, filtro: string) => `${coleccion}?${filtro}`,
  serverTimestamp: () => 'HORA_DEL_SERVIDOR',
  where: (campo: string, operador: string, valor: string) => `${campo} ${operador} ${valor}`,
  writeBatch: jest.fn(),
}));

const { FirebaseError } = jest.requireMock<{
  FirebaseError: new (code: string) => Error;
}>('firebase/app');

const leerDocumento = jest.mocked(getDocFromServer);
const leerConsulta = jest.mocked(getDocsFromServer);
const crearLote = jest.mocked(writeBatch);

const lote = {
  set: jest.fn<void, [ReferenciaFalsa, Record<string, unknown>]>(),
  commit: jest.fn<Promise<void>, []>(),
};

/** Lo que se escribió en una ruta dentro del lote. */
function escrito(ruta: string): unknown {
  return lote.set.mock.calls.find(([destino]) => destino.ruta === ruta)?.[1];
}

/** Solicitud de Ana a Wini como la arma `armarSolicitud`. */
const SOLICITUD_ANA: SolicitudNueva = {
  animalId: 'wini',
  albergueId: 'refugio-patitas',
  adoptanteId: 'adoptante-a',
  nombreAdoptante: 'Ana Torres',
  nombreAnimal: 'Wini',
  nombreAlbergue: 'Refugio Patitas',
  miniaturaAnimal: 'data:image/jpeg;base64,wini',
  porcentaje: 90,
  noApto: false,
  resumenHogar: { p2: 'casa', p12: 'menosDe4', p19: 'yaHeTenido' },
  estado: 'Pendiente',
};

const CONTACTO_ANA = { telefono: '6460000001', correo: 'ana.torres@example.com' };

beforeEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
  crearLote.mockReturnValue(lote as never);
  lote.commit.mockResolvedValue(undefined);
});

describe('enviarSolicitud (flujo B, MS-4)', () => {
  test('RF-11 válido: enviarSolicitud escribe la solicitud y privado/contacto en un solo writeBatch', async () => {
    await expect(enviarSolicitud(SOLICITUD_ANA, CONTACTO_ANA)).resolves.toEqual({
      estado: 'ok',
      solicitudId: 'solicitud-nueva',
    });
    expect(crearLote).toHaveBeenCalledTimes(1);
    expect(lote.set).toHaveBeenCalledTimes(2);
    expect(lote.set.mock.calls.map(([destino]) => destino.ruta)).toEqual([
      'solicitudes/solicitud-nueva',
      'solicitudes/solicitud-nueva/privado/contacto',
    ]);
    expect(lote.commit).toHaveBeenCalledTimes(1);
  });

  test('RF-11 válido: la solicitud va "Pendiente" con creadaEn y actualizadaEn = hora del servidor', async () => {
    await enviarSolicitud(SOLICITUD_ANA, CONTACTO_ANA);
    expect(escrito('solicitudes/solicitud-nueva')).toEqual({
      ...SOLICITUD_ANA,
      estado: 'Pendiente',
      creadaEn: 'HORA_DEL_SERVIDOR',
      actualizadaEn: 'HORA_DEL_SERVIDOR',
    });
  });

  test('RF-12: el contacto lleva solo el teléfono y el correo de la cuenta', async () => {
    await enviarSolicitud(SOLICITUD_ANA, CONTACTO_ANA);
    expect(escrito('solicitudes/solicitud-nueva/privado/contacto')).toEqual(CONTACTO_ANA);
  });

  test('CA-09: si el lote no responde en 10 s devuelve sin-conexion', async () => {
    jest.useFakeTimers();
    lote.commit.mockReturnValue(new Promise<void>(() => {}));
    const envio = enviarSolicitud(SOLICITUD_ANA, CONTACTO_ANA);
    jest.advanceTimersByTime(ESPERA_ESCRITURA_MS);
    await expect(envio).resolves.toEqual({ estado: 'sin-conexion' });
  });

  test('CA-09: si falla la red devuelve sin-conexion', async () => {
    lote.commit.mockRejectedValue(new FirebaseError('unavailable'));
    await expect(enviarSolicitud(SOLICITUD_ANA, CONTACTO_ANA)).resolves.toEqual({
      estado: 'sin-conexion',
    });
  });

  test('RNF-02: si las reglas rechazan el lote devuelve sin-permiso', async () => {
    lote.commit.mockRejectedValue(new FirebaseError('permission-denied'));
    await expect(enviarSolicitud(SOLICITUD_ANA, CONTACTO_ANA)).resolves.toEqual({
      estado: 'sin-permiso',
    });
  });
});

describe('leerMisSolicitudes (flujo D, MS-6)', () => {
  test('RF-27: consulta del servidor las solicitudes donde adoptanteId == uid', async () => {
    leerConsulta.mockResolvedValue({
      docs: [{ id: 's1', data: () => ({ animalId: 'wini', estado: 'Pendiente' }) }],
    } as never);
    await expect(leerMisSolicitudes('adoptante-a')).resolves.toEqual({
      estado: 'ok',
      solicitudes: [{ animalId: 'wini', estado: 'Pendiente', id: 's1' }],
    });
    expect(leerConsulta).toHaveBeenCalledWith('solicitudes?adoptanteId == adoptante-a');
  });

  test('CA-09: si la consulta no responde en 10 s devuelve sin-conexion', async () => {
    jest.useFakeTimers();
    leerConsulta.mockReturnValue(new Promise(() => {}));
    const lectura = leerMisSolicitudes('adoptante-a');
    jest.advanceTimersByTime(ESPERA_GUARDAR_MS);
    await expect(lectura).resolves.toEqual({ estado: 'sin-conexion' });
  });

  test('RNF-02: si las reglas rechazan la consulta devuelve sin-permiso', async () => {
    leerConsulta.mockRejectedValue(new FirebaseError('permission-denied'));
    await expect(leerMisSolicitudes('adoptante-a')).resolves.toEqual({ estado: 'sin-permiso' });
  });
});

describe('leerCuentaAdoptante (flujo B, paso 4)', () => {
  test('RF-11: devuelve el nombre, el teléfono y el correo leídos del servidor', async () => {
    leerDocumento.mockResolvedValue({
      data: () => ({
        rol: 'adoptante',
        nombre: 'Ana Torres',
        telefono: '6460000001',
        correo: 'ana.torres@example.com',
      }),
    } as never);
    await expect(leerCuentaAdoptante('adoptante-a')).resolves.toEqual({
      estado: 'ok',
      cuenta: { nombre: 'Ana Torres', ...CONTACTO_ANA },
    });
    expect(leerDocumento).toHaveBeenCalledWith(
      expect.objectContaining({ ruta: 'usuarios/adoptante-a' }),
    );
  });

  test('G-4: sin documento en usuarios devuelve sin-permiso', async () => {
    leerDocumento.mockResolvedValue({ data: () => undefined } as never);
    await expect(leerCuentaAdoptante('adoptante-a')).resolves.toEqual({ estado: 'sin-permiso' });
  });

  test('CA-09: sin conexión devuelve sin-conexion', async () => {
    leerDocumento.mockRejectedValue(new FirebaseError('unavailable'));
    await expect(leerCuentaAdoptante('adoptante-a')).resolves.toEqual({ estado: 'sin-conexion' });
  });
});
