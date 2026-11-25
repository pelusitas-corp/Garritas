/**
 * Tarjeta del porcentaje de Match (Figma, F-06 §4 y MS-12): menta de radio
 * 32 con la miniatura del animal en un círculo de 76, "{porcentaje}%" en
 * negrita 40 y "compatible" en negrita 14. En la variante < 30 % (MS-3) va
 * sin relleno y con borde azul grisáceo de 2.
 *
 * Recibe la miniatura, el % del motor y si es la variante de menor
 * coincidencia. No devuelve datos: solo dibuja.
 */
import { Image, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import { TEXTOS_MATCH, textoPorcentajeMatch } from './textos';

interface Props {
  miniatura: string;
  porcentaje: number;
  menorCoincidencia: boolean;
}

const MINIATURA = 76;

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: RADIOS.tarjetaGrande,
    backgroundColor: COLORES.menta,
  },
  variante: {
    // "Sin relleno" (MS-3): el mismo crema del fondo de la pantalla.
    backgroundColor: COLORES.crema,
    borderWidth: 2,
    borderColor: COLORES.azulGrisaceo,
  },
  miniatura: { width: MINIATURA, height: MINIATURA, borderRadius: RADIOS.pildora },
  porcentaje: { fontFamily: FUENTES.negrita, fontSize: 40, color: COLORES.cafe },
  compatible: { fontFamily: FUENTES.negrita, fontSize: 14, color: COLORES.cafe },
});

export default function TarjetaPorcentaje({ miniatura, porcentaje, menorCoincidencia }: Props) {
  const texto = textoPorcentajeMatch(porcentaje);
  return (
    <View
      style={[estilos.tarjeta, menorCoincidencia && estilos.variante]}
      accessible
      accessibilityLabel={`${texto} ${TEXTOS_MATCH.compatible}`}
    >
      <Image source={{ uri: miniatura }} style={estilos.miniatura} />
      <View>
        <Text style={estilos.porcentaje}>{texto}</Text>
        <Text style={estilos.compatible}>{TEXTOS_MATCH.compatible}</Text>
      </View>
    </View>
  );
}
