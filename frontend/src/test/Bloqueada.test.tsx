import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppContextProvider, useApp } from '../context/AppContext';
import { Bloqueada } from '../components/Simulation/Bloqueada';

const LockedScreen = () => {
  const { currentScreen, setCurrentScreen } = useApp();
  if (currentScreen !== 'bloqueada') {
    return <button onClick={() => setCurrentScreen('bloqueada')}>Abrir bloqueio</button>;
  }
  return <Bloqueada />;
};

describe('timer da tela Bloqueada', () => {
  afterEach(() => vi.useRealTimers());

  it('decrementa um segundo a cada intervalo de 1.000 ms', () => {
    vi.useFakeTimers();
    const view = render(<AppContextProvider><LockedScreen /></AppContextProvider>);
    act(() => screen.getByRole('button', { name: 'Abrir bloqueio' }).click());
    expect(screen.getByText('14:56')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3_000));
    expect(screen.getByText('14:53')).toBeInTheDocument();

    view.unmount();
  });
});
