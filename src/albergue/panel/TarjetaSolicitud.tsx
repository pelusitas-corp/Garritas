/**
 * Tarjeta de una solicitud en "Solicitudes de un animal" (spec F-07 flujo
 * principal paso 7; RF-04, RF-18; PS-9, PS-10).
 *
 * Recibe la solicitud y qué hacer al tocarla (abrir el Detalle de
 * Solicitud, pantalla de F-08). Dibuja:
 * - las iniciales del adoptante en un círculo, su nombre y el resumen del
 *   hogar ("Departamento · primera vez");
 * - el estado en una píldora pequeña debajo del nombre (PS-10). F-08 la
 *   cambia por "Pre-aprobar" y "Rechazar" en las "Pendiente";
 * - a la derecha, "{porcentaje}%" y debajo "compatible", o
 *   "compatible · No Apto" si el campo guardado `noApto` es `true` (RN-02).
 *   Con "No Apto", toda la tarjeta se ve deslavada (opacidad ~0.6, RF-18).
 * No devuelve datos.
 *
 * Medidas de Figma (plan de F-07): fondo azul grisáceo, radio 28, relleno
 * 16; círculo crema de 44 px con letras en negrita 16; nombre negrita 17;
 * resumen regular 12; píldora crema de alto 32 con negrita 13; "90%" en
 * negrita 22 y "compatible" en negrita 11. Todo en café.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: RADIO_TARJETA,
    backgroundColor: COLORES.azulGrisaceo,
  },
  noApto: { opacity: OPACIDAD_NO_APTO },
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
  hogar: { fontFamily: FUENTES.regular, fontSize: 12, color: COLORES.cafe },
  pildora: {
    height: 32,
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 14,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.crema,
  },
  estado: { fontFamily: FUENTES.negrita, fontSize: 13, color: COLORES.cafe },
  derecha: { alignItems: 'flex-end' },
  porcentaje: { fontFamily: FUENTES.negrita, fontSize: 22, color: COLORES.cafe },
  compatible: { fontFamily: FUENTES.negrita, fontSize: 11, color: COLORES.cafe },
});

interface Props {
  solicitud: SolicitudConId;
  alPresionar: () => void;
}

export default function TarjetaSolicitud({ solicitud, alPresionar }: Props) {
  const porcentaje = textoPorcentaje(solicitud.porcentaje);
  const compatible = textoCompatible(solicitud.noApto);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${solicitud.nombreAdoptante}, ${porcentaje} ${compatible}, ${solicitud.estado}`}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.tarjeta,
        solicitud.noApto && estilos.noApto,
        pressed && estilos.presionada,
      ]}
    >
      <View style={estilos.circulo}>
        <Text style={estilos.iniciales}>{iniciales(solicitud.nombreAdoptante)}</Text>
      </View>
      <View style={estilos.centro}>
        <Text style={estilos.nombre} numberOfLines={1}>
          {solicitud.nombreAdoptante}
        </Text>
        <Text style={estilos.hogar}>{resumenDelHogar(solicitud.resumenHogar)}</Text>
        <View style={estilos.pildora}>
          <Text style={estilos.estado}>{solicitud.estado}</Text>
        </View>
      </View>
      <View style={estilos.derecha}>
        <Text style={estilos.porcentaje}>{porcentaje}</Text>
        <Text style={estilos.compatible}>{compatible}</Text>
      </View>
    </Pressable>
  );
}
