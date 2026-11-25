/**
 * Confirmación antes de guardar una decisión (spec F-08 PA-1, A1; CA-10).
 *
 * Es un `Modal` propio de la app (no el `Alert` del sistema), para usar los
 * textos y colores de la spec. Pregunta "¿Pre-aprobar la solicitud de
 * {nombre}?" o "¿Rechazar la solicitud de {nombre}?" con dos botones:
 * "Cancelar" (no guarda nada, A1) y el de la acción.
 *
 * Recibe la acción que se va a confirmar (`null` = cerrada), el nombre del
 * adoptante, `alConfirmar` y `alCancelar`. No devuelve datos.
 *
 * Diseño (plan de F-08): fondo oscuro (azul marino con opacidad, sin colores
 * nuevos); tarjeta crema de radio 24 y relleno 24; pregunta en negrita 18
 * centrada; "Cancelar" azul grisáceo; "Pre-aprobar" menta; "Rechazar" azul
 * marino con texto crema.
 */
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import { TEXTOS_DECISION, preguntaConfirmacion } from './textos';
import type { AccionDecision } from './textos';

/** Opacidad del fondo oscuro detrás de la tarjeta. */
const OPACIDAD_FONDO = 0.5;

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', padding: 24 },
  fondo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORES.azulMarino,
    opacity: OPACIDAD_FONDO,
  },
  tarjeta: {
    gap: 24,
    padding: 24,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.crema,
  },
  pregunta: {
    fontFamily: FUENTES.negrita,
    fontSize: 18,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  botones: { flexDirection: 'row', gap: 12 },
  boton: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: RADIOS.pildora,
  },
  cancelar: { backgroundColor: COLORES.azulGrisaceo },
  preAprobar: { backgroundColor: COLORES.menta },
  rechazar: { backgroundColor: COLORES.azulMarino },
  presionado: { opacity: 0.8 },
  texto: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  textoRechazar: { color: COLORES.crema },
});

interface Props {
  accion: AccionDecision | null;
  nombreAdoptante: string;
  alConfirmar: () => void;
  alCancelar: () => void;
}

export default function ConfirmarDecision({
  accion,
  nombreAdoptante,
  alConfirmar,
  alCancelar,
}: Props) {
  const esRechazo = accion === 'rechazar';
  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="fade"
      visible={accion !== null}
      onRequestClose={alCancelar}
    >
      <View style={estilos.contenedor}>
        <View style={estilos.fondo} />
        {accion ? (
          <View style={estilos.tarjeta} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={estilos.pregunta}>
              {preguntaConfirmacion(accion, nombreAdoptante)}
            </Text>
            <View style={estilos.botones}>
              <Pressable
                accessibilityRole="button"
                onPress={alCancelar}
                style={({ pressed }) => [
                  estilos.boton,
                  estilos.cancelar,
                  pressed && estilos.presionado,
                ]}
              >
                <Text style={estilos.texto}>{TEXTOS_DECISION.cancelar}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={alConfirmar}
                style={({ pressed }) => [
                  estilos.boton,
                  esRechazo ? estilos.rechazar : estilos.preAprobar,
                  pressed && estilos.presionado,
                ]}
              >
                <Text style={[estilos.texto, esRechazo && estilos.textoRechazar]}>
                  {esRechazo ? TEXTOS_DECISION.rechazar : TEXTOS_DECISION.preAprobar}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
