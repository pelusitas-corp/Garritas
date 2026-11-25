/**
 * Encabezado "Garritas" de las pantallas de acceso (F-01 §3, textos de Figma).
 *
 * Recibe `conFlechaAtras`: si es `true`, muestra la flecha "←" que regresa a
 * la pantalla anterior (P5: todas las de acceso menos Selección de Rol).
 * No devuelve datos: solo dibuja el encabezado.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RUTAS } from '../navegacion/rutas';
import { COLORES, FUENTES } from '../tema';

interface Props {
  conFlechaAtras?: boolean;
}

const estilos = StyleSheet.create({
  encabezado: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  flecha: { position: 'absolute', left: 16, padding: 8 },
  marca: { fontFamily: FUENTES.negrita, fontSize: 24, color: COLORES.azulMarino },
});

/** Regresa a la pantalla anterior; si se abrió con un enlace directo, va a Selección de Rol. */
function regresar() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(RUTAS.seleccionRol);
  }
}

export default function EncabezadoAcceso({ conFlechaAtras = false }: Props) {
  return (
    <View style={estilos.encabezado}>
      {conFlechaAtras ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Atrás"
          hitSlop={12}
          onPress={regresar}
          style={estilos.flecha}
        >
          <Ionicons name="arrow-back" size={28} color={COLORES.azulMarino} />
        </Pressable>
      ) : null}
      <Text accessibilityRole="header" style={estilos.marca}>
        Garritas
      </Text>
    </View>
  );
}
