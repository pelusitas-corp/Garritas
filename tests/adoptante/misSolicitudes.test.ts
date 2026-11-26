// Pruebas del orden y los estados de Mis solicitudes (spec F-06 T-3: RF-27,
// MS-7; A5 a A7). El nombre de cada prueba es su criterio de aceptación.
import {
  actualizarConIndicador,
  apoyoDelEstado,
  coloresDelPuntito,
  ordenarMisSolicitudes,
  pantallaMisSolicitudes,
} from '../../src/adoptante/solicitudes/misSolicitudes';
import type { MiSolicitud } from '../../src/adoptante/solicitudes/misSolicitudes';
import TEXTOS_MIS_SOLICITUDES from '../../src/adoptante/solicitudes/textos';
import MENSAJES from '../../src/compartido/mensajes';
import { RUTAS } from '../../src/compartido/navegacion/rutas';

/** Recibe milisegundos. Devuelve una fecha falsa con `toMillis`, como un `Timestamp`. */
const fecha = (ms: number) => ({ toMillis: () => ms });

const reintentar = jest.fn();

describe('ordenarMisSolicitudes (MS-7)', () => {
  test('RF-27 válido: ordenarMisSolicitudes pone primero la de creadaEn más reciente', () => {
    const solicitudes = [
      { id: 's1', creadaEn: fecha(100) },
      { id: 's4', creadaEn: fecha(300) },
      { id: 's6', creadaEn: fecha(200) },
    ];
    expect(ordenarMisSolicitudes(solicitudes).map((s) => s.id)).toEqual(['s4', 's6', 's1']);
  });

  test('MS-7: no cambia la lista original', () => {
    const solicitudes = [
      { id: 's1', creadaEn: fecha(100) },
      { id: 's4', creadaEn: fecha(300) },
    ];
    ordenarMisSolicitudes(solicitudes);
    expect(solicitudes.map((s) => s.id)).toEqual(['s1', 's4']);
  });
});

describe('pantallaMisSolicitudes (flujo D, A5 a A7)', () => {
  test('RF-27 válido: con solicitudes dibuja las tarjetas', () => {
    const solicitudes = [{ id: 's1' } as MiSolicitud];
    expect(pantallaMisSolicitudes({ tipo: 'con-datos', solicitudes }, reintentar)).toBeNull();
  });

  test('RF-27 no válido: sin solicitudes muestra "Aún no has enviado solicitudes. Encuentra a tu match en Descubrir"', () => {
    expect(pantallaMisSolicitudes({ tipo: 'con-datos', solicitudes: [] }, reintentar)).toEqual({
      estado: 'vacia',
      mensaje: MENSAJES.SIN_SOLICITUDES_ADOPTANTE,
    });
  });

  test('CA-09: sin conexión muestra "Error de conexión, verifica tu conexión a internet" con Reintentar', () => {
    const props = pantallaMisSolicitudes({ tipo: 'error' }, reintentar);
    expect(props?.estado).toBe('error');
    expect(props?.mensaje).toBe(MENSAJES.ERROR_CONEXION);
    expect(props?.boton?.texto).toBe('Reintentar');
    props?.boton?.alPresionar();
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  test('RNF-02: si las reglas rechazan la lectura muestra "No tienes permiso para ver esta sección"', () => {
    expect(pantallaMisSolicitudes({ tipo: 'sin-permiso' }, reintentar)).toEqual({
      estado: 'sin-permiso',
      mensaje: MENSAJES.SIN_PERMISO,
    });
  });

  test('02 §7: mientras carga solo se ve el indicador', () => {
    expect(pantallaMisSolicitudes({ tipo: 'cargando' }, reintentar)).toEqual({
      estado: 'cargando',
    });
  });
});

describe('apoyoDelEstado (Figma, PO-21)', () => {
  test('RF-27: "El albergue te contactará para conocerse." solo aparece con "Pre-aprobada"', () => {
    expect(apoyoDelEstado('Pre-aprobada')).toBe(TEXTOS_MIS_SOLICITUDES.teContactara);
    expect(TEXTOS_MIS_SOLICITUDES.teContactara).toBe('El albergue te contactará para conocerse.');
  });

  test.each(['Pendiente', 'Rechazada'] as const)(
    'RF-27: con "%s" no hay texto debajo',
    (estado) => {
      expect(apoyoDelEstado(estado)).toBeNull();
    },
  );
});

describe('F-13 · CA-02 · AF-3 (decisión del equipo, no está en el SRS)', () => {
  test('CA-02 · AF-3: en Mis solicitudes el estado es texto con puntito', () => {
    expect(coloresDelPuntito('Pendiente')).toEqual({ relleno: 'crema', borde: 'azulMarino' });
    expect(coloresDelPuntito('Pre-aprobada')).toEqual({ relleno: 'menta', borde: 'azulMarino' });
    expect(coloresDelPuntito('Rechazada')).toEqual({ relleno: 'cafe', borde: 'cafe' });
  });

  test('CA-02 · AF-3: "Descubrir más animales" lleva a Descubrir', () => {
    expect(TEXTOS_MIS_SOLICITUDES.descubrirMas).toBe('Descubrir más animales');
    expect(TEXTOS_MIS_SOLICITUDES.subtitulo).toBe('Aquí ves cómo van tus solicitudes.');
    expect(RUTAS.descubrir).toBe('/descubrir');
  });

  test('CA-02 · AF-3: al deslizar hacia abajo se ve el indicador y la lista se actualiza', async () => {
    const marcar = jest.fn();
    const leer = jest.fn(async () => {
      expect(marcar).toHaveBeenLastCalledWith(true); // El indicador está prendido mientras lee.
    });
    await actualizarConIndicador(marcar, leer);
    expect(leer).toHaveBeenCalledTimes(1);
    expect(marcar.mock.calls).toEqual([[true], [false]]);
  });

  test('CA-02 · AF-3 no válido: si la lectura falla, el indicador se apaga igual', async () => {
    const marcar = jest.fn();
    const leer = jest.fn(async () => {
      throw new Error('sin conexión');
    });
    await expect(actualizarConIndicador(marcar, leer)).rejects.toThrow('sin conexión');
    expect(marcar.mock.calls).toEqual([[true], [false]]);
  });
});
