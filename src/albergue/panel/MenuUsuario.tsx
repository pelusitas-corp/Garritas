/**
 * Ícono de usuario del encabezado de la lista y su botón "Cerrar sesión"
 * (spec F-07 A6; N-3, D-52 I1, PS-11; F-01 RN-08).
 *
 * - Al tocar el ícono aparece, 8 px debajo y alineado a la derecha, un botón
 *   oscuro "Cerrar sesión" con el ícono de salida.
 * - Tocar otra vez el ícono, o cualquier punto fuera del botón, lo oculta.
 *   Para eso, el botón se dibuja dentro de un `Modal` transparente que cubre
 *   toda la pantalla: la capa de fondo cierra el menú al tocarla.
 * - Al presionar "Cerrar sesión", llama a `alCerrarSesion` (la pantalla pasa
 *   `useSesion().cerrarSesion`; las guardas llevan después a `/`).
 *
 * Recibe `alCerrarSesion`. No devuelve datos.
 *
 * Medidas de Figma (plan de F-07): círculo azul grisáceo de 48 px con el
 * ícono de contorno de 24 en café; píldora azul marino con texto crema en
 * negrita 15 y sombra suave.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import type { HostInstance } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import { ICONOS_PANEL } from './iconosPanel';
import { TEXTOS_PANEL } from './textos';

/** Diámetro del círculo del ícono de usuario (igual que en Descubrir). */
const DIAMETRO = 48;

/** Separación entre el ícono y el botón "Cerrar sesión" (Figma). */
const SEPARACION = 8;

/** Dónde se dibuja el botón: debajo del ícono y alineado a su borde derecho. */
interface Posicion {
  top: number;
  right: number;
}

const estilos = StyleSheet.create({
  circulo: {
    width: DIAMETRO,
    height: DIAMETRO,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.azulGrisaceo,
  },
  presionado: { opacity: 0.8 },
  capa: { flex: 1 },
  boton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.azulMarino,
    // Sombra suave (iOS: shadow*; Android: elevation).
    shadowColor: COLORES.azulMarino,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  texto: { fontFamily: FUENTES.negrita, fontSize: 15, color: COLORES.crema },
});

interface Props {
  alCerrarSesion: () => void;
}

export default function MenuUsuario({ alCerrarSesion }: Props) {
  const icono = useRef<HostInstance>(null);
  const { width: anchoVentana } = useWindowDimensions();
  const [posicion, setPosicion] = useState<Posicion | null>(null);

  /** Abre el menú justo debajo del ícono (mide dónde quedó el ícono en la pantalla). */
  const abrir = () => {
    icono.current?.measureInWindow((x, y, ancho, alto) => {
      setPosicion({ top: y + alto + SEPARACION, right: anchoVentana - (x + ancho) });
    });
  };

  const cerrar = () => setPosicion(null);

  const cerrarSesion = () => {
    cerrar();
    alCerrarSesion();
  };

  return (
    <>
      <Pressable
        ref={icono}
        accessibilityRole="button"
        accessibilityLabel={TEXTOS_PANEL.cerrarSesion}
        accessibilityState={{ expanded: posicion !== null }}
        hitSlop={8}
        onPress={posicion ? cerrar : abrir}
        style={({ pressed }) => [estilos.circulo, pressed && estilos.presionado]}
      >
        <MaterialCommunityIcons name={ICONOS_PANEL.usuario} size={24} color={COLORES.cafe} />
      </Pressable>
      <Modal
        transparent
        statusBarTranslucent
        animationType="fade"
        visible={posicion !== null}
        onRequestClose={cerrar}
      >
        {/* Tocar fuera del botón (también sobre el ícono) cierra el menú (PS-11). */}
        <Pressable
          style={estilos.capa}
          onPress={cerrar}
          accessibilityLabel={TEXTOS_PANEL.cerrarSesion}
        >
          {posicion ? (
            <Pressable
              accessibilityRole="button"
              onPress={cerrarSesion}
              style={({ pressed }) => [estilos.boton, posicion, pressed && estilos.presionado]}
            >
              <MaterialCommunityIcons name={ICONOS_PANEL.salir} size={20} color={COLORES.crema} />
              <Text style={estilos.texto}>{TEXTOS_PANEL.cerrarSesion}</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}
