/**
 * Tarjeta de una solicitud en "Solicitudes de un animal" (spec F-07 flujo
 * principal paso 7; RF-04, RF-18; PS-9, PS-10 · spec F-08 flujo principal
 * pasos 2 a 7; RF-05, RF-21, RF-22, RC-05; PA-3, PA-4, PA-11).
 *
 * Recibe la solicitud, qué hacer al tocar sus datos (abrir el Detalle de
 * Solicitud), el estado de su decisión (`guardando` y `mensaje`) y
 * `alDecidir(accion)`. Dibuja:
 * - las iniciales del adoptante en un círculo, su nombre con "›" y el
 *   resumen del hogar separado por comas ("Departamento, primera vez");
 * - a la derecha, "{porcentaje}%" dentro de un círculo y "compatible" debajo;
 *   con "No Apto" (campo guardado `noApto`, RN-02 de F-07), "No Apto" va en
 *   su propia línea, en una píldora café, y la tarjeta se ve deslavada;
 * - "Ver solicitud ›", que también abre el Detalle;
 * - con "Pendiente": "✕ Rechazar" y "✓ Pre-aprobar" debajo (F-08 paso 2),
 *   también en las "No Apto" (PA-3);
 * - ya atendida: la píldora "✓ Pre-aprobada" (menta) o "✕ Rechazada"
 *   debajo del nombre (RN-02 de F-08);
 * - el mensaje de la decisión debajo de los botones (PA-11).
 * No devuelve datos.
 *
 * Los datos (círculo, nombre, hogar y %) son un botón que abre el Detalle;
 * los botones de decisión están aparte, para que tocarlos no abra el Detalle.
 *
 * Medidas de Figma (planes de F-07 y F-08): fondo azul grisáceo, radio 28,
 * relleno 20 (F-12 AE-8); círculo crema de 44 px con letras en negrita 16;
 * nombre negrita 17; resumen regular 16; píldora de alto 36 con negrita 16.
 *
 * F-13 (decisión del equipo, no está en el SRS):
 * - AF-8: "›" junto al nombre y el enlace "Ver solicitud ›" (negrita 16,
 *   azul marino, subrayado, alto mínimo 44) arriba de los botones;
 * - AF-11: el % en un círculo menta de 64 (negrita 20) con "compatible" (14)
 *   debajo; con "No Apto", el círculo gris (azul grisáceo al 50 %) y "No Apto"
 *   en su píldora café con texto crema, sin viñeta;
 * - AF-12: hogar separado por comas (el margen de 16 lo pone la pantalla);
 * - AF-14: "✕ Rechazada" café con texto crema y la tarjeta con opacidad 0.6.
 * Lo decide `vistaTarjeta` (panel.ts).
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AREA_TOQUE,
  CIRCULOS,
  COLORES,
  FUENTES,
  OPACIDAD_ATENUADA,
  RADIOS,
  TAMANOS_TEXTO,
} from '../../compartido/tema';
import BotonesDecision from '../solicitud/BotonesDecision';
import { vistaDelEstado } from '../solicitud/decision';
import { ICONOS_DECISION } from '../solicitud/iconosDecision';
import type { AccionDecision } from '../solicitud/textos';
import { iniciales, resumenDelHogar, vistaTarjeta } from './panel';
import type { SolicitudConId } from './panel';
import { TEXTOS_PANEL, textoPorcentaje } from './textos';

/** Radio de la tarjeta (Figma); cumple el mínimo de 24 de Soft UI. */
const RADIO_TARJETA = 28;

/** Diámetro del círculo de iniciales (Figma). */
const DIAMETRO_INICIALES = 44;

const estilos = StyleSheet.create({
  tarjeta: {
    gap: 12,
    // F-12 AE-8: relleno 20 y 12 entre filas (datos, botones y mensaje).
    padding: 20,
    borderRadius: RADIO_TARJETA,
    backgroundColor: COLORES.azulGrisaceo,
  },
  atenuada: { opacity: OPACIDAD_ATENUADA },
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
  filaNombre: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nombre: { flexShrink: 1, fontFamily: FUENTES.negrita, fontSize: 17, color: COLORES.cafe },
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
  // F-13 AF-14: "✕ Rechazada" café con texto crema.
  pildoraRechazada: { backgroundColor: COLORES.cafe },
  estado: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.dato },
  derecha: { alignItems: 'center', gap: 4 },
  // F-13 AF-11: el % dentro de un círculo de 64.
  circuloPorcentaje: {
    width: CIRCULOS.porcentaje,
    height: CIRCULOS.porcentaje,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
  },
  porcentaje: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.destacado,
    color: COLORES.cafe,
  },
  compatible: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.minimo, color: COLORES.cafe },
  // F-13 AF-11: "No Apto" en su propia línea, en píldora café con texto crema.
  noApto: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.cafe,
  },
  textoNoApto: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.minimo,
    color: COLORES.crema,
  },
  // F-13 AF-8: enlace con área de toque de 44.
  verSolicitud: { minHeight: AREA_TOQUE, justifyContent: 'center', alignSelf: 'flex-start' },
  textoVerSolicitud: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.dato,
    color: COLORES.azulMarino,
    textDecorationLine: 'underline',
  },
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
  const color = preAprobada ? COLORES.cafe : COLORES.crema;
  return (
    <View
      style={[estilos.pildora, preAprobada ? estilos.pildoraPreAprobada : estilos.pildoraRechazada]}
    >
      <MaterialCommunityIcons
        name={preAprobada ? ICONOS_DECISION.preAprobar : ICONOS_DECISION.rechazar}
        size={16}
        color={color}
      />
      <Text style={[estilos.estado, { color }]}>{texto}</Text>
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
  const vista = vistaTarjeta(solicitud);
  const vistaEstado = vistaDelEstado(solicitud.estado);
  const etiquetaAccesible = [
    solicitud.nombreAdoptante,
    `${porcentaje} ${TEXTOS_PANEL.compatible}`,
    vista.etiqueta,
    solicitud.estado,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <View style={[estilos.tarjeta, vista.atenuada && estilos.atenuada]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={etiquetaAccesible}
        onPress={alPresionar}
        style={({ pressed }) => [estilos.datos, pressed && estilos.presionada]}
      >
        <View style={estilos.circulo}>
          <Text style={estilos.iniciales}>{iniciales(solicitud.nombreAdoptante)}</Text>
        </View>
        <View style={estilos.centro}>
          <View style={estilos.filaNombre}>
            <Text style={estilos.nombre} numberOfLines={1}>
              {solicitud.nombreAdoptante}
            </Text>
            <Text style={estilos.nombre}>{TEXTOS_PANEL.flecha}</Text>
          </View>
          <Text style={estilos.hogar}>{resumenDelHogar(solicitud.resumenHogar)}</Text>
          {vistaEstado === 'botones' ? null : (
            <PildoraEstado preAprobada={vistaEstado === 'pre-aprobada'} texto={solicitud.estado} />
          )}
        </View>
        <View style={estilos.derecha}>
          <View style={[estilos.circuloPorcentaje, { backgroundColor: vista.fondoCirculo }]}>
            <Text style={estilos.porcentaje}>{porcentaje}</Text>
          </View>
          <Text style={estilos.compatible}>{TEXTOS_PANEL.compatible}</Text>
          {vista.etiqueta ? (
            <View style={estilos.noApto}>
              <Text style={estilos.textoNoApto}>{vista.etiqueta}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
      <Pressable accessibilityRole="link" onPress={alPresionar} style={estilos.verSolicitud}>
        <Text style={estilos.textoVerSolicitud}>{TEXTOS_PANEL.verSolicitud}</Text>
      </Pressable>
      {vistaEstado === 'botones' ? (
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
