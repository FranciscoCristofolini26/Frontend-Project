export type CalendarEventSource = 'internal' | 'google';

export type CalendarEventCategory = 'work' | 'study' | 'personal' | 'health';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location?: string;
  source: CalendarEventSource;
  category: CalendarEventCategory;
}

export type CalendarEventDraft = Omit<CalendarEvent, 'id'>;

export const CALENDAR_EVENT_MOCKS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Aula de Java',
    date: '2026-08-03',
    startTime: '09:00',
    endTime: '11:00',
    description: 'Aula sobre Spring Boot e persistência com JPA.',
    location: 'Sala 204',
    source: 'internal',
    category: 'study',
  },
  {
    id: 'event-2',
    title: 'Academia',
    date: '2026-08-03',
    startTime: '18:00',
    endTime: '19:30',
    description: 'Treino de força.',
    source: 'internal',
    category: 'health',
  },
  {
    id: 'event-3',
    title: 'Reunião do projeto',
    date: '2026-08-05',
    startTime: '10:00',
    endTime: '11:00',
    description: 'Alinhamento da entrega e próximos passos.',
    location: 'Google Meet',
    source: 'google',
    category: 'work',
  },
  {
    id: 'event-4',
    title: 'Estudar para prova',
    date: '2026-08-06',
    startTime: '14:00',
    endTime: '16:00',
    description: 'Revisar estruturas de dados e resolver exercícios.',
    source: 'internal',
    category: 'study',
  },
  {
    id: 'event-5',
    title: 'Consulta médica',
    date: '2026-08-08',
    startTime: '08:30',
    endTime: '09:15',
    description: 'Consulta anual de rotina.',
    location: 'Clínica Vida',
    source: 'google',
    category: 'health',
  },
  {
    id: 'event-6',
    title: 'Café com Marina',
    date: '2026-08-08',
    startTime: '10:30',
    endTime: '11:30',
    description: 'Colocar a conversa em dia.',
    location: 'Café do Centro',
    source: 'internal',
    category: 'personal',
  },
  {
    id: 'event-7',
    title: 'Aniversário da Luiza',
    date: '2026-08-08',
    startTime: '12:00',
    endTime: '13:00',
    description: 'Enviar uma mensagem de aniversário.',
    source: 'google',
    category: 'personal',
  },
  {
    id: 'event-8',
    title: 'Planejar viagem',
    date: '2026-08-08',
    startTime: '15:00',
    endTime: '16:00',
    description: 'Definir roteiro e reservar hospedagem.',
    source: 'internal',
    category: 'personal',
  },
  {
    id: 'event-9',
    title: 'Entrega do projeto',
    date: '2026-08-12',
    startTime: '16:00',
    endTime: '17:00',
    description: 'Publicar a versão final da apresentação.',
    source: 'internal',
    category: 'work',
  },
  {
    id: 'event-10',
    title: 'Reunião de trabalho',
    date: '2026-08-14',
    startTime: '09:30',
    endTime: '10:30',
    description: 'Revisão da semana com o time.',
    location: 'Sala Horizonte',
    source: 'google',
    category: 'work',
  },
  {
    id: 'event-11',
    title: 'Jantar em família',
    date: '2026-08-16',
    startTime: '19:00',
    endTime: '21:00',
    description: 'Jantar de domingo em família.',
    source: 'internal',
    category: 'personal',
  },
  {
    id: 'event-12',
    title: 'Mentoria de carreira',
    date: '2026-08-19',
    startTime: '17:00',
    endTime: '18:00',
    description: 'Conversa mensal de mentoria.',
    source: 'google',
    category: 'work',
  },
  {
    id: 'event-13',
    title: 'Retorno do dentista',
    date: '2026-08-24',
    startTime: '11:00',
    endTime: '11:40',
    description: 'Avaliação após o procedimento.',
    location: 'Odonto Prime',
    source: 'google',
    category: 'health',
  },
  {
    id: 'event-14',
    title: 'Workshop de design',
    date: '2026-08-27',
    startTime: '13:00',
    endTime: '16:00',
    description: 'Workshop sobre sistemas de design.',
    source: 'internal',
    category: 'study',
  },
];
