import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

export const calculateRoutineProgress = (completed: number, total: number) =>
  total > 0 ? Math.round((completed / total) * 100) : 0;

export const ROUTINE_PROGRESS_CIRCUMFERENCE = 452.3;

export const Dashboard: React.FC = () => {
  const {
    tasks,
    exercises,
    balance,
    invoice,
    projection,
    isAlertVisible,
    handleToggleTask,
    handlePayAlertBill,
    loggedWeights,
    setIsTaskModalOpen,
    setIsExpenseModalOpen,
    setIsWeightModalOpen,
    setIsWorkoutModalOpen,
    setExpenseType,
  } = useApp();

  // Tasks statistics
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const progressPercent = calculateRoutineProgress(completedTasksCount, totalTasksCount);
  const pendingTasksCount = totalTasksCount - completedTasksCount;

  // Exercises statistics
  const completedExercisesCount = exercises.filter((ex) => ex.completed).length;
  const totalExercisesCount = exercises.length;
  const exercisesProgressPercent = totalExercisesCount > 0 ? Math.round((completedExercisesCount / totalExercisesCount) * 100) : 0;

  const portugueseDateString = "quinta-feira, 16 de julho de 2026";

  // Dynamic SVG Weight Chart Calculator
  const getWeightChartSvg = () => {
    if (loggedWeights.length < 2) return null;
    
    // Width and height of the canvas
    const width = 240;
    const height = 60;
    const padding = 10;
    
    // Find min and max values for scaling
    const weights = loggedWeights.map(w => w.weight);
    const minW = Math.min(...weights) - 0.5;
    const maxW = Math.max(...weights) + 0.5;
    const diffW = maxW - minW || 1;
    
    // Map weights to X, Y coordinates
    const points = loggedWeights.map((record, index) => {
      const x = padding + (index * (width - 2 * padding)) / (loggedWeights.length - 1);
      const y = height - padding - ((record.weight - minW) * (height - 2 * padding)) / diffW;
      return { x, y, record };
    });
    
    // Build path using cubic bezier curves or straight lines
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    
    // Area path for gradient fill
    const areaD = `${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    
    return { points, d, areaD, width, height };
  };

  const chartData = getWeightChartSvg();

  return (
    <main className="mt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-300 flex flex-col gap-6">
      
      {/* Welcome Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="font-sans text-4xl md:text-5xl font-extrabold text-[#e0e3e5] tracking-tight">
            Bom dia, Lucas
          </h1>
          <p className="font-sans text-[#8c909f] mt-1 text-xs md:text-sm">
            Hoje é <span className="text-[#e0e3e5] font-semibold">{portugueseDateString}</span> — "O sucesso é a soma de pequenos esforços repetidos dia após dia."
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button 
            onClick={() => setIsTaskModalOpen(true)}
            size="sm"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">add</span> 
            Nova Tarefa
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => {
              setExpenseType('invoice');
              setIsExpenseModalOpen(true);
            }}
          >
            <span className="material-symbols-outlined text-[16px]">payments</span> 
            Lançar Despesa
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => setIsWeightModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[16px]">monitor_weight</span> 
            Registrar Peso
          </Button>
        </div>
      </header>

      {/* Alert Bar */}
      {isAlertVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb4ab]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <p className="font-sans text-xs font-bold text-[#ffb4ab] tracking-wider uppercase">
              ALERTA IMPORTANTE: CONTA DE LUZ VENCE AMANHÃ (R$ 342,10)
            </p>
          </div>
          <Button 
            variant="danger"
            size="sm"
            onClick={handlePayAlertBill}
            className="h-8"
          >
            PAGAR AGORA
          </Button>
        </motion.div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==================== LEFT COLUMN (4 cols) ==================== */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Routine Progress Card */}
          <Card className="flex flex-col items-center justify-center text-center p-6">
            <header className="w-full flex items-center gap-2 mb-4 self-start">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
              <h2 className="font-sans font-bold text-xs tracking-wider text-[#8c909f] uppercase">HOJE: PROGRESSO</h2>
            </header>

            <div className="relative w-44 h-44 mb-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  className="text-[#1d2022] stroke-current" 
                  cx="88" 
                  cy="88" 
                  fill="transparent" 
                  r="72" 
                  strokeWidth="7"
                />
                <motion.circle 
                  role="progressbar"
                  aria-label="Progresso da rotina"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent}
                  className="text-primary stroke-current" 
                  cx="88" 
                  cy="88" 
                  fill="transparent" 
                  r="72" 
                  strokeWidth="7"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: ROUTINE_PROGRESS_CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: ROUTINE_PROGRESS_CIRCUMFERENCE - (ROUTINE_PROGRESS_CIRCUMFERENCE * progressPercent) / 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    strokeDasharray: ROUTINE_PROGRESS_CIRCUMFERENCE,
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-mono text-4xl font-bold text-primary tracking-tighter">{progressPercent}%</span>
                <span className="font-sans text-[9px] text-[#8c909f] tracking-widest font-bold uppercase mt-0.5">DA ROTINA</span>
              </div>
            </div>
            
            <p className="font-sans text-[#8c909f] text-xs leading-normal">
              {pendingTasksCount === 0 
                ? 'Excelente! Todas as tarefas concluídas!' 
                : `Faltam ${pendingTasksCount} tarefa${pendingTasksCount > 1 ? 's' : ''} para completar o dia!`
              }
            </p>
          </Card>

          {/* Next Tasks Card */}
          <Card className="p-6">
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">list_alt</span>
                <h2 className="font-sans font-bold text-xs tracking-wider text-[#8c909f] uppercase">PRÓXIMAS TAREFAS</h2>
              </div>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="text-primary font-sans text-xs hover:underline uppercase tracking-wider font-bold cursor-pointer bg-transparent border-none"
              >
                VER TUDO
              </button>
            </header>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-center gap-3 p-3 bg-[#131318] hover:bg-white/5 border border-[#24242D] rounded-xl transition-all cursor-pointer group"
                >
                  <div className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-mono text-[11px] font-bold shrink-0 transition-all duration-300 ${
                    task.completed 
                      ? 'bg-primary/5 text-primary border border-primary/20' 
                      : 'bg-[#191c1e] text-[#8c909f] border border-transparent'
                  }`}>
                    <span>{task.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-sans font-bold text-xs truncate ${task.completed ? 'line-through text-[#8c909f]/60' : 'text-[#e0e3e5]'}`}>
                      {task.title}
                    </p>
                    <p className="text-[#8c909f] text-[10px] truncate mt-0.5">
                      {task.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-[#424753] group-hover:border-primary shrink-0 transition-colors duration-200">
                    {task.completed && (
                      <span className="material-symbols-outlined text-primary text-xs font-bold">check</span>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-xs text-[#8c909f] py-6 font-sans">Nenhuma tarefa agendada.</p>
              )}
            </div>
          </Card>
        </div>

        {/* ==================== RIGHT COLUMN (8 cols) ==================== */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Financial Consolidated Card */}
          <Card className="p-6 relative bg-gradient-to-br from-[#101415] to-[#131318]">
            <header className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                <h2 className="font-sans font-bold text-xs tracking-wider text-[#8c909f] uppercase">FINANCEIRO CONSOLIDADO</h2>
              </div>
              <button 
                onClick={() => {
                  setExpenseType('invoice');
                  setIsExpenseModalOpen(true);
                }}
                className="text-primary font-sans text-xs hover:underline uppercase tracking-wider font-bold cursor-pointer bg-transparent border-none"
              >
                LANÇAR
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="p-1 hover:bg-white/[0.02] rounded-xl transition-all">
                <p className="font-sans text-[10px] font-bold text-[#8c909f] tracking-wider uppercase mb-1">SALDO ATUAL</p>
                <p className="font-mono text-2xl font-bold text-[#e0e3e5] tracking-tight">
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="hidden md:block h-12 w-[1px] bg-[#24242D] self-center"></div>

              <div className="p-1 hover:bg-white/[0.02] rounded-xl transition-all">
                <p className="font-sans text-[10px] font-bold text-[#8c909f] tracking-wider uppercase mb-1">PRÓXIMA FATURA</p>
                <p className="font-mono text-2xl font-bold text-[#ffb4ab] tracking-tight">
                  R$ {invoice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="hidden md:block h-12 w-[1px] bg-[#24242D] self-center"></div>

              <div className="p-1 hover:bg-white/[0.02] rounded-xl transition-all">
                <p className="font-sans text-[10px] font-bold text-[#8c909f] tracking-wider uppercase mb-1">PROJEÇÃO FINAL DO MÊS</p>
                <p className="font-mono text-2xl font-bold text-[#4edea3] tracking-tight">
                  + R$ {projection.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          {/* Training of the Day Card */}
          <Card className="p-0 relative overflow-hidden flex flex-col min-h-[220px]">
            {/* Background Gym Image with dark overlay */}
            <div className="absolute inset-0 z-0">
              <div 
                className="w-full h-full bg-cover bg-center opacity-10" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1Wk11dI3m3SzrZpeK85WIZC3qwZttV0qRlpH1NA9IFhBhYRh3Je37tOqurHENSHIaM50Tv83JjVCVKkccZkhuQ50wHzsqCx6g9lLgnUFKBSIQ-Mj-m7YfNeihUKLloz4rpsyvznmmjpSo95GQfkaeHxQoUTCWMyvQPRrISiU63fi4YVH6YuulumT7s3Ahmr58vtmoPSEn6u0G2_Eu7BPMQpld2dl7kLP968WNa8aoZv8lciBCMM-xeA')" }}
              />
              <div className="absolute inset-0 bg-[#101415]/90"></div>
            </div>

            <div className="relative z-10 p-6 flex flex-col justify-between h-full flex-grow">
              <header className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">fitness_center</span>
                <h2 className="font-sans font-bold text-xs tracking-wider text-[#8c909f] uppercase">TREINO DO DIA</h2>
              </header>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full mt-auto">
                <div className="flex-grow w-full">
                  <h3 className="font-sans text-xl md:text-2xl font-bold text-[#e0e3e5] mb-2 tracking-tight">
                    Superior A: Peito e Tríceps
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-[#4edea3]/10 text-[#4edea3] font-sans font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border border-[#4edea3]/20">
                      HIPERTROFIA
                    </span>
                    <span className="bg-primary/10 text-primary font-sans font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border border-primary/20">
                      60 MIN
                    </span>
                  </div>
                  
                  <div className="w-full max-w-md bg-[#191c1e] rounded-full h-1.5 mb-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(173,198,255,0.5)]" 
                      style={{ width: `${exercisesProgressPercent}%` }}
                    />
                  </div>
                  <p className="text-[#8c909f] font-sans font-bold text-[9px] tracking-wider uppercase">
                    {completedExercisesCount} DE {totalExercisesCount} EXERCÍCIOS CONCLUÍDOS ({exercisesProgressPercent}%)
                  </p>
                </div>

                <button 
                  onClick={() => setIsWorkoutModalOpen(true)}
                  className="bg-[#191c1e] border border-[#24242D] hover:border-primary/50 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-[#24242d] transition-all group shrink-0 w-full md:w-36 h-28 cursor-pointer shadow-inner"
                >
                  <span className="material-symbols-outlined text-[36px] text-primary group-hover:scale-105 transition-transform duration-200" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                  <span className="font-sans font-bold text-[10px] tracking-wider uppercase text-primary mt-2">
                    INICIAR AGORA
                  </span>
                </button>
              </div>
            </div>
          </Card>

          {/* Bottom Split (Weight & Insights) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Weight Tracker Card */}
            <Card className="p-6 flex flex-col justify-between">
              <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">monitor_weight</span>
                  <h2 className="font-sans font-bold text-xs tracking-wider text-[#8c909f] uppercase">REGISTRO DE PESO</h2>
                </div>
                <button 
                  onClick={() => setIsWeightModalOpen(true)}
                  className="text-primary font-sans text-xs hover:underline uppercase tracking-wider font-bold cursor-pointer bg-transparent border-none"
                >
                  REGISTRAR
                </button>
              </header>

              <div className="flex-grow flex flex-col gap-4">
                {/* Weight Info Summary */}
                <div className="flex items-center gap-6">
                  <div className="bg-[#131318] p-3 rounded-xl border border-[#24242D] shrink-0">
                    <p className="text-[10px] text-[#8c909f] font-sans">Peso Atual</p>
                    <p className="font-mono text-2xl font-bold text-primary mt-0.5">
                      {loggedWeights[loggedWeights.length - 1]?.weight || 80.0} <span className="text-xs">kg</span>
                    </p>
                  </div>
                  <div className="text-xs text-[#8c909f] font-sans leading-relaxed">
                    Meta: <span className="text-[#4edea3] font-bold">78.0 kg</span>
                    <div className="mt-0.5">
                      Faltam: <span className="text-primary font-bold">
                        {Math.max(0, parseFloat(((loggedWeights[loggedWeights.length - 1]?.weight || 80.0) - 78).toFixed(1)))} kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* SVG Live Weight Evolution Line Chart */}
                {chartData && (
                  <div className="w-full bg-[#131318] p-2 rounded-xl border border-[#24242D] h-20 flex flex-col justify-center overflow-hidden">
                    <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} className="w-full h-full">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#adc6ff" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#adc6ff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Gradient Fill under Path */}
                      <path d={chartData.areaD} fill="url(#chartGradient)" />
                      
                      {/* Line Path */}
                      <path d={chartData.d} fill="none" stroke="#adc6ff" strokeWidth="2" strokeLinecap="round" />
                      
                      {/* Points */}
                      {chartData.points.map((pt, idx) => (
                        <g key={idx} className="group/dot">
                          <circle cx={pt.x} cy={pt.y} r="3" fill="#101415" stroke="#adc6ff" strokeWidth="1.5" />
                          <circle cx={pt.x} cy={pt.y} r="5" fill="#adc6ff" opacity="0" className="hover:opacity-30 cursor-pointer" />
                        </g>
                      ))}
                    </svg>
                  </div>
                )}
              </div>
            </Card>

            {/* Insights Card */}
            <Card className="p-6 flex flex-col justify-between">
              <header className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#4edea3] text-[20px]">analytics</span>
                <h2 className="font-sans font-bold text-xs tracking-wider text-[#8c909f] uppercase">INSIGHTS & MÉTRICAS</h2>
              </header>

              <div className="flex-grow flex flex-col gap-3 justify-center">
                <div className="p-3 bg-[#131318] rounded-xl border border-[#24242D] flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-[#8c909f] font-sans uppercase tracking-wider">Economia este mês</p>
                    <div className="flex items-end gap-1 mt-0.5">
                      <span className="font-mono text-lg font-bold text-[#4edea3]">12%</span>
                      <span className="text-[9px] text-[#4edea3] font-sans font-semibold uppercase mb-0.5">acima da meta</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#4edea3] text-xl">trending_up</span>
                </div>

                <div className="p-3 bg-[#131318] rounded-xl border border-[#24242D] flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-[#8c909f] font-sans uppercase tracking-wider">Frequência Treino</p>
                    <div className="flex items-end gap-1 mt-0.5">
                      <span className="font-mono text-lg font-bold text-primary">5/5</span>
                      <span className="text-[9px] text-[#8c909f] font-sans font-semibold uppercase mb-0.5">dias seguidos</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary text-xl">local_fire_department</span>
                </div>

                <button 
                  onClick={() => {
                    alert("Orby Insights:\n- Despesas gerais caíram 8% esta semana.\n- Excelente disciplina operacional! 5/5 treinos completados e 70% das tarefas concluídas.");
                  }}
                  className="w-full py-2 border border-[#424753] text-[#8c909f] hover:text-primary hover:border-primary rounded-lg font-sans text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer bg-transparent"
                >
                  VER DETALHES
                </button>
              </div>
            </Card>

          </div>

        </div>
      </div>
    </main>
  );
};
