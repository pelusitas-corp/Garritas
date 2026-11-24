// PROVISIONAL (02-navegacion): Registro con Correo. F-01 pone el formulario y "Crear cuenta" (RF-23).
import { router } from 'expo-router';

import PantallaProvisional from '../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../src/compartido/navegacion/rutas';

export default function Registro() {
  return (
    <PantallaProvisional
      titulo="Crea tu cuenta"
      ruta={RUTAS.registro}
      feature="F-01"
      botones={[
        {
          texto: 'Iniciar sesión',
          alPresionar: () => router.push(RUTAS.accesoAdoptante),
          variante: 'secundario',
        },
      ]}
    />
  );
}
