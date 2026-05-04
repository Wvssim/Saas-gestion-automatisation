import crypto from 'crypto';

/**
 * Encrypt sensitive data (API keys)
 * Note: Prisma @db.Encrypted handles this at DB level
 * This is for additional app-level encryption if needed
 */
export function encryptApiKey(apiKey: string, secret?: string): string {
  const encryptionSecret = secret || process.env.ENCRYPTION_KEY || '';

  if (!encryptionSecret) {
    console.warn('[Shopify] No encryption key provided, returning plaintext');
    return apiKey;
  }

  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(encryptionSecret, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('[Shopify] Encryption failed:', err);
    return apiKey;
  }
}

/**
 * Decrypt API key
 */
export function decryptApiKey(encryptedKey: string, secret?: string): string {
  const encryptionSecret = secret || process.env.ENCRYPTION_KEY || '';

  if (!encryptionSecret || !encryptedKey.includes(':')) {
    return encryptedKey;
  }

  try {
    const [ivHex, encrypted] = encryptedKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(encryptionSecret, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[Shopify] Decryption failed:', err);
    return encryptedKey;
  }
}

/**
 * Valider format API key
 */
export function isValidShopifyAccessToken(token: string): boolean {
  // Shopify access tokens sont alphanumériques, 32+ chars
  return /^[a-z0-9]{32,}$/i.test(token);
}
