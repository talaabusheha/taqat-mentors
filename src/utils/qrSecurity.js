/**
 * Dynamic QR Code Security Utility (Time-based One-Time Token)
 * Generates tokens that refresh every 10 seconds.
 */

const TOKEN_WINDOW_SECONDS = 10

/**
 * Get current 10-second window index
 */
const getCurrentWindowIndex = () => {
  return Math.floor(Date.now() / (TOKEN_WINDOW_SECONDS * 1000))
}

/**
 * Simple hash encoding for time-window token
 */
const encodeToken = (sessionId, windowIndex) => {
  const raw = `TAQAT-${sessionId}-${windowIndex}-SECURE`
  try {
    return btoa(raw).replace(/=/g, '').slice(-12)
  } catch (e) {
    return `${windowIndex}`
  }
}

/**
 * Generate the active QR token for a session
 */
export const getCurrentQRToken = (sessionId) => {
  if (!sessionId) return ''
  const windowIdx = getCurrentWindowIndex()
  return encodeToken(sessionId, windowIdx)
}

/**
 * Validate incoming QR token against current & immediately previous window (grace period ~15-20s)
 */
export const validateQRToken = (sessionId, token) => {
  if (!token) return { valid: false, reason: 'MISSING' }
  
  const currentIdx = getCurrentWindowIndex()
  const currentToken = encodeToken(sessionId, currentIdx)
  const previousToken = encodeToken(sessionId, currentIdx - 1)

  if (token === currentToken || token === previousToken) {
    return { valid: true }
  }

  return { valid: false, reason: 'EXPIRED' }
}

/**
 * Calculate exact seconds remaining in the current 10-second cycle
 */
export const getSecondsRemainingInCycle = () => {
  const nowInSec = Math.floor(Date.now() / 1000)
  const remainder = nowInSec % TOKEN_WINDOW_SECONDS
  return TOKEN_WINDOW_SECONDS - remainder
}
