import React from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

export const Cadastro: React.FC = () => {
  const { 
    setCurrentScreen, 
    registerPassword, 
    setRegisterPassword, 
    passwordChecks 
  } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentScreen('verificacao');
  };

  // Calculate password strength score
  const score = Object.values(passwordChecks).filter(Boolean).length;
  
  const getStrengthLabel = () => {
    if (score === 0) return { label: 'Inexistente', color: 'bg-transparent', text: 'text-[#8c909f]' };
    if (score <= 1) return { label: 'Fraca', color: 'bg-[#ffb4ab]', text: 'text-[#ffb4ab]' };
    if (score <= 3) return { label: 'Média', color: 'bg-yellow-500', text: 'text-yellow-500' };
    return { label: 'Forte', color: 'bg-[#4edea3]', text: 'text-[#4edea3]' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="min-h-screen flex bg-[#050507] overflow-hidden select-none relative">
      {/* Return button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 right-6 z-20"
      >
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setCurrentScreen('mapa')}
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Ver Mapa
        </Button>
      </motion.div>

      {/* Left Visual Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#131318] overflow-hidden items-center justify-center border-r border-[#24242D]">
        {/* Abstract Brand Image */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen bg-cover bg-center"
             style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCRmHFzQwbUvWui0mOA-YJqQM5SXwGXRBJkAfiFBQqL5gAQyVjzBOFJMkNJEvuKcigUcbKc1lZSjiSvmqep6DrlG9lEsoFU2sjTNA2dFUoXG7wwYs3Tc9J8GgOVSYxj98uHlVm23GykCg6mx8LhHf_4hQakdctstbfk1OD-AJwqnU-VWhpLdQ4Mm4tRkaD8StmgYCXetEprYDwx5rHtQXYP6hy1W70M3s6Qgny0FvKzABJ22XOCwVatjg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050507]"></div>

        {/* Branding */}
        <div className="relative z-10 p-12 flex flex-col gap-4 max-w-md w-full">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[36px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>widgets</span>
            <span className="font-sans text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#adc6ff] to-[#d0bcff]">Orby</span>
          </div>
          <p className="font-sans text-lg text-[#8c909f] font-light leading-relaxed">
            O ecossistema definitivo para performance pessoal, finanças consolidadas e foco operacional.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-8 relative z-10">
        
        {/* Mobile Brand Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8 absolute top-6 left-6">
          <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>widgets</span>
          <span className="font-sans text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#adc6ff] to-[#d0bcff]">Orby</span>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-full max-w-[440px] bg-[#101415]/80 backdrop-blur-md border border-[#24242D] rounded-2xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1.5">
            <h1 className="font-sans text-2xl font-bold text-[#e0e3e5] tracking-tight">Criar sua conta</h1>
            <p className="font-sans text-xs text-[#8c909f]">Preencha os dados abaixo para iniciar sua jornada.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Nome Completo"
              icon="person"
              type="text"
              id="fullName"
              placeholder="Ex: Lucas Silva"
              required
            />

            <Input
              label="E-mail Corporativo"
              icon="mail"
              type="email"
              id="email"
              placeholder="nome@empresa.com"
              required
            />

            <Input
              label="Senha"
              icon="lock"
              type="password"
              id="password"
              placeholder="••••••••"
              required
              fontFamily="mono"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />

            {/* Strength Bar */}
            {registerPassword && (
              <div className="flex flex-col gap-1.5 -mt-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider font-sans">
                  <span className="text-[#8c909f]">Força da Senha</span>
                  <span className={strength.text}>{strength.label}</span>
                </div>
                <div className="w-full bg-[#1c1c24] h-1.5 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(score / 4) * 100}%` }}></div>
                </div>
              </div>
            )}

            {/* Checklist */}
            <div className="bg-[#131318] p-4 rounded-xl border border-[#24242D] flex flex-col gap-2">
              <span className="font-sans font-bold text-[10px] text-[#8c909f] tracking-wider uppercase mb-1">Requisitos de Segurança</span>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div data-testid="password-check-minChar" data-valid={passwordChecks.minChar} className={`flex items-center gap-2 text-xs font-sans transition-colors duration-200 ${passwordChecks.minChar ? 'text-[#4edea3]' : 'text-[#8c909f]'}`}>
                  <span className="material-symbols-outlined text-[16px]">{passwordChecks.minChar ? 'check_circle' : 'radio_button_unchecked'}</span>
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div data-testid="password-check-hasUpper" data-valid={passwordChecks.hasUpper} className={`flex items-center gap-2 text-xs font-sans transition-colors duration-200 ${passwordChecks.hasUpper ? 'text-[#4edea3]' : 'text-[#8c909f]'}`}>
                  <span className="material-symbols-outlined text-[16px]">{passwordChecks.hasUpper ? 'check_circle' : 'radio_button_unchecked'}</span>
                  <span>Uma letra maiúscula</span>
                </div>
                <div data-testid="password-check-hasNumber" data-valid={passwordChecks.hasNumber} className={`flex items-center gap-2 text-xs font-sans transition-colors duration-200 ${passwordChecks.hasNumber ? 'text-[#4edea3]' : 'text-[#8c909f]'}`}>
                  <span className="material-symbols-outlined text-[16px]">{passwordChecks.hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                  <span>Um número</span>
                </div>
                <div data-testid="password-check-hasSpecial" data-valid={passwordChecks.hasSpecial} className={`flex items-center gap-2 text-xs font-sans transition-colors duration-200 ${passwordChecks.hasSpecial ? 'text-[#4edea3]' : 'text-[#8c909f]'}`}>
                  <span className="material-symbols-outlined text-[16px]">{passwordChecks.hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
                  <span>Caractere especial</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-1">
              <input 
                id="terms" 
                required 
                type="checkbox" 
                className="w-4 h-4 rounded bg-[#131318] border-[#24242D] text-primary focus:ring-primary/20 accent-[#adc6ff] mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms" className="font-sans text-[11px] text-[#8c909f] cursor-pointer leading-normal">
                Li e concordo com os <a className="text-primary hover:underline hover:text-[#d0bcff]" href="#terms">Termos de Uso</a> e a <a className="text-primary hover:underline hover:text-[#d0bcff]" href="#privacy">Política de Privacidade</a>.
              </label>
            </div>

            <Button type="submit" className="w-full mt-2 h-11">
              Criar Conta
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Button>
          </form>

          <div className="text-center pt-3 border-t border-[#24242D] mt-2">
            <p className="font-sans text-xs text-[#8c909f]">
              Já possui uma conta?{' '}
              <button 
                onClick={() => setCurrentScreen('login')}
                className="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none"
              >
                Fazer Login
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
