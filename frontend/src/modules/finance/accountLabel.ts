const ACCOUNT_TYPE_SUFFIX: Record<string, string> = {
  conta: "CC",
  poupanca: "Poupança",
  pagamento: "Pagamento",
  carteira: "Carteira",
  cartao: "Cartão",
}

export function accountTypeSuffix(type: string): string {
  const clean = type.trim()
  if (!clean) return "Conta"
  return ACCOUNT_TYPE_SUFFIX[clean] ?? clean.charAt(0).toLocaleUpperCase("pt-BR") + clean.slice(1)
}

export function suggestAccountLabel(bank: string | null | undefined, type: string): string {
  const cleanBank = bank?.trim()
  if (!cleanBank) return ""
  return `${cleanBank} - ${accountTypeSuffix(type)}`
}

export function updateAccountIdentity<T extends { bank: string | null; tipo: string; label: string }>(
  account: T,
  patch: Partial<Pick<T, "bank" | "tipo">>,
  autoLabel: boolean,
): T {
  const next = { ...account, ...patch }
  return autoLabel ? { ...next, label: suggestAccountLabel(next.bank, next.tipo) } : next
}
