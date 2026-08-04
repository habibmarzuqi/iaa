import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const SALT_ROUNDS = 10

/**
 * Hashes a plain text password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Computes legacy SHA-256 hash for backward compatibility checks.
 */
export function hashPasswordSha256(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Verifies a plain text password against a stored hash.
 * Supports both bcrypt hashes ($2a$, $2b$) and legacy SHA-256 hashes.
 *
 * @returns { isValid: boolean, isLegacySha256: boolean }
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<{ isValid: boolean; isLegacySha256: boolean }> {
  if (!storedHash) {
    return { isValid: false, isLegacySha256: false }
  }

  // Check if hash is bcrypt ($2a$, $2b$, $2y$)
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    try {
      const isValid = await bcrypt.compare(password, storedHash)
      return { isValid, isLegacySha256: false }
    } catch {
      return { isValid: false, isLegacySha256: false }
    }
  }

  // Fallback check for legacy SHA-256 hash
  const legacyHash = hashPasswordSha256(password)
  const isLegacyValid = legacyHash === storedHash

  return {
    isValid: isLegacyValid,
    isLegacySha256: isLegacyValid,
  }
}
