/**
 * Subtitle Wizard - Encryption utilities for localStorage
 */

/**
 * Maximum size of data that can be encrypted in a single operation
 * AES-GCM has practical limits, but we'll use a conservative threshold
 */
const MAX_ENCRYPT_SIZE = 16 * 1024 * 1024; // 16MB to be safe

/**
 * Encode Uint8Array to base64 using chunked approach
 * @param {Uint8Array} data - Binary data to encode
 * @returns {string} Base64-encoded string
 */
function encodeBase64(data) {
  // Use chunked binary string construction to avoid memory issues
  const chunkSize = 32768; // 32KB chunks
  const binaryChunks = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.subarray(i, i + chunkSize);
    let binary = '';
    const len = chunk.length;
    for (let j = 0; j < len; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
    binaryChunks.push(btoa(binary));
  }

  return binaryChunks.join('');
}

/**
 * Decode base64 string to Uint8Array using chunked approach
 * @param {string} base64 - Base64-encoded string
 * @returns {Uint8Array} Binary data
 */
function decodeBase64(base64) {
  // atob has limits, so decode in chunks
  const chunkSize = 65534;
  const binaryChunks = [];

  for (let i = 0; i < base64.length; i += chunkSize) {
    const chunk = base64.substring(i, i + chunkSize);
    binaryChunks.push(atob(chunk));
  }

  const binaryString = binaryChunks.join('');
  const len = binaryString.length;
  const data = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    data[i] = binaryString.charCodeAt(i);
  }

  return data;
}

/**
 * Combine ArrayBuffer parts into a single Uint8Array without creating large intermediate views
 * @param {ArrayBuffer[]} parts - Array of ArrayBuffer parts
 * @returns {Uint8Array} Combined Uint8Array
 */
function combineArrayBuffers(parts) {
  // Calculate total length
  let totalLength = 0;
  for (const part of parts) {
    totalLength += part.byteLength;
  }

  // Create result array
  const result = new Uint8Array(totalLength);

  // Copy each part using DataView for reliable copying
  let offset = 0;
  for (const part of parts) {
    const partLength = part.byteLength;
    const partView = new Uint8Array(part);
    result.set(partView, offset);
    offset += partLength;
  }

  return result;
}

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

  // Check if data is too large for single encryption operation
  if (dataBytes.length > MAX_ENCRYPT_SIZE) {
    throw new Error(`Data too large to encrypt: ${dataBytes.length} bytes (max: ${MAX_ENCRYPT_SIZE} bytes)`);
  }

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

  // Combine salt, iv, and encrypted data using a helper function
  // This avoids creating large intermediate typed arrays
  const combined = combineArrayBuffers([
    salt,
    iv,
    encryptedContent
  ]);

  // Encode to base64 using chunked encoding
  const base64String = encodeBase64(combined);
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
    // Decode from base64 using chunked decoding
    const encryptedArray = decodeBase64(base64Encrypted);

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
