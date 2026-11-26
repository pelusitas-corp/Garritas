/**
 * Mosaico crema del Detalle (prototipo, DE-10): ícono de contorno arriba,
 * etiqueta chica y valor en negrita. Se usa para Especie, Edad y Tamaño (RF-28).
 *
 * Recibe el ícono, la etiqueta (textos.ts) y el valor del animal.
 * No devuelve datos: solo dibuja.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS, TAMANOS_TEXTO } from '../../compartido/tema';
import type { NombreIcono } from './iconosDescubrir';

interface Props {
  icono: NombreIcono;
  etiqueta: string;
  valor: string;
}

const estilos = StyleSheet.create({
  mosaico: {
    flex: 1,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
    // El prototipo usa 20; el mínimo de Soft UI es 24 (arquitectura §8).
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.crema,
  },
  etiqueta: { fontFamily: FUENTES.regular, fontSize: TAMANOS_TEXTO.minimo, color: COLORES.cafe },
  valor: { fontFamily: FUENTES.negrita, fontSize: 14, color: COLORES.cafe, textAlign: 'center' },
});

export default function Mosaico({ icono, etiqueta, valor }: Props) {
  return (
    <View style={estilos.mosaico}>
      <MaterialCommunityIcons name={icono} size={28} color={COLORES.cafe} />
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}
