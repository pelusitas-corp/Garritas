/**
 * Las 25 preguntas del cuestionario (spec F-04 §4; ESTADO §6.3).
 *
 * Analogía: es el mazo de tarjetas de la entrevista. Cada tarjeta tiene su
 * número, su sección, la pregunta y las opciones que se pueden tocar. La
 * pantalla solo voltea tarjetas; aquí no se decide cuál sigue (eso está en
 * `avance.ts`, con los saltos de `preguntaAplica()` del motor F-05).
 *
 * Las claves (`p1` a `p25` y cada `clave` de opción) son las de F-05 §5 y
 * `src/matchmaking/tipos.ts`: así lo que se guarda en Firestore es justo lo
 * que el motor sabe leer (D-50).
 */
import type { IdPregunta, Respuestas } from '../../matchmaking';

/** Secciones del cuestionario, en orden (encabezado RN-09). */
export type Seccion = 'Tu hogar' | 'Tu familia' | 'Tu rutina' | 'Tu experiencia y tu ambiente';

/** Una opción que el adoptante toca: lo que ve (`texto`) y lo que se guarda (`clave`). */
interface Opcion<P extends IdPregunta> {
  clave: NonNullable<Respuestas[P]>;
  texto: string;
}

/**
 * Una pregunta. TypeScript revisa que cada `clave` sea una opción válida de
 * SU pregunta (por ejemplo, `p2` solo acepta `casa` o `departamento`).
 */
export type Pregunta = {
  [P in IdPregunta]: {
    id: P;
    numero: number;
    seccion: Seccion;
    texto: string;
    opciones: readonly Opcion<P>[];
  };
}[IdPregunta];

/** Opciones "Sí" y "No", que se repiten en varias preguntas. */
const OPCIONES_SI_NO = [
  { clave: 'si', texto: 'Sí' },
  { clave: 'no', texto: 'No' },
] as const;

/** Las 25 preguntas en orden P1 → P25 (textos literales de ESTADO §6.3). */
export const PREGUNTAS: readonly Pregunta[] = [
  // ── Tu hogar ───────────────────────────────────────────────────────────
  {
    id: 'p1',
    numero: 1,
    seccion: 'Tu hogar',
    texto: '¿Con qué mascotas puedes convivir en casa?',
    opciones: [
      { clave: 'perros', texto: 'Perros' },
      { clave: 'gatos', texto: 'Gatos' },
      { clave: 'ambos', texto: 'Ambos' },
    ],
  },
  {
    id: 'p2',
    numero: 2,
    seccion: 'Tu hogar',
    texto: '¿Dónde vives?',
    opciones: [
      { clave: 'casa', texto: 'Casa' },
      { clave: 'departamento', texto: 'Departamento' },
    ],
  },
  {
    id: 'p3',
    numero: 3,
    seccion: 'Tu hogar',
    texto: '¿Tu vivienda es propia o rentada?',
    opciones: [
      { clave: 'propia', texto: 'Propia' },
      { clave: 'rentada', texto: 'Rentada' },
    ],
  },
  {
    id: 'p4',
    numero: 4,
    seccion: 'Tu hogar',
    texto: '¿El dueño permite mascotas?',
    opciones: OPCIONES_SI_NO,
  },
  {
    id: 'p5',
    numero: 5,
    seccion: 'Tu hogar',
    texto: '¿Tienes patio con barda?',
    opciones: OPCIONES_SI_NO,
  },
  {
    id: 'p6',
    numero: 6,
    seccion: 'Tu hogar',
    texto: '¿Qué tan grande es tu patio?',
    opciones: [
      { clave: 'pequeno', texto: 'Pequeño' },
      { clave: 'mediano', texto: 'Mediano' },
      { clave: 'grande', texto: 'Grande' },
    ],
  },
  {
    id: 'p7',
    numero: 7,
    seccion: 'Tu hogar',
    texto: '¿Tus ventanas tienen red o protección?',
    opciones: OPCIONES_SI_NO,
  },
  // ── Tu familia ─────────────────────────────────────────────────────────
  {
    id: 'p8',
    numero: 8,
    seccion: 'Tu familia',
    texto: '¿Hay niños en casa?',
    opciones: OPCIONES_SI_NO,
  },
  {
    id: 'p9',
    numero: 9,
    seccion: 'Tu familia',
    texto: '¿Qué edad tiene el más pequeño?',
    opciones: [
      { clave: 'menosDe6', texto: 'Menos de 6 años' },
      { clave: 'seisOMas', texto: '6 años o más' },
    ],
  },
  {
    id: 'p10',
    numero: 10,
    seccion: 'Tu familia',
    texto: '¿Hay otras mascotas en casa?',
    opciones: OPCIONES_SI_NO,
  },
  {
    id: 'p11',
    numero: 11,
    seccion: 'Tu familia',
    texto: '¿Tus mascotas se llevan bien con otros animales?',
    opciones: [
      { clave: 'si', texto: 'Sí' },
      { clave: 'noSe', texto: 'No sé' },
      { clave: 'no', texto: 'No' },
    ],
  },
  // ── Tu rutina ──────────────────────────────────────────────────────────
  {
    id: 'p12',
    numero: 12,
    seccion: 'Tu rutina',
    texto: '¿Cuánto tiempo pasará sola tu mascota al día?',
    opciones: [
      { clave: 'menosDe4', texto: 'Menos de 4 h' },
      { clave: 'de4a8', texto: 'De 4 a 8 h' },
      { clave: 'masDe8', texto: 'Más de 8 h' },
    ],
  },
  {
    id: 'p13',
    numero: 13,
    seccion: 'Tu rutina',
    texto: '¿Alguien en casa trabaja o estudia desde ahí?',
    opciones: OPCIONES_SI_NO,
  },
  {
    id: 'p14',
    numero: 14,
    seccion: 'Tu rutina',
    texto: '¿Viajas seguido y dejas tu casa sola?',
    opciones: [
      { clave: 'seguido', texto: 'Seguido' },
      { clave: 'aVeces', texto: 'A veces' },
      { clave: 'casiNunca', texto: 'Casi nunca' },
    ],
  },
  {
    id: 'p15',
    numero: 15,
    seccion: 'Tu rutina',
    texto: '¿Cuántas veces al día podrías pasearla o jugar con ella?',
    opciones: [
      { clave: 'una', texto: '1' },
      { clave: 'dos', texto: '2' },
      { clave: 'tresOMas', texto: '3 o más' },
    ],
  },
  {
    id: 'p16',
    numero: 16,
    seccion: 'Tu rutina',
    texto: '¿Cuánto dura cada paseo o rato de juego?',
    opciones: [
      { clave: 'min15', texto: '15 min' },
      { clave: 'min30', texto: '30 min' },
      { clave: 'horaOMas', texto: '1 h o más' },
    ],
  },
  {
    id: 'p17',
    numero: 17,
    seccion: 'Tu rutina',
    texto: '¿Cómo es tu fin de semana ideal?',
    opciones: [
      { clave: 'enCasa', texto: 'En casa' },
      { clave: 'unPocoDeTodo', texto: 'Un poco de todo' },
      { clave: 'aireLibre', texto: 'Al aire libre' },
    ],
  },
  {
    id: 'p18',
    numero: 18,
    seccion: 'Tu rutina',
    texto: '¿Haces ejercicio o sales a caminar?',
    opciones: [
      { clave: 'casiNunca', texto: 'Casi nunca' },
      { clave: 'aVeces', texto: 'A veces' },
      { clave: 'seguido', texto: 'Seguido' },
    ],
  },
  // ── Tu experiencia y tu ambiente ───────────────────────────────────────
  {
    id: 'p19',
    numero: 19,
    seccion: 'Tu experiencia y tu ambiente',
    texto: '¿Has tenido mascotas antes?',
    opciones: [
      { clave: 'primeraVez', texto: 'Primera vez' },
      { clave: 'yaHeTenido', texto: 'Ya he tenido' },
    ],
  },
  {
    id: 'p20',
    numero: 20,
    seccion: 'Tu experiencia y tu ambiente',
    texto: '¿Has cuidado a un animal con miedo o que necesitaba entrenamiento?',
    opciones: OPCIONES_SI_NO,
  },
  {
    id: 'p21',
    numero: 21,
    seccion: 'Tu experiencia y tu ambiente',
    texto:
      'Los primeros días tu nueva mascota podría estar nerviosa o esconderse. ¿Cómo lo tomarías?',
    opciones: [
      { clave: 'paciencia', texto: 'Le doy tiempo y paciencia' },
      { clave: 'consejo', texto: 'Buscaría consejo' },
      { clave: 'preocupacion', texto: 'Me preocuparía mucho' },
    ],
  },
  {
    id: 'p22',
    numero: 22,
    seccion: 'Tu experiencia y tu ambiente',
    texto: '¿Cómo describirías tu casa?',
    opciones: [
      { clave: 'tranquila', texto: 'Tranquila' },
      { clave: 'normal', texto: 'Normal' },
      { clave: 'muyMovida', texto: 'Muy movida' },
    ],
  },
  {
    id: 'p23',
    numero: 23,
    seccion: 'Tu experiencia y tu ambiente',
    texto: '¿Recibes visitas seguido?',
    opciones: [
      { clave: 'casiNunca', texto: 'Casi nunca' },
      { clave: 'aVeces', texto: 'A veces' },
      { clave: 'seguido', texto: 'Seguido' },
    ],
  },
  {
    id: 'p24',
    numero: 24,
    seccion: 'Tu experiencia y tu ambiente',
    texto: '¿Cuánto ruido hay normalmente en casa?',
    opciones: [
      { clave: 'poco', texto: 'Poco' },
      { clave: 'normal', texto: 'Normal' },
      { clave: 'mucho', texto: 'Mucho' },
    ],
  },
  {
    id: 'p25',
    numero: 25,
    seccion: 'Tu experiencia y tu ambiente',
    texto: '¿Cómo te gustaría que fuera tu mascota?',
    opciones: [
      { clave: 'tranquila', texto: 'Tranquila' },
      { clave: 'juguetona', texto: 'Juguetona' },
      { clave: 'sociable', texto: 'Sociable con todos' },
      { clave: 'meAdapto', texto: 'Me adapto a cualquiera' },
    ],
  },
];

/**
 * Revisa datos que vienen de fuera (el teléfono o Firestore) y se queda solo
 * con las respuestas válidas: una clave `p1` a `p25` con una opción que
 * existe en esa pregunta. Así un dato viejo o dañado nunca llega al motor.
 * Recibe cualquier valor; devuelve las respuestas válidas (o `{}`).
 */
export function filtrarRespuestasValidas(datos: unknown): Respuestas {
  if (typeof datos !== 'object' || datos === null) {
    return {};
  }
  const entradas = Object.entries(datos).filter(([id, valor]) => {
    const pregunta = PREGUNTAS.find((p) => p.id === id);
    return pregunta?.opciones.some((opcion) => opcion.clave === valor) ?? false;
  });
  return Object.fromEntries(entradas);
}
