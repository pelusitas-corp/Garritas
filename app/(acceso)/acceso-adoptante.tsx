// PROVISIONAL (02-navegacion): Acceso de Adoptante. F-01 pone el formulario e "Iniciar sesión" (RF-09).
import { router } from 'expo-router';

import PantallaProvisional from '../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../src/compartido/navegacion/rutas';

export default function AccesoAdoptante() {
  return (
    <PantallaProvisional
      titulo="Ingresa a tu cuenta"
      ruta={RUTAS.accesoAdoptante}
      feature="F-01"
      botones={[
        {
          texto: 'Crear cuenta',
          alPresionar: () => router.push(RUTAS.avisoPrivacidad),
          variante: 'secundario',
        },
      ]}
    />
  );
}
