import type { Checklist, Task } from './contracts';
import { occurrenceId } from './selectors';

const today = new Date();
const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

export const tasksMock: Task[] = [
  { id: '1', title: 'Meditação matinal', date, time: '07:00', cat: 'saude', duration: 15, recurrence: 'none', weeksCount: 0 },
  { id: '2', title: 'Planejamento semanal', date, time: '10:00', cat: 'trabalho', duration: 30, recurrence: 'none', weeksCount: 0 },
  { id: '3', title: 'Reunião de alinhamento', date, time: '14:00', cat: 'trabalho', duration: 45, recurrence: 'none', weeksCount: 0 },
];

export const checklistMock: Checklist = { [occurrenceId(tasksMock[0], today)]: true };
