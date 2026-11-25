/**
 * Cuestionario (spec F-04: RF-02, RF-15, RF-16; ruta /cuestionario).
 *
 * Analogía: la pantalla es la mesa donde se voltean las tarjetas. No decide
 * nada por su cuenta: pregunta a `recuperacion.ts` dónde empezar, a
 * `avance.ts` qué tarjeta sigue, y guarda con `borrador.ts` (teléfono) y
 * `src/firebase/cuestionario.ts` (nube).
 *
 * Flujo (§6): cargando → pregunta → un toque por pregunta → en la última,
 * "Ver mi perfil Garritas" → guarda `completo: true` y el perfil → Perfil Garritas.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  buscarPregunta,
  limpiarRespuestas,
  posicionDe,
  preguntaAnterior,
  primeraSinResponder,
  puedeTerminar,
  responder,
  siguientePregunta,
} from '../../src/adoptante/cuestionario/avance';
import {
  borrarBorrador,
  guardarBorrador,
  leerBorrador,
} from '../../src/adoptante/cuestionario/borrador';
import EncabezadoCuestionario from '../../src/adoptante/cuestionario/EncabezadoCuestionario';
import OpcionRespuesta from '../../src/adoptante/cuestionario/OpcionRespuesta';
import { decidirInicio } from '../../src/adoptante/cuestionario/recuperacion';
import { TEXTO_APOYO, TEXTO_VER_MI_PERFIL } from '../../src/adoptante/cuestionario/textos';
import BotonPildora from '../../src/compartido/BotonPildora';
import EstadoPantalla from '../../src/compartido/EstadoPantalla';
import MENSAJES from '../../src/compartido/mensajes';
import { RUTAS } from '../../src/compartido/navegacion/rutas';
import { useSesion } from '../../src/compartido/navegacion/useSesion';
import { COLORES, FUENTES, RADIOS } from '../../src/compartido/tema';
import {
  completarCuestionario,
  crearCuestionario,
  guardarRespuestas,
  leerCuestionario,
  uidDelAdoptante,
} from '../../src/firebase/cuestionario';
import { asignarPerfilGarritas } from '../../src/matchmaking';
import type { IdPregunta, Respuestas } from '../../src/matchmaking';

/** Cualquier opción de cualquier pregunta (la de la pregunta actual la elige OpcionRespuesta). */
type ClaveOpcion = NonNullable<Respuestas[IdPregunta]>;

/** Lo que muestra la pantalla (§8: cargando, con datos, sin permiso). */
type Vista =
  | { tipo: 'cargando' }
  | { tipo: 'sin-permiso' }
  | {
      tipo: 'pregunta';
      uid: string;
      respuestas: Respuestas;
      actual: IdPregunta;
      /** Mensaje de A1, A2 o A3; se quita al primer toque. */
      mensaje: string | null;
    };

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  contenido: { flexGrow: 1, gap: 24, padding: 24 },
  aviso: {
    padding: 16,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.menta,
  },
  textoAviso: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  pregunta: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe },
  opciones: { gap: 16 },
  apoyo: {
    fontFamily: FUENTES.regular,
    fontSize: 15,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  error: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe, textAlign: 'center' },
});

/** Si una escritura la rechazan las reglas (RNF-02), la pantalla se bloquea. */
function esRechazoDePermiso(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'permission-denied'
  );
}

export default function Cuestionario() {
  // G-5: llega con ?aviso=incompleto cuando intentó abrir Descubrir, Detalle o Match.
  const { aviso } = useLocalSearchParams<{ aviso?: string }>();
  const { recargar } = useSesion();
  // uid del adoptante con sesión (la guarda G-1 ya aseguró que hay sesión).
  const [uidSesion] = useState(uidDelAdoptante);
  const [vista, setVista] = useState<Vista>(
    uidSesion ? { tipo: 'cargando' } : { tipo: 'sin-permiso' },
  );
  const [guardando, setGuardando] = useState(false);
  const [errorAlTerminar, setErrorAlTerminar] = useState(false);

  const bloquearSiNoHayPermiso = useCallback((error: unknown) => {
    if (esRechazoDePermiso(error)) {
      setVista({ tipo: 'sin-permiso' });
    }
    // Sin conexión no se hace nada: el borrador ya está en el teléfono (A5).
  }, []);

  // Al abrir: leer el avance y decidir dónde empezar (RN-06 a RN-08, RF-16).
  useEffect(() => {
    let vigente = true;
    const uid = uidSesion;
    if (!uid) {
      return undefined;
    }
    Promise.all([leerBorrador(uid), leerCuestionario(uid)]).then(([local, remota]) => {
      if (!vigente) {
        return;
      }
      if (remota.estado === 'sin-permiso') {
        setVista({ tipo: 'sin-permiso' });
        return;
      }
      const inicio = decidirInicio(local, remota, aviso === 'incompleto');
      if (inicio.accion === 'ir-a-descubrir') {
        // RN-06: se responde una sola vez. `recargar` pone al día la sesión por si
        // aún decía "incompleto" (así G-5 no lo regresa al cuestionario).
        recargar();
        router.replace(RUTAS.descubrir);
        return;
      }
      if (inicio.crearDocumento) {
        crearCuestionario(uid).catch(bloquearSiNoHayPermiso); // RN-08
      }
      setVista({
        tipo: 'pregunta',
        uid,
        respuestas: inicio.respuestas,
        actual: inicio.preguntaInicial,
        mensaje: inicio.mensaje,
      });
    });
    return () => {
      vigente = false;
    };
  }, [aviso, bloquearSiNoHayPermiso, recargar, uidSesion]);

  /** RN-01 a RN-04: guarda el toque y pasa a la siguiente pregunta que aplica. */
  const alElegir = useCallback(
    (clave: ClaveOpcion) => {
      if (vista.tipo !== 'pregunta') {
        return;
      }
      const { uid, respuestas, actual } = vista;
      const nuevas = responder(respuestas, actual, clave);
      guardarBorrador(uid, nuevas).catch(() => undefined); // RF-16: libreta del teléfono.
      guardarRespuestas(uid, nuevas).catch(bloquearSiNoHayPermiso); // Nube; no se espera (A5).
      const siguiente = siguientePregunta(actual, nuevas) ?? primeraSinResponder(nuevas) ?? actual;
      setErrorAlTerminar(false);
      setVista({ tipo: 'pregunta', uid, respuestas: nuevas, actual: siguiente, mensaje: null });
    },
    [vista, bloquearSiNoHayPermiso],
  );

  /** RN-04: "←" regresa a la pregunta anterior que aplica. */
  const alRegresar = useCallback(() => {
    if (vista.tipo !== 'pregunta') {
      return;
    }
    const anterior = preguntaAnterior(vista.actual, vista.respuestas);
    if (anterior) {
      setErrorAlTerminar(false);
      setVista({ ...vista, actual: anterior, mensaje: null });
    }
  }, [vista]);

  /** RN-05 y §6 paso 6: "Ver mi perfil Garritas". */
  const alTerminar = useCallback(async () => {
    if (vista.tipo !== 'pregunta' || guardando) {
      return;
    }
    const { uid, respuestas } = vista;
    const pendiente = primeraSinResponder(respuestas);
    if (pendiente) {
      setVista({ ...vista, actual: pendiente, mensaje: null });
      return;
    }
    const limpias = limpiarRespuestas(respuestas);
    const perfil = asignarPerfilGarritas({ respuestas: limpias, completo: true });
    if (!perfil.completo) {
      return; // No pasa: con todas las preguntas respondidas siempre hay perfil.
    }
    setGuardando(true);
    setErrorAlTerminar(false);
    const resultado = await completarCuestionario(uid, limpias, perfil.perfil);
    setGuardando(false);
    if (resultado === 'sin-permiso') {
      setVista({ tipo: 'sin-permiso' });
      return;
    }
    if (resultado === 'sin-conexion') {
      setErrorAlTerminar(true); // CA-09: sigue en el cuestionario.
      return;
    }
    await borrarBorrador(uid).catch(() => undefined);
    // replace: "atrás" no regresa al cuestionario (02-navegacion §4.2).
    router.replace(RUTAS.perfilGarritas);
    // Avisa a la sesión que el cuestionario ya está completo (G-5 deja pasar a Descubrir).
    recargar();
  }, [vista, guardando, recargar]);

  if (vista.tipo === 'cargando') {
    return <EstadoPantalla estado="cargando" />;
  }
  if (vista.tipo === 'sin-permiso') {
    return <EstadoPantalla estado="sin-permiso" />;
  }

  const { respuestas, actual, mensaje } = vista;
  const pregunta = buscarPregunta(actual);
  const { numero, total } = posicionDe(actual, respuestas);
  const hayAnterior = preguntaAnterior(actual, respuestas) !== null;
  const esLaUltima = siguientePregunta(actual, respuestas) === null;
  const mostrarTerminar = esLaUltima && puedeTerminar(respuestas);

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <EncabezadoCuestionario
          seccion={pregunta.seccion}
          numero={numero}
          total={total}
          alRegresar={hayAnterior ? alRegresar : null}
        />
        {mensaje ? (
          <View style={estilos.aviso}>
            <Text accessibilityRole="alert" style={estilos.textoAviso}>
              {mensaje}
            </Text>
          </View>
        ) : null}
        <Text accessibilityRole="header" style={estilos.pregunta}>
          {pregunta.texto}
        </Text>
        <View style={estilos.opciones}>
          {pregunta.opciones.map((opcion) => (
            <OpcionRespuesta
              key={opcion.clave}
              clave={opcion.clave}
              texto={opcion.texto}
              seleccionada={respuestas[actual] === opcion.clave}
              alElegir={alElegir}
            />
          ))}
        </View>
        <Text style={estilos.apoyo}>{TEXTO_APOYO}</Text>
        {errorAlTerminar ? (
          <Text accessibilityRole="alert" style={estilos.error}>
            {MENSAJES.ERROR_CONEXION}
          </Text>
        ) : null}
        {mostrarTerminar ? (
          <BotonPildora texto={guardando ? '…' : TEXTO_VER_MI_PERFIL} alPresionar={alTerminar} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
