const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_BASE_URL =
  process.env.PAYPAL_SANDBOX !== 'false'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`)
  return data.access_token as string
}

export async function createPayPalOrder(params: {
  amount: number
  txRef: string
  returnUrl: string
  cancelUrl: string
}): Promise<{ orderId: string; approveUrl: string }> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) throw new Error('PayPal credentials not configured')
  const token = await getAccessToken()
  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': params.txRef,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.txRef,
          amount: { currency_code: 'USD', value: params.amount.toFixed(2) },
          description: 'Codevora Pro Plan',
        },
      ],
      application_context: {
        brand_name: 'Codevora',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  })
  const data = await res.json()
  if (data.status !== 'CREATED') throw new Error(`PayPal order failed: ${JSON.stringify(data)}`)
  const approveLink = (data.links as Array<{ rel: string; href: string }>).find((l) => l.rel === 'approve')
  if (!approveLink) throw new Error('PayPal approve link not found')
  return { orderId: data.id as string, approveUrl: approveLink.href }
}

export async function capturePayPalOrder(orderId: string): Promise<{ success: boolean }> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) throw new Error('PayPal credentials not configured')
  const token = await getAccessToken()
  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await res.json()
  return { success: data.status === 'COMPLETED' }
}
