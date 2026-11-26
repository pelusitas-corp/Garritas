/**
 * "¡Solicitud enviada!" (spec F-06 flujo C: RF-11; N-6; ruta
 * /solicitud-enviada/{solicitudId}). Reemplaza la pantalla provisional.
 *
 * Pantalla propia, sin pestañas (N-6). Lee la solicitud del servidor
 * (`useSolicitudEnviada`) y muestra la huella con corazón, "¡Solicitud
 * enviada!", el subtítulo y una tarjeta menta con la miniatura en círculo,
 * el nombre del animal y su estado ("Pendiente") como texto negrita 14 café
 * (ajuste de la PO al plan; no es píldora). "Ver mis solicitudes" siempre
 * está visible (§6): abre la pestaña y cierra Detalle y Match (`dismissTo`).
 */
import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EncabezadoGarritas, { MARGEN } from '../../../src/adoptante/match/EncabezadoGarritas';
import HuellaMatch from '../../../src/adoptante/match/HuellaMatch';
import ICONOS_MATCH from '../../../src/adoptante/match/iconosMatch';
import { pantallaSolicitudEnviada } from '../../../src/adoptante/match/match';
import { TEXTOS_SOLICITUD_ENVIADA } from '../../../src/adoptante/match/textos';
import useSolicitudEnviada from '../../../src/adoptante/match/useSolicitudEnviada';
import BotonPildora from '../../../src/compartido/BotonPildora';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES, RADIOS } from '../../../src/compartido/tema';

const MINIATURA = 76;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: MARGEN,
    paddingVertical: 16,
  },
  titulo: {
    fontFamily: FUENTES.negrita,
    fontSize: 32,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: FUENTES.regular,
    fontSize: 16,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: RADIOS.tarjetaGrande,
    backgroundColor: COLORES.menta,
  },
  miniatura: { width: MINIATURA, height: MINIATURA, borderRadius: RADIOS.pildora },
  datos: { flexShrink: 1 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe },
  estadoSolicitud: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  pie: { paddingHorizontal: MARGEN, paddingTop: 8, paddingBottom: 12 },
});

/** "Ver mis solicitudes": abre la pestaña y cierra Detalle y Match (02 §4.2). */
function verMisSolicitudes() {
  router.dismissTo(RUTAS.misSolicitudes);
}

export default function SolicitudEnviada() {
  const { solicitudId } = useLocalSearchParams<{ solicitudId: string }>();
  const { estado, reintentar } = useSolicitudEnviada(solicitudId);
  const propsEstado = pantallaSolicitudEnviada(estado, reintentar);

  return (
    <SafeAreaView style={estilos.pantalla}>
      <EncabezadoGarritas />
      {propsEstado || estado.tipo !== 'con-datos' ? (
        <EstadoPantalla
          estado={propsEstado?.estado ?? 'cargando'}
          mensaje={propsEstado?.mensaje}
          boton={propsEstado?.boton}
        />
      ) : (
        <ScrollView contentContainerStyle={estilos.contenido}>
          <HuellaMatch />
          <Text accessibilityRole="header" style={estilos.titulo}>
            {TEXTOS_SOLICITUD_ENVIADA.titulo}
          </Text>
          <Text style={estilos.subtitulo}>{TEXTOS_SOLICITUD_ENVIADA.subtitulo}</Text>
          <View style={estilos.tarjeta}>
            <Image source={{ uri: estado.solicitud.miniaturaAnimal }} style={estilos.miniatura} />
            <View style={estilos.datos}>
              <Text style={estilos.nombre} numberOfLines={1}>
                {estado.solicitud.nombreAnimal}
              </Text>
              <Text style={estilos.estadoSolicitud}>{estado.solicitud.estado}</Text>
            </View>
          </View>
        </ScrollView>
      )}
      <View style={estilos.pie}>
        <BotonPildora
          texto={TEXTOS_SOLICITUD_ENVIADA.verMisSolicitudes}
          icono={ICONOS_MATCH.corazon}
          alPresionar={verMisSolicitudes}
        />
      </View>
    </SafeAreaView>
  );
}
