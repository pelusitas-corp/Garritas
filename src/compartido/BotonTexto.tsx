/**
 * Botón de texto con ícono, sin fondo ni borde (spec F-12 AE-6; decisión del
 * equipo, no está en el SRS). La píldora se deja para las acciones
 * principales; "Cerrar sesión" usa este botón en Mi perfil y en el menú del
 * usuario del albergue.
 *
 * Recibe el texto, el ícono de MaterialCommunityIcons y qué hacer al tocarlo.
 * Dibuja el ícono de 20 y el texto en negrita 16 café, centrados, con un área
 * de toque de al menos 44 de alto. No devuelve datos: solo dibuja el botón.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORES, FUENTES } from './tema';

/** Nombre de un ícono de MaterialCommunityIcons. */
export type IconoBotonTexto = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Alto mínimo del área de toque. */
const ALTO_MINIMO = 44;

/** Tamaño del ícono. */
const TAMANO_ICONO = 20;

const estilos = StyleSheet.create({
  boton: {
    minHeight: ALTO_MINIMO,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  presionado: { opacity: 0.6 },
  texto: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
});

interface Props {
  texto: string;
  icono: IconoBotonTexto;
  alPresionar: () => void;
}

export default function BotonTexto({ texto, icono, alPresionar }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texto}
      onPress={alPresionar}
      style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
    >
      <MaterialCommunityIcons name={icono} size={TAMANO_ICONO} color={COLORES.cafe} />
      <Text style={estilos.texto}>{texto}</Text>
    </Pressable>
  );
}
