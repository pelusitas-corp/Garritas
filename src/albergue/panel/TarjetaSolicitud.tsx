/**
 * Tarjeta de una solicitud en "Solicitudes de un animal" (spec F-07 flujo
 * principal paso 7; RF-04, RF-18; PS-9, PS-10 · spec F-08 flujo principal
 * pasos 2 a 7; RF-05, RF-21, RF-22, RC-05; PA-3, PA-4, PA-11).
 *
 * Recibe la solicitud, qué hacer al tocar sus datos (abrir el Detalle de
 * Solicitud), el estado de su decisión (`guardando` y `mensaje`) y
 * `alDecidir(accion)`. Dibuja:
 * - las iniciales del adoptante en un círculo, su nombre y el resumen del
 *   hogar ("Departamento · primera vez");
 * - a la derecha, "{porcentaje}%" y debajo "compatible", o
 *   "compatible · No Apto" si el campo guardado `noApto` es `true` (RN-02 de
 *   F-07). Con "No Apto", toda la tarjeta se ve deslavada (opacidad ~0.6);
 * - con "Pendiente": "✕ Rechazar" y "✓ Pre-aprobar" debajo (F-08 paso 2),
 *   también en las "No Apto" (PA-3);
 * - ya atendida: la píldora "✓ Pre-aprobada" (menta) o "✕ Rechazada"
 *   (crema) debajo del nombre (RN-02 de F-08);
 * - el mensaje de la decisión debajo de los botones (PA-11).
 * No devuelve datos.
 *
 * Los datos (círculo, nombre, hogar y %) son un botón que abre el Detalle;
 * los botones de decisión están aparte, para que tocarlos no abra el Detalle.
 *
 * Medidas de Figma (planes de F-07 y F-08): fondo azul grisáceo, radio 28,
 * relleno 16; círculo crema de 44 px con letras en negrita 16; nombre
 * negrita 17; resumen regular 16; píldora de alto 36 con negrita 16; "90%"
 * en negrita 22 y "compatible" en negrita 14; botones 12 px debajo de los
 * datos. Todo en café. F-12 AE-1: el resumen y el estado son datos (16) y
 * los demás textos no bajan de 14.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS, TAMANOS_TEXTO } from '../../compartido/tema';
import BotonesDecision from '../solicitud/BotonesDecision';
import { vistaDelEstado } from '../solicitud/decision';
import { ICONOS_DECISION } from '../solicitud/iconosDecision';
import type { AccionDecision } from '../solicitud/textos';
import { iniciales, resumenDelHogar } from './panel';
import type { SolicitudConId } from './panel';
import { textoCompatible, textoPorcentaje } from './textos';

/** Radio de la tarjeta (Figma); cumple el mínimo de 24 de Soft UI. */
const RADIO_TARJETA = 28;

/** Diámetro del círculo de iniciales (Figma). */
const DIAMETRO_INICIALES = 44;

/** Opacidad de la tarjeta "No Apto": se ve gris y deslavada, como en Figma. */
const OPACIDAD_NO_APTO = 0.6;

const estilos = StyleSheet.create({
  tarjeta: {
    gap: 12,
    padding: 16,
    borderRadius: RADIO_TARJETA,
    backgroundColor: COLORES.azulGrisaceo,
  },
  noApto: { opacity: OPACIDAD_NO_APTO },
  datos: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  presionada: { opacity: 0.8 },
  circulo: {
    width: DIAMETRO_INICIALES,
    height: DIAMETRO_INICIALES,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.crema,
  },
  iniciales: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  centro: { flex: 1, alignItems: 'flex-start', gap: 4 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 17, color: COLORES.cafe },
  hogar: { fontFamily: FUENTES.regular, fontSize: TAMANOS_TEXTO.dato, color: COLORES.cafe },
  pildora: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 14,
    borderRadius: RADIOS.pildora,
  },
  pildoraPreAprobada: { backgroundColor: COLORES.menta },
  pildoraRechazada: { backgroundColor: COLORES.crema },
  estado: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.dato, color: COLORES.cafe },
  derecha: { alignItems: 'flex-end' },
  porcentaje: { fontFamily: FUENTES.negrita, fontSize: 22, color: COLORES.cafe },
  compatible: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.minimo, color: COLORES.cafe },
  mensaje: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.minimo, color: COLORES.cafe },
});

interface Props {
  solicitud: SolicitudConId;
  alPresionar: () => void;
  guardando?: boolean;
  mensaje?: string | null;
  alDecidir: (accion: AccionDecision) => void;
}

/** Píldora de una solicitud ya atendida: "✓ Pre-aprobada" o "✕ Rechazada" (RN-02 de F-08). */
function PildoraEstado({ preAprobada, texto }: { preAprobada: boolean; texto: string }) {
  return (
    <View
      style={[estilos.pildora, preAprobada ? estilos.pildoraPreAprobada : estilos.pildoraRechazada]}
    >
      <MaterialCommunityIcons
        name={preAprobada ? ICONOS_DECISION.preAprobar : ICONOS_DECISION.rechazar}
        size={16}
        color={COLORES.cafe}
      />
      <Text style={estilos.estado}>{texto}</Text>
    </View>
  );
}

export default function TarjetaSolicitud({
  solicitud,
  alPresionar,
  guardando = false,
  mensaje = null,
  alDecidir,
}: Props) {
  const porcentaje = textoPorcentaje(solicitud.porcentaje);
  const compatible = textoCompatible(solicitud.noApto);
  const vista = vistaDelEstado(solicitud.estado);
  return (
    <View style={[estilos.tarjeta, solicitud.noApto && estilos.noApto]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${solicitud.nombreAdoptante}, ${porcentaje} ${compatible}, ${solicitud.estado}`}
        onPress={alPresionar}
        style={({ pressed }) => [estilos.datos, pressed && estilos.presionada]}
      >
        <View style={estilos.circulo}>
          <Text style={estilos.iniciales}>{iniciales(solicitud.nombreAdoptante)}</Text>
        </View>
        <View style={estilos.centro}>
          <Text style={estilos.nombre} numberOfLines={1}>
            {solicitud.nombreAdoptante}
          </Text>
          <Text style={estilos.hogar}>{resumenDelHogar(solicitud.resumenHogar)}</Text>
          {vista === 'botones' ? null : (
            <PildoraEstado preAprobada={vista === 'pre-aprobada'} texto={solicitud.estado} />
          )}
        </View>
        <View style={estilos.derecha}>
          <Text style={estilos.porcentaje}>{porcentaje}</Text>
          <Text style={estilos.compatible}>{compatible}</Text>
        </View>
      </Pressable>
      {vista === 'botones' ? (
        <BotonesDecision
          variante="tarjeta"
          nombreAdoptante={solicitud.nombreAdoptante}
          guardando={guardando}
          alDecidir={alDecidir}
        />
      ) : null}
      {mensaje ? (
        <Text accessibilityRole="alert" style={estilos.mensaje}>
          {mensaje}
        </Text>
      ) : null}
    </View>
  );
}
