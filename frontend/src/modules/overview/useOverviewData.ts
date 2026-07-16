import { useEffect, useState } from 'react';
import type { FinanceBootstrap } from '../finance/contracts';
import type { Checklist, Task } from '../routine/contracts';
import type { WeightRecord, WorkoutSession } from '../training/contracts';
import { getBootstrap } from '../../services/data';
import { financeFromBootstrap } from '../../services/finance';
import { mockOverview, mocksEnabled } from '../../services/mock';
import { getProfile, type Profile } from '../../services/profile';

export interface OverviewData {
  store: Record<string, unknown>;
  profile: Profile;
  finance: FinanceBootstrap;
  trend: { month: string; value: number }[];
  tasks: Task[];
  checklist: Checklist;
  workout: WorkoutSession;
  weights: WeightRecord[];
}

const emptyWorkout: WorkoutSession = { title: 'Nenhum treino programado', focus: 'Dia livre', durationMin: 0, exercises: [] };

function asChecklist(value: unknown): Checklist {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Checklist : {};
}

function workoutFromBootstrap(value: unknown, logValue: unknown): WorkoutSession {
  if (!Array.isArray(value) || !value.length) return emptyWorkout;
  const workout = value[0] as Record<string, unknown>;
  const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const log = logValue && typeof logValue === 'object' ? logValue as Record<string, { workoutId?: string; done?: string[] }> : {};
  const done = log[key]?.workoutId === String(workout.id ?? '') && Array.isArray(log[key]?.done) ? log[key].done! : [];
  return {
    title: typeof workout.name === 'string' ? workout.name : 'Treino de hoje',
    focus: typeof workout.focus === 'string' ? workout.focus : 'Treino programado',
    durationMin: typeof workout.durationMin === 'number' ? workout.durationMin : 0,
    exercises: exercises.map((item, index) => {
      const exercise = item as Record<string, unknown>;
      return {
        id: String(exercise.id ?? index),
        name: String(exercise.name ?? 'Exercício'),
        sets: `${String(exercise.sets ?? '—')} × ${String(exercise.reps ?? '—')}`,
        completed: done.includes(String(exercise.id ?? index)),
      };
    }),
  };
}

function weightsFromBootstrap(value: unknown): WeightRecord[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = item as Record<string, unknown>;
    const weight = Number(record.weight ?? record.peso);
    return typeof record.date === 'string' && Number.isFinite(weight) ? [{ date: record.date, weight }] : [];
  });
}

export function useOverviewData() {
  const demo = mocksEnabled();
  const [data, setData] = useState<OverviewData | null>(demo ? mockOverview : null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (demo) return;
    let active = true;
    Promise.all([getBootstrap(), getProfile()])
      .then(([bootstrap, profile]) => {
        if (!active) return;
        setData({
          store: bootstrap,
          profile,
          finance: financeFromBootstrap(bootstrap),
          trend: [],
          tasks: Array.isArray(bootstrap.tasks_v6) ? bootstrap.tasks_v6 as Task[] : [],
          checklist: asChecklist(bootstrap.checklist_v6),
          workout: workoutFromBootstrap(bootstrap.workouts, bootstrap.workout_log),
          weights: weightsFromBootstrap(bootstrap.body_log),
        });
      })
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason : new Error('Falha ao carregar dados.')));
    return () => { active = false; };
  }, [demo]);

  return { data, setData, error, loading: !data && !error, demo };
}
