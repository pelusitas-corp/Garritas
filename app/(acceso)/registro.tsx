/**
 * Registro con Correo, "Crea tu cuenta" (F-01 §3 flujo A, RF-23; ruta "/registro").
 *
 * - Solo se abre si ya se aceptó el aviso (RN-01); si no, lleva al aviso.
 * - "Crear cuenta" no responde con un campo vacío (RN-09) y revisa la
 *   contraseña en el teléfono antes de llamar a Firebase (CA-11).
 * - Crea la cuenta con `useSesion().crearCuenta` (RN-13). Si sale bien, borra
 *   la aceptación de memoria (P6) y la guarda G-2 abre el cuestionario.
 * - Si falla, muestra CA-04, CA-11, CA-12 o CA-13 debajo del formulario.
 * - F-11 (AD-2, AD-4): "Iniciar sesión" usa el tamaño chico y "Crear cuenta"
 *   con un campo vacío se ve desvanecido (lo hace `BotonPildora`).
 */
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CampoTexto from '../../src/compartido/acceso/CampoTexto';
import { leerAceptacion, olvidarAceptacion } from '../../src/compartido/acceso/consentimiento';
import EncabezadoAcceso from '../../src/compartido/acceso/EncabezadoAcceso';
import { mensajeErrorRegistro } from '../../src/compartido/acceso/errores';
import estilosAcceso from '../../src/compartido/acceso/estilosAcceso';
import MensajeError from '../../src/compartido/acceso/MensajeError';
import { camposLlenos, validarContrasena } from '../../src/compartido/acceso/validacion';
import BotonPildora from '../../src/compartido/BotonPildora';
import { RUTAS } from '../../src/compartido/navegacion/rutas';
import { useSesion } from '../../src/compartido/navegacion/useSesion';

const estilos = StyleSheet.create({
  campos: { gap: 12 },
  abajo: { gap: 12, marginTop: 'auto' },
});

export default function Registro() {
  const { crearCuenta } = useSesion();
  // Se lee una sola vez al abrir la pantalla (RN-01).
  const [fechaAceptacion] = useState(leerAceptacion);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!fechaAceptacion) {
    return <Redirect href={RUTAS.avisoPrivacidad} />;
  }

  const crear = async () => {
    const errorContrasena = validarContrasena(contrasena);
    if (errorContrasena) {
      setError(errorContrasena); // CA-11: no llama a Firebase
      return;
    }
    setEnviando(true);
    setError(null);
    const resultado = await crearCuenta({ nombre, correo, telefono, contrasena, fechaAceptacion });
    if (resultado.ok) {
      olvidarAceptacion(); // P6. La guarda G-2 abre el cuestionario.
      return;
    }
    setEnviando(false);
    setError(mensajeErrorRegistro(resultado.codigo));
  };

  return (
    <SafeAreaView style={estilosAcceso.pantalla}>
      <EncabezadoAcceso conFlechaAtras />
      <ScrollView
        contentContainerStyle={estilosAcceso.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <Text accessibilityRole="header" style={estilosAcceso.titulo}>
          Crea tu cuenta
        </Text>
        <Text style={estilosAcceso.subtitulo}>
          Después te haremos unas preguntas rápidas para encontrar tu match.
        </Text>
        <View style={estilos.campos}>
          <CampoTexto
            valor={nombre}
            alCambiar={setNombre}
            marcador="Nombre completo"
            editable={!enviando}
          />
          <CampoTexto
            valor={correo}
            alCambiar={setCorreo}
            marcador="Correo electrónico"
            tipo="correo"
            editable={!enviando}
          />
          <CampoTexto
            valor={telefono}
            alCambiar={setTelefono}
            marcador="Teléfono"
            tipo="telefono"
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
            texto="Crear cuenta"
            alPresionar={crear}
            desactivado={!camposLlenos([nombre, correo, telefono, contrasena])}
            cargando={enviando}
          />
          <Text style={estilosAcceso.pregunta}>¿Ya tienes cuenta?</Text>
          <BotonPildora
            texto="Iniciar sesión"
            alPresionar={() => router.push(RUTAS.accesoAdoptante)}
            variante="secundario"
            tamano="chico"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
