import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

export const TwoFactor: React.FC = () => {
  const { setCurrentScreen } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentScreen('dashboard');
  };

  return (
    <div className="bg-[#050507] min-h-screen flex items-center justify-center p-6 select-none relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#d0bcff]/5 rounded-full blur-[120px] pointer-events-none"></div>

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
        className="w-full max-w-[420px] flex flex-col gap-6 items-center"
      >
        <header className="text-center">
          <span className="font-sans text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#adc6ff] to-[#d0bcff] tracking-tight">
            Orby
          </span>
        </header>

        <div className="w-full bg-[#101415]/80 backdrop-blur-md rounded-2xl border border-[#24242D] p-8 flex flex-col gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#adc6ff] to-[#d0bcff]"></div>

          <div className="flex flex-col gap-2 text-center items-center">
            <div className="w-12 h-12 rounded-full bg-[#d0bcff]/10 flex items-center justify-center mb-1 border border-[#d0bcff]/20">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield_person
              </span>
            </div>
            <h2 className="font-sans text-xl font-bold text-[#e0e3e5] tracking-tight">
              Autenticação em Duas Etapas
            </h2>
            <p className="font-sans text-xs text-[#8c909f] leading-relaxed px-4">
              Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2 items-center" id="otp-inputs">
              <input 
                maxLength={6}
                placeholder="123 456"
                pattern="[0-9]*"
                inputMode="numeric"
                required
                autoFocus
                className="w-full h-14 bg-[#131318] border border-[#24242D] rounded-lg text-center font-mono text-3xl text-primary tracking-[0.4em] focus:border-[#adc6ff] focus:outline-none transition-all focus:shadow-[0_0_12px_rgba(173,198,255,0.15)] placeholder:opacity-30 placeholder:tracking-[0.1em] px-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full h-11">
                Verificar Código
              </Button>
              <Button 
                type="button"
                variant="ghost"
                onClick={() => alert("Código de backup aceito! Redirecionando...")}
                className="w-full h-10"
              >
                Usar código de backup
              </Button>
            </div>
          </form>
        </div>

        <footer>
          <p className="font-sans text-[10px] text-[#8c909f] flex items-center gap-1 justify-center uppercase tracking-wider font-bold">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            Conexão Segura
          </p>
        </footer>
      </motion.main>
    </div>
  );
};
