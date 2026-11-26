/**
 * Píldora chica del prototipo (DE-10): Nunito 700, café. F-12 AE-1: el texto
 * sube de 12 a 14 (`TAMANOS_TEXTO.minimo`) y el alto, de 26 a 30.
 * La usan la tarjeta de Descubrir (especie y %) y los cuidados de salud del
 * Detalle (con su ícono de sí o no).
 *
 * Recibe el texto, el color de fondo (crema o menta) y un ícono opcional.
 * No devuelve datos: solo dibuja.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS, TAMANOS_TEXTO } from '../../compartido/tema';
import type { NombreColor } from '../../compartido/tema';
import type { NombreIcono } from './iconosDescubrir';

interface Props {
  texto: string;
  fondo?: NombreColor;
  icono?: NombreIcono | null;
}

const estilos = StyleSheet.create({
  pildora: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: RADIOS.pildora,
  },
  texto: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.minimo, color: COLORES.cafe },
});

export default function Pildora({ texto, fondo = 'crema', icono = null }: Props) {
  return (
    <View style={[estilos.pildora, { backgroundColor: COLORES[fondo] }]}>
      {icono ? <MaterialCommunityIcons name={icono} size={16} color={COLORES.cafe} /> : null}
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}
