import { useEffect, useState } from "react"

/**
 * Marcas coloridas em PNG local. Os arquivos foram derivados do projeto MIT
 * `@edusites/bancos-brasil`; veja public/bank-icons/ATTRIBUTION.md.
 */

export function normalizeBankSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

const BANK_ALIASES: Record<string, string[]> = {
  agibank: ["agibank"], asaas: ["asaas"], avenue: ["avenue"],
  bancodobrasil: ["bancodobrasil", "bb", "bancodobrasilsa"],
  bmg: ["bmg", "bancobmg"], bradesco: ["bradesco", "bancobradesco"],
  bs2: ["bs2", "bancobs2"], btg: ["btg", "btgpactual", "bancobtgpactual"],
  bv: ["bv", "bancovotorantim"], c6: ["c6", "c6bank", "bancoc6"],
  caixa: ["caixa", "caixaeconomica", "caixaeconomicafederal", "cef"],
  cora: ["cora"], digio: ["digio"], efibank: ["efibank", "gerencianet"],
  infinitepay: ["infinitepay"], inter: ["inter", "bancointer"],
  itau: ["itau", "itauunibanco"], iugu: ["iugu"],
  mercadopago: ["mercadopago", "mercadolivre", "mercadolibre"],
  mercantil: ["mercantil", "bancomercantil"], neon: ["neon", "banconeon"],
  next: ["next", "banconext"], ngcash: ["ngcash"], nomad: ["nomad"],
  nubank: ["nubank", "nu", "nupagamentos"], original: ["original", "bancooriginal"],
  pagbank: ["pagbank", "pagseguro"], pan: ["pan", "bancopan"], paypal: ["paypal"],
  picpay: ["picpay"], revolut: ["revolut"], rico: ["rico", "ricoinvestimentos"],
  safra: ["safra", "bancosafra"], santander: ["santander", "bancosantander"],
  sicoob: ["sicoob"], sicredi: ["sicredi"], stone: ["stone"], stripe: ["stripe"],
  ton: ["ton"], wise: ["wise"], xp: ["xp", "xpinvestimentos"],
}

export const POPULAR_BANKS: { slug: string; name: string }[] = [
  ["nubank", "Nubank"], ["inter", "Inter"], ["c6", "C6 Bank"], ["itau", "Itaú"],
  ["bradesco", "Bradesco"], ["santander", "Santander"], ["bancodobrasil", "Banco do Brasil"],
  ["caixa", "Caixa"], ["btg", "BTG Pactual"], ["bv", "Banco BV"], ["safra", "Safra"],
  ["mercantil", "Banco Mercantil"], ["bmg", "Banco BMG"], ["pan", "Banco PAN"],
  ["sicoob", "Sicoob"], ["sicredi", "Sicredi"], ["original", "Banco Original"],
  ["neon", "Neon"], ["next", "Next"], ["digio", "Digio"], ["bs2", "BS2"],
  ["agibank", "Agibank"], ["cora", "Cora"], ["asaas", "Asaas"], ["efibank", "Efí Bank"],
  ["picpay", "PicPay"], ["mercadopago", "Mercado Pago"], ["pagbank", "PagBank"],
  ["infinitepay", "InfinitePay"], ["stone", "Stone"], ["ton", "Ton"], ["iugu", "Iugu"],
  ["ngcash", "NG.CASH"], ["xp", "XP Investimentos"], ["rico", "Rico"],
  ["avenue", "Avenue"], ["nomad", "Nomad"], ["wise", "Wise"], ["revolut", "Revolut"],
  ["paypal", "PayPal"], ["stripe", "Stripe"],
].map(([slug, name]) => ({ slug, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))

/** Compatibilidade com formulários antigos. Prefira POPULAR_BANKS. */
export const BANKS = POPULAR_BANKS

export function resolveBankSlug(bank: string | null | undefined): string | null {
  if (!bank) return null
  const value = normalizeBankSearch(bank)
  for (const [slug, aliases] of Object.entries(BANK_ALIASES)) {
    if (aliases.some((alias) => alias.length <= 3 ? value === alias : value.includes(alias) || alias.includes(value))) return slug
  }
  return null
}

function initials(bank: string): string {
  const words = bank.trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "") || bank.slice(0, 2)).toUpperCase()
}

interface BankLogoProps {
  bank: string | null | undefined
  size?: number
  className?: string
}

export function BankLogo({ bank, size = 36, className }: BankLogoProps) {
  const slug = resolveBankSlug(bank)
  const src = slug ? `/bank-icons/${slug}.png` : null
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const box = { width: size, height: size } as const

  if (src && slug && !failed) {
    return (
      <span
        role="img"
        aria-label={bank ? `Logo ${bank}` : "Logo do banco"}
        data-bank-logo={slug}
        data-bank-logo-kind="brand-raster"
        className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container ${className ?? ""}`}
        style={box}
      >
        <img
          alt=""
          aria-hidden="true"
          src={src}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="block size-full object-cover"
          onError={() => setFailed(true)}
        />
      </span>
    )
  }

  return (
    <span
      role="img"
      aria-label={bank ? `Identificação de ${bank}` : "Identificação do banco"}
      data-bank-logo="fallback-initials"
      data-bank-logo-kind="initials"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high font-sans text-xs font-bold tracking-tight text-primary ${className ?? ""}`}
      style={box}
    >
      <span aria-hidden="true">{bank ? initials(bank) : "BK"}</span>
    </span>
  )
}
