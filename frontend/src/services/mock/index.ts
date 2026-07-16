import { financeBootstrapMock, netWorthTrendMock } from '../../modules/finance/mock';
import { checklistMock, tasksMock } from '../../modules/routine/mock';
import { weightHistoryMock, workoutMock } from '../../modules/training/mock';

export const mockOverview = {
  store: { workouts: [workoutMock], workout_log: {}, body_log: weightHistoryMock, body_height: null },
  profile: { username: 'Lucas', email: 'lucas@orby.com.br', avatar: null, totp_enabled: false, notify_email: true, has_password: true },
  finance: financeBootstrapMock,
  trend: netWorthTrendMock,
  tasks: tasksMock,
  checklist: checklistMock,
  workout: workoutMock,
  weights: weightHistoryMock,
};

export const mocksEnabled = () => import.meta.env.VITE_USE_MOCKS === 'true';
