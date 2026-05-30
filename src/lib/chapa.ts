const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY!
const CHAPA_BASE_URL = 'https://api.chapa.co/v1'

export interface ChapaInitParams {
  amount: number
  email: string
  firstName: string
  lastName: string
  txRef: string
  callbackUrl: string
  returnUrl: string
  title: string
}

export async function initializeChapaPayment(params: ChapaInitParams): Promise<{ checkoutUrl: string }> {
  if (!CHAPA_SECRET_KEY) throw new Error('CHAPA_SECRET_KEY is not set')

  const res = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount: params.amount.toFixed(2),
      currency: 'ETB',
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      tx_ref: params.txRef,
      callback_url: params.callbackUrl,
      return_url: params.returnUrl,
      customization: { title: params.title },
    }),
  })

  const data = await res.json()
  if (data.status !== 'success' || !data.data?.checkout_url) {
    throw new Error(`Chapa init failed: ${data.message ?? JSON.stringify(data)}`)
  }

  return { checkoutUrl: data.data.checkout_url as string }
}

export async function verifyChapaPayment(txRef: string): Promise<{ success: boolean }> {
  if (!CHAPA_SECRET_KEY) throw new Error('CHAPA_SECRET_KEY is not set')

  const res = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${encodeURIComponent(txRef)}`, {
    headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` },
  })

  const data = await res.json()
  return { success: data.status === 'success' && data.data?.status === 'success' }
}
