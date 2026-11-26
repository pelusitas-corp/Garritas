/**
 * Modal "¿Quieres cerrar sesión?" (spec F-13 §4.1 punto 4, AF-17; 02 v1.4
 * N-3 y CA-14; decisión del equipo, no está en el SRS). Lo usan Mi perfil
 * (adoptante) y el menú del ícono de usuario (albergue).
 *
 * - `Modal` de React Native, `transparent` y sin animación, con un velo azul
 *   marino al 40 % (`FONDOS.velo`).
 * - Tarjeta crema centrada con la pregunta (negrita 20, café) y 2 botones:
 *   "Cancelar" (secundario) y "Cerrar sesión" (principal).
 * - "Atrás" de Android y tocar fuera de la tarjeta equivalen a "Cancelar".
 * Lo que pasa al responder lo decide `responderCerrarSesion`.
 *
 * Exporta dos piezas:
 * - `TarjetaCerrarSesion`: el velo y la tarjeta, sin `Modal`. El menú del
 *   albergue la dibuja dentro de su propio `Modal` para no abrir dos a la vez.
 * - `ConfirmarCerrarSesion` (por defecto): la tarjeta dentro de un `Modal`.
 *
 * Reciben `visible` (solo el `Modal`), `alOcultar` y `alCerrarSesion`.
 * No devuelven datos.
 */
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import BotonPildora from './BotonPildora';
import { responderCerrarSesion } from './respuestaCerrarSesion';
import type { RespuestaCerrarSesion } from './respuestaCerrarSesion';
import { COLORES, FONDOS, FUENTES, RADIOS, TAMANOS_TEXTO } from './tema';
import TEXTOS_COMPARTIDOS from './textos';

const estilos = StyleSheet.create({
  velo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: FONDOS.velo,
  },
  tarjeta: {
    alignSelf: 'stretch',
    gap: 16,
    padding: 24,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.crema,
  },
  pregunta: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.destacado,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  botones: { gap: 12 },
});

interface PropsTarjeta {
  alOcultar: () => void;
  alCerrarSesion: () => void;
}

/** El velo y la tarjeta con la pregunta y los 2 botones, sin `Modal`. */
export function TarjetaCerrarSesion({ alOcultar, alCerrarSesion }: PropsTarjeta) {
  const responder = (respuesta: RespuestaCerrarSesion) =>
    responderCerrarSesion(respuesta, { ocultar: alOcultar, cerrarSesion: alCerrarSesion });
  return (
    // Tocar el velo (fuera de la tarjeta) equivale a "Cancelar".
    <Pressable
      style={estilos.velo}
      onPress={() => responder('cancelar')}
      accessibilityLabel={TEXTOS_COMPARTIDOS.cancelar}
    >
      {/* La tarjeta atrapa sus toques para que no lleguen al velo. */}
      <Pressable style={estilos.tarjeta} accessibilityViewIsModal>
        <Text accessibilityRole="header" style={estilos.pregunta}>
          {TEXTOS_COMPARTIDOS.quieresCerrarSesion}
        </Text>
        <View style={estilos.botones}>
          <BotonPildora
            texto={TEXTOS_COMPARTIDOS.cancelar}
            variante="secundario"
            alPresionar={() => responder('cancelar')}
          />
          <BotonPildora
            texto={TEXTOS_COMPARTIDOS.cerrarSesion}
            alPresionar={() => responder('confirmar')}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

interface Props extends PropsTarjeta {
  visible: boolean;
}

export default function ConfirmarCerrarSesion({ visible, alOcultar, alCerrarSesion }: Props) {
  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="none"
      visible={visible}
      // "Atrás" de Android equivale a "Cancelar".
      onRequestClose={() =>
        responderCerrarSesion('cancelar', { ocultar: alOcultar, cerrarSesion: alCerrarSesion })
      }
    >
      <TarjetaCerrarSesion alOcultar={alOcultar} alCerrarSesion={alCerrarSesion} />
    </Modal>
  );
}
