/**
 * Estado de una solicitud en Mis solicitudes (spec F-13 §4.2, AF-3; decisión
 * del equipo, no está en el SRS). Reemplaza la píldora de F-06 (MS-12) para
 * que el estado no parezca botón (RN-03): es texto café en negrita 16 con un
 * puntito de color de 12 a la izquierda. Los colores del puntito los decide
 * `coloresDelPuntito`. El texto es el valor de `estado`, literal del SRS
 * (RF-27, 03 §6).
 *
 * Recibe el estado. No devuelve datos: solo dibuja.
 */
import { StyleSheet, Text, View } from 'react-native';

import type { EstadoSolicitud } from '../../compartido/modelo';
import { BORDE, COLORES, FUENTES, PUNTITOS, RADIOS, TAMANOS_TEXTO } from '../../compartido/tema';
import { coloresDelPuntito } from './misSolicitudes';

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  puntito: {
    width: PUNTITOS.estado,
    height: PUNTITOS.estado,
    borderRadius: RADIOS.pildora,
    borderWidth: BORDE,
  },
  texto: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.dato, color: COLORES.cafe },
});

export default function EstadoConPuntito({ estado }: { estado: EstadoSolicitud }) {
  const { relleno, borde } = coloresDelPuntito(estado);
  return (
    <View style={estilos.fila}>
      {/* El puntito es decoración: el lector de pantalla solo lee el estado. */}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          estilos.puntito,
          { backgroundColor: COLORES[relleno], borderColor: COLORES[borde] },
        ]}
      />
      <Text style={estilos.texto}>{estado}</Text>
    </View>
  );
}
