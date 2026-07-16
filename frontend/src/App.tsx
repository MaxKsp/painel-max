import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface Task {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  completed: boolean;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: string;
  completed: boolean;
}

const DEFAULT_TASKS: Task[] = [
  { id: '1', time: '07:00', title: 'Meditação Matinal', subtitle: 'Mental health session', completed: true },
  { id: '2', time: '08:30', title: 'Treino de Cardio', subtitle: 'Corrida leve na esteira', completed: true },
  { id: '3', time: '10:00', title: 'Planejamento Semanal', subtitle: 'Metas do time', completed: true },
  { id: '4', time: '14:00', title: 'Reunião de Alinhamento', subtitle: 'Videochamada', completed: false },
  { id: '5', time: '16:30', title: 'Revisão de Código', subtitle: 'GitHub Pull Requests', completed: false },
  { id: '6', time: '17:30', title: 'Lanche da Tarde', subtitle: 'Shake proteico', completed: true },
  { id: '7', time: '18:00', title: 'Comprar Suplementos', subtitle: 'Farmácia central', completed: true },
];

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex-1', name: 'Supino Reto (Barra)', sets: '4 séries x 10 reps', completed: true },
  { id: 'ex-2', name: 'Supino Inclinado (Halteres)', sets: '3 séries x 12 reps', completed: true },
  { id: 'ex-3', name: 'Crucifixo Reto (Halteres)', sets: '3 séries x 12 reps', completed: true },
  { id: 'ex-4', name: 'Desenvolvimento de Ombros', sets: '4 séries x 10 reps', completed: false },
  { id: 'ex-5', name: 'Tríceps Pulley', sets: '3 séries x 12 reps', completed: false },
  { id: 'ex-6', name: 'Tríceps Testa', sets: '3 séries x 10 reps', completed: false },
  { id: 'ex-7', name: 'Elevação Lateral de Ombros', sets: '4 séries x 15 reps', completed: false },
];

export default function App() {
  // Navigation State
  // 'mapa' | 'dashboard' | 'login' | 'cadastro' | 'recuperar' | 'verificacao' | '2fa' | 'expirada' | 'bloqueada'
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');

  // App Global State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('orby_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('orby_exercises');
    return saved ? JSON.parse(saved) : DEFAULT_EXERCISES;
  });

  // Financial States
  const [balance, setBalance] = useState<number>(12450.80);
  const [invoice, setInvoice] = useState<number>(2120.45);
  const [projection, setProjection] = useState<number>(4890.12);

  // Alert States
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(true);

  // Search Modal
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState<boolean>(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('12:00');
  const [newTaskSubtitle, setNewTaskSubtitle] = useState('Geral');

  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseType, setExpenseType] = useState<'invoice' | 'sub_balance'>('invoice');

  const [weightValue, setWeightValue] = useState('80.0');
  const [loggedWeights, setLoggedWeights] = useState<Array<{ date: string; weight: number }>>([
    { date: '12/07', weight: 81.2 },
    { date: '13/07', weight: 80.9 },
    { date: '14/07', weight: 80.5 },
    { date: '15/07', weight: 80.2 },
  ]);

  // Auth / SignUp password checklist helpers
  const [registerPassword, setRegisterPassword] = useState('');
  const [passwordChecks, setPasswordChecks] = useState({
    minChar: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Locked count timer state
  const [blockedTime, setBlockedTime] = useState<number>(14 * 60 + 56); // 14:56 in seconds

  // Active workout timer
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [workoutTimer, setWorkoutTimer] = useState<number>(1800); // 30 minutes in seconds

  // Update localStorage when tasks or exercises change
  useEffect(() => {
    localStorage.setItem('orby_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('orby_exercises', JSON.stringify(exercises));
  }, [exercises]);

  // Handle countdown timers
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (currentScreen === 'bloqueada') {
      interval = setInterval(() => {
        setBlockedTime((prev) => (prev > 0 ? prev - 1 : 14 * 60 + 56));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentScreen]);

  // Active workout timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWorkoutActive && isWorkoutModalOpen) {
      interval = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutActive, isWorkoutModalOpen]);

  // Evaluate password requirements
  useEffect(() => {
    setPasswordChecks({
      minChar: registerPassword.length >= 8,
      hasUpper: /[A-Z]/.test(registerPassword),
      hasNumber: /[0-9]/.test(registerPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(registerPassword),
    });
  }, [registerPassword]);

  // Calculate task completions
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const pendingTasksCount = totalTasksCount - completedTasksCount;

  // Toggle tasks completion
  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  };

  // Add tasks
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      time: newTaskTime,
      subtitle: newTaskSubtitle || 'Geral',
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskSubtitle('');
    setIsTaskModalOpen(false);
  };

  // Pay Alert Bill
  const handlePayAlertBill = () => {
    setBalance((prev) => prev - 342.10);
    setProjection((prev) => prev - 342.10);
    setIsAlertVisible(false);
  };

  // Submit Expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(expenseAmount);
    if (!expenseDesc.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (expenseType === 'invoice') {
      setInvoice((prev) => prev + parsedAmount);
      setProjection((prev) => prev - parsedAmount);
    } else {
      setBalance((prev) => prev - parsedAmount);
      setProjection((prev) => prev - parsedAmount);
    }

    setExpenseDesc('');
    setExpenseAmount('');
    setIsExpenseModalOpen(false);
  };

  // Log weight
  const handleAddWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weightValue);
    if (isNaN(weightNum) || weightNum <= 0) return;

    const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    setLoggedWeights([...loggedWeights, { date: dateStr, weight: weightNum }]);
    setIsWeightModalOpen(false);
  };

  // Exercises states
  const completedExercisesCount = exercises.filter((ex) => ex.completed).length;
  const totalExercisesCount = exercises.length;

  const handleToggleExercise = (id: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === id) {
          return { ...ex, completed: !ex.completed };
        }
        return ex;
      })
    );
  };

  // Reset demo simulation state
  const handleResetSimulation = () => {
    setTasks(DEFAULT_TASKS);
    setExercises(DEFAULT_EXERCISES);
    setBalance(12450.80);
    setInvoice(2120.45);
    setProjection(4890.12);
    setIsAlertVisible(true);
    setBlockedTime(14 * 60 + 56);
  };

  // Global Key Down for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Format helper for dynamic time
  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Date formatted Portuguese
  const portugueseDateString = "quinta-feira, 16 de julho de 2026";

  return (
    <div className="relative min-h-screen bg-[#050507] text-[#e0e3e5]">
      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-md pt-32 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#131318] border border-[#24242D] rounded-xl shadow-2xl p-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-xs px-sm py-xs border-b border-[#24242D] mb-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">search</span>
              <input
                type="text"
                className="w-full bg-transparent border-none text-[#e0e3e5] placeholder-[#8c909f] focus:outline-none font-sans text-[18px]"
                placeholder="Busca global... (digite tarefas, treinos ou despesas)"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsSearchOpen(false);
                }}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-[#8c909f] hover:text-[#e0e3e5] font-sans text-sm border border-[#24242D] px-2 py-1 rounded-lg"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto px-sm pb-sm space-y-sm">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-lg text-[#8c909f] font-sans text-sm">
                  Digite algo para iniciar a busca no ecossistema Orby...
                </div>
              ) : (
                <div className="space-y-sm">
                  {/* Filter Tasks */}
                  {tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div>
                      <h4 className="text-primary text-xs font-semibold mb-xs uppercase tracking-widest font-sans">Tarefas Encontradas</h4>
                      <div className="space-y-1">
                        {tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                          <div
                            key={t.id}
                            onClick={() => {
                              handleToggleTask(t.id);
                              setIsSearchOpen(false);
                            }}
                            className="flex justify-between items-center bg-[#1c1c24] hover:bg-[#272733] p-xs rounded-lg cursor-pointer transition-colors"
                          >
                            <span className={`font-sans text-sm ${t.completed ? 'line-through text-[#8c909f]' : 'text-on-surface'}`}>{t.title}</span>
                            <span className="font-mono text-xs text-primary">{t.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Filter Workout */}
                  {exercises.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div>
                      <h4 className="text-secondary text-xs font-semibold mb-xs uppercase tracking-widest font-sans">Exercícios do Treino</h4>
                      <div className="space-y-1">
                        {exercises.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).map(e => (
                          <div
                            key={e.id}
                            onClick={() => {
                              handleToggleExercise(e.id);
                              setIsSearchOpen(false);
                            }}
                            className="flex justify-between items-center bg-[#1c1c24] hover:bg-[#272733] p-xs rounded-lg cursor-pointer transition-colors"
                          >
                            <span className={`font-sans text-sm ${e.completed ? 'line-through text-[#8c909f]' : 'text-on-surface'}`}>{e.name}</span>
                            <span className="font-sans text-xs text-[#8c909f]">{e.sets}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other options */}
                  <div className="pt-xs border-t border-[#24242D]/50 text-center text-xs text-[#8c909f] font-sans">
                    Fim dos resultados para "{searchQuery}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER CURRENT SCREEN */}
      {currentScreen === 'dashboard' && (
        <>
          {/* TopNavBar */}
          <nav className="bg-[#101415]/95 border-b border-[#424753] fixed top-0 w-full z-50 backdrop-blur-md">
            <div className="flex justify-between items-center px-lg py-sm w-full max-w-7xl mx-auto h-16">
              <div className="flex items-center gap-xl">
                <span 
                  onClick={() => setCurrentScreen('mapa')}
                  className="font-sans text-[32px] font-extrabold text-primary tracking-tighter cursor-pointer flex items-center gap-xs hover:opacity-80 select-none"
                >
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>widgets</span>
                  Orby
                </span>
                <div className="hidden md:flex gap-lg items-center">
                  <button 
                    onClick={() => setCurrentScreen('dashboard')}
                    className="font-sans font-bold text-sm text-primary border-b-2 border-primary pb-1 uppercase tracking-wider"
                  >
                    Agenda
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentScreen('mapa');
                    }}
                    className="font-sans font-bold text-sm text-on-surface-variant hover:text-primary transition-colors duration-200 uppercase tracking-wider"
                  >
                    Mapa de Telas
                  </button>
                  <button 
                    onClick={() => setIsWorkoutModalOpen(true)}
                    className="font-sans font-bold text-sm text-on-surface-variant hover:text-primary transition-colors duration-200 uppercase tracking-wider"
                  >
                    Treinos do Dia
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-md">
                <div className="flex items-center gap-sm">
                  {/* Search triggering */}
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="p-1 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs text-xs font-mono bg-[#191c1e] px-2 py-1 rounded-lg border border-[#24242D]"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    <span>Buscar <kbd className="bg-surface p-1 rounded font-mono text-[10px] border border-[#24242D]">/</kbd></span>
                  </button>

                  <button 
                    onClick={handleResetSimulation}
                    title="Restaurar dados iniciais da simulação"
                    className="p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center rounded-lg hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                  </button>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden border border-[#424753] hover:border-primary transition-colors"
                  >
                    <img 
                      className="w-full h-full object-cover" 
                      alt="Lucas headshot portrait" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHD0Bz8V6l_Z89xV7N2R9WHwRXJwUtBMuuJrYGLHjrgI_gjAsiNwGZ2x03QbfaHe6p3GcMkrn7PDk7ELKO1WhVRGxOpt9bhivwI5ZQFM2E8IWU9NbLvleQGlOsu0CLkS0gmN0mzAoFX1NNNFsynymVInK-JugeoodgvVBv9towkhinXeTuU4pd9xUr1CA9mutjqe6MxgUagOXJ0vu-2ztUc_pQ162uLyEXw1OehuSlUn8zUN4LNUjsWA"
                      referrerPolicy="no-referrer"
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#131318] border border-[#24242D] rounded-xl shadow-2xl p-xs z-[60] animate-in slide-in-from-top-2 duration-100">
                      <div className="px-sm py-xs border-b border-[#24242D] mb-xs">
                        <p className="font-sans font-bold text-sm text-[#e0e3e5]">Lucas Silva</p>
                        <p className="font-mono text-xs text-[#8c909f]">lucas@orby.com.br</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setCurrentScreen('login');
                        }}
                        className="w-full px-sm py-xs hover:bg-[#191c1e] text-left text-sm font-sans flex items-center gap-xs rounded-lg text-[#ffb4ab]"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Fazer Logout
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setCurrentScreen('expirada');
                        }}
                        className="w-full px-sm py-xs hover:bg-[#191c1e] text-left text-sm font-sans flex items-center gap-xs rounded-lg text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[18px]">timer_off</span>
                        Simular Sessão Expirada
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setCurrentScreen('bloqueada');
                        }}
                        className="w-full px-sm py-xs hover:bg-[#191c1e] text-left text-sm font-sans flex items-center gap-xs rounded-lg text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        Simular Acesso Bloqueado
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          <main className="mt-24 pb-xl px-md max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Welcome Header */}
            <header className="mb-lg flex flex-col lg:flex-row lg:items-end justify-between gap-md">
              <div>
                <h1 className="font-sans text-4xl md:text-5xl font-bold text-primary text-glow-primary tracking-tight">
                  Bom dia, Lucas
                </h1>
                <p className="font-sans text-on-surface-variant mt-1 text-sm md:text-base">
                  Hoje é <span className="text-[#e0e3e5] font-semibold">{portugueseDateString}</span> — "O sucesso é a soma de pequenos esforços repetidos dia após dia."
                </p>
              </div>
              <div className="flex flex-wrap gap-xs">
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="primary-btn px-sm py-2 rounded-lg flex items-center gap-xs text-[14px] shadow-[0_0_12px_rgba(173,198,255,0.15)] hover:brightness-110"
                >
                  <span className="material-symbols-outlined text-[18px] font-bold">add</span> Nova Tarefa
                </button>
                <button 
                  onClick={() => {
                    setExpenseType('invoice');
                    setIsExpenseModalOpen(true);
                  }}
                  className="bg-surface-container border border-[#424753] hover:bg-surface-variant hover:border-primary transition-all px-sm py-2 rounded-lg flex items-center gap-xs text-on-surface text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span> Lançar Despesa
                </button>
                <button 
                  onClick={() => setIsWeightModalOpen(true)}
                  className="bg-surface-container border border-[#424753] hover:bg-surface-variant hover:border-primary transition-all px-sm py-2 rounded-lg flex items-center gap-xs text-on-surface text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">monitor_weight</span> Registrar Peso
                </button>
              </div>
            </header>

            {/* Alert Bar */}
            {isAlertVisible && (
              <div className="mb-lg bg-error-container/15 border border-error/25 p-sm rounded-xl flex items-center justify-between gap-sm animate-pulse">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <p className="font-sans text-xs md:text-sm font-bold text-error tracking-wider uppercase">
                    ALERTA IMPORTANTE: CONTA DE LUZ VENCE AMANHÃ (R$ 342,10)
                  </p>
                </div>
                <button 
                  onClick={handlePayAlertBill}
                  className="bg-error-container text-white px-3 py-1 rounded-lg text-xs font-sans hover:bg-error transition-all"
                >
                  PAGAR AGORA
                </button>
              </div>
            )}

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
              {/* Section Today: Routine & Next Tasks (4 cols) */}
              <section className="lg:col-span-4 flex flex-col gap-lg">
                
                {/* Routine Progress Circle Card */}
                <div className="card-base p-md flex flex-col items-center justify-center text-center">
                  <header className="w-full flex items-center gap-xs mb-md self-start">
                    <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                    <h2 className="font-sans font-bold text-xs tracking-wider text-on-surface-variant uppercase">HOJE: PROGRESSO</h2>
                  </header>

                  <div className="relative w-48 h-48 mb-md flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        className="text-surface-container-highest stroke-current" 
                        cx="96" 
                        cy="96" 
                        fill="transparent" 
                        r="80" 
                        strokeWidth="8"
                      />
                      <circle 
                        className="text-primary stroke-current progress-ring-circle" 
                        cx="96" 
                        cy="96" 
                        fill="transparent" 
                        r="80" 
                        strokeWidth="8"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: 502.6,
                          strokeDashoffset: 502.6 - (502.6 * progressPercent) / 100
                        }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="font-sans text-5xl font-extrabold text-primary text-glow-primary">{progressPercent}%</span>
                      <span className="font-sans text-[10px] text-on-surface-variant tracking-widest font-bold uppercase">DA ROTINA</span>
                    </div>
                  </div>
                  <p className="font-sans text-on-surface-variant text-sm">
                    {pendingTasksCount === 0 
                      ? 'Parabéns! Todas as tarefas concluídas!' 
                      : `Faltam ${pendingTasksCount} tarefa${pendingTasksCount > 1 ? 's' : ''} para completar o dia!`
                    }
                  </p>
                </div>

                {/* Next Tasks List Card */}
                <div className="card-base p-md">
                  <header className="flex items-center justify-between mb-md">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">list_alt</span>
                      <h2 className="font-sans font-bold text-xs tracking-wider text-on-surface-variant uppercase">PRÓXIMAS TAREFAS</h2>
                    </div>
                    <button 
                      onClick={() => setIsTaskModalOpen(true)}
                      className="text-primary font-sans text-xs hover:underline uppercase tracking-wider font-semibold"
                    >
                      ADICIONAR
                    </button>
                  </header>

                  <div className="space-y-sm max-h-80 overflow-y-auto pr-xs">
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className="flex items-center gap-sm p-sm bg-surface-container-lowest hover:bg-surface-container border border-[#24242D] rounded-xl transition-all cursor-pointer group"
                      >
                        <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-mono text-xs transition-transform group-hover:scale-105 duration-200 ${task.completed ? 'bg-primary/5 text-primary border border-primary/25' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          <span>{task.time}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-sans font-bold text-sm truncate ${task.completed ? 'line-through text-on-surface-variant/60' : 'text-[#e0e3e5]'}`}>
                            {task.title}
                          </p>
                          <p className="text-on-surface-variant text-xs truncate">
                            {task.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#424753] group-hover:border-primary transition-colors">
                          {task.completed && (
                            <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-center text-sm text-[#8c909f] py-md">Nenhuma tarefa agendada.</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Section Finance & Training (8 cols) */}
              <section className="lg:col-span-8 flex flex-col gap-lg">
                
                {/* Financial Consolidated */}
                <div className="card-base p-md bg-gradient-to-br from-[#131318] to-[#1d2022] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                  
                  <header className="flex justify-between items-center mb-lg">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                      <h2 className="font-sans font-bold text-xs tracking-wider text-on-surface-variant uppercase">FINANCEIRO CONSOLIDADO</h2>
                    </div>
                    <button 
                      onClick={() => {
                        setExpenseType('invoice');
                        setIsExpenseModalOpen(true);
                      }}
                      className="text-primary font-sans text-xs hover:underline uppercase tracking-wider font-semibold"
                    >
                      LANÇAR
                    </button>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-lg relative z-10">
                    <div className="p-xs hover:bg-white/5 rounded-xl transition-all">
                      <p className="font-sans text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-1">SALDO ATUAL</p>
                      <p className="font-mono text-2xl lg:text-3xl font-bold text-[#e0e3e5]">
                        R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="h-px md:h-12 w-full md:w-px bg-[#424753] self-center"></div>

                    <div className="p-xs hover:bg-white/5 rounded-xl transition-all">
                      <p className="font-sans text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-1">PRÓXIMA FATURA</p>
                      <p className="font-mono text-2xl lg:text-3xl font-bold text-error">
                        R$ {invoice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="h-px md:h-12 w-full md:w-px bg-[#424753] self-center"></div>

                    <div className="p-xs hover:bg-white/5 rounded-xl transition-all">
                      <p className="font-sans text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-1">PROJEÇÃO FINAL DO MÊS</p>
                      <p className="font-mono text-2xl lg:text-3xl font-bold text-tertiary text-glow-tertiary">
                        + R$ {projection.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Training of the Day Card */}
                <div className="card-base p-md flex flex-col gap-lg relative overflow-hidden">
                  <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                    <div 
                      className="w-full h-full bg-cover bg-center" 
                      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1Wk11dI3m3SzrZpeK85WIZC3qwZttV0qRlpH1NA9IFhBhYRh3Je37tOqurHENSHIaM50Tv83JjVCVKkccZkhuQ50wHzsqCx6g9lLgnUFKBSIQ-Mj-m7YfNeihUKLloz4rpsyvznmmjpSo95GQfkaeHxQoUTCWMyvQPRrISiU63fi4YVH6YuulumT7s3Ahmr58vtmoPSEn6u0G2_Eu7BPMQpld2dl7kLP968WNa8aoZv8lciBCMM-xeA')" }}
                    />
                  </div>

                  <div className="relative z-10 w-full">
                    <header className="flex items-center gap-xs mb-lg">
                      <span className="material-symbols-outlined text-primary text-[20px]">fitness_center</span>
                      <h2 className="font-sans font-bold text-xs tracking-wider text-on-surface-variant uppercase">TREINO DO DIA</h2>
                    </header>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-lg w-full">
                      <div className="flex-1 w-full">
                        <h3 className="font-sans text-2xl font-bold text-[#e0e3e5] mb-xs">
                          Superior A: Peito e Tríceps
                        </h3>
                        <div className="flex gap-sm mb-lg">
                          <span className="bg-tertiary/10 text-tertiary font-sans font-bold px-sm py-1 rounded-full text-[10px] uppercase tracking-wider border border-tertiary/20">
                            HIPERTROFIA
                          </span>
                          <span className="bg-primary/10 text-primary font-sans font-bold px-sm py-1 rounded-full text-[10px] uppercase tracking-wider border border-primary/20">
                            60 MIN
                          </span>
                        </div>
                        
                        <div className="w-full bg-surface-container rounded-full h-2 mb-xs">
                          <div 
                            className="bg-primary h-2 rounded-full shadow-[0_0_8px_rgba(173,198,255,0.5)] transition-all duration-300" 
                            style={{ width: `${(completedExercisesCount / totalExercisesCount) * 100}%` }}
                          />
                        </div>
                        <p className="text-on-surface-variant font-sans font-bold text-[10px] tracking-wider uppercase">
                          {completedExercisesCount} DE {totalExercisesCount} EXERCÍCIOS CONCLUÍDOS
                        </p>
                      </div>

                      <button 
                        onClick={() => {
                          setIsWorkoutActive(true);
                          setIsWorkoutModalOpen(true);
                        }}
                        className="bg-surface-bright/20 backdrop-blur-md border border-[#424753] p-lg rounded-xl flex flex-col items-center justify-center hover:bg-surface-bright/40 hover:border-primary transition-all group shrink-0 w-full md:w-auto"
                      >
                        <span className="material-symbols-outlined text-[48px] text-primary group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                          play_circle
                        </span>
                        <span className="font-sans font-bold text-xs tracking-wider uppercase text-primary mt-xs">
                          INICIAR AGORA
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Insights and Weight tracker split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  
                  {/* Weight tracker logging history */}
                  <div className="card-base p-md flex flex-col">
                    <header className="flex items-center justify-between mb-md">
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-primary text-[20px]">monitor_weight</span>
                        <h2 className="font-sans font-bold text-xs tracking-wider text-on-surface-variant uppercase">REGISTRO DE PESO</h2>
                      </div>
                      <button 
                        onClick={() => setIsWeightModalOpen(true)}
                        className="text-primary font-sans text-xs hover:underline uppercase tracking-wider font-semibold"
                      >
                        REGISTRAR
                      </button>
                    </header>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center gap-md py-sm">
                        <div className="bg-surface-container p-sm rounded-xl border border-[#24242D]">
                          <p className="text-xs text-[#8c909f] font-sans">Peso Atual</p>
                          <p className="font-mono text-2xl font-bold text-primary">
                            {loggedWeights[loggedWeights.length - 1]?.weight || 80.0} <span className="text-xs">kg</span>
                          </p>
                        </div>
                        <div className="text-xs text-on-surface-variant font-sans">
                          Meta: <span className="text-tertiary font-bold">78.0 kg</span>
                          <div className="mt-1">
                            Faltam: <span className="text-primary font-bold">{( (loggedWeights[loggedWeights.length - 1]?.weight || 80.0) - 78 ).toFixed(1)} kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#24242D] pt-sm">
                        <p className="text-xs text-[#8c909f] font-sans mb-xs uppercase tracking-wider font-bold">Histórico Recente</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {loggedWeights.slice(-4).map((lw, idx) => (
                            <div key={idx} className="bg-surface-container-low px-sm py-1 rounded-lg border border-[#24242D] text-center shrink-0 min-w-[60px]">
                              <p className="font-mono text-[10px] text-[#8c909f]">{lw.date}</p>
                              <p className="font-mono text-xs font-bold text-on-surface">{lw.weight}k</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insights card */}
                  <div className="card-base p-md flex flex-col justify-between">
                    <header className="flex items-center gap-xs mb-md">
                      <span className="material-symbols-outlined text-tertiary text-[20px]">analytics</span>
                      <h2 className="font-sans font-bold text-xs tracking-wider text-on-surface-variant uppercase">INSIGHTS & MÉTRICAS</h2>
                    </header>

                    <div className="flex-1 flex flex-col justify-between gap-md">
                      <div className="p-sm bg-surface-container rounded-xl border border-[#24242D] flex justify-between items-center">
                        <div>
                          <p className="text-[12px] text-[#8c909f] font-sans mb-xs uppercase tracking-wider">Economia este mês</p>
                          <div className="flex items-end gap-xs">
                            <span className="font-mono text-xl font-bold text-tertiary">12%</span>
                            <span className="text-[10px] text-tertiary font-sans font-medium uppercase mb-1">acima da meta</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-tertiary text-2xl">trending_up</span>
                      </div>

                      <div className="p-sm bg-surface-container rounded-xl border border-[#24242D] flex justify-between items-center">
                        <div>
                          <p className="text-[12px] text-[#8c909f] font-sans mb-xs uppercase tracking-wider">Frequência Treino</p>
                          <div className="flex items-end gap-xs">
                            <span className="font-mono text-xl font-bold text-primary">5/5</span>
                            <span className="text-[10px] text-on-surface-variant font-sans font-medium uppercase mb-1">dias seguidos</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-primary text-2xl">local_fire_department</span>
                      </div>

                      <button 
                        onClick={() => {
                          alert("Orby Insights:\n- Seus gastos diminuíram 8% comparados à semana passada.\n- Foco operacional excelente com 5/5 treinos completados e 70% de tarefas concluídas!");
                        }}
                        className="w-full py-2 border border-[#424753] text-on-surface-variant hover:text-primary hover:border-primary rounded-lg font-sans text-xs uppercase tracking-wider font-bold transition-all"
                      >
                        VER DETALHES COMPLETOS
                      </button>
                    </div>
                  </div>

                </div>

              </section>
            </div>
          </main>
        </>
      )}

      {currentScreen === 'mapa' && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-[#424753] bg-[#101415] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-lg py-sm flex justify-between items-center w-full h-16">
              <span 
                onClick={() => setCurrentScreen('dashboard')}
                className="font-sans text-2xl font-bold text-primary cursor-pointer flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-primary text-[24px]">widgets</span>
                Orby
              </span>
              <h1 className="font-sans text-lg md:text-xl font-bold text-[#e0e3e5]">00 — Mapa de Telas do Orby</h1>
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className="px-sm py-1 bg-primary text-on-primary font-bold font-sans text-xs rounded-lg hover:brightness-110"
              >
                IR PARA O DASHBOARD
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-grow max-w-7xl mx-auto px-lg py-xl w-full flex flex-col gap-xl animate-in fade-in duration-300">
            
            {/* Quick Helper Banner */}
            <div className="bg-[#131318] border border-[#24242D] rounded-xl p-md flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
              <div>
                <p className="text-primary font-bold font-sans text-sm uppercase tracking-wider mb-1">Portal do Desenvolvedor & Mapa Interativo</p>
                <p className="text-[#8c909f] font-sans text-xs md:text-sm">
                  Clique em qualquer cartão de tela abaixo para iniciar a demonstração interativa daquele fluxo. Use a simulação para avaliar cada layout com detalhes precisos!
                </p>
              </div>
              <button 
                onClick={handleResetSimulation}
                className="bg-[#191c1e] text-[#e0e3e5] border border-[#424753] px-3 py-1.5 rounded-lg text-xs font-sans hover:border-primary hover:text-primary transition-all"
              >
                Restaurar Simulação
              </button>
            </div>

            {/* Auth Section */}
            <section>
              <h2 className="font-sans text-xl font-bold text-[#e0e3e5] mb-md uppercase tracking-wider border-l-4 border-primary pl-xs">
                Autenticação (Auth)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-sm">
                
                <div 
                  onClick={() => setCurrentScreen('login')}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">login</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Login (01)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Formulário com SSO Google</span>
                </div>

                <div 
                  onClick={() => setCurrentScreen('cadastro')}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">person_add</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Cadastro (02)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Validador de força de senha</span>
                </div>

                <div 
                  onClick={() => setCurrentScreen('recuperar')}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">vpn_key</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Recuperar Senha (03)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Instruções por e-mail</span>
                </div>

                <div 
                  onClick={() => setCurrentScreen('verificacao')}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">mark_email_unread</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Verificar E-mail (04)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Aviso de ativação de conta</span>
                </div>

                <div 
                  onClick={() => setCurrentScreen('2fa')}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">shield_person</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">2FA Autenticação (05)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Código TOTP de 6 dígitos</span>
                </div>

                <div 
                  onClick={() => setCurrentScreen('expirada')}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">timer_off</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Sessão Expirada (06)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Segurança por inatividade</span>
                </div>

                <div 
                  onClick={() => setCurrentScreen('bloqueada')}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">lock</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Acesso Bloqueado (07)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Contagem regressiva ativa</span>
                </div>

              </div>
            </section>

            {/* Navigation Section */}
            <section>
              <h2 className="font-sans text-xl font-bold text-[#e0e3e5] mb-md uppercase tracking-wider border-l-4 border-primary pl-xs">
                Navegação Base
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-sm">
                
                <div 
                  onClick={() => setCurrentScreen('dashboard')}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">dashboard</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Dashboard Principal (10)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Agenda, Finanças e Treinos</span>
                </div>

                <div 
                  onClick={() => setIsSearchOpen(true)}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">search</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Busca Global (11)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Pesquisa instantânea</span>
                </div>

              </div>
            </section>

            {/* Agenda Section */}
            <section>
              <h2 className="font-sans text-xl font-bold text-[#e0e3e5] mb-md uppercase tracking-wider border-l-4 border-primary pl-xs">
                Agenda & Treinos Interativos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-sm">
                
                <div 
                  onClick={() => {
                    setCurrentScreen('dashboard');
                    setTimeout(() => setIsTaskModalOpen(true), 150);
                  }}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">add_circle</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Novo Evento/Tarefa (22)</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Criação de compromisso</span>
                </div>

                <div 
                  onClick={() => {
                    setCurrentScreen('dashboard');
                    setTimeout(() => setIsWorkoutModalOpen(true), 150);
                  }}
                  className="card-base rounded-xl p-md flex flex-col items-center justify-center gap-xs hover:border-primary transition-all cursor-pointer group text-center"
                >
                  <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary text-4xl mb-2">fitness_center</span>
                  <span className="font-sans font-bold text-sm text-[#e0e3e5] group-hover:text-primary">Treino Interativo</span>
                  <span className="font-sans text-[11px] text-[#8c909f]">Lista de exercícios com cronômetro</span>
                </div>

              </div>
            </section>
          </main>
        </div>
      )}

      {currentScreen === 'login' && (
        <div className="tech-bg min-h-screen flex flex-col items-center justify-center p-md relative overflow-hidden select-none animate-in fade-in duration-300">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/10 blur-[100px] rounded-full pointer-events-none"></div>

          {/* Map Return button */}
          <button 
            onClick={() => setCurrentScreen('mapa')}
            className="absolute top-md left-md flex items-center gap-xs bg-surface-container border border-[#424753] hover:border-primary transition-colors px-3 py-1.5 rounded-lg text-xs font-sans text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Ver Mapa de Telas
          </button>

          <main className="w-full max-w-[420px] bg-[#101415] border border-surface-container-highest rounded-xl p-lg flex flex-col gap-lg shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-secondary"></div>

            <div className="flex flex-col items-center gap-xs text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container border border-surface-container-highest mb-xs shadow-inner">
                <span className="material-symbols-outlined text-[32px] bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  blur_on
                </span>
              </div>
              <h1 className="font-sans text-2xl font-bold text-[#e0e3e5]">Bem-vindo à Orby</h1>
              <p className="font-sans text-sm text-[#c2c6d5]">Acesse sua plataforma para continuar.</p>
            </div>

            <form 
              className="flex flex-col gap-md" 
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentScreen('2fa');
              }}
            >
              <div className="flex flex-col gap-1 group focus-glow">
                <label className="font-sans font-bold text-[11px] tracking-wider uppercase text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="login-email">
                  E-mail Corporativo
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-sm text-[#8c909f] group-focus-within:text-primary transition-colors">mail</span>
                  <input 
                    className="w-full bg-surface-container border border-surface-container-highest rounded-lg py-sm pl-xl pr-sm font-mono text-sm text-on-surface placeholder-[#8c909f] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                    id="login-email" 
                    placeholder="nome@empresa.com" 
                    required 
                    type="email"
                    defaultValue="lucas@orby.com.br"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 group focus-glow">
                <label className="font-sans font-bold text-[11px] tracking-wider uppercase text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="login-password">
                  Senha de Acesso
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-sm text-[#8c909f] group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    className="w-full bg-surface-container border border-surface-container-highest rounded-lg py-sm pl-xl pr-sm font-mono text-sm text-on-surface placeholder-[#8c909f] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                    id="login-password" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    defaultValue="OrbySec2026!"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-xs">
                <label className="flex items-center gap-xs cursor-pointer group">
                  <input className="w-4 h-4 rounded bg-surface-container border-surface-container-highest focus:ring-primary checked:bg-primary" type="checkbox" defaultChecked />
                  <span className="font-sans text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">Lembrar de mim</span>
                </label>
                <button 
                  type="button"
                  onClick={() => setCurrentScreen('recuperar')}
                  className="font-sans text-xs text-primary hover:underline transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>

              <button 
                className="w-full flex items-center justify-center gap-xs rounded-lg py-sm mt-xs bg-gradient-to-r from-primary-container to-secondary-container text-white font-sans font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(81,142,250,0.2)]" 
                type="submit"
              >
                Entrar
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </form>

            <div className="flex items-center gap-sm my-xs">
              <div className="h-[1px] flex-1 bg-surface-container-highest"></div>
              <span className="font-sans text-[11px] tracking-wider text-[#8c909f] uppercase font-bold">Ou</span>
              <div className="h-[1px] flex-1 bg-surface-container-highest"></div>
            </div>

            <div className="flex flex-col gap-sm">
              <button 
                onClick={() => setCurrentScreen('2fa')}
                className="w-full flex items-center justify-center gap-sm rounded-lg py-2 border border-surface-container-highest bg-transparent text-[#e0e3e5] font-sans text-xs hover:bg-surface-container hover:border-[#8c909f] transition-all active:scale-[0.98]" 
                type="button"
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Entrar com Google Workspace
              </button>
            </div>

            <div className="text-center pt-xs mt-xs border-t border-surface-container-highest/50">
              <p className="font-sans text-xs text-on-surface-variant">
                Não tem conta?{' '}
                <button 
                  onClick={() => setCurrentScreen('cadastro')}
                  className="text-primary font-bold hover:underline"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </main>

          <div className="absolute bottom-md right-md text-[#8c909f]/30 font-mono text-xs pointer-events-none hidden md:block">
            Orby Pro Secure Access V.1.2
          </div>
        </div>
      )}

      {currentScreen === 'cadastro' && (
        <div className="min-h-screen flex bg-[#050507] animate-in fade-in duration-300">
          
          {/* Left Visual Panel (Desktop) */}
          <div className="hidden lg:flex lg:w-[45%] relative bg-[#131318] overflow-hidden items-center justify-center">
            {/* Abstract Brand Image */}
            <div className="absolute inset-0 z-0">
              <div 
                className="w-full h-full bg-cover bg-center opacity-40 mix-blend-screen" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCRmHFzQwbUvWui0mOA-YJqQM5SXwGXRBJkAfiFBQqL5gAQyVjzBOFJMkNJEvuKcigUcbKc1lZSjiSvmqep6DrlG9lEsoFU2sjTNA2dFUoXG7wwYs3Tc9J8GgOVSYxj98uHlVm23GykCg6mx8LhHf_4hQakdctstbfk1OD-AJwqnU-VWhpLdQ4Mm4tRkaD8StmgYCXetEprYDwx5rHtQXYP6hy1W70M3s6Qgny0FvKzABJ22XOCwVatjg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]/50"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050507]"></div>
            </div>

            {/* Branding Anchor */}
            <div className="relative z-10 p-xl flex flex-col gap-md max-w-md w-full">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>widgets</span>
                <span className="font-sans text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Orby</span>
              </div>
              <p className="font-sans text-xl text-on-surface-variant font-light leading-relaxed">
                O ecossistema definitivo para performance financeira e foco operacional.
              </p>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-gutter md:p-xl relative z-10">
            {/* Mobile Brand Logo */}
            <div className="lg:hidden flex items-center gap-xs mb-lg absolute top-gutter left-gutter">
              <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>widgets</span>
              <span className="font-sans text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Orby</span>
            </div>

            {/* Back to map */}
            <button 
              onClick={() => setCurrentScreen('mapa')}
              className="absolute top-gutter right-gutter flex items-center gap-xs bg-surface-container border border-[#424753] hover:border-primary transition-colors px-3 py-1.5 rounded-lg text-xs font-sans text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Ver Mapa
            </button>

            {/* Form Card Level 1 */}
            <div className="w-full max-w-[440px] glass-card rounded-xl p-md md:p-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-lg">
              <div className="flex flex-col gap-base">
                <h1 className="font-sans text-2xl font-bold text-[#e0e3e5]">Criar sua conta</h1>
                <p className="font-sans text-xs text-[#c2c6d5]">
                  Preencha os dados abaixo para iniciar sua jornada.
                </p>
              </div>

              <form 
                className="flex flex-col gap-md" 
                onSubmit={(e) => {
                  e.preventDefault();
                  setCurrentScreen('verificacao');
                }}
              >
                {/* Nome Input */}
                <div className="flex flex-col gap-xs">
                  <label className="font-sans font-bold text-[11px] tracking-wider uppercase text-on-surface-variant" htmlFor="fullName">Nome Completo</label>
                  <div className="relative flex items-center input-glow rounded-lg transition-all duration-300">
                    <span className="material-symbols-outlined absolute left-sm text-[#8c909f]">person</span>
                    <input 
                      className="w-full bg-surface-container border border-[#424753] text-[#e0e3e5] placeholder-[#8c909f] rounded-lg py-2.5 pl-xl pr-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-sans" 
                      id="fullName" 
                      placeholder="Ex: João Silva" 
                      required 
                      type="text"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="flex flex-col gap-xs">
                  <label className="font-sans font-bold text-[11px] tracking-wider uppercase text-on-surface-variant" htmlFor="email">E-mail Corporativo</label>
                  <div className="relative flex items-center input-glow rounded-lg transition-all duration-300">
                    <span className="material-symbols-outlined absolute left-sm text-[#8c909f]">mail</span>
                    <input 
                      className="w-full bg-surface-container border border-[#424753] text-[#e0e3e5] placeholder-[#8c909f] rounded-lg py-2.5 pl-xl pr-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-sans" 
                      id="email" 
                      placeholder="nome@empresa.com" 
                      required 
                      type="email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-xs">
                  <label className="font-sans font-bold text-[11px] tracking-wider uppercase text-on-surface-variant" htmlFor="password">Senha</label>
                  <div className="relative flex items-center input-glow rounded-lg transition-all duration-300">
                    <span className="material-symbols-outlined absolute left-sm text-[#8c909f]">lock</span>
                    <input 
                      className="w-full bg-surface-container border border-[#424753] text-[#e0e3e5] placeholder-[#8c909f] rounded-lg py-2.5 pl-xl pr-[48px] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-sans" 
                      id="password" 
                      placeholder="••••••••" 
                      required 
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className="bg-surface-container p-sm rounded-lg border border-[#424753]/50 flex flex-col gap-xs mt-xs">
                  <p className="font-sans font-bold text-[10px] text-on-surface-variant tracking-wider uppercase mb-1">Requisitos da Senha</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className={`flex items-center gap-2 text-xs font-sans ${passwordChecks.minChar ? 'text-tertiary' : 'text-[#8c909f]'}`}>
                      <span className="material-symbols-outlined text-[16px]">{passwordChecks.minChar ? 'check_circle' : 'radio_button_unchecked'}</span>
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-sans ${passwordChecks.hasUpper ? 'text-tertiary' : 'text-[#8c909f]'}`}>
                      <span className="material-symbols-outlined text-[16px]">{passwordChecks.hasUpper ? 'check_circle' : 'radio_button_unchecked'}</span>
                      <span>Uma letra maiúscula</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-sans ${passwordChecks.hasNumber ? 'text-tertiary' : 'text-[#8c909f]'}`}>
                      <span className="material-symbols-outlined text-[16px]">{passwordChecks.hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                      <span>Um número</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-sans ${passwordChecks.hasSpecial ? 'text-tertiary' : 'text-[#8c909f]'}`}>
                      <span className="material-symbols-outlined text-[16px]">{passwordChecks.hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
                      <span>Caractere especial</span>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 mt-xs">
                  <input className="w-4 h-4 rounded bg-surface-container border-[#424753] focus:ring-primary checked:bg-primary" id="terms" required type="checkbox" />
                  <label className="font-sans text-xs text-on-surface-variant cursor-pointer pt-[1px]" htmlFor="terms">
                    Eu li e concordo com os <a className="text-primary hover:underline" href="#terms">Termos de Uso</a> e <a className="text-primary hover:underline" href="#privacy">Política de Privacidade</a>.
                  </label>
                </div>

                {/* Submit Action */}
                <button 
                  className="w-full mt-sm py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-sans font-bold text-sm uppercase tracking-wider hover:brightness-110 hover:shadow-[0_0_16px_rgba(173,198,255,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-xs group" 
                  type="submit"
                >
                  Finalizar Cadastro
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </form>

              {/* Footer Link */}
              <div className="text-center border-t border-[#424753]/30 pt-md mt-xs">
                <p className="font-sans text-xs text-on-surface-variant">
                  Já possui uma conta?{' '}
                  <button 
                    onClick={() => setCurrentScreen('login')}
                    className="text-primary font-bold hover:underline"
                  >
                    Entrar no sistema
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentScreen === 'verificacao' && (
        <div className="tech-bg min-h-screen flex items-center justify-center p-md relative overflow-hidden select-none animate-in fade-in duration-300">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Quick Screen Back map switcher */}
          <button 
            onClick={() => setCurrentScreen('mapa')}
            className="absolute top-md left-md flex items-center gap-xs bg-surface-container border border-[#424753] hover:border-primary transition-colors px-3 py-1.5 rounded-lg text-xs font-sans text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Ver Mapa de Telas
          </button>

          <main className="w-full max-w-[420px] bg-[#101415] rounded-xl border border-[#424753] p-xl flex flex-col items-center text-center shadow-2xl relative overflow-hidden z-10 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

            <div className="mb-lg">
              <span className="font-sans text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">Orby</span>
            </div>

            <div className="mb-lg relative group">
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl group-hover:bg-secondary/30 transition-all duration-500"></div>
              <div className="relative w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center border border-[#424753] z-10">
                <span className="material-symbols-outlined text-[40px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mark_email_unread
                </span>
              </div>
            </div>

            <h1 className="font-sans text-xl font-bold text-[#e0e3e5] mb-xs">
              Verifique seu e-mail
            </h1>
            <p className="font-sans text-sm text-[#c2c6d5] mb-xl px-sm">
              Enviamos um link de ativação seguro para confirmar sua identidade. Por favor, verifique sua caixa de entrada.
            </p>

            <div className="w-full flex flex-col gap-sm">
              <button 
                onClick={() => alert("E-mail de verificação reconfigurado e reenviado!")}
                className="w-full relative group overflow-hidden rounded-lg bg-transparent border border-[#424753] px-md py-3 flex items-center justify-center gap-xs transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_rgba(173,198,255,0.15)] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#8c909f] group-hover:text-primary transition-colors">
                  forward_to_inbox
                </span>
                <span className="font-sans font-bold text-xs tracking-wider text-[#e0e3e5] group-hover:text-primary transition-colors uppercase">
                  REENVIAR E-MAIL
                </span>
              </button>

              <button 
                onClick={() => setCurrentScreen('login')}
                className="w-full py-2.5 hover:bg-surface-container-high rounded-lg text-xs font-sans text-primary font-bold hover:underline transition-all"
              >
                Ir para o Login
              </button>
            </div>

            <div className="mt-lg pt-sm border-t border-surface-container-highest w-full">
              <button 
                onClick={() => alert("Simulando central de ajuda Orby support_agent")}
                className="inline-flex items-center gap-base font-sans text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
                Falar com o suporte
              </button>
            </div>
          </main>
        </div>
      )}

      {currentScreen === '2fa' && (
        <div className="bg-[#050507] min-h-screen flex items-center justify-center p-gutter select-none animate-in fade-in duration-300">
          
          {/* Back button */}
          <button 
            onClick={() => setCurrentScreen('mapa')}
            className="absolute top-md left-md flex items-center gap-xs bg-surface-container border border-[#424753] hover:border-primary transition-colors px-3 py-1.5 rounded-lg text-xs font-sans text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Ver Mapa de Telas
          </button>

          <main className="w-full max-w-[420px] flex flex-col gap-lg items-center">
            <header className="text-center">
              <h1 className="font-sans text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">
                Orby
              </h1>
            </header>

            <div className="w-full bg-[#131318] rounded-xl border border-[#24242D] p-lg flex flex-col gap-lg shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col gap-sm text-center items-center">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center mb-xs border border-secondary/20">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    shield_person
                  </span>
                </div>
                <h2 className="font-sans text-xl font-bold text-[#e0e3e5]">
                  Autenticação em Duas Etapas
                </h2>
                <p className="font-sans text-sm text-[#c2c6d5] px-sm">
                  Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
                </p>
              </div>

              <form 
                className="flex flex-col gap-lg mt-xs" 
                onSubmit={(e) => {
                  e.preventDefault();
                  setCurrentScreen('dashboard');
                }}
              >
                {/* Simulated multi box inputs */}
                <div className="flex justify-between gap-xs items-center" id="otp-inputs">
                  {/* Since standard individual box handlers can be tricky in dynamic React without individual states, we use a single clean styled numeric text input formatted beautifully, or 6 inputs */}
                  <input 
                    maxLength={6}
                    placeholder="123 456"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    required
                    autoFocus
                    className="w-full h-14 bg-surface-container-low border border-[#424753] rounded-lg text-center font-mono text-3xl text-primary tracking-[0.4em] focus:border-primary focus:outline-none transition-all input-glow placeholder:opacity-30 placeholder:tracking-[0.1em] px-2"
                  />
                </div>

                <div className="flex flex-col gap-sm">
                  <button 
                    className="w-full h-12 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-[0_0_15px_rgba(173,198,255,0.2)]" 
                    type="submit"
                  >
                    Verificar Código
                  </button>
                  <button 
                    type="button"
                    onClick={() => alert("Código de backup aceito! Redirecionando...")}
                    className="w-full h-10 rounded-lg bg-transparent border border-transparent text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider hover:text-[#e0e3e5] hover:bg-surface-container transition-colors active:scale-[0.98]" 
                  >
                    Usar código de backup
                  </button>
                </div>
              </form>
            </div>

            <footer>
              <p className="font-sans text-xs text-[#8c909f] flex items-center gap-1 justify-center uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                Conexão Segura
              </p>
            </footer>
          </main>
        </div>
      )}

      {currentScreen === 'recuperar' && (
        <div className="bg-[#050507] min-h-screen flex items-center justify-center relative overflow-hidden select-none animate-in fade-in duration-300">
          
          {/* Back button */}
          <button 
            onClick={() => setCurrentScreen('mapa')}
            className="absolute top-md left-md flex items-center gap-xs bg-surface-container border border-[#424753] hover:border-primary transition-colors px-3 py-1.5 rounded-lg text-xs font-sans text-on-surface-variant hover:text-primary animate-in"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Ver Mapa de Telas
          </button>

          <main className="w-full max-w-md mx-gutter z-10 relative">
            <div className="glass-card rounded-xl border border-[#424753] p-lg shadow-2xl relative overflow-hidden transition-all duration-500 ease-in-out" id="cardContainer">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              
              {/* Header / Brand */}
              <div className="text-center mb-lg relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container border border-surface-container-highest mb-sm">
                  <span className="material-symbols-outlined text-primary text-[24px]">vpn_key</span>
                </div>
                <h1 className="font-sans text-xl font-bold text-[#e0e3e5] mb-xs">Recuperar Senha</h1>
                <p className="font-sans text-sm text-[#c2c6d5]">
                  Digite o e-mail associado à sua conta Orby para receber as instruções de redefinição.
                </p>
              </div>

              {/* Form State */}
              <div className="relative z-10">
                <form 
                  className="flex flex-col gap-md"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const emailInputVal = (document.getElementById('rec-email') as HTMLInputElement)?.value || '';
                    alert(`Instruções enviadas com sucesso para: ${emailInputVal}!`);
                    setCurrentScreen('login');
                  }}
                >
                  {/* Email Input Group */}
                  <div className="flex flex-col gap-xs">
                    <label className="font-sans text-xs font-bold text-[#c2c6d5] uppercase tracking-wider" htmlFor="rec-email">E-mail Corporativo</label>
                    <div className="relative flex items-center input-glow bg-[#131318] border border-[#24242D] rounded-lg overflow-hidden transition-all duration-200">
                      <div className="pl-sm flex items-center justify-center text-[#8c909f]">
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                      </div>
                      <input 
                        className="w-full bg-transparent border-none text-on-surface font-sans text-sm focus:ring-0 placeholder-[#8c909f] py-2.5 px-sm focus:outline-none" 
                        id="rec-email" 
                        placeholder="nome@empresa.com" 
                        required 
                        type="email"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-sm mt-xs">
                    <button 
                      className="w-full py-3 px-md rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-xs hover:opacity-90 active:scale-[0.98] transition-all relative overflow-hidden group" 
                      type="submit"
                    >
                      <span className="relative z-10">Enviar Instruções</span>
                      <span className="material-symbols-outlined relative z-10 text-[18px]">arrow_forward</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCurrentScreen('login')}
                      className="w-full py-2 px-md rounded-lg bg-transparent text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-xs hover:text-on-surface transition-colors"
                    >
                      Voltar para o Login
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </main>
        </div>
      )}

      {currentScreen === 'expirada' && (
        <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-gutter relative overflow-hidden select-none animate-in fade-in duration-300">
          
          {/* Back switch */}
          <button 
            onClick={() => setCurrentScreen('mapa')}
            className="absolute top-md left-md flex items-center gap-xs bg-surface-container border border-[#424753] hover:border-primary transition-colors px-3 py-1.5 rounded-lg text-xs font-sans text-on-surface-variant hover:text-primary animate-in"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Ver Mapa de Telas
          </button>

          <main className="w-full max-w-md bg-[#131318] border border-[#24242D] rounded-xl p-xl flex flex-col items-center text-center relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="w-24 h-24 mb-lg relative flex items-center justify-center">
              <div className="absolute inset-0 bg-error/20 rounded-full blur-xl opacity-70"></div>
              <div className="bg-surface-container border border-[#24242D] w-16 h-16 rounded-full flex items-center justify-center relative z-10">
                <span className="material-symbols-outlined text-error text-[32px]">
                  timer_off
                </span>
              </div>
            </div>

            <h1 className="font-sans text-3xl font-bold text-[#e0e3e5] mb-sm">
              Sessão Expirada
            </h1>
            <p className="font-sans text-sm text-[#c2c6d5] mb-xl max-w-[280px]">
              Por motivos de segurança, você foi desconectado devido à inatividade.
            </p>

            <button 
              onClick={() => setCurrentScreen('login')}
              className="w-full h-12 bg-gradient-to-r from-primary-container to-secondary-container rounded flex items-center justify-center font-sans text-xs uppercase tracking-wider hover:opacity-90 transition-all font-bold text-white relative overflow-hidden group shadow-[0_0_15px_rgba(81,142,250,0.2)]"
            >
              Fazer Login Novamente
            </button>

            <div className="mt-lg">
              <span className="font-sans text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Orby
              </span>
            </div>
          </main>
        </div>
      )}

      {currentScreen === 'bloqueada' && (
        <div className="bg-surface-container-lowest text-on-surface font-body-md text-body-md min-h-screen flex items-center justify-center p-gutter relative overflow-hidden select-none animate-in fade-in duration-300">
          
          {/* Back button */}
          <button 
            onClick={() => setCurrentScreen('mapa')}
            className="absolute top-md left-md flex items-center gap-xs bg-surface-container border border-[#424753] hover:border-primary transition-colors px-3 py-1.5 rounded-lg text-xs font-sans text-on-surface-variant hover:text-primary animate-in"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Ver Mapa de Telas
          </button>

          <main className="w-full max-w-[440px] bg-[#101415] border border-surface-container-highest rounded-xl p-xl flex flex-col items-center text-center shadow-2xl relative z-10">
            <div className="w-20 h-20 rounded-full bg-error-container/20 border border-error-container flex items-center justify-center mb-lg relative">
              <div className="absolute inset-0 bg-error/10 rounded-full blur-md"></div>
              <span className="material-symbols-outlined text-error text-[40px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
            </div>

            <div className="mb-xl flex flex-col gap-xs">
              <h1 className="font-sans text-2xl font-bold text-[#e0e3e5]">Acesso Bloqueado</h1>
              <p className="font-sans text-sm text-[#c2c6d5] max-w-[320px]">
                Detectamos muitas tentativas de acesso incorretas. Por motivos de segurança, sua conta foi temporariamente protegida.
              </p>
            </div>

            {/* Countdown Timer Component */}
            <div className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg p-lg mb-xl relative overflow-hidden group">
              <p className="font-sans font-bold text-[10px] text-on-surface-variant uppercase tracking-wider mb-xs relative z-10">
                Tente novamente em
              </p>
              <div className="font-mono text-3xl font-bold text-primary relative z-10 flex items-center justify-center gap-xs">
                <span>{formatSeconds(blockedTime)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-sm">
              <button 
                onClick={() => alert("Central de suporte notificada! Um agente entrará em contato.")}
                className="w-full bg-transparent border border-outline-variant hover:border-primary hover:text-primary transition-all duration-300 rounded-lg py-2.5 px-md flex items-center justify-center gap-xs font-sans text-xs uppercase tracking-wider font-bold text-[#c2c6d5]" 
              >
                <span className="material-symbols-outlined text-[18px]">
                  support_agent
                </span>
                Falar com Suporte
              </button>
              <button 
                onClick={() => setCurrentScreen('login')}
                className="w-full bg-transparent py-2 px-md flex items-center justify-center font-sans text-xs uppercase tracking-wider font-bold text-[#8c909f] hover:text-[#e0e3e5] transition-colors duration-200" 
              >
                Voltar ao Início
              </button>
            </div>
          </main>
        </div>
      )}

      {/* ============================================================================
          MODALS & OVERLAYS
          ============================================================================ */}

      {/* 1. Modal Nova Tarefa */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#131318] border border-[#24242D] rounded-xl p-md flex flex-col gap-md">
            <div className="flex justify-between items-center pb-sm border-b border-[#24242D]">
              <h3 className="font-sans font-bold text-base text-[#e0e3e5] flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
                Nova Tarefa da Rotina
              </h3>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="text-[#8c909f] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-sm">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold font-sans text-[#c2c6d5] uppercase tracking-wider">Título da Tarefa</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Reunião Diária de Sincronização"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-surface-container border border-[#424753] text-[#e0e3e5] rounded-lg p-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold font-sans text-[#c2c6d5] uppercase tracking-wider">Horário</label>
                  <input 
                    type="time" 
                    required
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full bg-surface-container border border-[#424753] text-[#e0e3e5] rounded-lg p-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold font-sans text-[#c2c6d5] uppercase tracking-wider">Marcador / Subtítulo</label>
                  <input 
                    type="text" 
                    placeholder="Ex: GitHub, Equipe, Casa"
                    value={newTaskSubtitle}
                    onChange={(e) => setNewTaskSubtitle(e.target.value)}
                    className="w-full bg-surface-container border border-[#424753] text-[#e0e3e5] rounded-lg p-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-[#24242D] mt-md">
                <button 
                  type="button" 
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-sm py-1.5 bg-transparent border border-[#424753] text-[#e0e3e5] rounded-lg text-xs font-sans uppercase font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-sm py-1.5 bg-primary text-on-primary rounded-lg text-xs font-sans uppercase font-bold hover:brightness-110 shadow-lg"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Lançar Despesa */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#131318] border border-[#24242D] rounded-xl p-md flex flex-col gap-md">
            <div className="flex justify-between items-center pb-sm border-b border-[#24242D]">
              <h3 className="font-sans font-bold text-base text-[#e0e3e5] flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                Lançar Nova Despesa
              </h3>
              <button 
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-[#8c909f] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-sm">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold font-sans text-[#c2c6d5] uppercase tracking-wider">Descrição</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Assinatura Copilot, Almoço comercial"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-surface-container border border-[#424753] text-[#e0e3e5] rounded-lg p-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold font-sans text-[#c2c6d5] uppercase tracking-wider">Valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-surface-container border border-[#424753] text-[#e0e3e5] rounded-lg p-2 focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold font-sans text-[#c2c6d5] uppercase tracking-wider">Tipo de Despesa</label>
                <div className="grid grid-cols-2 gap-sm">
                  <button 
                    type="button"
                    onClick={() => setExpenseType('invoice')}
                    className={`p-2 rounded-lg border font-sans text-xs uppercase font-bold transition-all ${expenseType === 'invoice' ? 'bg-error/15 border-error text-error' : 'bg-surface-container border-[#424753] text-on-surface-variant'}`}
                  >
                    Adicionar à Fatura
                  </button>
                  <button 
                    type="button"
                    onClick={() => setExpenseType('sub_balance')}
                    className={`p-2 rounded-lg border font-sans text-xs uppercase font-bold transition-all ${expenseType === 'sub_balance' ? 'bg-primary/15 border-primary text-primary' : 'bg-surface-container border-[#424753] text-on-surface-variant'}`}
                  >
                    Subtrair do Saldo
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-[#24242D] mt-md">
                <button 
                  type="button" 
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-sm py-1.5 bg-transparent border border-[#424753] text-[#e0e3e5] rounded-lg text-xs font-sans uppercase font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-sm py-1.5 bg-primary text-on-primary rounded-lg text-xs font-sans uppercase font-bold hover:brightness-110 shadow-lg"
                >
                  Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Registrar Peso */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#131318] border border-[#24242D] rounded-xl p-md flex flex-col gap-md">
            <div className="flex justify-between items-center pb-sm border-b border-[#24242D]">
              <h3 className="font-sans font-bold text-base text-[#e0e3e5] flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">monitor_weight</span>
                Registrar Peso Diário
              </h3>
              <button 
                onClick={() => setIsWeightModalOpen(false)}
                className="text-[#8c909f] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddWeightSubmit} className="space-y-sm">
              <div className="flex flex-col gap-2 items-center py-sm">
                <p className="font-mono text-3xl font-bold text-primary">{weightValue} <span className="text-sm">kg</span></p>
                <p className="text-xs text-[#8c909f] font-sans">Meta de Definição: 78.0 kg</p>
                
                <input 
                  type="range" 
                  min="65" 
                  max="100" 
                  step="0.1" 
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary mt-sm"
                />
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-[#24242D] mt-md">
                <button 
                  type="button" 
                  onClick={() => setIsWeightModalOpen(false)}
                  className="px-sm py-1.5 bg-transparent border border-[#424753] text-[#e0e3e5] rounded-lg text-xs font-sans uppercase font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-sm py-1.5 bg-primary text-on-primary rounded-lg text-xs font-sans uppercase font-bold hover:brightness-110 shadow-lg"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Treino do Dia Ativo */}
      {isWorkoutModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[110] flex items-center justify-center p-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#131318] border border-[#24242D] rounded-xl p-md flex flex-col gap-md max-h-[90vh] overflow-hidden">
            
            <div className="flex justify-between items-start pb-sm border-b border-[#24242D]">
              <div>
                <h3 className="font-sans font-bold text-lg text-[#e0e3e5] flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[24px]">fitness_center</span>
                  Treino do Dia: Superior A
                </h3>
                <p className="text-xs text-[#8c909f] font-sans">Peito e Tríceps — Hipertrofia</p>
              </div>
              <div className="flex items-center gap-sm">
                <div className="bg-surface-container border border-[#24242D] px-2.5 py-1 rounded-lg flex items-center gap-xs text-xs font-mono text-primary">
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  <span>{formatSeconds(workoutTimer)}</span>
                </div>
                <button 
                  onClick={() => setIsWorkoutModalOpen(false)}
                  className="text-[#8c909f] hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Simulated interactive exercise controller */}
            <div className="flex-1 overflow-y-auto pr-xs space-y-sm py-xs">
              <div className="p-sm bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                <span className="font-sans text-xs text-[#e0e3e5] font-bold uppercase tracking-wider">Status do cronômetro de atividade</span>
                <button 
                  type="button"
                  onClick={() => setIsWorkoutActive(!isWorkoutActive)}
                  className={`px-3 py-1 rounded-lg text-xs font-sans uppercase font-bold border transition-all ${isWorkoutActive ? 'bg-error/15 border-error text-error' : 'bg-primary/20 border-primary text-primary'}`}
                >
                  {isWorkoutActive ? 'Pausar Atividade' : 'Retomar Atividade'}
                </button>
              </div>

              <div className="space-y-sm">
                {exercises.map((ex) => (
                  <div 
                    key={ex.id}
                    onClick={() => handleToggleExercise(ex.id)}
                    className="flex justify-between items-center p-sm bg-surface-container hover:bg-surface-container-high border border-[#24242D] rounded-xl cursor-pointer transition-all"
                  >
                    <div>
                      <p className={`font-sans font-bold text-sm ${ex.completed ? 'line-through text-on-surface-variant/60' : 'text-on-surface'}`}>{ex.name}</p>
                      <p className="font-sans text-xs text-[#8c909f]">{ex.sets}</p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-primary text-glow-primary">
                        {ex.completed ? 'Concluído' : 'Pendente'}
                      </span>
                      <div className="w-5 h-5 rounded-full border border-[#424753] flex items-center justify-center">
                        {ex.completed && <span className="material-symbols-outlined text-primary text-xs font-bold">check</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-sm border-t border-[#24242D] mt-md shrink-0">
              <span className="text-xs text-[#8c909f] font-sans font-bold uppercase tracking-wider">
                Progresso Geral: {completedExercisesCount} de {totalExercisesCount}
              </span>
              <button 
                onClick={() => {
                  setExercises(exercises.map(ex => ({ ...ex, completed: true })));
                  alert("Excelente treino, Lucas! Você completou o Superior A: Peito e Tríceps com maestria.");
                  setIsWorkoutActive(false);
                  setIsWorkoutModalOpen(false);
                }}
                className="px-sm py-2 bg-gradient-to-r from-primary to-secondary text-on-primary font-sans font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg hover:brightness-110"
              >
                Concluir Treino Completo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
