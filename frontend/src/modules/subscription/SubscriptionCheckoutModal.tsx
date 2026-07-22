import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"
import { Icon } from "../../design-system"
import { formatCurrency } from "../../lib/format"
import type { PaymentMethod, SubscriptionPayment } from "./contracts"

interface SubscriptionCheckoutModalProps {
  open: boolean
  payment: SubscriptionPayment | null
  busy: boolean
  error: string | null
  onStart: (method: PaymentMethod) => Promise<void>
  onClose: () => void
}

export function SubscriptionCheckoutModal({
  open,
  payment,
  busy,
  error,
  onStart,
  onClose,
}: SubscriptionCheckoutModalProps) {
  const pending = payment?.status === "pending"
  const terminal = payment?.status === "expired" || payment?.status === "cancelled"

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Assinar o Level OS"
      description="Escolha o meio de pagamento. A etapa financeira acontece no ambiente seguro do Mercado Pago."
      icon="workspace_premium"
      maxWidth="max-w-lg"
    >
      {busy ? (
        <div className="grid min-h-64 place-items-center" aria-busy="true">
          <div className="text-center">
            <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary motion-reduce:animate-none" />
            <p className="mt-3 text-sm text-muted">Preparando o checkout seguro…</p>
          </div>
        </div>
      ) : payment?.status === "paid" ? (
        <div className="space-y-5 text-center">
          <div className="border-y border-tertiary/35 py-8">
            <Icon name="verified" className="text-4xl text-tertiary" />
            <p className="mt-3 text-lg font-semibold text-on-surface">Pagamento confirmado</p>
            <p className="mt-1 text-sm text-muted">O plano Individual já está ativo.</p>
          </div>
          <Button className="w-full" onClick={onClose}>Concluir</Button>
        </div>
      ) : pending ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3 border-y border-outline-variant py-4">
            <div>
              <p className="text-xs text-muted">Plano Individual · mensal</p>
              <p className="numeric-value mt-1 text-xl font-semibold text-on-surface">
                {formatCurrency(payment.amount_cents / 100)}
              </p>
            </div>
            <span className="rounded-md bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
              Aguardando pagamento
            </span>
          </div>

          <div className="flex gap-3 border-b border-outline-variant pb-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name={payment.method === "pix" ? "account_balance" : "credit_card"} className="text-[21px]" />
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">
                Preferência: {payment.method === "pix" ? "Pix" : "cartão"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Você confirma o meio disponível e a recorrência na página do Mercado Pago. O Level OS não recebe cartão ou CVV.
              </p>
            </div>
          </div>

          {payment.checkout_url ? (
            <a
              href={payment.checkout_url}
              className="level-button level-button--primary flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              Continuar no Mercado Pago
              <Icon name="open_in_new" className="text-[18px]" />
            </a>
          ) : (
            <p role="alert" className="text-sm text-error">O link do checkout não está disponível. Tente criar uma nova cobrança.</p>
          )}
          <p role="status" className="text-center text-xs leading-5 text-muted">
            O retorno do checkout não libera acesso sozinho. Esta janela consulta a confirmação do servidor a cada 5 segundos.
          </p>
          {error ? <p role="alert" className="text-sm text-error">{error}</p> : null}
          <Button variant="ghost" className="w-full" onClick={onClose}>Fechar e pagar depois</Button>
        </div>
      ) : (
        <div className="space-y-5">
          {terminal ? (
            <p role="status" className="border-y border-warning/30 py-3 text-sm text-warning">
              A cobrança anterior foi encerrada. Escolha um meio para gerar um novo checkout.
            </p>
          ) : null}
          <div>
            <p className="text-sm font-semibold text-on-surface">Como você prefere assinar?</p>
            <p className="mt-1 text-xs leading-5 text-muted">O plano é mensal e único. O Mercado Pago apresenta a autorização e as condições antes da confirmação.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentMethodButton
              icon="account_balance"
              title="Pix"
              description="Abra o checkout e confirme o Pix no Mercado Pago."
              onClick={() => { void onStart("pix").catch(() => undefined) }}
            />
            <PaymentMethodButton
              icon="credit_card"
              title="Cartão"
              description="Cartão e CVV ficam somente com o Mercado Pago."
              onClick={() => { void onStart("card").catch(() => undefined) }}
            />
          </div>
          <div className="flex items-start gap-2 border-t border-outline-variant pt-4 text-xs leading-5 text-muted">
            <Icon name="shield_lock" className="mt-0.5 shrink-0 text-[17px] text-primary" />
            O plano só é ativado depois que o webhook validado confirma um pagamento aprovado.
          </div>
          {error ? <p role="alert" className="text-sm text-error">{error}</p> : null}
        </div>
      )}
    </Modal>
  )
}

function PaymentMethodButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-28 rounded-lg border border-outline-variant p-4 text-left transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-on-surface">
        <Icon name={icon} className="text-[20px] text-primary" />
        {title}
      </span>
      <span className="mt-2 block text-xs leading-5 text-muted">{description}</span>
    </button>
  )
}
