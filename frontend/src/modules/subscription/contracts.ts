export interface SubscriptionState {
  plan: "free" | "individual"
  status: string
  current_period_end: string | null
  in_trial: boolean
  trial_ends_at: string | null
  trial_days_left: number
  access: boolean
  price_cents: number
}

export type PaymentMethod = "pix" | "card"
export type PaymentStatus = "pending" | "paid" | "expired" | "cancelled"

export interface SubscriptionPayment {
  provider: "mercadopago"
  method: PaymentMethod
  external_id: string
  status: PaymentStatus
  provider_status: string | null
  checkout_url: string
  expires_at: string | null
  amount_cents: number
  plan: "individual"
  recurring: true
}
