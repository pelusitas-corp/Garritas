/**
 * Sección de fotos de "Nueva mascota" (F-02 §4 pasos 2 y 3; RF-13, RI-02,
 * AL-3, AL-4).
 *
 * - Vistas previas con ✕ para quitarlas antes de publicar (CA-03, CA-09).
 * - Indicador en lugar de la vista previa mientras se procesa una foto (§6).
 * - "Añadir una foto": gris y sin responder con 3 fotos (A5). F-13 AF-15
 *   (decisión del equipo; no está en el SRS): es un recuadro con borde
 *   punteado azul marino, un círculo menta de 72 con el ícono `camera-plus`
 *   (36, azul marino) y el texto debajo.
 * - Debajo, "Tomar foto" y "Elegir de la galería" (AL-4). Con la cámara
 *   negada, "Tomar foto" queda gris y se muestra el mensaje (CA-08).
 *
 * Recibe el estado de las fotos y qué hacer en cada botón. No devuelve
 * datos: solo dibuja la sección.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import MensajeError from '../../compartido/acceso/MensajeError';
import BotonPildora from '../../compartido/BotonPildora';
import MENSAJES from '../../compartido/mensajes';
import {
  BORDE,
  CIRCULOS,
  COLORES,
  FUENTES,
  ICONOS,
  OPACIDAD_DESVANECIDO,
  RADIOS,
  TAMANOS_TEXTO,
} from '../../compartido/tema';
import { TEXTOS_ALTA } from './textos';

/** Una foto en pantalla: una clave fija para React y su miniatura para la vista previa. */
export interface FotoEnPantalla {
  clave: string;
  miniatura: string;
}

interface Props {
  fotos: readonly FotoEnPantalla[];
  procesando: boolean;
  puedeAgregar: boolean;
  mostrarOpciones: boolean;
  camaraNegada: boolean;
  bloqueada: boolean;
  alAnadir: () => void;
  alTomar: () => void;
  alElegir: () => void;
  alQuitar: (posicion: number) => void;
}

const LADO_VISTA_PREVIA = 96;

/** Ícono de "Añadir una foto" (F-13 AF-15). */
const ICONO_ANADIR = 'camera-plus';

const estilos = StyleSheet.create({
  contenedor: { gap: 12 },
  vistas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vista: {
    width: LADO_VISTA_PREVIA,
    height: LADO_VISTA_PREVIA,
    borderRadius: RADIOS.tarjeta,
    overflow: 'hidden',
    backgroundColor: COLORES.menta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: { width: '100%', height: '100%' },
  quitar: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.azulMarino,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoQuitar: { fontFamily: FUENTES.negrita, fontSize: 14, color: COLORES.crema },
  opciones: { gap: 8 },
  // F-13 AF-15: recuadro con borde punteado y cámara con "+".
  anadir: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: RADIOS.tarjeta,
    borderWidth: BORDE,
    borderStyle: 'dashed',
    borderColor: COLORES.azulMarino,
  },
  anadirPresionado: { opacity: 0.8 },
  anadirDesactivado: { opacity: OPACIDAD_DESVANECIDO },
  circuloCamara: {
    width: CIRCULOS.camara,
    height: CIRCULOS.camara,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.menta,
  },
  textoAnadir: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.dato, color: COLORES.cafe },
});

export default function SeccionFotos({
  fotos,
  procesando,
  puedeAgregar,
  mostrarOpciones,
  camaraNegada,
  bloqueada,
  alAnadir,
  alTomar,
  alElegir,
  alQuitar,
}: Props) {
  /** A5: con 3 fotos, mientras se procesa una o mientras se publica, no responde. */
  const sinAnadir = !puedeAgregar || procesando || bloqueada;
  return (
    <View style={estilos.contenedor}>
      {fotos.length > 0 || procesando ? (
        <View style={estilos.vistas}>
          {fotos.map((foto, posicion) => (
            <View key={foto.clave} style={estilos.vista}>
              <Image source={{ uri: foto.miniatura }} style={estilos.imagen} />
              <Pressable
                accessibilityRole="button"
                disabled={bloqueada}
                hitSlop={8}
                onPress={() => alQuitar(posicion)}
                style={estilos.quitar}
              >
                <Text style={estilos.textoQuitar}>{TEXTOS_ALTA.quitarFoto}</Text>
              </Pressable>
            </View>
          ))}
          {procesando ? (
            <View style={estilos.vista}>
              <ActivityIndicator color={COLORES.azulMarino} />
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: sinAnadir }}
        disabled={sinAnadir}
        onPress={alAnadir}
        style={({ pressed }) => [
          estilos.anadir,
          pressed && estilos.anadirPresionado,
          sinAnadir && estilos.anadirDesactivado,
        ]}
      >
        <View style={estilos.circuloCamara}>
          <MaterialCommunityIcons
            name={ICONO_ANADIR}
            size={ICONOS.camara}
            color={COLORES.azulMarino}
          />
        </View>
        <Text style={estilos.textoAnadir}>{TEXTOS_ALTA.anadirFoto}</Text>
      </Pressable>

      {mostrarOpciones ? (
        <View style={estilos.opciones}>
          <BotonPildora
            texto={TEXTOS_ALTA.tomarFoto}
            alPresionar={alTomar}
            variante="secundario"
            desactivado={camaraNegada || procesando || bloqueada}
          />
          <BotonPildora
            texto={TEXTOS_ALTA.elegirGaleria}
            alPresionar={alElegir}
            variante="secundario"
            desactivado={procesando || bloqueada}
          />
          {camaraNegada ? <MensajeError texto={MENSAJES.CAMARA_SIN_PERMISO} /> : null}
        </View>
      ) : null}
    </View>
  );
}
