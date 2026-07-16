import { navigate } from '../../../app/router';
import { StatCard } from '../../../design-system';
import { formatCurrency } from '../../../lib/format';
import type { FinanceBootstrap } from '../../finance/contracts';
import { financeSummary } from '../../finance/selectors';

export function FinanceOverview({ data }: { data: FinanceBootstrap; trend: { month: string; value: number }[] }) {
  const summary = financeSummary(data);
  return (
    <section aria-labelledby="finance-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="finance-title" className="text-lg font-semibold">Finanças</h2>
        <button onClick={() => navigate('/financeiro')} className="text-sm font-medium text-primary hover:text-on-surface">Ver detalhes</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patrimônio líquido" value={formatCurrency(summary.netWorth)} note="Resumo consolidado" icon="account_balance" dot="primary" />
        <StatCard label="Saldo total" value={formatCurrency(summary.totalBalance)} note={`${summary.accountsCount} contas`} icon="savings" dot="positive" />
        <StatCard label="Fatura total" value={formatCurrency(summary.totalInvoice)} note={`${summary.cardsCount} cartões`} icon="credit_card" dot="warning" />
        <StatCard label="Crédito disponível" value={formatCurrency(summary.availableCredit)} note="Limite menos fatura" icon="credit_score" dot="positive" />
      </div>
    </section>
  );
}
