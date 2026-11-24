// PROVISIONAL (02-navegacion): Aviso de Privacidad. F-01 pone la casilla y el aviso (RF-25).
import { router } from 'expo-router';

import PantallaProvisional from '../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../src/compartido/navegacion/rutas';

export default function AvisoPrivacidad() {
  return (
    <PantallaProvisional
      titulo="Aviso de privacidad"
      ruta={RUTAS.avisoPrivacidad}
      feature="F-01"
      botones={[
        {
          texto: 'Ver aviso completo',
          alPresionar: () => router.push(RUTAS.avisoIntegral),
          variante: 'secundario',
        },
        { texto: 'Continuar', alPresionar: () => router.push(RUTAS.registro) },
      ]}
    />
  );
}
