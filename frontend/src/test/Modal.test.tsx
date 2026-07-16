import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../components/ui/Modal';

describe('Modal acessível', () => {
  it('expõe semântica de diálogo e fecha com Escape', () => {
    const close = vi.fn();
    render(<Modal isOpen onClose={close} title="Editar tarefa"><button>Salvar</button></Modal>);
    expect(screen.getByRole('dialog', { name: 'Editar tarefa' })).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });
});
