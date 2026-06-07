import CryptoJS from 'crypto-js';

const getSecretKey = () => process.env.NEXT_PUBLIC_STORAGE_SECRET || 'default-secret-fallback-key-2026';

/**
 * Generates a cryptographic signature for network requests to prevent replay attacks.
 * @param payload The data being sent
 * @param timestamp The exact time of the request
 */
export function generateNetworkSignature(payload: any, timestamp: number): string {
  const dataString = JSON.stringify(payload);
  return CryptoJS.HmacSHA256(dataString + timestamp.toString(), getSecretKey()).toString();
}

/**
 * Verifies if a received signature is valid for the given payload and timestamp.
 */
export function verifyNetworkSignature(payload: any, timestamp: number, signature: string): boolean {
  if (!signature) return false;
  const expectedSignature = generateNetworkSignature(payload, timestamp);
  return signature === expectedSignature;
}
