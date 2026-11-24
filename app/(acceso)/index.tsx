// PROVISIONAL (02-navegacion): Selección de Rol. F-01 pone el contenido real.
import { router } from 'expo-router';

import PantallaProvisional from '../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../src/compartido/navegacion/rutas';

export default function SeleccionDeRol() {
  return (
    <PantallaProvisional
      titulo="Bienvenido a Garritas"
      ruta={RUTAS.seleccionRol}
      feature="F-01"
      botones={[
        { texto: 'Quiero adoptar', alPresionar: () => router.push(RUTAS.avisoPrivacidad) },
        {
          texto: 'Soy albergue o rescatista',
          alPresionar: () => router.push(RUTAS.accesoAlbergue),
          variante: 'secundario',
        },
      ]}
    />
  );
}
