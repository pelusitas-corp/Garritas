/**
 * Botón píldora de Soft UI (arquitectura §8, Taller 7).
 *
 * Recibe el texto, qué hacer al tocarlo y su variante:
 * - `principal`: azul marino (acción principal, como en Figma);
 * - `secundario`: menta (acciones de apoyo).
 * Opcionales (F-01, RN-09 y §3.1):
 * - `gris`: se ve gris, pero SÍ responde ("Continuar" sin la casilla, A1);
 * - `desactivado`: se ve gris y NO responde (campos vacíos, RN-09);
 * - `cargando`: muestra un indicador y NO responde (mientras contesta Firebase);
 * - `icono`: ícono a la izquierda del texto, del mismo color (F-06, decisión 3
 *   del plan: el corazón de "Enviar solicitud" y "Ver mis solicitudes").
 * No devuelve datos: solo dibuja el botón.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from './tema';

interface Props {
  texto: string;
  alPresionar: () => void;
  variante?: 'principal' | 'secundario';
  gris?: boolean;
  desactivado?: boolean;
  cargando?: boolean;
  icono?: ComponentProps<typeof MaterialCommunityIcons>['name'];
}

const estilos = StyleSheet.create({
  boton: {
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  principal: { backgroundColor: COLORES.azulMarino },
  secundario: { backgroundColor: COLORES.menta },
  gris: { backgroundColor: COLORES.azulGrisaceo },
  presionado: { opacity: 0.8 },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { fontFamily: FUENTES.negrita, fontSize: 18 },
  textoPrincipal: { color: COLORES.crema },
  textoSecundario: { color: COLORES.azulMarino },
});

export default function BotonPildora({
  texto,
  alPresionar,
  variante = 'principal',
  gris = false,
  desactivado = false,
  cargando = false,
  icono = undefined,
}: Props) {
  const esPrincipal = variante === 'principal';
  const noResponde = desactivado || cargando;
  const seVeGris = gris || desactivado;
  const colorTexto = esPrincipal && !seVeGris ? COLORES.crema : COLORES.azulMarino;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: noResponde, busy: cargando }}
      disabled={noResponde}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.boton,
        esPrincipal ? estilos.principal : estilos.secundario,
        seVeGris && estilos.gris,
        pressed && estilos.presionado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <View style={estilos.contenido}>
          {icono ? <MaterialCommunityIcons name={icono} size={22} color={colorTexto} /> : null}
          <Text
            style={[
              estilos.texto,
              esPrincipal && !seVeGris ? estilos.textoPrincipal : estilos.textoSecundario,
            ]}
          >
            {texto}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
