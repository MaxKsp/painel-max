import type { Checklist, Task } from './contracts';

export const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const occurrenceId = (task: Task, date: Date) => `${task.id}:${dateKey(date)}`;

export function isTaskOnDate(task: Task, date: Date): boolean {
  const anchor = new Date(`${task.date}T00:00:00`);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (Number.isNaN(anchor.getTime())) return false;
  if (task.recurrence === 'none') return dateKey(anchor) === dateKey(target);
  if (target < anchor) return false;
  if (task.recurrence === 'yearly') return target.getMonth() === anchor.getMonth() && target.getDate() === anchor.getDate();
  if (target.getDay() !== anchor.getDay()) return false;
  const weeks = Math.floor((target.getTime() - anchor.getTime()) / 604_800_000);
  return !task.weeksCount || weeks < task.weeksCount;
}

export const tasksOnDate = (tasks: Task[], date: Date) => tasks.filter((task) => isTaskOnDate(task, date)).sort((a, b) => a.time.localeCompare(b.time));

export function routineSummary(tasks: Task[], checklist: Checklist, date: Date) {
  const scheduled = tasksOnDate(tasks, date);
  const completed = scheduled.filter((task) => checklist[occurrenceId(task, date)]).length;
  const pendingTasks = scheduled.filter((task) => !checklist[occurrenceId(task, date)]);
  return { total: scheduled.length, completed, pending: scheduled.length - completed, progress: scheduled.length ? Math.round(completed / scheduled.length * 100) : 0, nextTask: pendingTasks[0] ?? null };
}
