import type { FinanceBootstrap } from '../modules/finance/contracts';
import { apiRequest } from './api-client';
import { getCsrfToken } from './csrf';

export type FinanceSetKey = 'expense_lines_v4' | 'income_lines' | 'ifood-entries' | 'accounts_v2';

export function financeFromBootstrap(data: Record<string, unknown>): FinanceBootstrap {
  return {
    accounts_v2: Array.isArray(data.accounts_v2) ? data.accounts_v2 as FinanceBootstrap['accounts_v2'] : [],
    expense_lines_v4: Array.isArray(data.expense_lines_v4) ? data.expense_lines_v4 as FinanceBootstrap['expense_lines_v4'] : [],
    income_lines: Array.isArray(data.income_lines) ? data.income_lines as FinanceBootstrap['income_lines'] : [],
    'ifood-entries': Array.isArray(data['ifood-entries']) ? data['ifood-entries'] as FinanceBootstrap['ifood-entries'] : [],
    vaults: Array.isArray(data.vaults) ? data.vaults as FinanceBootstrap['vaults'] : [],
    transfers: Array.isArray(data.transfers) ? data.transfers as FinanceBootstrap['transfers'] : [],
    acc_view: data.acc_view === 'banco' ? 'banco' : 'conta',
    bank_favorites: Array.isArray(data.bank_favorites) ? data.bank_favorites as string[] : [],
  };
}

export const saveFinanceSet = (key: FinanceSetKey, value: unknown[]) => apiRequest<{ ok: true }>('/api/finance.php', { method: 'POST', csrf: getCsrfToken(), body: { key, value } });

export interface OfxRow { date: string; value: number; kind: string; desc: string; fitid: string; dup: boolean }
export const previewOfx = (file: File) => {
  const body = new FormData();
  body.append('file', file);
  return apiRequest<{ ok: true; rows: OfxRow[] }>('/api/import-ofx.php', { method: 'POST', csrf: getCsrfToken(), body });
};
