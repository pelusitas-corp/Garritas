/**
 * Mi perfil (spec F-04: RF-19; ruta /mi-perfil; pestaña del adoptante).
 *
 * Con el cuestionario completo: saludo del adoptante y su perfil Garritas
 * (ilustración, nombre y frase).
 * Sin terminar (G-6, RF-19 no válido): NO redirige; muestra el mensaje
 * "Termina tu cuestionario para descubrir tu perfil Garritas" y "Cerrar sesión".
 * Otros estados (§8): cargando, error de conexión y sin permiso.
 *
 * F-11 AD-5 y AD-6: arriba a la izquierda va `EncabezadoMarca` con "Mi perfil";
 * el saludo y la tarjeta del perfil quedan centrados en el espacio que sobra.
 *
 * F-13 (decisión del equipo, no está en el SRS):
 * - AF-16 (reemplaza AE-5 y la tarjeta de AF-1): "¡Hola, {nombre}!" (negrita
 *   26, café) va sin tarjeta, directo sobre el crema y centrado, 8 arriba de
 *   "Tu perfil Garritas es:" (16), seguido de la tarjeta del perfil.
 * - AF-2: "Cerrar sesión" es una píldora chica azul grisáceo con el ícono
 *   `logout`, arriba a la derecha. Los estados vacía y sin permiso usan la
 *   misma píldora, debajo del mensaje.
 * - AF-17 (02 v1.4 N-3): tocar "Cerrar sesión" abre "¿Quieres cerrar
 *   sesión?" (`ConfirmarCerrarSesion`); solo al confirmar se cierra la sesión.
 * Si todo cabe, la pantalla no rebota ni se mueve al deslizar (F-12 AE-5).
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TEXTO_MI_PERFIL } from '../../../src/adoptante/descubrir/textos';
import TarjetaPerfilGarritas from '../../../src/adoptante/perfil/TarjetaPerfilGarritas';
import { TEXTO_TU_PERFIL, textoSaludo } from '../../../src/adoptante/perfil/textos';
import { useNombreAdoptante } from '../../../src/adoptante/perfil/useNombreAdoptante';
import { usePerfilGarritas } from '../../../src/adoptante/perfil/usePerfilGarritas';
import BotonPildora from '../../../src/compartido/BotonPildora';
import type { IconoBotonTexto } from '../../../src/compartido/BotonTexto';
import ConfirmarCerrarSesion from '../../../src/compartido/ConfirmarCerrarSesion';
import EncabezadoMarca from '../../../src/compartido/EncabezadoMarca';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import MENSAJES from '../../../src/compartido/mensajes';
import { useSesion } from '../../../src/compartido/navegacion/useSesion';
import { COLORES, FUENTES, TAMANOS_TEXTO } from '../../../src/compartido/tema';
import TEXTOS_COMPARTIDOS from '../../../src/compartido/textos';

/** Ícono de salida de "Cerrar sesión" (F-12 AE-6, igual que en el menú del albergue). */
const ICONO_CERRAR_SESION: IconoBotonTexto = 'logout';

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  contenido: { flexGrow: 1, padding: 24 },
  // F-11 AD-6 y F-13 AF-16: saludo, "Tu perfil Garritas es:" y la tarjeta, centrados.
  cuerpo: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  // AF-16: 8 entre el saludo y "Tu perfil Garritas es:".
  saludoYTuPerfil: { alignItems: 'center', gap: 8 },
  saludo: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.saludo,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  tuPerfil: {
    fontFamily: FUENTES.regular,
    fontSize: TAMANOS_TEXTO.dato,
    color: COLORES.cafe,
    textAlign: 'center',
  },
});

export default function MiPerfil() {
  const { cerrarSesion } = useSesion();
  const perfil = usePerfilGarritas();
  const nombre = useNombreAdoptante();
  /** F-13 AF-17: `true` mientras se muestra "¿Quieres cerrar sesión?". */
  const [confirmando, setConfirmando] = useState(false);
  const botonCerrarSesion = {
    texto: TEXTOS_COMPARTIDOS.cerrarSesion,
    icono: ICONO_CERRAR_SESION,
    alPresionar: () => setConfirmando(true),
  };

  /** Recibe lo que dibuja la pantalla. Devuelve eso con el modal de confirmación (AF-17). */
  const conConfirmacion = (contenido: ReactNode) => (
    <>
      {contenido}
      <ConfirmarCerrarSesion
        visible={confirmando}
        alOcultar={() => setConfirmando(false)}
        alCerrarSesion={cerrarSesion}
      />
    </>
  );

  if (perfil.tipo === 'sin-permiso' || nombre.tipo === 'sin-permiso') {
    return conConfirmacion(<EstadoPantalla estado="sin-permiso" botonChico={botonCerrarSesion} />);
  }
  if (perfil.tipo === 'cargando') {
    return <EstadoPantalla estado="cargando" />;
  }
  if (perfil.tipo === 'vacia') {
    // G-6 (RF-19 no válido): se queda aquí, sin redirigir.
    return conConfirmacion(
      <EstadoPantalla
        estado="vacia"
        mensaje={MENSAJES.PERFIL_SIN_CUESTIONARIO}
        botonChico={botonCerrarSesion}
      />,
    );
  }
  if (perfil.tipo === 'error' || nombre.tipo === 'error') {
    return <EstadoPantalla estado="error" />;
  }
  if (nombre.tipo === 'cargando') {
    return <EstadoPantalla estado="cargando" />;
  }

  return conConfirmacion(
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      {/* N-3 y F-13 AF-2: "Cerrar sesión" como píldora chica arriba a la derecha. */}
      <EncabezadoMarca
        texto={TEXTO_MI_PERFIL}
        derecha={
          <BotonPildora
            texto={botonCerrarSesion.texto}
            icono={botonCerrarSesion.icono}
            alPresionar={botonCerrarSesion.alPresionar}
            tamano="chico"
            gris
          />
        }
      />
      {/* F-12 AE-5: sin rebote si todo cabe (iOS y Android); si no cabe, se desplaza. */}
      <ScrollView
        contentContainerStyle={estilos.contenido}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <View style={estilos.cuerpo}>
          <View style={estilos.saludoYTuPerfil}>
            {nombre.nombre ? (
              <Text accessibilityRole="header" style={estilos.saludo}>
                {textoSaludo(nombre.nombre)}
              </Text>
            ) : null}
            <Text style={estilos.tuPerfil}>{TEXTO_TU_PERFIL}</Text>
          </View>
          <TarjetaPerfilGarritas perfil={perfil.perfil} />
        </View>
      </ScrollView>
    </SafeAreaView>,
  );
}
