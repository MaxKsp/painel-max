import { describe, expect, it } from 'vitest';
import type { Task } from '../modules/routine/contracts';
import { occurrenceId, routineSummary } from '../modules/routine/selectors';

const date = new Date(2026, 6, 16);
const tasks: Task[] = [
  { id: 'a', title: 'Hoje 1', date: '2026-07-16', time: '08:00', cat: 'pessoal', duration: 10, recurrence: 'none', weeksCount: 0 },
  { id: 'b', title: 'Hoje 2', date: '2026-07-16', time: '09:00', cat: 'pessoal', duration: 10, recurrence: 'none', weeksCount: 0 },
  { id: 'c', title: 'Outro dia', date: '2026-07-17', time: '09:00', cat: 'pessoal', duration: 10, recurrence: 'none', weeksCount: 0 },
];

describe('progresso da rotina', () => {
  it('considera somente ocorrências da data selecionada', () => {
    const result = routineSummary(tasks, { [occurrenceId(tasks[0], date)]: true }, date);
    expect(result).toMatchObject({ total: 2, completed: 1, pending: 1, progress: 50 });
  });

  it('não grava conclusão dentro da tarefa', () => {
    expect(tasks.some((task) => 'completed' in task)).toBe(false);
  });
});
