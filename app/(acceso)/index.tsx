/**
 * Selección de Rol (F-01 §3, textos de Figma; ruta "/").
 *
 * - "Quiero adoptar" → Aviso de privacidad (RF-25 va antes del registro).
 * - "Soy albergue o rescatista" → Acceso de Albergue.
 * - "¿Ya tienes cuenta?" + "Iniciar sesión" → Acceso de Adoptante (A-1).
 * Si ya hay sesión, la guarda G-2 lleva al inicio del rol antes de mostrarla.
 *
 * F-11 (AD-1, AD-2; decisión del equipo, no está en el SRS): el logo va entre
 * el encabezado y el título, e "Iniciar sesión" usa el tamaño chico.
 *
 * F-12 (AE-2; decisión del equipo, no está en el SRS): el logo y el título
 * quedan centrados verticalmente en el espacio libre entre el encabezado y
 * los botones de rol, que se quedan abajo.
 */
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Logo del perrito y el gatito (F-11 AD-1); su tipo está en src/compartido/imagenes.d.ts.
import LOGO from '../../assets/images/logo-garritas.png';
import EncabezadoAcceso from '../../src/compartido/acceso/EncabezadoAcceso';
import estilosAcceso from '../../src/compartido/acceso/estilosAcceso';
import BotonPildora from '../../src/compartido/BotonPildora';
import { RUTAS } from '../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES } from '../../src/compartido/tema';

/** Logo de 240 de ancho con su proporción (580 : 456, F-11 §4.1). */
const ANCHO_LOGO = 240;
const ALTO_LOGO = Math.round((ANCHO_LOGO * 456) / 580);

const estilos = StyleSheet.create({
  // F-12 AE-2: ocupa el espacio libre y centra el logo y el título en él.
  centro: { flex: 1, justifyContent: 'center' },
  logo: { width: ANCHO_LOGO, height: ALTO_LOGO, alignSelf: 'center' },
  titulo: { textAlign: 'center', marginTop: 16 },
  botones: { gap: 12 },
  pie: {
    fontFamily: FUENTES.regular,
    fontSize: 14,
    color: COLORES.cafe,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default function SeleccionDeRol() {
  return (
    <SafeAreaView style={estilosAcceso.pantalla}>
      <EncabezadoAcceso />
      <ScrollView contentContainerStyle={estilosAcceso.contenido}>
        <View style={estilos.centro}>
          <Image
            source={LOGO}
            style={estilos.logo}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Logo de Garritas"
          />
          <Text accessibilityRole="header" style={[estilosAcceso.titulo, estilos.titulo]}>
            Bienvenido a Garritas
          </Text>
        </View>
        <View style={estilos.botones}>
          <BotonPildora
            texto="Quiero adoptar"
            alPresionar={() => router.push(RUTAS.avisoPrivacidad)}
          />
          <BotonPildora
            texto="Soy albergue o rescatista"
            alPresionar={() => router.push(RUTAS.accesoAlbergue)}
            variante="secundario"
          />
          <Text style={estilosAcceso.pregunta}>¿Ya tienes cuenta?</Text>
          <BotonPildora
            texto="Iniciar sesión"
            alPresionar={() => router.push(RUTAS.accesoAdoptante)}
            variante="secundario"
            tamano="chico"
          />
          <Text style={estilos.pie}>Juntos, más hogares y nuevas historias.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
