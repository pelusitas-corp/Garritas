/**
 * Aviso integral dentro de la app (F-01 §3, P-01, PO-27; ruta "/aviso-integral").
 * Muestra docs/privacidad/aviso-privacidad-integral.md con desplazamiento y
 * la flecha "←", que regresa al Aviso de Privacidad.
 */
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AVISO_INTEGRAL } from '../../src/compartido/acceso/avisos';
import EncabezadoAcceso from '../../src/compartido/acceso/EncabezadoAcceso';
import estilosAcceso from '../../src/compartido/acceso/estilosAcceso';
import TextoAviso from '../../src/compartido/acceso/TextoAviso';

export default function AvisoIntegral() {
  return (
    <SafeAreaView style={estilosAcceso.pantalla}>
      <EncabezadoAcceso conFlechaAtras />
      <ScrollView contentContainerStyle={estilosAcceso.contenido}>
        <TextoAviso markdown={AVISO_INTEGRAL} />
      </ScrollView>
    </SafeAreaView>
  );
}
