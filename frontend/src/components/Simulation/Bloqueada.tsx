import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

export const Bloqueada: React.FC = () => {
  const { setCurrentScreen, blockedTime } = useApp();

  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#050507] text-[#e0e3e5] min-h-screen flex items-center justify-center p-6 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Back button */}
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
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500/80 to-[#ffb4ab]/80"></div>

        <div className="w-16 h-16 rounded-full bg-error-container/20 border border-[#ffb4ab]/30 flex items-center justify-center mb-2 relative">
          <div className="absolute inset-0 bg-[#ffb4ab]/10 rounded-full blur-md"></div>
          <span className="material-symbols-outlined text-error text-[36px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
            lock
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-2xl font-bold text-[#e0e3e5] tracking-tight">Acesso Bloqueado</h1>
          <p className="font-sans text-xs text-[#8c909f] leading-relaxed px-4">
            Múltiplas tentativas de login incorretas detectadas. Por segurança, sua conta foi temporariamente suspensa.
          </p>
        </div>

        {/* Countdown Timer Component */}
        <div className="w-full bg-[#131318] border border-[#24242D] rounded-xl p-5 relative overflow-hidden group">
          <span className="font-sans font-bold text-[10px] text-[#8c909f] uppercase tracking-wider mb-1 block">
            Tente novamente em
          </span>
          <div className="font-mono text-3xl font-bold text-primary flex items-center justify-center gap-1">
            <motion.span
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {formatSeconds(blockedTime)}
            </motion.span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          <Button 
            variant="secondary"
            onClick={() => alert("Suporte notificado. Entraremos em contato.")}
            className="w-full h-11"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            Falar com Suporte
          </Button>
          <Button 
            variant="ghost"
            onClick={() => setCurrentScreen('login')}
            className="w-full h-10"
          >
            Voltar ao Início
          </Button>
        </div>
      </motion.main>
    </div>
  );
};
