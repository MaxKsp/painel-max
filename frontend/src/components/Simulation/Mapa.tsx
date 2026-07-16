import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { motion } from 'motion/react';

export const Mapa: React.FC = () => {
  const { setCurrentScreen, handleResetSimulation, setIsSearchOpen } = useApp();

  const handleOpenSearchDemo = () => {
    setIsSearchOpen(true);
  };

  const screens = [
    // Auth Group
    { id: 'login', title: 'Login (01)', desc: 'Formulário com SSO Google', icon: 'login', category: 'Autenticação' },
    { id: 'cadastro', title: 'Cadastro (02)', desc: 'Validador de força de senha', icon: 'person_add', category: 'Autenticação' },
    { id: 'recuperar', title: 'Recuperar Senha (03)', desc: 'Instruções por e-mail', icon: 'vpn_key', category: 'Autenticação' },
    { id: 'verificacao', title: 'Verificar E-mail (04)', desc: 'Aviso de ativação de conta', icon: 'mark_email_unread', category: 'Autenticação' },
    { id: '2fa', title: '2FA Autenticação (05)', desc: 'Código TOTP de 6 dígitos', icon: 'shield_person', category: 'Autenticação' },
    { id: 'expirada', title: 'Sessão Expirada (06)', desc: 'Segurança por inatividade', icon: 'timer_off', category: 'Segurança & Simulação' },
    { id: 'bloqueada', title: 'Acesso Bloqueado (07)', desc: 'Contagem regressiva ativa', icon: 'lock', category: 'Segurança & Simulação' },
    
    // Navigation & General Group
    { id: 'dashboard', title: 'Dashboard Principal (10)', desc: 'Agenda, Finanças e Treinos', icon: 'dashboard', category: 'Navegação Base' },
    { id: 'search-trigger', title: 'Busca Global (11)', desc: 'Pesquisa instantânea (Pressione /)', icon: 'search', category: 'Navegação Base', action: handleOpenSearchDemo },
  ];

  const categories = Array.from(new Set(screens.map(s => s.category)));

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col text-[#e0e3e5]">
      {/* Header */}
      <header className="border-b border-[#24242D] bg-[#101415]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center w-full h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentScreen('dashboard')}>
            <span className="material-symbols-outlined text-primary text-[28px]">widgets</span>
            <span className="font-sans text-2xl font-extrabold text-primary tracking-tight">Orby</span>
          </div>
          <h1 className="font-sans text-sm md:text-base font-bold text-[#e0e3e5] uppercase tracking-wider">
            Painel do Desenvolvedor — Mapa de Telas
          </h1>
          <Button 
            size="sm" 
            onClick={() => setCurrentScreen('dashboard')}
          >
            Ir para o Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full flex flex-col gap-8">
        
        {/* Quick Helper Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#101415] border border-[#24242D] rounded-[16px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-[3px] h-full bg-[#adc6ff]"></div>
          <div>
            <p className="text-primary font-bold font-sans text-sm uppercase tracking-wider mb-1">
              Ambiente de Demonstração Interativa
            </p>
            <p className="text-[#8c909f] font-sans text-xs md:text-sm">
              Selecione qualquer uma das telas simuladas do ecossistema Orby abaixo para testar fluxos de interação, responsividade e consistência do design system.
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleResetSimulation}
          >
            Restaurar Simulação
          </Button>
        </motion.div>

        {/* Render categories */}
        {categories.map((cat, catIdx) => (
          <motion.section 
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.1 }}
            className="flex flex-col gap-4"
          >
            <h2 className="font-sans text-xs font-bold text-[#8c909f] uppercase tracking-widest border-l-4 border-primary pl-2">
              {cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {screens
                .filter(s => s.category === cat)
                .map(screen => (
                  <motion.div
                    key={screen.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (screen.action) {
                        screen.action();
                      } else {
                        setCurrentScreen(screen.id);
                      }
                    }}
                    className="cursor-pointer group"
                  >
                    <Card className="h-full justify-between items-center text-center p-6 gap-3 min-h-[160px] hover:border-primary/50">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#131318] border border-[#24242D] group-hover:border-primary/30 transition-colors duration-200">
                        <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary transition-colors text-[24px]">
                          {screen.icon}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary transition-colors">
                          {screen.title}
                        </span>
                        <span className="font-sans text-[11px] text-[#8c909f] leading-snug">
                          {screen.desc}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </motion.section>
        ))}
      </main>

      <footer className="border-t border-[#24242D] py-6 text-center text-xs text-[#8c909f] font-mono">
        Orby Tech Engine V.2026.07
      </footer>
    </div>
  );
};
