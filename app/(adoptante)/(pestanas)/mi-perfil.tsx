/**
 * Mi perfil (spec F-04: RF-19; ruta /mi-perfil; pestaña del adoptante).
 *
 * Con el cuestionario completo: nombre del adoptante, su perfil Garritas
 * (ilustración, nombre y frase) y "Cerrar sesión" al final (N-3).
 * Sin terminar (G-6, RF-19 no válido): NO redirige; muestra el mensaje
 * "Termina tu cuestionario para descubrir tu perfil Garritas" y "Cerrar sesión".
 * Otros estados (§8): cargando, error de conexión y sin permiso.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TarjetaPerfilGarritas from '../../../src/adoptante/perfil/TarjetaPerfilGarritas';
import { useNombreAdoptante } from '../../../src/adoptante/perfil/useNombreAdoptante';
import { usePerfilGarritas } from '../../../src/adoptante/perfil/usePerfilGarritas';
import BotonPildora from '../../../src/compartido/BotonPildora';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import MENSAJES from '../../../src/compartido/mensajes';
import { useSesion } from '../../../src/compartido/navegacion/useSesion';
import { COLORES, FUENTES } from '../../../src/compartido/tema';

/** Texto del botón de N-3 (02-navegacion), igual que en la pantalla provisional. */
const TEXTO_CERRAR_SESION = 'Cerrar sesión';

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  contenido: { flexGrow: 1, gap: 32, padding: 24, justifyContent: 'space-between' },
  cuerpo: { gap: 32 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe, textAlign: 'center' },
});

export default function MiPerfil() {
  const { cerrarSesion } = useSesion();
  const perfil = usePerfilGarritas();
  const nombre = useNombreAdoptante();
  const botonCerrarSesion = { texto: TEXTO_CERRAR_SESION, alPresionar: cerrarSesion };

  if (perfil.tipo === 'sin-permiso' || nombre.tipo === 'sin-permiso') {
    return <EstadoPantalla estado="sin-permiso" boton={botonCerrarSesion} />;
  }
  if (perfil.tipo === 'cargando') {
    return <EstadoPantalla estado="cargando" />;
  }
  if (perfil.tipo === 'vacia') {
    // G-6 (RF-19 no válido): se queda aquí, sin redirigir.
    return (
      <EstadoPantalla
        estado="vacia"
        mensaje={MENSAJES.PERFIL_SIN_CUESTIONARIO}
        boton={botonCerrarSesion}
      />
    );
  }
  if (perfil.tipo === 'error' || nombre.tipo === 'error') {
    return <EstadoPantalla estado="error" />;
  }
  if (nombre.tipo === 'cargando') {
    return <EstadoPantalla estado="cargando" />;
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.cuerpo}>
          {nombre.nombre ? (
            <Text accessibilityRole="header" style={estilos.nombre}>
              {nombre.nombre}
            </Text>
          ) : null}
          <TarjetaPerfilGarritas perfil={perfil.perfil} />
        </View>
        {/* N-3: "Cerrar sesión" al final de Mi perfil. Las guardas llevan a Selección de Rol. */}
        <BotonPildora
          texto={TEXTO_CERRAR_SESION}
          alPresionar={cerrarSesion}
          variante="secundario"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
