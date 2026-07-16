import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export const TopNavBar: React.FC = () => {
  const {
    setCurrentScreen,
    setIsSearchOpen,
    handleResetSimulation,
    isProfileMenuOpen,
    setIsProfileMenuOpen,
    setIsWorkoutModalOpen,
    setIsExpenseModalOpen
  } = useApp();

  return (
    <nav className="bg-[#101415]/95 border-b border-[#24242D] fixed top-0 w-full z-50 backdrop-blur-md">
      <div className="flex justify-between items-center px-6 w-full max-w-7xl mx-auto h-16">
        
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center gap-8">
          <div 
            onClick={() => setCurrentScreen('dashboard')}
            className="font-sans text-[26px] font-extrabold text-primary tracking-tighter cursor-pointer flex items-center gap-1.5 hover:opacity-85 select-none"
          >
            <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>widgets</span>
            Orby
          </div>

          <div className="hidden md:flex gap-6 items-center">
            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className="font-sans font-bold text-xs text-primary border-b-2 border-primary pb-1 uppercase tracking-wider cursor-pointer"
            >
              Agenda
            </button>
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="font-sans font-bold text-xs text-[#8c909f] hover:text-primary transition-colors duration-200 uppercase tracking-wider cursor-pointer"
            >
              Financeiro
            </button>
            <button 
              onClick={() => setIsWorkoutModalOpen(true)}
              className="font-sans font-bold text-xs text-[#8c909f] hover:text-primary transition-colors duration-200 uppercase tracking-wider cursor-pointer"
            >
              Treinos
            </button>
            <button 
              onClick={() => setCurrentScreen('mapa')}
              className="font-sans font-bold text-xs text-[#8c909f] hover:text-primary transition-colors duration-200 uppercase tracking-wider cursor-pointer"
            >
              Mapa de Telas
            </button>
          </div>
        </div>

        {/* Right Side: Tools & Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-[#8c909f] hover:text-primary transition-colors flex items-center gap-1.5 text-[11px] font-mono bg-[#191c1e] px-2.5 py-1.5 rounded-lg border border-[#24242D] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>Buscar <kbd className="bg-[#101415] px-1 rounded font-mono text-[9px] border border-[#24242D]">/</kbd></span>
            </button>

            {/* Reset Simulation Button */}
            <button 
              onClick={handleResetSimulation}
              title="Restaurar dados iniciais da simulação"
              className="p-2 text-[#8c909f] hover:text-primary transition-colors flex items-center justify-center rounded-lg hover:bg-white/5 border border-transparent hover:border-[#24242D] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>

            {/* Notification Bell (Visual Only) */}
            <button 
              onClick={() => alert("Central de Notificações: Nenhuma notificação nova no momento.")}
              className="p-2 text-[#8c909f] hover:text-[#e0e3e5] transition-colors flex items-center justify-center rounded-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
            </button>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-9 h-9 rounded-full overflow-hidden border border-[#424753] hover:border-primary transition-colors cursor-pointer"
            >
              <img 
                className="w-full h-full object-cover" 
                alt="Lucas Headshot portrait" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHD0Bz8V6l_Z89xV7N2R9WHwRXJwUtBMuuJrYGLHjrgI_gjAsiNwGZ2x03QbfaHe6p3GcMkrn7PDk7ELKO1WhVRGxOpt9bhivwI5ZQFM2E8IWU9NbLvleQGlOsu0CLkS0gmN0mzAoFX1NNNFsynymVInK-JugeoodgvVBv9towkhinXeTuU4pd9xUr1CA9mutjqe6MxgUagOXJ0vu-2ztUc_pQ162uLyEXw1OehuSlUn8zUN4LNUjsWA"
                referrerPolicy="no-referrer"
              />
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <>
                  {/* Backdrop to close profile menu */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-[#101415] border border-[#24242D] rounded-xl shadow-2xl p-1 z-50 overflow-hidden"
                  >
                    <div className="px-3.5 py-2.5 border-b border-[#24242D] mb-1">
                      <p className="font-sans font-bold text-xs text-[#e0e3e5]">Lucas Silva</p>
                      <p className="font-mono text-[10px] text-[#8c909f]">lucas@orby.com.br</p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setCurrentScreen('login');
                      }}
                      className="w-full px-3 py-2 hover:bg-white/5 text-left text-xs font-sans font-bold flex items-center gap-2 rounded-lg text-[#ffb4ab] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      Fazer Logout
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setCurrentScreen('expirada');
                      }}
                      className="w-full px-3 py-2 hover:bg-white/5 text-left text-xs font-sans flex items-center gap-2 rounded-lg text-[#8c909f] hover:text-[#e0e3e5] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">timer_off</span>
                      Simular Sessão Expirada
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setCurrentScreen('bloqueada');
                      }}
                      className="w-full px-3 py-2 hover:bg-white/5 text-left text-xs font-sans flex items-center gap-2 rounded-lg text-[#8c909f] hover:text-[#e0e3e5] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                      Simular Acesso Bloqueado
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </nav>
  );
};
