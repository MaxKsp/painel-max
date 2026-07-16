import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { failed: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  declare readonly props: Readonly<{ children: ReactNode }>;
  constructor(props: { children: ReactNode }) { super(props); }
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Orby UI error', error, info.componentStack); }
  render() {
    if (this.state.failed) return <main className="mx-auto max-w-xl px-6 py-24 text-center"><h1 className="text-2xl font-semibold text-on-surface">Algo saiu do esperado</h1><p className="mt-3 text-on-surface-variant">Seus dados não foram alterados. Recarregue a página para tentar novamente.</p><button onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-primary px-5 py-3 font-medium text-on-primary">Recarregar</button></main>;
    return this.props.children;
  }
}
