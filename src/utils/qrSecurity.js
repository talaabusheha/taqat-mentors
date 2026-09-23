/**
 * Dynamic QR Code Security Utility (Time-based One-Time Token)
 * Generates tokens that refresh every 2 minutes (120 seconds).
 */

export const TOKEN_WINDOW_SECONDS = 120

/**
 * Get current 2-minute window index
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
 * Validate incoming QR token against current & past windows (~10 minutes grace period + clock skew tolerance)
 */
export const validateQRToken = (sessionId, token) => {
  if (!token) return { valid: false, reason: 'MISSING' }
  
  const currentIdx = getCurrentWindowIndex()

  // Check past 5 windows (~10 mins) and 1 future window (clock skew tolerance)
  for (let offset = -1; offset <= 5; offset++) {
    if (token === encodeToken(sessionId, currentIdx - offset)) {
      return { valid: true }
    }
  }

  return { valid: false, reason: 'EXPIRED' }
}

/**
 * Calculate exact seconds remaining in the current 2-minute cycle
 */
export const getSecondsRemainingInCycle = () => {
  const nowInSec = Math.floor(Date.now() / 1000)
  const remainder = nowInSec % TOKEN_WINDOW_SECONDS
  return TOKEN_WINDOW_SECONDS - remainder
}

