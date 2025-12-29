/**
 * Token Encryption Utilities
 *
 * Provides AES-256-GCM encryption for sensitive tokens like OAuth credentials.
 * This prevents exposure of tokens if the database is compromised.
 *
 * @security Encryption key must be stored securely in environment variables.
 * Generate a key using: openssl rand -base64 32
 *
 * @example
 * ```ts
 * import { encryptToken, decryptToken } from '@/lib/crypto/token-encryption';
 *
 * // Encrypt before storing
 * const encrypted = encryptToken(oauthAccessToken);
 *
 * // Decrypt when reading
 * const decrypted = decryptToken(encrypted);
 * ```
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

// Encryption algorithm - AES-256-GCM provides both encryption and authentication
const ALGORITHM = "aes-256-gcm";

// Key length for AES-256 (32 bytes)
const KEY_LENGTH = 32;

// IV length for GCM mode (12 bytes recommended by NIST)
const IV_LENGTH = 12;

// Auth tag length (16 bytes for full security)
const AUTH_TAG_LENGTH = 16;

// Salt for key derivation (static, but combined with env key)
const KEY_DERIVATION_SALT = "mealprep-token-encryption-v1";

/**
 * Lazily derived encryption key from environment variable
 * Using scrypt for key derivation to strengthen the key
 */
let derivedKey: Buffer | null = null;

function getDerivedKey(): Buffer {
  if (derivedKey) {
    return derivedKey;
  }

  const envKey = process.env.TOKEN_ENCRYPTION_KEY;

  if (!envKey) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY environment variable is not set. " +
        "Generate one with: openssl rand -base64 32"
    );
  }

  if (envKey.length < 32) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be at least 32 characters. " +
        "Generate one with: openssl rand -base64 32"
    );
  }

  // Derive a proper 256-bit key using scrypt
  derivedKey = scryptSync(envKey, KEY_DERIVATION_SALT, KEY_LENGTH);
  return derivedKey;
}

/**
 * Encrypts a token string using AES-256-GCM
 *
 * @param plaintext - The token to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext (all base64)
 * @throws Error if encryption fails or key is not configured
 *
 * @example
 * ```ts
 * const encrypted = encryptToken(googleAccessToken);
 * // Returns: "rAnD0mIv==:aUtHtAg==:cIpHeRtExT=="
 * ```
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) {
    return "";
  }

  const key = getDerivedKey();

  // Generate random IV for each encryption
  const iv = randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Encrypt
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Get auth tag for integrity verification
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypts a token encrypted with encryptToken
 *
 * @param encrypted - The encrypted token string (iv:authTag:ciphertext format)
 * @returns Decrypted plaintext token
 * @throws Error if decryption fails, format is invalid, or integrity check fails
 *
 * @example
 * ```ts
 * const decrypted = decryptToken(encryptedToken);
 * // Returns original token string
 * ```
 */
export function decryptToken(encrypted: string): string {
  if (!encrypted) {
    return "";
  }

  const key = getDerivedKey();

  // Parse the encrypted format
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted token format. Expected iv:authTag:ciphertext"
    );
  }

  const [ivBase64, authTagBase64, ciphertext] = parts;

  // Decode components
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");

  // Validate IV length
  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: ${iv.length}, expected ${IV_LENGTH}`);
  }

  // Validate auth tag length
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(
      `Invalid auth tag length: ${authTag.length}, expected ${AUTH_TAG_LENGTH}`
    );
  }

  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Set auth tag for integrity verification
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Checks if a string appears to be an encrypted token
 * (starts with base64 IV and has proper format)
 */
export function isEncryptedToken(value: string): boolean {
  if (!value || typeof value !== "string") {
    return false;
  }

  const parts = value.split(":");
  if (parts.length !== 3) {
    return false;
  }

  // Check if parts look like base64
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return parts.every((part) => base64Regex.test(part));
}

/**
 * Safely encrypts a token, returning original value if encryption fails
 * Useful during migration when some tokens may already be encrypted
 */
export function safeEncryptToken(plaintext: string): string {
  if (!plaintext) {
    return "";
  }

  // Don't double-encrypt
  if (isEncryptedToken(plaintext)) {
    return plaintext;
  }

  try {
    return encryptToken(plaintext);
  } catch (error) {
    console.error("[Token Encryption] Failed to encrypt token:", error);
    // Return original value to prevent data loss
    // Log for monitoring but don't expose in production
    return plaintext;
  }
}

/**
 * Safely decrypts a token, returning original value if decryption fails
 * Useful during migration when some tokens may not be encrypted yet
 */
export function safeDecryptToken(encrypted: string): string {
  if (!encrypted) {
    return "";
  }

  // Check if it looks encrypted
  if (!isEncryptedToken(encrypted)) {
    // Probably a plaintext token from before encryption was enabled
    return encrypted;
  }

  try {
    return decryptToken(encrypted);
  } catch (error) {
    console.error("[Token Encryption] Failed to decrypt token:", error);
    // Return original value - may be plaintext or corrupted
    return encrypted;
  }
}
