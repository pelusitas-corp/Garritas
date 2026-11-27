// Pruebas de las funciones puras de la decisión y del Detalle de Solicitud
// (spec F-08 T-2: RF-05, RF-21, RF-22, RF-12, RNF-02; RN-01, PA-1, PA-6,
// PA-7, PA-10). Usan los datos de prueba s1 a s6 (03-modelo-datos §8.3).
// No hay Firebase: las fechas son objetos simples.
// El nombre de cada prueba es su criterio de aceptación.
import type { Timestamp } from 'firebase/firestore';

import type { SolicitudConId } from '../../src/albergue/panel/panel';
import {
  debeVolverALeer,
  decidirPantallaDetalle,
  decidirPreAprobacion,
  decidirRechazo,
  formatoTelefono,
  lineasDelHogar,
  mensajeDeDecision,
  vistaDelEstado,
} from '../../src/albergue/solicitud/decision';
import type { LecturaSolicitud, ResultadoDecision } from '../../src/albergue/solicitud/decision';
import { ICONOS_HOGAR } from '../../src/albergue/solicitud/iconosDecision';
import { preguntaConfirmacion, textoTelefono } from '../../src/albergue/solicitud/textos';
import type { EstadoAnimal } from '../../src/compartido/modelo';
import { CIRCULOS, OPACIDAD_ATENUADA } from '../../src/compartido/tema';
import { esNoApto } from '../../src/matchmaking';
import { ADOPTANTES, ALBERGUE, SOLICITUDES } from '../../scripts/datos-prueba/datos';

/** Fecha de Firestore de mentira: solo hace falta `toMillis`. */
function fecha(milisegundos: number): Timestamp {
  return { toMillis: () => milisegundos } as Timestamp;
}

/** Una solicitud de 03 §8.3 (s1 a s6) como la lee el Detalle. */
function solicitud(id: string): SolicitudConId {
  const prueba = SOLICITUDES.find((candidata) => candidata.id === id);
  if (!prueba) {
    throw new Error(`No existe la solicitud de prueba ${id}`);
  }
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
    creadaEn: fecha(1),
    actualizadaEn: fecha(1),
  };
}

/** La lectura correcta de una solicitud de prueba. */
function lectura(id: string): LecturaSolicitud {
  return { estado: 'ok', solicitud: solicitud(id) };
}

const DISPONIBLE: { estado: EstadoAnimal } = { estado: 'Disponible' };
const EN_PRE_ADOPCION: { estado: EstadoAnimal } = { estado: 'En pre-adopción' };
const CONTACTO_ANA = {
  estado: 'ok',
  contacto: { telefono: '6460000001', correo: 'ana.torres@example.com' },
} as const;

describe('F-08 · RF-05 y RF-22 · Pre-aprobar (RN-01)', () => {
  test('CA-01 RF-05 válido: s1 "Pendiente" con Wini "Disponible" se puede pre-aprobar', () => {
    expect(decidirPreAprobacion(solicitud('s1'), DISPONIBLE)).toBe('ok');
  });

  test('CA-02 RF-05 no válido: una solicitud ya atendida muestra "Esta solicitud ya fue atendida"', () => {
    const resultado = decidirPreAprobacion(solicitud('s4'), DISPONIBLE);

    expect(resultado).toBe('ya-atendida');
    expect(mensajeDeDecision(resultado)).toBe('Esta solicitud ya fue atendida');
    expect(decidirPreAprobacion(solicitud('s6'), DISPONIBLE)).toBe('ya-atendida');
  });

  test('RN-01: si la solicitud ya fue atendida y el animal está en pre-adopción, solo sale "Esta solicitud ya fue atendida"', () => {
    expect(mensajeDeDecision(decidirPreAprobacion(solicitud('s4'), EN_PRE_ADOPCION))).toBe(
      'Esta solicitud ya fue atendida',
    );
  });

  test('CA-06 RF-22 no válido: con Rocky en pre-adopción muestra "Este animal ya cuenta con una pre-adopción en curso"', () => {
    const resultado = decidirPreAprobacion(solicitud('s5'), EN_PRE_ADOPCION);

    expect(resultado).toBe('preadopcion-en-curso');
    expect(mensajeDeDecision(resultado)).toBe(
      'Este animal ya cuenta con una pre-adopción en curso',
    );
  });

  test('RNF-02: sin solicitud o sin animal no se pre-aprueba', () => {
    expect(decidirPreAprobacion(null, DISPONIBLE)).toBe('sin-permiso');
    expect(decidirPreAprobacion(solicitud('s1'), null)).toBe('sin-permiso');
  });
});

describe('F-08 · RF-21 · Rechazar', () => {
  test('CA-03 RF-21 válido: s2 "Pendiente" se puede rechazar', () => {
    expect(decidirRechazo(solicitud('s2'))).toBe('ok');
  });

  test('CA-04 RF-21 no válido: rechazar una solicitud ya atendida muestra "Esta solicitud ya fue atendida"', () => {
    const resultado = decidirRechazo(solicitud('s6'));

    expect(resultado).toBe('ya-atendida');
    expect(mensajeDeDecision(resultado)).toBe('Esta solicitud ya fue atendida');
  });

  test('CA-05 RF-22 válido: con Rocky en pre-adopción, s5 sigue "Pendiente" con botones y sí se puede rechazar', () => {
    expect(vistaDelEstado(solicitud('s5').estado)).toBe('botones');
    expect(decidirRechazo(solicitud('s5'))).toBe('ok');
    // PA-4: "Pre-aprobar" no va gris; al confirmarlo sale el mensaje de RF-22.
    expect(decidirPreAprobacion(solicitud('s5'), EN_PRE_ADOPCION)).toBe('preadopcion-en-curso');
  });

  test('RN-02: "Pre-aprobada" y "Rechazada" son finales: muestran su píldora y no botones', () => {
    expect(vistaDelEstado('Pre-aprobada')).toBe('pre-aprobada');
    expect(vistaDelEstado('Rechazada')).toBe('rechazada');
    expect(vistaDelEstado('Pendiente')).toBe('botones');
  });
});

describe('F-08 · Mensajes y relectura de una decisión (RN-06, PA-10)', () => {
  test('CA-12: sin conexión, una decisión muestra "Error de conexión, verifica tu conexión a internet"', () => {
    expect(mensajeDeDecision('sin-conexion')).toBe(
      'Error de conexión, verifica tu conexión a internet',
    );
  });

  test('A7 RNF-02: si las reglas rechazan la decisión muestra "No tienes permiso para ver esta sección"', () => {
    expect(mensajeDeDecision('sin-permiso')).toBe('No tienes permiso para ver esta sección');
  });

  test('PA-10: después de "ok" o "ya atendida" se vuelve a leer; después de un error, no', () => {
    const vuelveALeer: Record<ResultadoDecision, boolean> = {
      ok: true,
      'ya-atendida': true,
      'preadopcion-en-curso': false,
      'sin-conexion': false,
      'sin-permiso': false,
    };
    (Object.keys(vuelveALeer) as ResultadoDecision[]).forEach((resultado) => {
      expect(debeVolverALeer(resultado)).toBe(vuelveALeer[resultado]);
    });
    expect(mensajeDeDecision('ok')).toBeNull();
  });

  test('PA-1: la confirmación pregunta "¿Pre-aprobar la solicitud de Ana Torres?" y "¿Rechazar la solicitud de Luis Pérez?"', () => {
    expect(preguntaConfirmacion('pre-aprobar', 'Ana Torres')).toBe(
      '¿Pre-aprobar la solicitud de Ana Torres?',
    );
    expect(preguntaConfirmacion('rechazar', 'Luis Pérez')).toBe(
      '¿Rechazar la solicitud de Luis Pérez?',
    );
  });
});

describe('F-08 · RF-12 · Contacto en el Detalle', () => {
  test('CA-07 RF-12 válido: s4 "Pre-aprobada" muestra "Tel. 646 000 0001" y "ana.torres@example.com"', () => {
    const pantalla = decidirPantallaDetalle(ALBERGUE.uid, lectura('s4'), CONTACTO_ANA);

    expect(pantalla.tipo).toBe('con-datos');
    if (pantalla.tipo === 'con-datos' && pantalla.contacto.tipo === 'visible') {
      expect(textoTelefono(pantalla.contacto.telefono)).toBe('Tel. 646 000 0001');
      expect(pantalla.contacto.correo).toBe('ana.torres@example.com');
    } else {
      throw new Error('El contacto de s4 debía verse');
    }
  });

  test('CA-07 RF-12 válido: con la solicitud "Pre-aprobada" y sin leer el contacto, hay que leerlo', () => {
    expect(decidirPantallaDetalle(ALBERGUE.uid, lectura('s4'))).toMatchObject({
      tipo: 'con-datos',
      contacto: { tipo: 'cargando' },
    });
  });

  test('CA-08 RF-12 no válido: s2 "Pendiente" y s6 "Rechazada" muestran "Pre-aprueba la solicitud para ver los datos de contacto" y no piden el contacto', () => {
    ['s2', 's6'].forEach((id) => {
      // Aunque llegara un contacto, con "Pendiente" o "Rechazada" no se usa.
      const pantalla = decidirPantallaDetalle(ALBERGUE.uid, lectura(id), CONTACTO_ANA);
      expect(pantalla).toMatchObject({
        tipo: 'con-datos',
        contacto: {
          tipo: 'oculto',
          mensaje: 'Pre-aprueba la solicitud para ver los datos de contacto',
        },
      });
    });
  });

  test('PA-6: un teléfono de 10 dígitos sale como "646 000 0001" y uno distinto, tal cual', () => {
    expect(formatoTelefono('6460000001')).toBe('646 000 0001');
    expect(formatoTelefono('+52 646 000 0001')).toBe('+52 646 000 0001');
    expect(formatoTelefono('646000000')).toBe('646000000');
  });

  test('Decisión 2 del plan: si el contacto falla al abrir, el error va en lugar de toda la pantalla', () => {
    expect(decidirPantallaDetalle(ALBERGUE.uid, lectura('s4'), { estado: 'sin-conexion' })).toEqual(
      { tipo: 'error', mensaje: 'Error de conexión, verifica tu conexión a internet' },
    );
  });

  test('Decisión 2 del plan: si el contacto falla después de pre-aprobar, el error va solo en su lugar', () => {
    expect(
      decidirPantallaDetalle(
        ALBERGUE.uid,
        lectura('s4'),
        { estado: 'sin-conexion' },
        'despues-de-decidir',
      ),
    ).toMatchObject({
      tipo: 'con-datos',
      contacto: { tipo: 'error', mensaje: 'Error de conexión, verifica tu conexión a internet' },
    });
  });

  test('Decisión 2 del plan: si privado/contacto no existe, "No tienes permiso para ver esta sección" en su lugar', () => {
    expect(
      decidirPantallaDetalle(ALBERGUE.uid, lectura('s4'), { estado: 'no-existe' }),
    ).toMatchObject({
      tipo: 'con-datos',
      contacto: { tipo: 'sin-permiso', mensaje: 'No tienes permiso para ver esta sección' },
    });
  });
});

describe('F-08 · PA-7 · Su hogar y sus cuidados', () => {
  test('PA-7: el hogar de Ana es "Vive en: Casa", "Tiempo solo: Menos de 4 hrs", "Experiencia: Sí"', () => {
    expect(lineasDelHogar(ADOPTANTES.a.resumenHogar).map((linea) => linea.texto)).toEqual([
      'Vive en: Casa',
      'Tiempo solo: Menos de 4 hrs',
      'Experiencia: Sí',
    ]);
  });

  test('PA-7: el hogar de Luis es "Departamento", "Más de 8 hrs" y "No"', () => {
    expect(lineasDelHogar(ADOPTANTES.b.resumenHogar).map((linea) => linea.texto)).toEqual([
      'Vive en: Departamento',
      'Tiempo solo: Más de 8 hrs',
      'Experiencia: No',
    ]);
    expect(lineasDelHogar({ p2: 'casa', p12: 'de4a8', p19: 'primeraVez' })[1].texto).toBe(
      'Tiempo solo: De 4 a 8 hrs',
    );
  });
});

describe('F-08 · RNF-02 y G-11 · Detalle de una solicitud ajena', () => {
  test('CA-11 RNF-02 G-11: una solicitud de otro albergue o que no existe muestra "No tienes permiso para ver esta sección"', () => {
    const sinPermiso = { tipo: 'sin-permiso', mensaje: 'No tienes permiso para ver esta sección' };

    expect(decidirPantallaDetalle('otro-albergue', lectura('s1'))).toEqual(sinPermiso);
    expect(decidirPantallaDetalle(ALBERGUE.uid, { estado: 'no-existe' })).toEqual(sinPermiso);
    expect(decidirPantallaDetalle(ALBERGUE.uid, { estado: 'sin-permiso' })).toEqual(sinPermiso);
  });

  test('A5: si la solicitud no se puede leer por la red, se muestra "Error de conexión, verifica tu conexión a internet"', () => {
    expect(decidirPantallaDetalle(ALBERGUE.uid, { estado: 'sin-conexion' })).toEqual({
      tipo: 'error',
      mensaje: 'Error de conexión, verifica tu conexión a internet',
    });
  });
});

describe('F-13 · CA-10 y CA-11 · Detalle de solicitud (AF-13, AF-14)', () => {
  test('CA-10 · AF-13: en el Detalle de s1, "Su hogar y sus cuidados" muestra 3 círculos centrados', () => {
    const lineas = lineasDelHogar(ADOPTANTES.a.resumenHogar);
    expect(lineas.map((linea) => linea.clave)).toEqual(['viveEn', 'tiempoSolo', 'experiencia']);
    lineas.forEach((linea) => expect(ICONOS_HOGAR[linea.clave]).toBeTruthy());
    expect(CIRCULOS.hogar).toBe(72);
  });

  test('CA-11 · AF-14: s6 (Rechazada) muestra "✕ Rechazada" café en la lista y en el Detalle, con la tarjeta atenuada, y sigue mostrando el mensaje de RF-12', () => {
    const pantalla = decidirPantallaDetalle(ALBERGUE.uid, lectura('s6'), CONTACTO_ANA);
    expect(pantalla).toMatchObject({
      tipo: 'con-datos',
      solicitud: { estado: 'Rechazada' },
      contacto: { mensaje: 'Pre-aprueba la solicitud para ver los datos de contacto' },
    });
    expect(vistaDelEstado('Rechazada')).toBe('rechazada');
    expect(OPACIDAD_ATENUADA).toBe(0.6);
  });
});
