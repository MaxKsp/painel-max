import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

export const Verificacao: React.FC = () => {
  const { setCurrentScreen } = useApp();

  const handleResend = () => {
    alert("Um novo e-mail de ativação foi enviado!");
  };

  return (
    <div className="tech-bg min-h-screen flex items-center justify-center p-6 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#adc6ff]/5 rounded-full blur-[120px] pointer-events-none"></div>

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
        className="w-full max-w-[420px] bg-[#101415]/80 backdrop-blur-md border border-[#24242D] rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#adc6ff] to-[#d0bcff]"></div>

        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#131318] border border-[#24242D] relative group">
          <div className="absolute inset-0 bg-[#d0bcff]/15 rounded-full blur-md group-hover:bg-[#d0bcff]/25 transition-colors duration-300"></div>
          <span className="material-symbols-outlined text-[36px] text-secondary relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
            mark_email_unread
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-2xl font-bold text-[#e0e3e5] tracking-tight">Verifique seu e-mail</h1>
          <p className="font-sans text-xs text-[#8c909f] leading-relaxed px-4">
            Enviamos um link de ativação seguro para confirmar sua identidade. Por favor, verifique sua caixa de entrada.
          </p>
        </div>

        <div className="w-full flex flex-col gap-2">
          <Button onClick={handleResend} className="w-full h-11">
            <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
            Reenviar E-mail
          </Button>
          
          <Button variant="ghost" onClick={() => setCurrentScreen('login')} className="w-full h-10">
            Ir para o Login
          </Button>
        </div>

        <div className="pt-4 border-t border-[#24242D] w-full">
          <button 
            onClick={() => alert("Simulando central de ajuda Orby support_agent")}
            className="inline-flex items-center gap-2 font-sans text-xs text-[#8c909f] hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
          >
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            Falar com o suporte
          </button>
        </div>
      </motion.main>
    </div>
  );
};
