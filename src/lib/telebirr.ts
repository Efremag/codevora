import crypto from 'crypto'

const BASE_URL = process.env.TELEBIRR_BASE_URL
  || 'https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway'

function createTimestamp(): string {
  return Date.now().toString()
}

function createNonceStr(): string {
  return crypto.randomBytes(16).toString('hex')
}

function signObject(obj: Record<string, unknown>): string {
  const rawKey = process.env.TELEBIRR_PRIVATE_KEY!
  const pem = rawKey.includes('BEGIN')
    ? rawKey
    : `-----BEGIN RSA PRIVATE KEY-----\n${rawKey.replace(/(.{64})/g, '$1\n')}\n-----END RSA PRIVATE KEY-----`

  // Sort keys alphabetically, exclude sign / sign_type / empty values
  const entries = Object.entries(obj)
    .filter(([k, v]) => k !== 'sign' && k !== 'sign_type' && v !== '' && v != null)
    .sort(([a], [b]) => a.localeCompare(b))

  const str = entries
    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join('&')

  const signer = crypto.createSign('SHA256')
  signer.update(str, 'utf8')
  return signer.sign(pem, 'base64')
}

// Step 1 — get fabric token
async function applyFabricToken(): Promise<string> {
  const fabricAppId = process.env.TELEBIRR_APP_KEY!
  const appSecret   = process.env.TELEBIRR_APP_SECRET!

  const res  = await fetch(`${BASE_URL}/payment/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-APP-Key': fabricAppId },
    body: JSON.stringify({ appSecret }),
  })
  const data = await res.json()
  console.log('FabricToken:', JSON.stringify(data))
  if (!data.token) throw new Error(`FabricToken failed: ${data.msg ?? JSON.stringify(data)}`)
  return data.token as string
}

// Step 3 — create pre-order, return rawRequest string for the SuperApp bridge
async function createPreOrder(
  fabricToken: string,
  params: { outTradeNo: string; title: string; amount: string; notifyUrl: string }
): Promise<string> {
  const merchantAppId = process.env.TELEBIRR_APP_ID!
  const merchantCode  = process.env.TELEBIRR_SHORT_CODE!
  const fabricAppId   = process.env.TELEBIRR_APP_KEY!

  const req: Record<string, unknown> = {
    timestamp: createTimestamp(),
    nonce_str: createNonceStr(),
    method:    'payment.preorder',
    version:   '1.0',
    biz_content: {
      notify_url:            params.notifyUrl,
      trade_type:            'InApp',
      appid:                 merchantAppId,
      merch_code:            merchantCode,
      merch_order_id:        params.outTradeNo,
      title:                 params.title,
      total_amount:          params.amount,
      trans_currency:        'ETB',
      timeout_express:       '120m',
      business_type:         'BuyGoods',
      payee_identifier:      merchantCode,
      payee_identifier_type: '04',
      payee_type:            '5000',
    },
  }
  req.sign      = signObject(req)
  req.sign_type = 'SHA256WithRSA'

  const res  = await fetch(`${BASE_URL}/payment/v1/merchant/preOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-APP-Key':    fabricAppId,
      Authorization:  fabricToken,
    },
    body: JSON.stringify(req),
  })
  const data = await res.json()
  console.log('PreOrder:', JSON.stringify(data))
  if (!data.biz_content?.prepay_id)
    throw new Error(`PreOrder failed: ${data.msg ?? JSON.stringify(data)}`)

  // Build the rawRequest string the SuperApp bridge expects (Step 4)
  const map: Record<string, string> = {
    appid:      merchantAppId,
    merch_code: merchantCode,
    nonce_str:  createNonceStr(),
    prepay_id:  data.biz_content.prepay_id as string,
    timestamp:  createTimestamp(),
  }
  const sign = signObject(map)

  return [
    `appid=${map.appid}`,
    `merch_code=${map.merch_code}`,
    `nonce_str=${map.nonce_str}`,
    `prepay_id=${map.prepay_id}`,
    `timestamp=${map.timestamp}`,
    `sign=${sign}`,
    `sign_type=SHA256WithRSA`,
  ].join('&')
}

export interface TelebirrPaymentParams {
  outTradeNo: string
  amount: string
  title: string
  notifyUrl: string
}

export async function initiateTelebirrPayment(params: TelebirrPaymentParams): Promise<{ rawRequest: string }> {
  if (!process.env.TELEBIRR_APP_ID)      throw new Error('TELEBIRR_APP_ID is not set')
  if (!process.env.TELEBIRR_APP_KEY)     throw new Error('TELEBIRR_APP_KEY (Fabric App ID) is not set')
  if (!process.env.TELEBIRR_APP_SECRET)  throw new Error('TELEBIRR_APP_SECRET is not set')
  if (!process.env.TELEBIRR_SHORT_CODE)  throw new Error('TELEBIRR_SHORT_CODE is not set')
  if (!process.env.TELEBIRR_PRIVATE_KEY) throw new Error('TELEBIRR_PRIVATE_KEY is not set')

  const fabricToken = await applyFabricToken()
  const rawRequest  = await createPreOrder(fabricToken, params)
  return { rawRequest }
}
