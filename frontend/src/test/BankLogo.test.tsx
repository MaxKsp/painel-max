import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { BankLogo } from "../components/ui/BankLogo"

describe("BankLogo", () => {
  it("renderiza uma marca oficial como imagem raster", () => {
    render(<BankLogo bank="Nubank" />)
    const logo = screen.getByRole("img", { name: "Logo Nubank" })
    expect(logo).toHaveAttribute("data-bank-logo-kind", "brand-raster")
    expect(logo.querySelector("img")).toHaveAttribute("src", "/bank-icons/nubank.png")
    expect(logo.querySelector("svg")).toBeNull()
  })

  it("renderiza iniciais sem SVG para qualquer instituição", () => {
    render(<BankLogo bank="Banco Comunitário Exemplo" />)
    const logo = screen.getByRole("img", { name: "Identificação de Banco Comunitário Exemplo" })
    expect(logo).toHaveAttribute("data-bank-logo-kind", "initials")
    expect(logo).toHaveTextContent("BC")
    expect(logo.querySelector("svg")).toBeNull()
  })
})
