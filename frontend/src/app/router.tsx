import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';

export type AppPath = '/' | '/agenda' | '/financeiro' | '/treinos' | '/perfil';
const paths: AppPath[] = ['/', '/agenda', '/financeiro', '/treinos', '/perfil'];

export const normalizePath = (pathname: string): AppPath => paths.includes(pathname as AppPath) ? pathname as AppPath : '/';

export function navigate(path: AppPath) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useRoute() {
  const [path, setPath] = useState<AppPath>(() => normalizePath(window.location.pathname));
  useEffect(() => {
    const sync = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  return path;
}

export function RouterLink({ to, children, className, onNavigate }: { key?: string; to: AppPath; children: ReactNode; className?: string; onNavigate?: () => void }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
    onNavigate?.();
  };
  return <a href={to} className={className} onClick={handleClick}>{children}</a>;
}
