import { routineSummary } from "../routine/selectors"
import { Badge } from "../../design-system"
import { useApp } from "../../context/AppContext"
import { useBootstrap } from "../../app/BootstrapProvider"
import { OverviewHeader } from "./components/OverviewHeader"
import { FinanceOverview } from "./components/FinanceOverview"
import { RoutineOverview } from "./components/RoutineOverview"
import { TrainingOverview } from "./components/TrainingOverview"
import { VaultsOverview } from "./components/VaultsOverview"

/**
 * Tela Visão Geral (multi-módulo).
 *
 * Composição pura: os mocks ISOLADOS de cada módulo entram por props, sem
 * fetch. Para ligar ao backend real, basta trocar cada `*Mock` pela leitura de
 * `GET api/data.php?all=1` — o contrato já é espelhado em cada módulo.
 */
export function OverviewScreen() {
  const { data, error, loading, demo } = useBootstrap()
  const { setIsExpenseModalOpen, setIsTaskModalOpen } = useApp()
  const today = new Date()

  if (loading) return <main className="mx-auto max-w-[1440px] px-6 pt-28 text-on-surface-variant">Carregando sua visão geral…</main>
  if (error || !data) return <main className="mx-auto max-w-[1440px] px-6 pt-28"><h1 className="text-xl text-on-surface">Não foi possível carregar seus dados</h1><p className="mt-2 text-on-surface-variant">{error?.message}</p></main>
  const routine = routineSummary(data.tasks, data.checklist, today)

  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <OverviewHeader
        userName={data.profile.username}
        date={today}
        pendingTasks={routine.pending}
        onNewExpense={() => setIsExpenseModalOpen(true)}
        onNewTask={() => setIsTaskModalOpen(true)}
      />
      {demo && <div className="mb-4"><Badge tone="warning">Modo demonstração</Badge></div>}

      <div className="flex flex-col gap-8">
        <section id="finance" className="scroll-mt-24">
          <FinanceOverview data={data.finance} trend={data.trend} />
        </section>

        <section id="routine" aria-labelledby="modules-title" className="scroll-mt-24">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="modules-title"
              className="text-lg font-semibold text-on-surface"
            >
              Rotina e treino
            </h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <RoutineOverview tasks={data.tasks} checklist={data.checklist} date={today} />
            <span id="training" className="sr-only scroll-mt-24" />
            <TrainingOverview workout={data.workout} weights={data.weights} />
            <VaultsOverview vaults={data.finance.vaults} />
          </div>
        </section>
      </div>
    </main>
  )
}
