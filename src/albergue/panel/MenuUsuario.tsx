/**
 * Ícono de usuario del encabezado de la lista y su botón "Cerrar sesión"
 * (spec F-07 A6; N-3, D-52 I1, PS-11; F-01 RN-08).
 *
 * - Al tocar el ícono aparece, 8 px debajo y alineado a la derecha, el menú:
 *   una tarjeta con "Cerrar sesión" y el ícono de salida.
 * - Tocar otra vez el ícono, o cualquier punto fuera del botón, lo oculta.
 *   Para eso, el botón se dibuja dentro de un `Modal` transparente que cubre
 *   toda la pantalla: la capa de fondo cierra el menú al tocarla.
 * - Al presionar "Cerrar sesión", llama a `alCerrarSesion` (la pantalla pasa
 *   `useSesion().cerrarSesion`; las guardas llevan después a `/`).
 *
 * Recibe `alCerrarSesion`. No devuelve datos.
 *
 * Medidas de Figma (plan de F-07): círculo azul grisáceo de 48 px con el
 * ícono de contorno de 24 en café.
 *
 * F-12 AE-6 (decisión del equipo, no está en el SRS): "Cerrar sesión" deja la
 * píldora azul marino y usa `BotonTexto` (ícono y texto café, sin fondo). El
 * menú conserva su contenedor como tarjeta: fondo crema, radio 24 y borde
 * azul grisáceo de `BORDE`, sin sombra (respuesta 4 de Jennifer al plan).
 *
 * F-13 AF-17 (decisión del equipo, no está en el SRS; 02 v1.4 N-3): al tocar
 * "Cerrar sesión" el menú se cambia por "¿Quieres cerrar sesión?"
 * (`TarjetaCerrarSesion`), dentro del mismo `Modal`, para no abrir dos
 * modales a la vez. "Cancelar", "atrás" o tocar fuera lo cierran sin salir.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { HostInstance } from 'react-native';

import BotonTexto from '../../compartido/BotonTexto';
import { TarjetaCerrarSesion } from '../../compartido/ConfirmarCerrarSesion';
import { BORDE, COLORES, RADIOS } from '../../compartido/tema';
import { ICONOS_PANEL } from './iconosPanel';
import { TEXTOS_PANEL } from './textos';

/** Diámetro del círculo del ícono de usuario (igual que en Descubrir). */
const DIAMETRO = 48;

/** Separación entre el ícono y el botón "Cerrar sesión" (Figma). */
const SEPARACION = 8;

/** Dónde se dibuja el menú: debajo del ícono y alineado a su borde derecho. */
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
  // F-12 AE-6: tarjeta crema con borde, sin sombra; dentro va `BotonTexto`.
  menu: {
    position: 'absolute',
    padding: 4,
    borderRadius: RADIOS.tarjeta,
    borderWidth: BORDE,
    borderColor: COLORES.azulGrisaceo,
    backgroundColor: COLORES.crema,
  },
});

interface Props {
  alCerrarSesion: () => void;
}

export default function MenuUsuario({ alCerrarSesion }: Props) {
  const icono = useRef<HostInstance>(null);
  const { width: anchoVentana } = useWindowDimensions();
  const [posicion, setPosicion] = useState<Posicion | null>(null);
  /** F-13 AF-17: `true` mientras se muestra "¿Quieres cerrar sesión?". */
  const [confirmando, setConfirmando] = useState(false);

  /** Abre el menú justo debajo del ícono (mide dónde quedó el ícono en la pantalla). */
  const abrir = () => {
    icono.current?.measureInWindow((x, y, ancho, alto) => {
      setPosicion({ top: y + alto + SEPARACION, right: anchoVentana - (x + ancho) });
    });
  };

  const cerrar = () => setPosicion(null);

  /** "Cerrar sesión" del menú: en lugar de salir, pide confirmación (AF-17). */
  const pedirConfirmacion = () => {
    cerrar();
    setConfirmando(true);
  };

  const ocultarConfirmacion = () => setConfirmando(false);

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
        visible={posicion !== null || confirmando}
        onRequestClose={confirmando ? ocultarConfirmacion : cerrar}
      >
        {confirmando ? (
          <TarjetaCerrarSesion alOcultar={ocultarConfirmacion} alCerrarSesion={alCerrarSesion} />
        ) : (
          // Tocar fuera del botón (también sobre el ícono) cierra el menú (PS-11).
          <Pressable
            style={estilos.capa}
            onPress={cerrar}
            accessibilityLabel={TEXTOS_PANEL.cerrarSesion}
          >
            {posicion ? (
              <View style={[estilos.menu, posicion]}>
                <BotonTexto
                  texto={TEXTOS_PANEL.cerrarSesion}
                  icono={ICONOS_PANEL.salir}
                  alPresionar={pedirConfirmacion}
                />
              </View>
            ) : null}
          </Pressable>
        )}
      </Modal>
    </>
  );
}
