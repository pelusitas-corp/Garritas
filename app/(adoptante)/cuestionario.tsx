// PROVISIONAL (02-navegacion): Cuestionario. F-04 pone las preguntas (RF-02, RF-15, RF-16).
import { router, useLocalSearchParams } from 'expo-router';

import MENSAJES from '../../src/compartido/mensajes';
import PantallaProvisional from '../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../src/compartido/navegacion/rutas';

export default function Cuestionario() {
  // G-5: llega con ?aviso=incompleto cuando intentó abrir Descubrir, Detalle o Match.
  const { aviso } = useLocalSearchParams<{ aviso?: string }>();

  return (
    <PantallaProvisional
      titulo="Cuestionario"
      ruta={RUTAS.cuestionario}
      feature="F-04"
      aviso={aviso === 'incompleto' ? MENSAJES.CUESTIONARIO_INCOMPLETO : ''}
      botones={[
        {
          texto: 'Ver mi perfil Garritas',
          alPresionar: () => router.replace(RUTAS.perfilGarritas),
        },
      ]}
    />
  );
}
