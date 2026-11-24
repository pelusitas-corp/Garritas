// PROVISIONAL (02-navegacion): Perfil Garritas. F-04 muestra el perfil (RF-19).
import { router } from 'expo-router';

import PantallaProvisional from '../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../src/compartido/navegacion/rutas';

export default function PerfilGarritas() {
  return (
    <PantallaProvisional
      titulo="Perfil Garritas"
      ruta={RUTAS.perfilGarritas}
      feature="F-04"
      botones={[
        // "Ver mis matches": texto de Figma por confirmar (PO-21). replace: atrás no regresa al cuestionario.
        { texto: 'Ver mis matches', alPresionar: () => router.replace(RUTAS.descubrir) },
      ]}
    />
  );
}
