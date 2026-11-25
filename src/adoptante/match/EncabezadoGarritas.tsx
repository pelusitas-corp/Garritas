/**
 * Encabezado de Match y de "¡Solicitud enviada!" (F-06 MS-8, Figma): la
 * huella y "Garritas" a la izquierda y, a la derecha, el círculo azul
 * grisáceo de 48 con el ícono de usuario. El ícono es SOLO dibujo: 02 §4.2
 * no da ruta desde estas pantallas a Mi perfil (fuera de alcance de F-06).
 *
 * No recibe nada. No devuelve datos: solo dibuja.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES } from '../../compartido/tema';
import BotonCircular from '../descubrir/BotonCircular';
import { TEXTO_GARRITAS, TEXTO_MI_PERFIL } from '../descubrir/textos';
import ICONOS_MATCH from './iconosMatch';

/** Margen lateral del prototipo (PNG 390 × 844). */
export const MARGEN = 24;

const estilos = StyleSheet.create({
  encabezado: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: MARGEN,
  },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 24, color: COLORES.cafe },
});

export default function EncabezadoGarritas() {
  return (
    <View style={estilos.encabezado}>
      <View style={estilos.marca}>
        <MaterialCommunityIcons name={ICONOS_MATCH.huella} size={24} color={COLORES.cafe} />
        <Text accessibilityRole="header" style={estilos.titulo}>
          {TEXTO_GARRITAS}
        </Text>
      </View>
      <BotonCircular
        icono={ICONOS_MATCH.usuario}
        etiqueta={TEXTO_MI_PERFIL}
        fondo="azulGrisaceo"
        diametro={48}
        tamanoIcono={24}
      />
    </View>
  );
}
