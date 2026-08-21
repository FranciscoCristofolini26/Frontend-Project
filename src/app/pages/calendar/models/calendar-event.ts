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
