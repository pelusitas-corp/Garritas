/**
 * Píldora del estado de una solicitud en Mis solicitudes (Figma, F-06
 * flujo D y MS-12). Va a lo ancho de la tarjeta, alto 36, negrita 16 café
 * (el estado es un dato, F-12 AE-1):
 * - "Pendiente": sin relleno (se ve el azul grisáceo de la tarjeta) y borde café;
 * - "Pre-aprobada": relleno menta;
 * - "Rechazada": relleno crema con borde café.
 * El texto es el valor de `estado`, literal del SRS (RF-27, 03 §6).
 * Solo se usa en Mis solicitudes (ajuste de la PO al plan).
 *
 * Recibe el estado. No devuelve datos: solo dibuja.
 */
import { StyleSheet, Text, View } from 'react-native';

import type { EstadoSolicitud } from '../../compartido/modelo';
import { COLORES, FUENTES, RADIOS, TAMANOS_TEXTO } from '../../compartido/tema';

const estilos = StyleSheet.create({
  pildora: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    borderWidth: 1,
  },
  texto: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.dato, color: COLORES.cafe },
});

/** Colores de cada estado (solo de `tema.ts`). */
const ESTILO_ESTADO = StyleSheet.create({
  Pendiente: { backgroundColor: COLORES.azulGrisaceo, borderColor: COLORES.cafe },
  'Pre-aprobada': { backgroundColor: COLORES.menta, borderColor: COLORES.menta },
  Rechazada: { backgroundColor: COLORES.crema, borderColor: COLORES.cafe },
} satisfies Record<EstadoSolicitud, object>);

export default function PildoraEstado({ estado }: { estado: EstadoSolicitud }) {
  return (
    <View style={[estilos.pildora, ESTILO_ESTADO[estado]]}>
      <Text style={estilos.texto}>{estado}</Text>
    </View>
  );
}
