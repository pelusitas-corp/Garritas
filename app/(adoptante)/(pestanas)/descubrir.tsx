/**
 * Descubrir (spec F-03: RF-10, RF-26, RNF-01; ruta /descubrir; pestaña del adoptante).
 *
 * Muestra el mazo ordenado por compatibilidad, una tarjeta a la vez. El
 * ícono de usuario del encabezado abre Mi perfil. Si llega de G-8, muestra
 * arriba "Esta mascota ya no está disponible para adopción" (DE-4).
 * Los estados (cargando, vacía, mazo terminado, error y sin permiso) los
 * decide `pantallaDescubrir` y los dibuja `EstadoPantalla`.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pantallaDescubrir } from '../../../src/adoptante/descubrir/estados';
import { ICONOS_DESCUBRIR } from '../../../src/adoptante/descubrir/iconosDescubrir';
import { tarjetaActual } from '../../../src/adoptante/descubrir/mazo';
import TarjetaAnimal from '../../../src/adoptante/descubrir/TarjetaAnimal';
import { TEXTO_DESCUBRIR, TEXTO_MI_PERFIL } from '../../../src/adoptante/descubrir/textos';
import useDescubrir from '../../../src/adoptante/descubrir/useDescubrir';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import MENSAJES from '../../../src/compartido/mensajes';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES, RADIOS } from '../../../src/compartido/tema';

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 30, color: COLORES.cafe },
  aviso: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.menta,
  },
  textoAviso: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  cuerpo: { flex: 1, padding: 24 },
});

export default function Descubrir() {
  const { estado, avisoNoDisponible, pasar, verDeNuevo, abrirDetalle, reintentar } = useDescubrir();
  const propsEstado = pantallaDescubrir(estado, { reintentar, verDeNuevo });
  const tarjeta = estado.tipo === 'con-datos' ? tarjetaActual(estado.mazo) : null;

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <View style={estilos.encabezado}>
        <Text accessibilityRole="header" style={estilos.titulo}>
          {TEXTO_DESCUBRIR}
        </Text>
        <Pressable
          onPress={() => router.navigate(RUTAS.miPerfil)}
          accessibilityRole="button"
          accessibilityLabel={TEXTO_MI_PERFIL}
          hitSlop={12}
        >
          <MaterialCommunityIcons
            name={ICONOS_DESCUBRIR.miPerfil}
            size={36}
            color={COLORES.azulMarino}
          />
        </Pressable>
      </View>
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
