export type PrayerVerse = {
  text: string
  reference: string
}

export const prayerVerses: PrayerVerse[] = [
  {
    text: 'Clama a mí, y yo te responderé.',
    reference: 'Jeremías 33:3',
  },
  {
    text: 'Perseverad en la oración, velando en ella con acción de gracias.',
    reference: 'Colosenses 4:2',
  },
  {
    text: 'Orad sin cesar.',
    reference: '1 Tesalonicenses 5:17',
  },
  {
    text: 'La oración eficaz del justo puede mucho.',
    reference: 'Santiago 5:16',
  },
  {
    text: 'Todo lo que pidiereis en oración, creyendo, lo recibiréis.',
    reference: 'Mateo 21:22',
  },
  {
    text: 'Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá.',
    reference: 'Mateo 7:7',
  },
  {
    text: 'Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.',
    reference: '1 Pedro 5:7',
  },
  {
    text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego.',
    reference: 'Filipenses 4:6',
  },
]

export function getRandomPrayerVerse(): PrayerVerse {
  const randomIndex = Math.floor(Math.random() * prayerVerses.length)

  return prayerVerses[randomIndex]
}