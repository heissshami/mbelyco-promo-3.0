import crypto from "crypto"

// Default alphanumeric generator used by v3
export function generateCode(prefix: string, length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = crypto.randomBytes(length)
  let text = ""
  for (let i = 0; i < length; i++) {
    text += alphabet[bytes[i] % alphabet.length]
  }
  return prefix ? `${prefix}${text}` : text
}

// Legacy alphabet excludes: B, D, O, Q, I, V
export const LEGACY_ALPHABET = "ACEFGHJKLMNPRSTUWXYZ0123456789"

function randomLegacyPart(len: number) {
  const bytes = crypto.randomBytes(len)
  let out = ""
  for (let i = 0; i < len; i++) {
    out += LEGACY_ALPHABET[bytes[i] % LEGACY_ALPHABET.length]
  }
  return out
}

// Legacy format: XXXX-XXYY-XXMM-XXDD
export function generateLegacyCode(createdAt = new Date()) {
  const YY = String(createdAt.getFullYear()).slice(-2)
  const MM = String(createdAt.getMonth() + 1).padStart(2, "0")
  const DD = String(createdAt.getDate()).padStart(2, "0")
  return `${randomLegacyPart(4)}-${randomLegacyPart(2)}${YY}-${randomLegacyPart(2)}${MM}-${randomLegacyPart(2)}${DD}`
}

export function normalizePrefix(prefix: string) {
  return prefix?.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "") ?? ""
}