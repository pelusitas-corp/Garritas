// PROVISIONAL (02-navegacion): Alta de Mascota ("Nueva mascota"). F-02 pone el formulario (RF-01, RF-13, RF-14).
import { router } from 'expo-router';

import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';

export default function NuevaMascota() {
  return (
    <PantallaProvisional
      titulo="Nueva mascota"
      ruta={RUTAS.nuevaMascota}
      feature="F-02"
      botones={[
        // Al publicar correctamente, regresa a Solicitudes (§4.3).
        { texto: 'Publicar para adopción', alPresionar: () => router.navigate(RUTAS.solicitudes) },
      ]}
    />
  );
}
