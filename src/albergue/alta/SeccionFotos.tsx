/**
 * Sección de fotos de "Nueva mascota" (F-02 §4 pasos 2 y 3; RF-13, RI-02,
 * AL-3, AL-4).
 *
 * - Vistas previas con ✕ para quitarlas antes de publicar (CA-03, CA-09).
 * - Indicador en lugar de la vista previa mientras se procesa una foto (§6).
 * - "Añadir una foto": gris y sin responder con 3 fotos (A5).
 * - Debajo, "Tomar foto" y "Elegir de la galería" (AL-4). Con la cámara
 *   negada, "Tomar foto" queda gris y se muestra el mensaje (CA-08).
 *
 * Recibe el estado de las fotos y qué hacer en cada botón. No devuelve
 * datos: solo dibuja la sección.
 */
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import MensajeError from '../../compartido/acceso/MensajeError';
import BotonPildora from '../../compartido/BotonPildora';
import MENSAJES from '../../compartido/mensajes';
import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
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

      <BotonPildora
        texto={TEXTOS_ALTA.anadirFoto}
        alPresionar={alAnadir}
        variante="secundario"
        desactivado={!puedeAgregar || procesando || bloqueada}
      />

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
