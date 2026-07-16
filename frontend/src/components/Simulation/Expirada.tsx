import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

export const Expirada: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <div className="bg-[#050507] text-[#e0e3e5] min-h-screen flex items-center justify-center p-6 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Back switch */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setCurrentScreen('mapa')}
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Ver Mapa de Telas
        </Button>
      </motion.div>

      <motion.main 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-full max-w-[420px] bg-[#101415]/80 backdrop-blur-md border border-[#24242D] rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#ffb4ab]/50 to-red-600/50"></div>

        <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#ffb4ab]/10 rounded-full blur-lg opacity-70"></div>
          <div className="bg-[#131318] border border-[#24242D] w-14 h-14 rounded-full flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined text-error text-[28px]">
              timer_off
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-2xl font-bold text-[#e0e3e5] tracking-tight">
            Sessão Expirada
          </h1>
          <p className="font-sans text-xs text-[#8c909f] leading-relaxed px-4">
            Por motivos de segurança, sua conexão foi encerrada devido à inatividade.
          </p>
        </div>

        <Button 
          onClick={() => setCurrentScreen('login')}
          className="w-full h-11 bg-gradient-to-r from-[#ffb4ab] to-red-600 text-white font-bold"
        >
          Fazer Login Novamente
        </Button>

        <div className="mt-4">
          <span className="font-sans text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#adc6ff] to-[#d0bcff]">
            Orby
          </span>
        </div>
      </motion.main>
    </div>
  );
};
