import React from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { setCurrentScreen } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentScreen('2fa');
  };

  return (
    <div className="tech-bg min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Dynamic ambient lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#adc6ff]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d0bcff]/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Map Return button */}
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

      {/* Main Container */}
      <motion.main 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-full max-w-[420px] bg-[#101415]/80 backdrop-blur-md border border-[#24242D] rounded-2xl p-8 flex flex-col gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
      >
        {/* Visual indicator bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#adc6ff] to-[#d0bcff]"></div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#131318] border border-[#24242D] mb-2 shadow-inner group">
            <span className="material-symbols-outlined text-[32px] bg-clip-text text-transparent bg-gradient-to-r from-[#adc6ff] to-[#d0bcff] transition-transform duration-300 group-hover:rotate-180" style={{ fontVariationSettings: "'FILL' 1" }}>
              blur_on
            </span>
          </div>
          <h1 className="font-sans text-2xl font-bold text-[#e0e3e5] tracking-tight">Bem-vindo à Orby</h1>
          <p className="font-sans text-xs text-[#8c909f]">Insira suas credenciais corporativas para continuar.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="E-mail Corporativo"
            icon="mail"
            type="email"
            id="login-email"
            placeholder="nome@empresa.com"
            required
            defaultValue="lucas@orby.com.br"
          />

          <div className="flex flex-col gap-1">
            <Input
              label="Senha de Acesso"
              icon="lock"
              type="password"
              id="login-password"
              placeholder="••••••••"
              required
              fontFamily="mono"
              defaultValue="OrbySec2026!"
            />
            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-4 h-4 rounded bg-[#131318] border-[#24242D] text-primary focus:ring-primary/20 accent-[#adc6ff] cursor-pointer"
                />
                <span className="font-sans text-[11px] text-[#8c909f] group-hover:text-[#e0e3e5] transition-colors">Lembrar de mim</span>
              </label>
              <button
                type="button"
                onClick={() => setCurrentScreen('recuperar')}
                className="font-sans text-[11px] text-primary hover:underline hover:text-[#d0bcff] transition-colors bg-transparent border-none cursor-pointer"
              >
                Esqueci a senha
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-2 h-11">
            Entrar
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Button>
        </form>

        <div className="flex items-center gap-3 my-1">
          <div className="h-[1px] flex-1 bg-[#24242D]"></div>
          <span className="font-sans text-[10px] tracking-wider text-[#8c909f] uppercase font-bold">Ou entrar com</span>
          <div className="h-[1px] flex-1 bg-[#24242D]"></div>
        </div>

        <Button 
          variant="secondary" 
          onClick={() => setCurrentScreen('2fa')} 
          className="w-full h-10 border border-[#24242D] hover:border-[#8c909f]/30"
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          Google Workspace
        </Button>

        <div className="text-center pt-3 border-t border-[#24242D] mt-2">
          <p className="font-sans text-xs text-[#8c909f]">
            Não tem uma conta corporativa?{' '}
            <button 
              onClick={() => setCurrentScreen('cadastro')}
              className="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none"
            >
              Solicitar Acesso
            </button>
          </p>
        </div>
      </motion.main>

      <div className="absolute bottom-6 right-6 text-[#8c909f]/30 font-mono text-[10px] pointer-events-none hidden md:block">
        Orby Pro Secure Access V.1.2
      </div>
    </div>
  );
};
