/**
 * Descubrir (spec F-03: RF-10, RF-26, RNF-01; ruta /descubrir; pestaña del adoptante).
 *
 * Muestra el mazo ordenado por compatibilidad, una tarjeta a la vez.
 * Diseño del prototipo (DE-10): encabezado con la huella y "Garritas", el
 * ícono de usuario en un círculo azul claro (abre Mi perfil) y el subtítulo
 * "Tu próximo mejor amigo.". Si llega de G-8, muestra arriba "Esta mascota
 * ya no está disponible para adopción" (DE-4).
 * Los estados (cargando, vacía, mazo terminado, error y sin permiso) los
 * decide `pantallaDescubrir` y los dibuja `EstadoPantalla`.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BotonCircular from '../../../src/adoptante/descubrir/BotonCircular';
import { pantallaDescubrir } from '../../../src/adoptante/descubrir/estados';
import { ICONOS_DESCUBRIR } from '../../../src/adoptante/descubrir/iconosDescubrir';
import { tarjetaActual } from '../../../src/adoptante/descubrir/mazo';
import TarjetaAnimal from '../../../src/adoptante/descubrir/TarjetaAnimal';
import {
  TEXTO_GARRITAS,
  TEXTO_MI_PERFIL,
  TEXTO_SUBTITULO_DESCUBRIR,
} from '../../../src/adoptante/descubrir/textos';
import useDescubrir from '../../../src/adoptante/descubrir/useDescubrir';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import MENSAJES from '../../../src/compartido/mensajes';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES, RADIOS } from '../../../src/compartido/tema';

/** Margen lateral del prototipo. */
const MARGEN = 24;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  encabezado: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: MARGEN,
  },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 24, color: COLORES.cafe },
  subtitulo: {
    marginTop: 16,
    paddingHorizontal: MARGEN,
    fontFamily: FUENTES.negrita,
    fontSize: 18,
    color: COLORES.cafe,
  },
  aviso: {
    marginHorizontal: MARGEN,
    marginTop: 12,
    padding: 16,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.menta,
  },
  textoAviso: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  cuerpo: { flex: 1, paddingHorizontal: MARGEN, paddingTop: 16, paddingBottom: 12 },
});

export default function Descubrir() {
  const { estado, avisoNoDisponible, pasar, verDeNuevo, abrirDetalle, reintentar } = useDescubrir();
  const propsEstado = pantallaDescubrir(estado, { reintentar, verDeNuevo });
  const tarjeta = estado.tipo === 'con-datos' ? tarjetaActual(estado.mazo) : null;

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <View style={estilos.encabezado}>
        <View style={estilos.marca}>
          <MaterialCommunityIcons name={ICONOS_DESCUBRIR.marca} size={24} color={COLORES.cafe} />
          <Text accessibilityRole="header" style={estilos.titulo}>
            {TEXTO_GARRITAS}
          </Text>
        </View>
        <BotonCircular
          icono={ICONOS_DESCUBRIR.miPerfil}
          etiqueta={TEXTO_MI_PERFIL}
          fondo="azulGrisaceo"
          diametro={48}
          tamanoIcono={24}
          alPresionar={() => router.navigate(RUTAS.miPerfil)}
        />
      </View>
      <Text style={estilos.subtitulo}>{TEXTO_SUBTITULO_DESCUBRIR}</Text>
      {avisoNoDisponible ? (
        <View style={estilos.aviso}>
          <Text accessibilityRole="alert" style={estilos.textoAviso}>
            {MENSAJES.MASCOTA_NO_DISPONIBLE}
          </Text>
        </View>
      ) : null}
      {propsEstado || !tarjeta ? (
        <EstadoPantalla
          estado={propsEstado?.estado ?? 'cargando'}
          mensaje={propsEstado?.mensaje}
          mensajeSiTarda={propsEstado?.mensajeSiTarda}
          boton={propsEstado?.boton}
        />
      ) : (
        <View style={estilos.cuerpo}>
          <TarjetaAnimal tarjeta={tarjeta} alPasar={pasar} alAbrir={abrirDetalle} />
        </View>
      )}
    </SafeAreaView>
  );
}
