/**
 * Botón redondo con un ícono (diseño del prototipo de Descubrir y del
 * Detalle, DE-10): ícono de usuario, "ⓘ", "Pasar", "Me encanta" y "✕".
 *
 * Recibe el ícono, su nombre accesible (el texto de la spec), el color de
 * fondo, el diámetro y el tamaño del ícono (por defecto, la mitad del
 * diámetro). `alPresionar` es opcional: sin
 * él, el círculo solo se dibuja (no es un botón). No devuelve datos.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORES, RADIOS } from '../../compartido/tema';
import type { NombreColor } from '../../compartido/tema';
import type { NombreIcono } from './iconosDescubrir';

interface Props {
  icono: NombreIcono;
  etiqueta: string;
  fondo: NombreColor;
  diametro: number;
  tamanoIcono?: number;
  alPresionar?: () => void;
}

const estilos = StyleSheet.create({
  circulo: { alignItems: 'center', justifyContent: 'center', borderRadius: RADIOS.pildora },
  presionado: { opacity: 0.8 },
});

export default function BotonCircular({
  icono,
  etiqueta,
  fondo,
  diametro,
  tamanoIcono = Math.round(diametro / 2),
  alPresionar = undefined,
}: Props) {
  const forma = [
    estilos.circulo,
    { width: diametro, height: diametro, backgroundColor: COLORES[fondo] },
  ];
  const dibujo = <MaterialCommunityIcons name={icono} size={tamanoIcono} color={COLORES.cafe} />;
  if (!alPresionar) {
    return (
      <View style={forma} accessibilityLabel={etiqueta}>
        {dibujo}
      </View>
    );
  }
  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={8}
      style={({ pressed }) => [forma, pressed && estilos.presionado]}
    >
      {dibujo}
    </Pressable>
  );
}
