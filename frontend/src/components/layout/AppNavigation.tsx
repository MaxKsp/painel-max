import { RouterLink, type AppPath } from '../../app/router';

const destinations: { path: AppPath; label: string; icon: string }[] = [
  { path: '/', label: 'Visão geral', icon: 'home' },
  { path: '/agenda', label: 'Agenda', icon: 'calendar_month' },
  { path: '/financeiro', label: 'Financeiro', icon: 'account_balance_wallet' },
  { path: '/treinos', label: 'Treinos', icon: 'fitness_center' },
  { path: '/perfil', label: 'Perfil', icon: 'person' },
];

export function AppNavigation({ path, onSearch }: { path: AppPath; onSearch: () => void }) {
  return <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#0c0d10]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <RouterLink to="/" className="flex items-center gap-2 text-white"><span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-on-primary"><span className="material-symbols-outlined text-[19px]">orbit</span></span><span className="text-lg font-semibold">Orby</span></RouterLink>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {destinations.map((item) => <RouterLink key={item.path} to={item.path} className={`rounded-lg px-3 py-2 text-sm font-medium ${path === item.path ? 'bg-white/[0.08] text-white' : 'text-on-surface-variant hover:bg-white/[0.04] hover:text-white'}`}><span aria-current={path === item.path ? 'page' : undefined}>{item.label}</span></RouterLink>)}
        </nav>
        <button onClick={onSearch} className="grid h-10 w-10 place-items-center rounded-xl text-on-surface-variant hover:bg-white/[0.06] hover:text-white" aria-label="Abrir busca"><span className="material-symbols-outlined">search</span></button>
      </div>
    </header>
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/[0.08] bg-[#0c0d10]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Navegação mobile">
      {destinations.map((item) => <RouterLink key={item.path} to={item.path} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] ${path === item.path ? 'text-primary' : 'text-muted'}`}><span className="material-symbols-outlined text-[21px]" aria-hidden="true">{item.icon}</span><span aria-current={path === item.path ? 'page' : undefined}>{item.label}</span></RouterLink>)}
    </nav>
  </>;
}
