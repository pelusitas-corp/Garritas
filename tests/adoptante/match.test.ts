// Pruebas de las decisiones de Match y del envío (spec F-06 T-2: RF-20,
// RF-11, RF-17, RF-18; A1 a A4; MS-1). Usan el motor real (F-05) con los
// datos de tests/matchmaking/datos.ts y los animales de 03 §8.2.
// El nombre de cada prueba es su criterio de aceptación.
import {
  armarSolicitud,
  decidirEnvio,
  decidirMatch,
  decidirSolicitudEnviada,
  pantallaMatch,
  pantallaSolicitudEnviada,
} from '../../src/adoptante/match/match';
import type { LecturaCuestionario } from '../../src/adoptante/match/match';
import MENSAJES from '../../src/compartido/mensajes';
import type { AnimalConId } from '../../src/firebase/animales';
import { evaluarAnimales } from '../../src/matchmaking';
import type { Cuestionario, ResultadoMatch } from '../../src/matchmaking';
import explicarMatch from '../../src/matchmaking/explicacion';
import { animalDePrueba } from './datosDescubrir';
import { ADOPTANTE_A, ADOPTANTE_B } from '../matchmaking/datos';

// Se envuelve `evaluarAnimales` para poder forzar 29 % y 30 % en dos pruebas.
// En las demás responde el motor real.
jest.mock('../../src/matchmaking', () => {
  const real = jest.requireActual<typeof import('../../src/matchmaking')>('../../src/matchmaking');
  return { ...real, evaluarAnimales: jest.fn(real.evaluarAnimales) };
});

const evaluarSimulado = jest.mocked(evaluarAnimales);

/** Recibe un cuestionario de prueba. Devuelve la lectura que da `leerCuestionario`. */
function lecturaDe(cuestionario: Cuestionario): LecturaCuestionario {
  return { estado: 'existe', ...cuestionario, actualizadoEn: null };
}

/** Recibe un animal. Devuelve la lectura `ok` de `leerAnimal`. */
const lecturaAnimal = (animal: AnimalConId) => ({ estado: 'ok', animal }) as const;

const WINI = animalDePrueba('wini');
const TOBY = animalDePrueba('toby');
const CANELA = animalDePrueba('canela');
const ROCKY = animalDePrueba('rocky');

/** Lo que devuelve el motor real, para no fijar las dimensiones a mano. */
function resultadoDelMotor(cuestionario: Cuestionario, animal: AnimalConId): ResultadoMatch {
  const evaluacion = evaluarAnimales(cuestionario, [
    {
      animalId: animal.id,
      especie: animal.especie,
      perfilCompatibilidad: animal.perfilCompatibilidad,
    },
  ]);
  if (!evaluacion.completo || !evaluacion.resultados[0]) {
    throw new Error('El motor no devolvió resultado');
  }
  return evaluacion.resultados[0];
}

/** Cosenos cualesquiera para armar la explicación de 29 % y 30 % con `explicarMatch` (F-05). */
const COSENOS = {
  energia: 0.1,
  espacio: 0.9,
  tiempo: 0.2,
  convivencia: 0.8,
  temperamento: 0.7,
  experiencia: 0.6,
};

/** Recibe un %. Devuelve un resultado del motor con la explicación real de F-05. */
function resultadoCon(porcentaje: number): ResultadoMatch {
  return {
    animalId: WINI.id,
    porcentaje,
    noApto: porcentaje < 30,
    explicacion: explicarMatch(porcentaje, COSENOS),
  };
}

describe('decidirMatch (flujo A)', () => {
  test('RF-20 válido: con Ana y Wini (90 %) devuelve "mayorAporte" con Nivel de energía, Espacio y Tiempo disponible', () => {
    const esperado = resultadoDelMotor(ADOPTANTE_A, WINI);
    const decision = decidirMatch(lecturaDe(ADOPTANTE_A), lecturaAnimal(WINI));
    expect(decision.tipo).toBe('match');
    if (decision.tipo !== 'match') return;
    expect(decision.resultado.porcentaje).toBe(90);
    expect(decision.resultado.explicacion.tipo).toBe('mayorAporte');
    expect(decision.resultado.explicacion.dimensiones).toHaveLength(3);
    expect(decision.resultado.explicacion.dimensiones).toEqual(esperado.explicacion.dimensiones);
    expect(decision.resultado.explicacion.dimensiones).toEqual([
      'Nivel de energía',
      'Espacio',
      'Tiempo disponible',
    ]);
  });

  test('RF-20 no válido: con 24 % muestra "Esta mascota podría no adaptarse a tu estilo de vida"', () => {
    const decision = decidirMatch(lecturaDe(ADOPTANTE_B), lecturaAnimal(TOBY));
    expect(decision.tipo).toBe('match');
    if (decision.tipo !== 'match') return;
    expect(decision.resultado.porcentaje).toBe(24);
    expect(decision.resultado.explicacion).toEqual({
      tipo: 'menorCoincidencia',
      dimensiones: ['Nivel de energía', 'Tiempo disponible'],
      mensaje: MENSAJES.MASCOTA_PODRIA_NO_ADAPTARSE,
    });
  });

  test('RF-20 no válido: con 29 % es la variante de menor coincidencia', () => {
    evaluarSimulado.mockReturnValueOnce({ completo: true, resultados: [resultadoCon(29)] });
    const decision = decidirMatch(lecturaDe(ADOPTANTE_A), lecturaAnimal(WINI));
    if (decision.tipo !== 'match') throw new Error(decision.tipo);
    expect(decision.resultado.explicacion.tipo).toBe('menorCoincidencia');
    expect(decision.resultado.explicacion.mensaje).toBe(MENSAJES.MASCOTA_PODRIA_NO_ADAPTARSE);
  });

  test('RF-20 válido: con exactamente 30 % no es la variante', () => {
    evaluarSimulado.mockReturnValueOnce({ completo: true, resultados: [resultadoCon(30)] });
    const decision = decidirMatch(lecturaDe(ADOPTANTE_A), lecturaAnimal(WINI));
    if (decision.tipo !== 'match') throw new Error(decision.tipo);
    expect(decision.resultado.explicacion.tipo).toBe('mayorAporte');
    expect(decision.resultado.explicacion.dimensiones).toHaveLength(3);
  });

  test('RF-17 no válido: Canela con las respuestas de B muestra "Esta mascota no es compatible con las condiciones de tu hogar"', () => {
    expect(decidirMatch(lecturaDe(ADOPTANTE_B), lecturaAnimal(CANELA))).toEqual({
      tipo: 'no-compatible',
      mensaje: MENSAJES.MASCOTA_NO_COMPATIBLE,
    });
  });

  test('RF-11 no válido (A1): al abrir Match con el animal "En pre-adopción" regresa a Descubrir', () => {
    expect(decidirMatch(lecturaDe(ADOPTANTE_A), lecturaAnimal(ROCKY))).toEqual({
      tipo: 'no-disponible',
    });
  });

  test('A1 (MS-11): al abrir Match con un animal inexistente regresa a Descubrir', () => {
    expect(decidirMatch(lecturaDe(ADOPTANTE_A), { estado: 'no-existe' })).toEqual({
      tipo: 'no-disponible',
    });
  });

  test('Decisión 1 del plan: un animal con el perfil incompleto se trata como A1', () => {
    const sinPerfil = { ...WINI, perfilCompatibilidad: {} as AnimalConId['perfilCompatibilidad'] };
    expect(decidirMatch(lecturaDe(ADOPTANTE_A), lecturaAnimal(sinPerfil))).toEqual({
      tipo: 'no-disponible',
    });
  });

  test('G-5: con el cuestionario incompleto lleva al cuestionario', () => {
    const incompleto = { ...ADOPTANTE_A, completo: false };
    expect(decidirMatch(lecturaDe(incompleto), lecturaAnimal(WINI)).tipo).toBe(
      'cuestionario-incompleto',
    );
  });

  test('CA-09: sin conexión en el cuestionario o en el animal muestra el error de conexión', () => {
    expect(decidirMatch({ estado: 'sin-conexion' }, lecturaAnimal(WINI)).tipo).toBe('error');
    expect(decidirMatch(lecturaDe(ADOPTANTE_A), { estado: 'sin-conexion' }).tipo).toBe('error');
  });

  test('RNF-02: si las reglas rechazan una lectura muestra "No tienes permiso para ver esta sección"', () => {
    expect(decidirMatch({ estado: 'sin-permiso' }, lecturaAnimal(WINI)).tipo).toBe('sin-permiso');
    expect(decidirMatch(lecturaDe(ADOPTANTE_A), { estado: 'sin-permiso' }).tipo).toBe(
      'sin-permiso',
    );
  });
});

describe('decidirEnvio (flujo B, A3 y A4)', () => {
  test('RF-11 no válido: con el animal "En pre-adopción" muestra "Esta mascota ya no está disponible para adopción"', () => {
    expect(decidirEnvio({ estado: 'En pre-adopción' }, [], 'wini')).toEqual({
      permitida: false,
      mensaje: MENSAJES.MASCOTA_NO_DISPONIBLE,
    });
  });

  test('RF-11 no válido: con el animal borrado muestra "Esta mascota ya no está disponible para adopción"', () => {
    expect(decidirEnvio(null, [], 'wini')).toEqual({
      permitida: false,
      mensaje: MENSAJES.MASCOTA_NO_DISPONIBLE,
    });
  });

  test.each(['Pendiente', 'Pre-aprobada', 'Rechazada'])(
    'MS-1: con una solicitud previa "%s" muestra "Ya enviaste una solicitud para esta mascota. Revisa su estado en Mis solicitudes"',
    (estado) => {
      const previas = [{ animalId: 'wini', estado }];
      expect(decidirEnvio({ estado: 'Disponible' }, previas, 'wini')).toEqual({
        permitida: false,
        mensaje: MENSAJES.SOLICITUD_YA_ENVIADA,
      });
    },
  );

  test('MS-1: una solicitud a otro animal no bloquea el envío', () => {
    expect(decidirEnvio({ estado: 'Disponible' }, [{ animalId: 'toby' }], 'wini')).toEqual({
      permitida: true,
    });
  });

  test('A3 antes que A4: con el animal no disponible y una solicitud previa, gana "no disponible"', () => {
    expect(decidirEnvio({ estado: 'En pre-adopción' }, [{ animalId: 'wini' }], 'wini')).toEqual({
      permitida: false,
      mensaje: MENSAJES.MASCOTA_NO_DISPONIBLE,
    });
  });

  test('RF-11 válido: con el animal "Disponible" y sin solicitud previa se permite enviar', () => {
    expect(decidirEnvio({ estado: 'Disponible' }, [], 'wini')).toEqual({ permitida: true });
  });
});

describe('armarSolicitud (03 §4.5)', () => {
  const CUENTA_ANA = {
    nombre: 'Ana Torres',
    telefono: '6460000001',
    correo: 'ana.torres@example.com',
  };

  test('RF-11 válido: armarSolicitud copia los campos de 03 §4.5 y pone estado "Pendiente"', () => {
    const armada = armarSolicitud({
      uid: 'adoptante-a',
      animal: WINI,
      resultado: { porcentaje: 90, noApto: false },
      respuestas: ADOPTANTE_A.respuestas,
      cuenta: CUENTA_ANA,
    });
    expect(armada).toEqual({
      solicitud: {
        animalId: 'wini',
        albergueId: 'refugio-patitas',
        adoptanteId: 'adoptante-a',
        nombreAdoptante: 'Ana Torres',
        nombreAnimal: 'Wini',
        nombreAlbergue: 'Refugio Patitas',
        miniaturaAnimal: WINI.miniatura,
        porcentaje: 90,
        noApto: false,
        resumenHogar: { p2: 'casa', p12: 'menosDe4', p19: 'yaHeTenido' },
        estado: 'Pendiente',
      },
      contacto: { telefono: '6460000001', correo: 'ana.torres@example.com' },
    });
  });

  test('RF-18: con 24 % guarda noApto en true, el mismo que muestra Match', () => {
    const armada = armarSolicitud({
      uid: 'adoptante-b',
      animal: TOBY,
      resultado: { porcentaje: 24, noApto: true },
      respuestas: ADOPTANTE_B.respuestas,
      cuenta: { ...CUENTA_ANA, nombre: 'Luis Pérez' },
    });
    expect(armada?.solicitud.porcentaje).toBe(24);
    expect(armada?.solicitud.noApto).toBe(true);
  });

  test('RF-18 no válido: con 30 % guarda noApto en false', () => {
    const armada = armarSolicitud({
      uid: 'adoptante-a',
      animal: WINI,
      resultado: { porcentaje: 30, noApto: false },
      respuestas: ADOPTANTE_A.respuestas,
      cuenta: CUENTA_ANA,
    });
    expect(armada?.solicitud.noApto).toBe(false);
  });

  test('M-1: resumenHogar lleva solo p2, p12 y p19 del cuestionario', () => {
    const armada = armarSolicitud({
      uid: 'adoptante-b',
      animal: WINI,
      resultado: { porcentaje: 70, noApto: false },
      respuestas: ADOPTANTE_B.respuestas,
      cuenta: CUENTA_ANA,
    });
    expect(armada?.solicitud.resumenHogar).toEqual({
      p2: 'departamento',
      p12: 'masDe8',
      p19: 'primeraVez',
    });
  });

  test('M-1: si falta una respuesta del resumen no arma la solicitud', () => {
    const incompletas = { ...ADOPTANTE_A.respuestas, p12: undefined };
    expect(
      armarSolicitud({
        uid: 'adoptante-a',
        animal: WINI,
        resultado: { porcentaje: 90, noApto: false },
        respuestas: incompletas,
        cuenta: CUENTA_ANA,
      }),
    ).toBeNull();
  });
});

describe('pantallaMatch (estados de Match, §6)', () => {
  const acciones = { reintentar: jest.fn(), irADescubrir: jest.fn() };

  test('RNF-01: mientras carga, a los 3 s muestra "Calculando compatibilidad, verifica tu conexión a internet"', () => {
    expect(pantallaMatch({ tipo: 'cargando' }, acciones)).toEqual({
      estado: 'cargando',
      mensajeSiTarda: MENSAJES.CALCULANDO_COMPATIBILIDAD,
    });
  });

  test('CA-09: sin conexión muestra "Error de conexión, verifica tu conexión a internet" con Reintentar', () => {
    const props = pantallaMatch({ tipo: 'error' }, acciones);
    expect(props?.mensaje).toBe(MENSAJES.ERROR_CONEXION);
    expect(props?.boton?.texto).toBe('Reintentar');
    props?.boton?.alPresionar();
    expect(acciones.reintentar).toHaveBeenCalledTimes(1);
  });

  test('RNF-02: si las reglas rechazan muestra "No tienes permiso para ver esta sección"', () => {
    expect(pantallaMatch({ tipo: 'sin-permiso' }, acciones)).toEqual({
      estado: 'sin-permiso',
      mensaje: MENSAJES.SIN_PERMISO,
    });
  });

  test('RF-17 no válido: muestra el mensaje con "Ir a Descubrir" en lugar del match, sin "Enviar solicitud"', () => {
    const props = pantallaMatch(
      { tipo: 'no-compatible', mensaje: MENSAJES.MASCOTA_NO_COMPATIBLE },
      acciones,
    );
    expect(props?.mensaje).toBe(MENSAJES.MASCOTA_NO_COMPATIBLE);
    expect(props?.boton?.texto).toBe('Ir a Descubrir');
    props?.boton?.alPresionar();
    expect(acciones.irADescubrir).toHaveBeenCalledTimes(1);
  });

  test('RF-20 válido: con el match dibuja el % y su explicación', () => {
    const decision = decidirMatch(lecturaDe(ADOPTANTE_A), lecturaAnimal(WINI));
    if (decision.tipo !== 'match') throw new Error(decision.tipo);
    expect(pantallaMatch(decision, acciones)).toBeNull();
  });
});

describe('"¡Solicitud enviada!" (flujo C, §6)', () => {
  const S_NUEVA = {
    nombreAnimal: 'Wini',
    miniaturaAnimal: WINI.miniatura,
    estado: 'Pendiente',
  } as const;

  test('RF-11 válido: con la solicitud leída muestra Wini y "Pendiente"', () => {
    const estado = decidirSolicitudEnviada({ estado: 'ok', solicitud: S_NUEVA });
    expect(estado).toEqual({ tipo: 'con-datos', solicitud: S_NUEVA });
    expect(pantallaSolicitudEnviada(estado, jest.fn())).toBeNull();
  });

  test('RNF-02: una solicitud inexistente o ajena muestra "No tienes permiso para ver esta sección"', () => {
    expect(decidirSolicitudEnviada({ estado: 'no-existe' })).toEqual({ tipo: 'sin-permiso' });
    expect(decidirSolicitudEnviada({ estado: 'sin-permiso' })).toEqual({ tipo: 'sin-permiso' });
    expect(pantallaSolicitudEnviada({ tipo: 'sin-permiso' }, jest.fn())).toEqual({
      estado: 'sin-permiso',
      mensaje: MENSAJES.SIN_PERMISO,
    });
  });

  test('CA-09: sin conexión muestra "Error de conexión, verifica tu conexión a internet" con Reintentar', () => {
    const estado = decidirSolicitudEnviada({ estado: 'sin-conexion' });
    const props = pantallaSolicitudEnviada(estado, jest.fn());
    expect(props?.mensaje).toBe(MENSAJES.ERROR_CONEXION);
    expect(props?.boton?.texto).toBe('Reintentar');
  });
});
