import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Cadastro } from '../components/Auth/Cadastro';
import { AppContextProvider } from '../context/AppContext';

describe('checklist de força de senha', () => {
  beforeEach(() => localStorage.clear());

  it('marca cada requisito conforme a senha muda e classifica uma senha completa como forte', async () => {
    render(<AppContextProvider><Cadastro /></AppContextProvider>);
    const password = document.querySelector<HTMLInputElement>('#password');
    expect(password).not.toBeNull();

    const checks = ['minChar', 'hasUpper', 'hasNumber', 'hasSpecial'];
    checks.forEach((check) => expect(screen.getByTestId(`password-check-${check}`)).toHaveAttribute('data-valid', 'false'));

    fireEvent.change(password!, { target: { value: 'abcdefgh' } });
    await waitFor(() => expect(screen.getByTestId('password-check-minChar')).toHaveAttribute('data-valid', 'true'));
    expect(screen.getByTestId('password-check-hasUpper')).toHaveAttribute('data-valid', 'false');

    fireEvent.change(password!, { target: { value: 'Abcdef1!' } });
    await waitFor(() => checks.forEach((check) => expect(screen.getByTestId(`password-check-${check}`)).toHaveAttribute('data-valid', 'true')));
    expect(screen.getByText('Forte')).toBeInTheDocument();
  });
});
