export interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  cat: string;
  duration: number;
  recurrence: 'none' | 'weekly' | 'yearly';
  weeksCount: number;
}

export type Checklist = Record<string, boolean>;
