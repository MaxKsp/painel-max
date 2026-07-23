import { describe, expect, it } from "vitest"
import { accountTypeSuffix, suggestAccountLabel, updateAccountIdentity } from "../modules/finance/accountLabel"

describe("suggestAccountLabel", () => {
  it.each([
    ["conta", "Caixa - CC"],
    ["poupanca", "Caixa - Poupança"],
    ["pagamento", "Caixa - Pagamento"],
    ["carteira", "Caixa - Carteira"],
    ["cartao", "Caixa - Cartão"],
  ])("combina o banco com o tipo %s", (type, expected) => {
    expect(suggestAccountLabel("Caixa", type)).toBe(expected)
  })

  it("não cria rótulo sem banco", () => {
    expect(suggestAccountLabel("", "conta")).toBe("")
  })

  it("mantém tipos futuros legíveis", () => {
    expect(accountTypeSuffix("investimento")).toBe("Investimento")
  })

  it("atualiza o nome automático ao trocar banco ou tipo", () => {
    const account = { bank: "Nubank", tipo: "conta", label: "Nubank - CC" }
    expect(updateAccountIdentity(account, { bank: "Caixa", tipo: "poupanca" }, true).label).toBe("Caixa - Poupança")
  })

  it("preserva um nome personalizado", () => {
    const account = { bank: "Nubank", tipo: "conta", label: "Reserva da família" }
    expect(updateAccountIdentity(account, { bank: "Caixa", tipo: "poupanca" }, false).label).toBe("Reserva da família")
  })
})
