import jwt from 'jsonwebtoken'

const ACCESS_EXPIRY = '15m'
const REFRESH_EXPIRY = '7d'

export function signAccessToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_EXPIRY })
}

export function signRefreshToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_EXPIRY })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!)
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!)
}
