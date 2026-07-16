import React from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

export const Recuperar: React.FC = () => {
  const { setCurrentScreen } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailVal = (document.getElementById('rec-email') as HTMLInputElement)?.value || '';
    alert(`Instruções de redefinição enviadas para: ${emailVal}`);
    setCurrentScreen('login');
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-full max-w-[420px] bg-[#101415]/80 backdrop-blur-md border border-[#24242D] rounded-2xl p-8 flex flex-col gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#adc6ff] to-[#d0bcff]"></div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#131318] border border-[#24242D] mb-2 shadow-inner">
            <span className="material-symbols-outlined text-[28px] text-primary">
              vpn_key
            </span>
          </div>
          <h1 className="font-sans text-2xl font-bold text-[#e0e3e5] tracking-tight">Recuperar Senha</h1>
          <p className="font-sans text-xs text-[#8c909f]">Digite seu e-mail corporativo para receber instruções.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="E-mail Corporativo"
            icon="mail"
            type="email"
            id="rec-email"
            placeholder="nome@empresa.com"
            required
          />

          <div className="flex flex-col gap-2 mt-2">
            <Button type="submit" className="w-full h-11">
              Enviar Instruções
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCurrentScreen('login')}
              className="w-full h-10"
            >
              Voltar para o Login
            </Button>
          </div>
        </form>
      </motion.main>
    </div>
  );
};
