import { ChefHat, ExternalLink } from "lucide-react"
import type { ReactNode } from "react"
import type { AssistantResponse } from "./contracts"
import type { AssistantModule } from "./store"
import { parseDietPlan } from "../nutrition/store"

interface ResultDetail { label: string; value: string }
export interface AssistantResultPresentation {
  details: ResultDetail[]
  destination: AssistantModule
  destinationLabel: string
}

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null

const text = (value: unknown): string | null => typeof value === "string" && value.trim() ? value.trim() : null
const number = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) ? value : null
const brl = (value: unknown): string | null => {
  const parsed = number(value)
  return parsed === null ? null : parsed.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
const date = (value: unknown): string | null => {
  const parsed = text(value)
  if (!parsed || !/^\d{4}-\d{2}-\d{2}$/.test(parsed)) return parsed
  const [year, month, day] = parsed.split("-")
  return `${day}/${month}/${year}`
}
const detail = (label: string, value: string | null): ResultDetail | null => value ? { label, value } : null
const compact = (values: Array<ResultDetail | null>): ResultDetail[] => values.filter((value): value is ResultDetail => value !== null)

export function assistantResultPresentation(response: AssistantResponse): AssistantResultPresentation | null {
  const data = record(response.data)
  if (!data || !response.action || !response.module || response.module === "query") return null

  switch (response.action) {
    case "add_expense":
      return { destination: "financeiro", destinationLabel: "Ver em Finanças", details: compact([
        detail("Valor", brl(data.value)), detail("Descrição", text(data.description)),
        detail("Categoria", text(data.category)), detail("Conta", text(data.account)), detail("Data", date(data.date)),
      ]) }
    case "add_income":
      return { destination: "financeiro", destinationLabel: "Ver em Finanças", details: compact([
        detail("Valor", brl(data.value)), detail("Tipo", text(data.type)), detail("Conta", text(data.account)), detail("Data", date(data.date)),
      ]) }
    case "add_transfer":
      return { destination: "financeiro", destinationLabel: "Ver em Finanças", details: compact([
        detail("Valor", brl(data.value)), detail("Origem", text(data.from)), detail("Destino", text(data.to)), detail("Data", date(data.date)),
      ]) }
    case "add_task": {
      const task = record(data.task)
      return task ? { destination: "agenda", destinationLabel: "Ver na Rotina", details: compact([
        detail("Tarefa", text(task.title)), detail("Data", date(task.date)), detail("Horário", text(task.time)),
      ]) } : null
    }
    case "create_workout": {
      const workout = record(data.workout)
      const exercises = Array.isArray(workout?.exercises) ? workout.exercises.length : null
      return workout ? { destination: "treinos", destinationLabel: "Ver em Treinos", details: compact([
        detail("Treino", text(workout.name)), detail("Foco", text(workout.focus)), detail("Exercícios", exercises === null ? null : String(exercises)),
      ]) } : null
    }
    case "create_workout_program": {
      const workouts = Array.isArray(data.workouts) ? data.workouts : []
      return { destination: "treinos", destinationLabel: "Ver programa", details: compact([
        detail("Fichas", String(workouts.length)), detail("Frequência", number(data.daysPerWeek) === null ? null : `${number(data.daysPerWeek)}x por semana`),
        detail("Local", text(data.location)),
      ]) }
    }
    case "log_measurement": {
      const measurement = record(data.measurement)
      const measured = number(measurement?.value)
      return measurement ? { destination: "treinos", destinationLabel: "Ver evolução", details: compact([
        detail("Medida", text(measurement.type)), detail("Valor", measured === null ? null : `${measured.toLocaleString("pt-BR")} ${text(measurement.unit) ?? ""}`.trim()),
        detail("Data", date(measurement.date)),
      ]) } : null
    }
    case "log_workout_session":
    case "log_cardio": {
      const session = record(data.session)
      const exercises = Array.isArray(session?.exercises) ? session.exercises.length : null
      return session ? { destination: "treinos", destinationLabel: "Ver sessão", details: compact([
        detail("Sessão", text(session.name)), detail("Data", date(session.date)), detail("Exercícios", exercises === null ? null : String(exercises)),
      ]) } : null
    }
    default:
      return null
  }
}

export function AssistantResultCard({ response, onView }: { response: AssistantResponse; onView: (module: AssistantModule) => void }) {
  if (response.action === "create_diet_plan") {
    const data = record(response.data)
    const plan = parseDietPlan(data?.plan)
    if (!plan) return null
    const mealCount = plan.days.reduce((total, day) => total + day.meals.length, 0)
    return (
      <div className="mt-3 border-t border-outline-variant pt-3">
        <div className="grid grid-cols-3 gap-3" aria-label="Resumo do plano alimentar">
          <div><p className="numeric-value font-semibold text-on-surface">{plan.periodDays}</p><p className="text-[10px] text-muted">dias</p></div>
          <div><p className="numeric-value font-semibold text-on-surface">{mealCount}</p><p className="text-[10px] text-muted">refeições</p></div>
          <div><p className="numeric-value font-semibold text-on-surface">{brl(plan.estimatedCostBRL)}</p><p className="text-[10px] text-muted">custo estimado</p></div>
        </div>
        <ResultButton icon={<ChefHat className="size-4" />} label="Ver cardápio completo" onClick={() => onView("alimentacao")} />
      </div>
    )
  }

  const presentation = assistantResultPresentation(response)
  if (!presentation || presentation.details.length === 0) return null
  return (
    <div className="mt-3 border-t border-outline-variant pt-3">
      <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {presentation.details.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-[10px] text-muted">{item.label}</dt>
            <dd className="truncate text-xs font-semibold text-on-surface">{item.value}</dd>
          </div>
        ))}
      </dl>
      {response.status !== "confirmation" ? <ResultButton icon={<ExternalLink className="size-4" />} label={presentation.destinationLabel} onClick={() => onView(presentation.destination)} /> : null}
    </div>
  )
}

function ResultButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{icon}{label}</button>
}
