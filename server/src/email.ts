import type { Config } from './config.js'

/** Sends an invite if Resend is configured. Invitation creation never depends on email delivery. */
export async function sendInvitationEmail(config: Config, recipient: string, code: string, expiresAt: string): Promise<boolean> {
  if (!config.RESEND_API_KEY || !config.RESEND_FROM) return false
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: config.RESEND_FROM, to: [recipient], subject: 'Your Open Grocery List invitation', text: `You have been invited to Open Grocery List.\n\nInvitation code: ${code}\n\nThis code expires ${expiresAt}. Open the iOS app, enter this code, and sign in with Apple.\n` })
  })
  if (!response.ok) { console.warn(`Resend invitation delivery failed with HTTP ${response.status}`); return false }
  return true
}
