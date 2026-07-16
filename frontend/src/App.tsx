import { useEffect } from 'react';
import { BootstrapProvider } from './app/BootstrapProvider';
import { useRoute } from './app/router';
import { Cadastro } from './components/Auth/Cadastro';
import { Login } from './components/Auth/Login';
import { Recuperar } from './components/Auth/Recuperar';
import { TwoFactor } from './components/Auth/TwoFactor';
import { Verificacao } from './components/Auth/Verificacao';
import { ModalsContainer } from './components/Dashboard/ModalsContainer';
import { AppNavigation } from './components/layout/AppNavigation';
import { Bloqueada } from './components/Simulation/Bloqueada';
import { Expirada } from './components/Simulation/Expirada';
import { Mapa } from './components/Simulation/Mapa';
import { AppContextProvider, useApp } from './context/AppContext';
import { AgendaScreen } from './modules/agenda/AgendaScreen';
import { FinanceScreen } from './modules/finance/FinanceScreen';
import { OverviewScreen } from './modules/overview/OverviewScreen';
import { ProfileScreen } from './modules/profile/ProfileScreen';
import { TrainingScreen } from './modules/training/TrainingScreen';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

function AppRouter() {
  const { currentScreen, setIsSearchOpen, setIsTaskModalOpen, setIsExpenseModalOpen } = useApp();
  const path = useRoute();
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsSearchOpen(false); if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName ?? '')) { event.preventDefault(); setIsSearchOpen(true); } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, [setIsSearchOpen]);
  if (currentScreen === 'login') return <Login />;
  if (currentScreen === 'cadastro') return <Cadastro />;
  if (currentScreen === 'recuperar') return <Recuperar />;
  if (currentScreen === 'verificacao') return <Verificacao />;
  if (currentScreen === '2fa') return <TwoFactor />;
  if (currentScreen === 'expirada') return <Expirada />;
  if (currentScreen === 'bloqueada') return <Bloqueada />;
  if (currentScreen === 'mapa') return <Mapa />;
  return <div className="min-h-screen bg-background text-on-surface"><AppNavigation path={path} onSearch={() => setIsSearchOpen(true)} />{path === '/' && <OverviewScreen />}{path === '/agenda' && <AgendaScreen onNewTask={() => setIsTaskModalOpen(true)} />}{path === '/financeiro' && <FinanceScreen onNewExpense={() => setIsExpenseModalOpen(true)} />}{path === '/treinos' && <TrainingScreen />}{path === '/perfil' && <ProfileScreen />}<ModalsContainer /></div>;
}

export default function App() { return <ErrorBoundary><AppContextProvider><BootstrapProvider><AppRouter /></BootstrapProvider></AppContextProvider></ErrorBoundary>; }
