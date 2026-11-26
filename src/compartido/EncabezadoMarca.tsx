/**
 * Encabezado de marca (spec F-11 §4.4, AD-5; decisión del equipo, no está en
 * el SRS): la huella y un texto a su lado, alineados a la izquierda, con las
 * medidas del encabezado de Descubrir (alto 48, texto negrita 24 café,
 * margen lateral 24).
 *
 * Recibe:
 * - `texto`: lo que va junto a la huella ("Garritas" o "Mi perfil"); la
 *   pantalla lo trae de sus textos, porque `src/compartido` no importa de
 *   `src/adoptante`.
 * - `derecha` (opcional): lo que va en el lado derecho, como el botón de
 *   usuario de Descubrir.
 * No devuelve datos: solo dibuja.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES } from './tema';

/** Ícono de la huella (el mismo que `ICONOS_DESCUBRIR.marca`). */
const ICONO_HUELLA = 'paw';

/** Margen lateral del prototipo (PNG 390 × 844). */
const MARGEN = 24;

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

interface Props {
  texto: string;
  derecha?: ReactNode;
}

export default function EncabezadoMarca({ texto, derecha = null }: Props) {
  return (
    <View style={estilos.encabezado}>
      <View style={estilos.marca}>
        <MaterialCommunityIcons name={ICONO_HUELLA} size={24} color={COLORES.cafe} />
        <Text accessibilityRole="header" style={estilos.titulo}>
          {texto}
        </Text>
      </View>
      {derecha}
    </View>
  );
}
