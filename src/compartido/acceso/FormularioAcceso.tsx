/**
 * Formulario "Ingresa a tu cuenta" (F-01 §3 flujo B, RF-09). Lo usan
 * Acceso de Adoptante y Acceso de Albergue (P-05).
 *
 * Recibe:
 * - `subtitulo`: texto debajo del título (el albergue no tiene, P-05);
 * - `conCrearCuenta`: si muestra "¿Aún no tienes cuenta?" + "Crear cuenta",
 *   que lleva al Aviso de Privacidad (RF-25 va antes del registro).
 *
 * Al iniciar sesión bien, Firebase avisa a `useSesion`, que lee el rol, y la
 * guarda G-2 abre el inicio de ESE rol, sin importar desde qué pantalla
 * entró (RN-05). Si falla, muestra CA-06 o CA-12 debajo del formulario.
 *
 * F-12 (AE-2; decisión del equipo, no está en el SRS): título, subtítulo,
 * campos y botones quedan centrados verticalmente debajo del encabezado,
 * con 24 entre los campos y los botones. Con el teclado abierto se sigue
 * pudiendo desplazar, como antes.
 *
 * F-13 AF-21 (decisión del equipo, no está en el SRS):
 * - el formulario va dentro de `KeyboardAvoidingView` ("padding" en iOS y
 *   "height" en Android) con `ScrollView`, así al abrir el teclado el campo
 *   activo y "Iniciar sesión" siguen visibles y se puede desplazar;
 * - arriba del título, centrado, el logo de Garritas del mismo tamaño que en
 *   Selección de Rol (`ANCHO_LOGO`), sin "Bienvenido a Garritas" y oculto
 *   para el lector de pantalla.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Logo del perrito y el gatito (F-11 AD-1); su tipo está en imagenes.d.ts.
import LOGO from '../../../assets/images/logo-garritas.png';

import { iniciarSesion } from '../../firebase/acceso';
import BotonPildora from '../BotonPildora';
import { RUTAS } from '../navegacion/rutas';
import { ANCHO_LOGO, altoLogo } from '../tema';
import CampoTexto from './CampoTexto';
import EncabezadoAcceso from './EncabezadoAcceso';
import { mensajeErrorAcceso } from './errores';
import estilosAcceso from './estilosAcceso';
import MensajeError from './MensajeError';
import { camposLlenos } from './validacion';

interface Props {
  subtitulo?: string;
  conCrearCuenta?: boolean;
}

const estilos = StyleSheet.create({
  // F-12 AE-2: el formulario completo va al centro del espacio libre.
  centrado: { justifyContent: 'center' },
  // F-13 AF-21: el logo del mismo tamaño que en Selección de Rol.
  logo: { width: ANCHO_LOGO, height: altoLogo(ANCHO_LOGO), alignSelf: 'center' },
  campos: { gap: 12 },
  // 8 más el `gap` de 16 del contenido = 24 entre los campos y los botones.
  abajo: { gap: 12, marginTop: 8 },
});

export default function FormularioAcceso({ subtitulo = '', conCrearCuenta = false }: Props) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entrar = async () => {
    setEnviando(true);
    setError(null);
    const resultado = await iniciarSesion(correo, contrasena);
    if (!resultado.ok) {
      setEnviando(false);
      setError(mensajeErrorAcceso(resultado.codigo));
    }
    // Si salió bien, no hay nada que hacer aquí: la guarda G-2 cambia de pantalla.
  };

  return (
    <SafeAreaView style={estilosAcceso.pantalla}>
      <EncabezadoAcceso conFlechaAtras />
      <KeyboardAvoidingView
        style={estilosAcceso.teclado}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[estilosAcceso.contenido, estilos.centrado]}
          keyboardShouldPersistTaps="handled"
        >
          {/* F-13 AF-21: el logo es decoración; el lector de pantalla no lo lee. */}
          <Image
            source={LOGO}
            style={estilos.logo}
            resizeMode="contain"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <Text accessibilityRole="header" style={estilosAcceso.titulo}>
            Ingresa a tu cuenta
          </Text>
          {subtitulo ? <Text style={estilosAcceso.subtitulo}>{subtitulo}</Text> : null}
          <View style={estilos.campos}>
            <CampoTexto
              valor={correo}
              alCambiar={setCorreo}
              marcador="Correo electrónico"
              tipo="correo"
              editable={!enviando}
            />
            <CampoTexto
              valor={contrasena}
              alCambiar={setContrasena}
              marcador="Contraseña"
              tipo="contrasena"
              editable={!enviando}
            />
          </View>
          {error ? <MensajeError texto={error} /> : null}
          <View style={estilos.abajo}>
            <BotonPildora
              texto="Iniciar sesión"
              alPresionar={entrar}
              desactivado={!camposLlenos([correo, contrasena])}
              cargando={enviando}
            />
            {conCrearCuenta ? (
              <>
                <Text style={estilosAcceso.pregunta}>¿Aún no tienes cuenta?</Text>
                <BotonPildora
                  texto="Crear cuenta"
                  alPresionar={() => router.push(RUTAS.avisoPrivacidad)}
                  variante="secundario"
                />
              </>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
