import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppNavigation } from '../components/layout/AppNavigation';
import { normalizePath } from '../app/router';

describe('router do aplicativo', () => {
  it('normaliza caminhos desconhecidos para a Visão Geral', () => {
    expect(normalizePath('/inexistente')).toBe('/');
    expect(normalizePath('/agenda')).toBe('/agenda');
  });

  it('navega sem recarregar e atualiza a History API', () => {
    window.history.replaceState({}, '', '/');
    render(<AppNavigation path="/" onSearch={() => undefined} />);
    fireEvent.click(screen.getAllByRole('link', { name: 'Agenda' })[0]);
    expect(window.location.pathname).toBe('/agenda');
  });

  it('marca dinamicamente a rota ativa no desktop e mobile', () => {
    render(<AppNavigation path="/treinos" onSearch={() => undefined} />);
    expect(screen.getAllByText('Treinos').every((node) => node.getAttribute('aria-current') === 'page')).toBe(true);
  });
});
