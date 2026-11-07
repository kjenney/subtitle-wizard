/**
 * Subtitle Wizard - Encryption utilities for localStorage
 */

/**
 * Encrypt data using AES-GCM
 * @param {string|Object} data - Data to encrypt
 * @param {string} password - Password for encryption
 * @returns {Promise<string>} Base64-encoded encrypted data
 */
export async function encryptData(data, password) {
  const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(dataString);

  // Generate salt
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  // Derive key from password
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    cryptoKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Generate IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataBytes
  );

  // Combine salt, iv, and encrypted data
  const encryptedArray = new Uint8Array(
    salt.length + iv.length + encryptedContent.byteCount
  );
  encryptedArray.set(salt);
  encryptedArray.set(iv, salt.length);
  encryptedArray.set(new Uint8Array(encryptedContent), salt.length + iv.length);

  // Encode to base64
  const base64String = btoa(String.fromCharCode(...encryptedArray));
  return base64String;
}

/**
 * Decrypt data using AES-GCM
 * @param {string} base64Encrypted - Base64-encoded encrypted data
 * @param {string} password - Password for decryption
 * @returns {Promise<string|Object>} Decrypted data
 */
export async function decryptData(base64Encrypted, password) {
  try {
    // Decode from base64
    const encryptedArray = new Uint8Array(
      atob(base64Encrypted).split('').map(c => c.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted content
    const salt = encryptedArray.subarray(0, 16);
    const iv = encryptedArray.subarray(16, 28);
    const encryptedContent = encryptedArray.subarray(28);

    // Derive key from password
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      cryptoKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt
    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedContent
    );

    // Parse as JSON or return as string
    try {
      return JSON.parse(new TextDecoder().decode(decryptedContent));
    } catch {
      return new TextDecoder().decode(decryptedContent);
    }
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Generate a secure random string for encryption key
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export function generateEncryptionKey(length = 32) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const charactersLength = characters.length;
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);

  return Array.from(array)
    .map(byte => characters[byte % charactersLength])
    .join('');
}
