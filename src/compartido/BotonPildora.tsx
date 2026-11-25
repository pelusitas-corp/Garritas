/**
 * Botón píldora de Soft UI (arquitectura §8, Taller 7).
 *
 * Recibe el texto, qué hacer al tocarlo y su variante:
 * - `principal`: azul marino (acción principal, como en Figma);
 * - `secundario`: menta (acciones de apoyo).
 * Opcionales (F-01, RN-09 y §3.1):
 * - `gris`: se ve gris, pero SÍ responde ("Continuar" sin la casilla, A1);
 * - `desactivado`: se ve gris y NO responde (campos vacíos, RN-09);
 * - `cargando`: muestra un indicador y NO responde (mientras contesta Firebase).
 * No devuelve datos: solo dibuja el botón.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { COLORES, FUENTES, RADIOS } from './tema';

interface Props {
  texto: string;
  alPresionar: () => void;
  variante?: 'principal' | 'secundario';
  gris?: boolean;
  desactivado?: boolean;
  cargando?: boolean;
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
        <Text
          style={[
            estilos.texto,
            esPrincipal && !seVeGris ? estilos.textoPrincipal : estilos.textoSecundario,
          ]}
        >
          {texto}
        </Text>
      )}
    </Pressable>
  );
}
