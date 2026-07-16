import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

function Broken(): never { throw new Error('quebrou'); }

describe('ErrorBoundary', () => {
  it('mostra recuperação segura quando um componente falha', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<ErrorBoundary><Broken /></ErrorBoundary>);
    expect(screen.getByRole('heading', { name: 'Algo saiu do esperado' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument();
  });
});
