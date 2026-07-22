/** Mock ISOLADO da Rotina para o preview (view models de front-end).
 *  A âncora acompanha o calendário local para que "Hoje" e a Visão Geral
 *  nunca exibam uma data fixa ou divergente. */
import type { Priority, Task } from "./contracts"

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`

const TODAY = new Date()
const TODAY_YEAR = TODAY.getFullYear()
const TODAY_MONTH = TODAY.getMonth() + 1
const TODAY_DAY = TODAY.getDate()
export const TODAY_ISO = iso(TODAY_YEAR, TODAY_MONTH, TODAY_DAY)

/** Tarefas nomeadas de hoje (visão Dia rica). */
const todayTasks: Task[] = [
  { id: "t-1", date: TODAY_ISO, time: "07:00", title: "Meditação matinal", subtitle: "Bem-estar", completed: true, priority: "media", category: "Saúde", durationMin: 15 },
  { id: "t-2", date: TODAY_ISO, time: "08:30", title: "Treino de cardio", subtitle: "Corrida leve", completed: true, priority: "alta", category: "Saúde", durationMin: 45 },
  { id: "t-3", date: TODAY_ISO, time: "10:00", title: "Planejamento semanal", subtitle: "Metas do time", completed: true, priority: "alta", category: "Trabalho", durationMin: 60 },
  { id: "t-4", date: TODAY_ISO, time: "14:00", title: "Reunião de alinhamento", subtitle: "Videochamada", completed: false, priority: "media", category: "Trabalho", durationMin: 30 },
  { id: "t-5", date: TODAY_ISO, time: "16:30", title: "Revisão de código", subtitle: "Pull requests", completed: false, priority: "alta", category: "Trabalho", durationMin: 90 },
  { id: "t-6", date: TODAY_ISO, time: "18:00", title: "Comprar suplementos", subtitle: "Farmácia central", completed: false, priority: "baixa", category: "Pessoal", durationMin: 20 },
]

const POOL: { title: string; category: string; priority: Priority; time: string; durationMin: number }[] = [
  { title: "Estudo de inglês", category: "Estudo", priority: "media", time: "07:30", durationMin: 30 },
  { title: "Deep work", category: "Trabalho", priority: "alta", time: "09:00", durationMin: 120 },
  { title: "Almoço", category: "Pessoal", priority: "baixa", time: "12:00", durationMin: 60 },
  { title: "Treino de força", category: "Saúde", priority: "alta", time: "18:30", durationMin: 60 },
  { title: "Leitura", category: "Pessoal", priority: "baixa", time: "21:00", durationMin: 30 },
  { title: "Revisar finanças", category: "Pessoal", priority: "media", time: "20:00", durationMin: 20 },
]

/** Gera tarefas espalhadas por um mês (padrão determinístico p/ heatmap). */
function spread(year: number, month: number, days: number, past: boolean): Task[] {
  const normalized = new Date(year, month - 1, 1)
  year = normalized.getFullYear()
  month = normalized.getMonth() + 1
  const out: Task[] = []
  for (let d = 1; d <= days; d++) {
    if (iso(year, month, d) === TODAY_ISO) continue // hoje já tem tarefas nomeadas
    const n = (d * 7 + month * 3) % 4 // 0..3 tarefas
    for (let k = 0; k < n; k++) {
      const p = POOL[(d + k + month) % POOL.length]
      out.push({
        id: `g-${year}-${month}-${d}-${k}`,
        date: iso(year, month, d),
        time: p.time,
        title: p.title,
        subtitle: p.category,
        category: p.category,
        priority: p.priority,
        durationMin: p.durationMin,
        // dias passados majoritariamente concluídos; futuros em aberto
        completed: past || (year === TODAY_YEAR && month === TODAY_MONTH && d < TODAY_DAY && (d + k) % 3 !== 0),
      })
    }
  }
  return out
}

export const tasksMock: Task[] = [
  ...todayTasks,
  ...spread(TODAY_YEAR, TODAY_MONTH, new Date(TODAY_YEAR, TODAY_MONTH, 0).getDate(), false),
  ...spread(TODAY_YEAR, TODAY_MONTH - 1, new Date(TODAY_YEAR, TODAY_MONTH - 1, 0).getDate(), true),
  ...spread(TODAY_YEAR, TODAY_MONTH + 1, new Date(TODAY_YEAR, TODAY_MONTH + 1, 0).getDate(), false),
  ...spread(TODAY_YEAR, TODAY_MONTH - 2, new Date(TODAY_YEAR, TODAY_MONTH - 2, 0).getDate(), true),
]
