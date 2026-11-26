/**
 * Botón píldora de Soft UI (arquitectura §8, Taller 7).
 *
 * Recibe el texto, qué hacer al tocarlo y su variante:
 * - `principal`: azul marino (acción principal, como en Figma);
 * - `secundario`: menta (acciones de apoyo).
 * Opcionales (F-01, RN-09 y §3.1):
 * - `gris`: se ve gris, pero SÍ responde ("Continuar" sin la casilla, A1);
 * - `desactivado`: NO responde y se ve desvanecido, con su mismo color y
 *   opacidad `OPACIDAD_DESVANECIDO` (F-11 AD-4: campos vacíos, RN-09). Si
 *   llega junto con `gris`, se ve gris;
 * - `cargando`: muestra un indicador y NO responde (mientras contesta Firebase);
 * - `icono`: ícono a la izquierda del texto, del mismo color (F-06, decisión 3
 *   del plan: el corazón de "Enviar solicitud" y "Ver mis solicitudes");
 * - `tamano`: `normal` (todo el ancho) o `chico` (F-11 AD-2: texto 16, menos
 *   alto, del ancho de su texto y centrado, como "Iniciar sesión").
 * No devuelve datos: solo dibuja el botón.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, OPACIDAD_DESVANECIDO, RADIOS } from './tema';
import type { NombreColor } from './tema';

export type VarianteBoton = 'principal' | 'secundario';
export type TamanoBoton = 'normal' | 'chico';

interface Props {
  texto: string;
  alPresionar: () => void;
  variante?: VarianteBoton;
  gris?: boolean;
  desactivado?: boolean;
  cargando?: boolean;
  icono?: ComponentProps<typeof MaterialCommunityIcons>['name'];
  tamano?: TamanoBoton;
}

/** Cómo se ve y si responde un botón (lo decide `aspectoBoton`). */
export interface AspectoBoton {
  fondo: NombreColor;
  colorTexto: NombreColor;
  opacidad: number;
  responde: boolean;
}

/**
 * Recibe la variante y los estados del botón. Devuelve su color de fondo,
 * el color del texto, la opacidad (1, o `OPACIDAD_DESVANECIDO` si está
 * desactivado) y si responde al toque. Es pura: no dibuja nada.
 */
export function aspectoBoton(
  variante: VarianteBoton,
  { gris = false, desactivado = false, cargando = false } = {},
): AspectoBoton {
  const esPrincipal = variante === 'principal';
  let fondo: NombreColor = esPrincipal ? 'azulMarino' : 'menta';
  if (gris) {
    fondo = 'azulGrisaceo';
  }
  return {
    fondo,
    colorTexto: esPrincipal && !gris ? 'crema' : 'azulMarino',
    opacidad: desactivado && !gris ? OPACIDAD_DESVANECIDO : 1,
    responde: !desactivado && !cargando,
  };
}

/**
 * Medidas de cada tamaño. `chico` (F-11 AD-2): relleno 10 × 24, texto 16 y
 * centrado, así mide el ancho de su texto. `normal` no fija `alignSelf`: ocupa
 * el ancho que le dé su contenedor, como siempre.
 */
export const MEDIDAS_BOTON = {
  normal: { paddingVertical: 16, paddingHorizontal: 24, tamanoTexto: 18 },
  chico: { paddingVertical: 10, paddingHorizontal: 24, tamanoTexto: 16, alignSelf: 'center' },
} as const;

const estilos = StyleSheet.create({
  boton: {
    borderRadius: RADIOS.pildora,
    paddingHorizontal: MEDIDAS_BOTON.normal.paddingHorizontal,
    paddingVertical: MEDIDAS_BOTON.normal.paddingVertical,
    alignItems: 'center',
  },
  chico: {
    paddingHorizontal: MEDIDAS_BOTON.chico.paddingHorizontal,
    paddingVertical: MEDIDAS_BOTON.chico.paddingVertical,
    alignSelf: MEDIDAS_BOTON.chico.alignSelf,
  },
  presionado: { opacity: 0.8 },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { fontFamily: FUENTES.negrita, fontSize: MEDIDAS_BOTON.normal.tamanoTexto },
  textoChico: { fontSize: MEDIDAS_BOTON.chico.tamanoTexto },
});

export default function BotonPildora({
  texto,
  alPresionar,
  variante = 'principal',
  gris = false,
  desactivado = false,
  cargando = false,
  icono = undefined,
  tamano = 'normal',
}: Props) {
  const aspecto = aspectoBoton(variante, { gris, desactivado, cargando });
  const colorTexto = COLORES[aspecto.colorTexto];
  const esChico = tamano === 'chico';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !aspecto.responde, busy: cargando }}
      disabled={!aspecto.responde}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.boton,
        esChico && estilos.chico,
        { backgroundColor: COLORES[aspecto.fondo], opacity: aspecto.opacidad },
        pressed && estilos.presionado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <View style={estilos.contenido}>
          {icono ? <MaterialCommunityIcons name={icono} size={22} color={colorTexto} /> : null}
          <Text style={[estilos.texto, esChico && estilos.textoChico, { color: colorTexto }]}>
            {texto}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
