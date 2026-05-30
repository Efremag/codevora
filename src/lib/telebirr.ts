import crypto from 'crypto'

interface PaymentParams {
  outTradeNo: string
  totalAmount: string
  subject: string
  notifyUrl: string
  returnUrl: string
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}

function computeSign(params: Record<string, string>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort()
  const paramStr = sortedKeys.map(k => `${k}=${params[k]}`).join('&')
  return crypto
    .createHash('md5')
    .update(`${paramStr}&appSecret=${appSecret}`, 'utf8')
    .digest('hex')
    .toUpperCase()
}

function rsaEncrypt(data: string, rawPublicKey: string): string {
  const pem = rawPublicKey.includes('BEGIN PUBLIC KEY')
    ? rawPublicKey
    : `-----BEGIN PUBLIC KEY-----\n${rawPublicKey.replace(/(.{64})/g, '$1\n')}\n-----END PUBLIC KEY-----`
  const encrypted = crypto.publicEncrypt(
    { key: pem, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(data, 'utf-8')
  )
  return encrypted.toString('base64')
}

export async function initiateTelebirrPayment(params: PaymentParams) {
  const appId      = process.env.TELEBIRR_APP_ID!
  const shortCode  = process.env.TELEBIRR_SHORT_CODE!
  const appSecret  = process.env.TELEBIRR_APP_SECRET!
  const publicKey  = process.env.TELEBIRR_PUBLIC_KEY!
  const apiUrl     = process.env.TELEBIRR_API_URL || 'https://app.ethiotelecom.et/payment/v2/webpay'

  const nonce     = generateNonce()
  const timestamp = Date.now().toString()

  const payload: Record<string, string> = {
    appId,
    shortCode,
    outTradeNo:    params.outTradeNo,
    subject:       params.subject,
    totalAmount:   params.totalAmount,
    timeoutExpress: '30m',
    notifyUrl:     params.notifyUrl,
    returnUrl:     params.returnUrl,
    receiveName:   'Codevora',
    nonce,
    timestamp,
  }

  const sign = computeSign(payload, appSecret)
  const ussd = rsaEncrypt(JSON.stringify(payload), publicKey)

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appid: appId, sign, ussd }),
  })

  if (!res.ok) throw new Error(`Telebirr API returned ${res.status}`)

  const result = await res.json()

  if (result.code === '0' && result.data?.toPayUrl) {
    return { toPayUrl: result.data.toPayUrl as string }
  }

  throw new Error(result.msg || 'Payment initiation failed')
}
