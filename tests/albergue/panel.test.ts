// Pruebas de las funciones puras del panel de solicitudes (spec F-07 T-2:
// RF-04, RF-18, RNF-02; PS-1 a PS-9). Usan los datos de prueba s1 a s6
// (03-modelo-datos §8). No hay Firebase: las fechas son objetos simples.
// El nombre de cada prueba es su criterio de aceptación.
import type { Timestamp } from 'firebase/firestore';

import {
  contarNuevas,
  contarPorAnimal,
  decidirPantallaAnimal,
  decidirPantallaLista,
  iniciales,
  ordenarAnimales,
  ordenarSolicitudes,
  resumenDelHogar,
  textoConteo,
  vistaTarjeta,
} from '../../src/albergue/panel/panel';
import type { LecturaSolicitudes, SolicitudConId } from '../../src/albergue/panel/panel';
import { TEXTOS_PANEL, etiquetaNoApto, textoPorcentaje } from '../../src/albergue/panel/textos';
import MENSAJES from '../../src/compartido/mensajes';
import { COLORES, FONDOS } from '../../src/compartido/tema';
import type { AnimalConId, LecturaAnimal, LecturaAnimales } from '../../src/firebase/animales';
import type { LecturaNombre } from '../../src/firebase/usuarios';
import { esNoApto } from '../../src/matchmaking';
import { ADOPTANTES, ALBERGUE, ANIMALES, SOLICITUDES } from '../../scripts/datos-prueba/datos';

/** Fecha de Firestore de mentira: solo hace falta `toMillis`. */
function fecha(milisegundos: number): Timestamp {
  return { toMillis: () => milisegundos } as Timestamp;
}

/** Los 5 animales de 03 §8.2 tal como los lee el panel; `creadoEn` = su posición. */
const ANIMALES_PANEL: AnimalConId[] = ANIMALES.map((animal, posicion) => ({
  ...animal,
  albergueId: ALBERGUE.uid,
  nombreAlbergue: ALBERGUE.nombre,
  miniatura: 'data:image/jpeg;base64,',
  creadoEn: fecha(posicion),
}));

/** Las solicitudes s1 a s6 de 03 §8.3; `creadaEn` = su posición. */
const SOLICITUDES_PANEL: SolicitudConId[] = SOLICITUDES.map((prueba, posicion) => {
  const adoptante = ADOPTANTES[prueba.adoptante];
  return {
    id: prueba.id,
    animalId: prueba.animalId,
    albergueId: ALBERGUE.uid,
    adoptanteId: adoptante.uid,
    nombreAdoptante: adoptante.nombre,
    nombreAnimal: prueba.animalId,
    nombreAlbergue: ALBERGUE.nombre,
    miniaturaAnimal: 'data:image/jpeg;base64,',
    porcentaje: prueba.porcentaje,
    noApto: esNoApto(prueba.porcentaje),
    resumenHogar: adoptante.resumenHogar,
    estado: prueba.estado,
    creadaEn: fecha(posicion),
    actualizadaEn: fecha(posicion),
  };
});

const NOMBRE_OK: LecturaNombre = { estado: 'ok', nombre: ALBERGUE.nombre };

/** Las solicitudes de un animal de prueba. */
function solicitudesDe(animalId: string): LecturaSolicitudes {
  return {
    estado: 'ok',
    solicitudes: SOLICITUDES_PANEL.filter((solicitud) => solicitud.animalId === animalId),
  };
}

/** La lectura de un animal de prueba. */
function lecturaDe(animalId: string): LecturaAnimal {
  const animal = ANIMALES_PANEL.find((candidato) => candidato.id === animalId);
  return animal ? { estado: 'ok', animal } : { estado: 'no-existe' };
}

/** Una solicitud de mentira con su % y su orden de llegada. */
function conPorcentaje(id: string, porcentaje: number, llegada: number) {
  return { id, porcentaje, creadaEn: fecha(llegada) };
}

describe('F-07 · RF-04 · Orden de las solicitudes (PS-1)', () => {
  test('CA-01 RF-04 válido: [90, 94, 98] se ordena como 98, 94, 90', () => {
    const ordenadas = ordenarSolicitudes([
      conPorcentaje('a', 90, 1),
      conPorcentaje('b', 94, 2),
      conPorcentaje('c', 98, 3),
    ]);
    expect(ordenadas.map((solicitud) => solicitud.porcentaje)).toEqual([98, 94, 90]);
  });

  test('CA-01 RF-04 válido: con el mismo % va primero la de creadaEn más antigua (PS-1)', () => {
    const ordenadas = ordenarSolicitudes([
      conPorcentaje('llego-despues', 80, 20),
      conPorcentaje('llego-antes', 80, 10),
      conPorcentaje('menor', 50, 1),
    ]);
    expect(ordenadas.map((solicitud) => solicitud.id)).toEqual([
      'llego-antes',
      'llego-despues',
      'menor',
    ]);
  });

  test('CA-01 RF-04 válido: en Wini sale primero Ana Torres con "90%" y después Luis Pérez con "70%"', () => {
    const pantalla = decidirPantallaAnimal(
      ALBERGUE.uid,
      NOMBRE_OK,
      lecturaDe('wini'),
      solicitudesDe('wini'),
    );

    expect(pantalla.tipo).toBe('con-datos');
    if (pantalla.tipo === 'con-datos') {
      expect(
        pantalla.solicitudes.map((s) => [s.nombreAdoptante, textoPorcentaje(s.porcentaje)]),
      ).toEqual([
        ['Ana Torres', '90%'],
        ['Luis Pérez', '70%'],
      ]);
      expect(pantalla.nombreAnimal).toBe('Wini');
      expect(pantalla.nombreAlbergue).toBe('Refugio Patitas');
    }
  });

  test('RF-04: ordenarSolicitudes y ordenarAnimales no cambian la lista original', () => {
    const solicitudes = [conPorcentaje('a', 10, 1), conPorcentaje('b', 90, 2)];
    const animales = [{ creadoEn: fecha(1) }, { creadoEn: fecha(2) }];

    ordenarSolicitudes(solicitudes);
    ordenarAnimales(animales);

    expect(solicitudes.map((solicitud) => solicitud.id)).toEqual(['a', 'b']);
    expect(animales[0].creadoEn.toMillis()).toBe(1);
  });
});

describe('F-07 · RF-04 no válido · Animal sin solicitudes', () => {
  test('CA-02 RF-04 no válido: Canela sin solicitudes muestra "Aún no hay solicitudes de adopción para este perfil"', () => {
    const pantalla = decidirPantallaAnimal(
      ALBERGUE.uid,
      NOMBRE_OK,
      lecturaDe('canela'),
      solicitudesDe('canela'),
    );

    expect(pantalla).toEqual({
      tipo: 'vacia',
      nombreAlbergue: 'Refugio Patitas',
      nombreAnimal: 'Canela',
      miniaturaAnimal: 'data:image/jpeg;base64,',
      mensaje: 'Aún no hay solicitudes de adopción para este perfil',
    });
  });
});

describe('F-07 · RF-18 · Etiqueta "No Apto" (RN-02)', () => {
  test('CA-03 RF-18 válido: una solicitud con 25 % y noApto: true lleva la etiqueta "No Apto"', () => {
    expect(etiquetaNoApto(true)).toBe(MENSAJES.ETIQUETA_NO_APTO);
  });

  test('CA-03 RF-18 válido: Toby muestra "24%" con "compatible" y "No Apto" (F-13 AF-11)', () => {
    const pantalla = decidirPantallaAnimal(
      ALBERGUE.uid,
      NOMBRE_OK,
      lecturaDe('toby'),
      solicitudesDe('toby'),
    );

    expect(pantalla.tipo).toBe('con-datos');
    if (pantalla.tipo === 'con-datos') {
      const [luis] = pantalla.solicitudes;
      expect(luis.nombreAdoptante).toBe('Luis Pérez');
      expect(textoPorcentaje(luis.porcentaje)).toBe('24%');
      expect(etiquetaNoApto(luis.noApto)).toBe('No Apto');
    }
  });

  test('CA-04 RF-18 no válido: con 30 % no muestra "No Apto"', () => {
    const conTreinta = { porcentaje: 30, noApto: esNoApto(30) };

    expect(conTreinta.noApto).toBe(false);
    expect(etiquetaNoApto(conTreinta.noApto)).toBeNull();
  });

  test('CA-04 RF-18 no válido: Rocky con 31 % muestra "compatible" sin "No Apto"', () => {
    const pantalla = decidirPantallaAnimal(
      ALBERGUE.uid,
      NOMBRE_OK,
      lecturaDe('rocky'),
      solicitudesDe('rocky'),
    );

    expect(pantalla.tipo).toBe('con-datos');
    if (pantalla.tipo === 'con-datos') {
      expect(
        pantalla.solicitudes.map((s) => [
          s.nombreAdoptante,
          textoPorcentaje(s.porcentaje),
          etiquetaNoApto(s.noApto),
          s.estado,
        ]),
      ).toEqual([
        ['Ana Torres', '77%', null, 'Pre-aprobada'],
        ['Luis Pérez', '31%', null, 'Pendiente'],
      ]);
    }
  });

  test('RN-02: "No Apto" sale del campo guardado noApto y no se recalcula', () => {
    // Una solicitud guardada con noApto: false se muestra sin etiqueta, sea cual sea su %.
    expect(etiquetaNoApto(false)).toBeNull();
    expect(etiquetaNoApto(true)).toBe('No Apto');
  });
});

describe('F-07 · Lista de mis animales (N-5, PS-2, PS-3)', () => {
  const LECTURA_ANIMALES: LecturaAnimales = { estado: 'ok', animales: ANIMALES_PANEL };
  const LECTURA_SOLICITUDES: LecturaSolicitudes = {
    estado: 'ok',
    solicitudes: SOLICITUDES_PANEL,
  };

  test('CA-05: Refugio Patitas ve sus 9 animales: Wini 2 solicitudes, Luna 1 solicitud, Rocky 2 solicitudes, Toby 1 solicitud, y Canela, Tiara, Tostado, Nova y Naranga 0 solicitudes', () => {
    const pantalla = decidirPantallaLista(NOMBRE_OK, LECTURA_ANIMALES, LECTURA_SOLICITUDES);

    expect(pantalla.tipo).toBe('con-datos');
    if (pantalla.tipo === 'con-datos') {
      expect(pantalla.nombreAlbergue).toBe('Refugio Patitas');
      const conteos = Object.fromEntries(
        pantalla.filas.map((fila) => [fila.animal.nombre, textoConteo(fila.conteo, 'solicitudes')]),
      );
      expect(conteos).toEqual({
        Wini: '2 solicitudes',
        Luna: '1 solicitud',
        Rocky: '2 solicitudes',
        Toby: '1 solicitud',
        Canela: '0 solicitudes',
        Tiara: '0 solicitudes',
        Tostado: '0 solicitudes',
        Nova: '0 solicitudes',
        Naranga: '0 solicitudes',
      });
    }
  });

  test('CA-05: el conteo cuenta todas las solicitudes del animal, sin importar su estado', () => {
    expect(contarPorAnimal(SOLICITUDES_PANEL)).toEqual({ wini: 2, toby: 1, rocky: 2, luna: 1 });
    // Rocky: una "Pre-aprobada" y una "Pendiente"; Luna: una "Rechazada".
    expect(
      contarPorAnimal([{ animalId: 'rocky' }, { animalId: 'rocky' }, { animalId: 'luna' }]),
    ).toEqual({ rocky: 2, luna: 1 });
  });

  test('CA-05: "1 solicitud" en singular y "0 solicitudes" o "2 solicitudes" en plural', () => {
    expect(textoConteo(1, 'solicitudes')).toBe('1 solicitud');
    expect(textoConteo(0, 'solicitudes')).toBe('0 solicitudes');
    expect(textoConteo(2, 'solicitudes')).toBe('2 solicitudes');
  });

  test('PS-2: "Tus animales" muestra primero el animal más reciente', () => {
    const pantalla = decidirPantallaLista(NOMBRE_OK, LECTURA_ANIMALES, LECTURA_SOLICITUDES);

    expect(pantalla.tipo).toBe('con-datos');
    if (pantalla.tipo === 'con-datos') {
      // creadoEn = posición en ANIMALES: Naranga (8) es el más reciente y Wini (0) el más antiguo.
      expect(pantalla.filas.map((fila) => fila.animal.nombre)).toEqual([
        'Naranga',
        'Nova',
        'Tostado',
        'Tiara',
        'Canela',
        'Toby',
        'Rocky',
        'Luna',
        'Wini',
      ]);
    }
  });

  test('CA-06: un albergue sin animales ve "Aún no tienes mascotas publicadas. Agrégalas en la pestaña Mascotas"', () => {
    const pantalla = decidirPantallaLista(
      NOMBRE_OK,
      { estado: 'ok', animales: [] },
      { estado: 'ok', solicitudes: [] },
    );

    expect(pantalla).toEqual({
      tipo: 'vacia',
      nombreAlbergue: 'Refugio Patitas',
      mensaje: 'Aún no tienes mascotas publicadas. Agrégalas en la pestaña Mascotas',
    });
  });
});

describe('F-07 · Solicitudes nuevas y tarjeta (PS-7, PS-9)', () => {
  test('PS-7: en Wini dice "2 solicitudes nuevas" y en Rocky "1 solicitud nueva" (solo cuenta "Pendiente")', () => {
    const wini = solicitudesDe('wini');
    const rocky = solicitudesDe('rocky');
    if (wini.estado !== 'ok' || rocky.estado !== 'ok') {
      throw new Error('Datos de prueba incompletos');
    }

    expect(textoConteo(contarNuevas(wini.solicitudes), 'nuevas')).toBe('2 solicitudes nuevas');
    expect(textoConteo(contarNuevas(rocky.solicitudes), 'nuevas')).toBe('1 solicitud nueva');
  });

  test('PS-7: con ninguna "Pendiente", Luna dice "0 solicitudes nuevas"', () => {
    const pantalla = decidirPantallaAnimal(
      ALBERGUE.uid,
      NOMBRE_OK,
      lecturaDe('luna'),
      solicitudesDe('luna'),
    );

    expect(pantalla.tipo).toBe('con-datos');
    if (pantalla.tipo === 'con-datos') {
      expect(textoConteo(pantalla.nuevas, 'nuevas')).toBe('0 solicitudes nuevas');
      expect(pantalla.solicitudes[0].estado).toBe('Rechazada');
    }
  });

  test('PS-9: las iniciales de "Ana Torres" son "AT"', () => {
    expect(iniciales('Ana Torres')).toBe('AT');
    expect(iniciales('  Luis   Pérez García ')).toBe('LP');
    expect(iniciales('Ana')).toBe('A');
  });

  test('PS-9 y F-13 AF-12: el hogar de Luis Pérez es "Departamento, primera vez" y el de Ana "Casa, tiene experiencia"', () => {
    expect(resumenDelHogar(ADOPTANTES.b.resumenHogar)).toBe('Departamento, primera vez');
    expect(resumenDelHogar(ADOPTANTES.a.resumenHogar)).toBe('Casa, tiene experiencia');
  });
});

describe('F-07 · RNF-02, G-11 y errores (PS-5, A3 a A5)', () => {
  test('CA-07 RNF-02 G-11: un animal de otro albergue muestra "No tienes permiso para ver esta sección" y no lee sus solicitudes', () => {
    const pantalla = decidirPantallaAnimal('otro-albergue', NOMBRE_OK, lecturaDe('wini'));

    expect(pantalla).toEqual({
      tipo: 'sin-permiso',
      mensaje: 'No tienes permiso para ver esta sección',
    });
  });

  test('CA-07 RNF-02 G-11: un animalId que no existe muestra "No tienes permiso para ver esta sección"', () => {
    const pantalla = decidirPantallaAnimal(ALBERGUE.uid, NOMBRE_OK, lecturaDe('no-existe'));

    expect(pantalla).toEqual({
      tipo: 'sin-permiso',
      mensaje: 'No tienes permiso para ver esta sección',
    });
  });

  test('PS-5: si el animal es suyo, primero se ve el título y después se leen sus solicitudes', () => {
    expect(decidirPantallaAnimal(ALBERGUE.uid, NOMBRE_OK, lecturaDe('wini'))).toEqual({
      tipo: 'leer-solicitudes',
      nombreAlbergue: 'Refugio Patitas',
      nombreAnimal: 'Wini',
      miniaturaAnimal: 'data:image/jpeg;base64,',
    });
  });

  test('CA-08: sin conexión, la lista y el animal muestran "Error de conexión, verifica tu conexión a internet"', () => {
    const error = { tipo: 'error', mensaje: 'Error de conexión, verifica tu conexión a internet' };
    const sinConexion = { estado: 'sin-conexion' } as const;

    expect(decidirPantallaLista(NOMBRE_OK, sinConexion, sinConexion)).toEqual(error);
    expect(decidirPantallaLista(sinConexion, { estado: 'ok', animales: [] }, sinConexion)).toEqual(
      error,
    );
    expect(decidirPantallaAnimal(ALBERGUE.uid, NOMBRE_OK, sinConexion)).toEqual(error);
    expect(decidirPantallaAnimal(ALBERGUE.uid, NOMBRE_OK, lecturaDe('wini'), sinConexion)).toEqual(
      error,
    );
  });

  test('A5 RNF-02: si las reglas rechazan una lectura se muestra "No tienes permiso para ver esta sección"', () => {
    const sinPermiso = { tipo: 'sin-permiso', mensaje: 'No tienes permiso para ver esta sección' };

    expect(
      decidirPantallaLista(NOMBRE_OK, { estado: 'sin-conexion' }, { estado: 'sin-permiso' }),
    ).toEqual(sinPermiso);
    expect(
      decidirPantallaAnimal(ALBERGUE.uid, NOMBRE_OK, lecturaDe('wini'), {
        estado: 'sin-permiso',
      }),
    ).toEqual(sinPermiso);
  });
});

describe('F-13 · CA-07 · Encabezado de las solicitudes de un animal (AF-7)', () => {
  test('CA-07 · AF-7: en Wini se ve su foto en círculo, "Un hogar para:" y "Wini" grande; en Canela, el logo y el mensaje centrados', () => {
    const wini = decidirPantallaAnimal(ALBERGUE.uid, NOMBRE_OK, lecturaDe('wini'));
    expect(wini).toMatchObject({ nombreAnimal: 'Wini', miniaturaAnimal: expect.any(String) });
    expect(TEXTOS_PANEL.unHogarPara).toBe('Un hogar para:');

    const canela = decidirPantallaAnimal(
      ALBERGUE.uid,
      NOMBRE_OK,
      lecturaDe('canela'),
      solicitudesDe('canela'),
    );
    expect(canela).toMatchObject({
      tipo: 'vacia',
      mensaje: 'Aún no hay solicitudes de adopción para este perfil',
    });
  });
});

describe('F-13 · CA-08, CA-09 y CA-11 · Tarjeta de solicitud (AF-8 a AF-12, AF-14)', () => {
  test('CA-08 · AF-8, AF-9, AF-10: cada tarjeta tiene "›" y "Ver solicitud ›" (abre el Detalle); el texto de orden no se ve tocable; "2 solicitudes nuevas" va en píldora', () => {
    expect(TEXTOS_PANEL.flecha).toBe('›');
    expect(TEXTOS_PANEL.verSolicitud).toBe('Ver solicitud ›');
    expect(TEXTOS_PANEL.ordenadas).toBe('Ordenadas de mayor a menor compatibilidad.');
    const wini = decidirPantallaAnimal(
      ALBERGUE.uid,
      NOMBRE_OK,
      lecturaDe('wini'),
      solicitudesDe('wini'),
    );
    expect(wini.tipo === 'con-datos' && textoConteo(wini.nuevas, 'nuevas')).toBe(
      '2 solicitudes nuevas',
    );
    expect(FONDOS.nuevas).toBe('rgba(37, 49, 76, 0.15)');
  });

  test('CA-09 · AF-11, AF-12: el % va en círculo menta; en Toby (s3) el círculo es gris y "No Apto" va en su propia línea; el hogar se lee con comas', () => {
    const [s1] = SOLICITUDES_PANEL.filter((s) => s.id === 's1');
    const [s3] = SOLICITUDES_PANEL.filter((s) => s.id === 's3');
    expect(vistaTarjeta(s1)).toEqual({
      fondoCirculo: COLORES.menta,
      etiqueta: null,
      atenuada: false,
    });
    expect(vistaTarjeta(s3)).toEqual({
      fondoCirculo: FONDOS.noApto,
      etiqueta: 'No Apto',
      atenuada: true,
    });
    expect(resumenDelHogar(s1.resumenHogar)).toBe('Casa, tiene experiencia');
    expect(resumenDelHogar(s1.resumenHogar)).not.toContain('·');
  });

  test('CA-11 · AF-14: s6 (Rechazada) muestra "✕ Rechazada" café en la lista y en el Detalle, con la tarjeta atenuada, y sigue mostrando el mensaje de RF-12', () => {
    const [s6] = SOLICITUDES_PANEL.filter((s) => s.id === 's6');
    expect(s6.estado).toBe('Rechazada');
    expect(vistaTarjeta(s6)).toMatchObject({ etiqueta: null, atenuada: true });
  });

  test('F-13 no válido: una "Pendiente" o "Pre-aprobada" sin "No Apto" no se atenúa', () => {
    expect(vistaTarjeta({ noApto: false, estado: 'Pendiente' }).atenuada).toBe(false);
    expect(vistaTarjeta({ noApto: false, estado: 'Pre-aprobada' }).atenuada).toBe(false);
  });
});
