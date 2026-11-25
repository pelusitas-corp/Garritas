/**
 * Selección de Rol (F-01 §3, textos de Figma; ruta "/").
 *
 * - "Quiero adoptar" → Aviso de privacidad (RF-25 va antes del registro).
 * - "Soy albergue o rescatista" → Acceso de Albergue.
 * - "¿Ya tienes cuenta?" + "Iniciar sesión" → Acceso de Adoptante (A-1).
 * Si ya hay sesión, la guarda G-2 lleva al inicio del rol antes de mostrarla.
 */
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EncabezadoAcceso from '../../src/compartido/acceso/EncabezadoAcceso';
import estilosAcceso from '../../src/compartido/acceso/estilosAcceso';
import BotonPildora from '../../src/compartido/BotonPildora';
import { RUTAS } from '../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES } from '../../src/compartido/tema';

const estilos = StyleSheet.create({
  titulo: { textAlign: 'center', marginTop: 24 },
  botones: { gap: 12, marginTop: 'auto' },
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
        <Text accessibilityRole="header" style={[estilosAcceso.titulo, estilos.titulo]}>
          Bienvenido a Garritas
        </Text>
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
          />
          <Text style={estilos.pie}>Juntos, más hogares y nuevas historias.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
