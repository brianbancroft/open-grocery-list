import { createHash, randomBytes } from 'node:crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const appleKeys = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
export const newOpaqueToken = () => randomBytes(32).toString('base64url')
export async function verifyAppleIdentityToken(token: string, bundleId: string) {
  const { payload } = await jwtVerify(token, appleKeys, { issuer: 'https://appleid.apple.com', audience: bundleId })
  if (typeof payload.sub !== 'string') throw new Error('Apple token has no subject')
  return { sub: payload.sub, email: typeof payload.email === 'string' ? payload.email : undefined }
}
