import crypto from "crypto"

export function generateCode(prefix: string, length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = crypto.randomBytes(length)
  let text = ""
  for (let i = 0; i < length; i++) {
    text += alphabet[bytes[i] % alphabet.length]
  }
  return prefix ? `${prefix}${text}` : text
}

export function normalizePrefix(prefix: string) {
  return prefix?.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "") ?? ""
}