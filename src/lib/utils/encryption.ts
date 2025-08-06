import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!
const ALGORITHM = 'aes-256-gcm'

/**
 * Dérive une clé de 32 bytes à partir de la clé d'environnement
 */
function deriveKey(): Buffer {
  return crypto.scryptSync(ENCRYPTION_KEY, 'docvault-salt', 32)
}

/**
 * Chiffre un buffer ou une string
 */
export function encrypt(data: Buffer | string): { encrypted: Buffer; iv: Buffer; authTag: Buffer } {
  const iv = crypto.randomBytes(16)
  const key = deriveKey()
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  cipher.setAAD(Buffer.from('docvault', 'utf8'))
  
  const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()])
  
  return {
    encrypted,
    iv,
    authTag: cipher.getAuthTag()
  }
}

/**
 * Déchiffre un buffer
 */
export function decrypt(encrypted: Buffer, iv: Buffer, authTag: Buffer): Buffer {
  const key = deriveKey()
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAAD(Buffer.from('docvault', 'utf8'))
  decipher.setAuthTag(authTag)
  
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted
}

/**
 * Chiffre un fichier pour le stockage
 */
export function encryptFile(fileBuffer: Buffer): { encrypted: Buffer; metadata: string } {
  const { encrypted, iv, authTag } = encrypt(fileBuffer)
  
  // Combiner les métadonnées de chiffrement
  const metadata = JSON.stringify({
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    algorithm: ALGORITHM
  })
  
  return { encrypted, metadata }
}

/**
 * Déchiffre un fichier stocké
 */
export function decryptFile(encryptedBuffer: Buffer, metadata: string): Buffer {
  const { iv, authTag } = JSON.parse(metadata)
  
  return decrypt(
    encryptedBuffer,
    Buffer.from(iv, 'base64'),
    Buffer.from(authTag, 'base64')
  )
}

/**
 * Vérifie si la clé de chiffrement est configurée
 */
export function isEncryptionConfigured(): boolean {
  return !!ENCRYPTION_KEY && ENCRYPTION_KEY.length >= 32
}

/**
 * Génère une clé de chiffrement (pour la génération de nouvelles clés)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64')
}

/**
 * Chiffrement côté client pour les navigateurs
 * Utilise Web Crypto API pour une sécurité maximale
 */
export class ClientEncryption {
  private static async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API non disponible')
    }
    
    const encoder = new TextEncoder()
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Chiffre un fichier côté client
   */
  static async encryptFile(file: File, password: string): Promise<{
    encryptedData: ArrayBuffer
    metadata: string
    salt: Uint8Array
    iv: Uint8Array
  }> {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API non disponible')
    }
    
    const salt = window.crypto.getRandomValues(new Uint8Array(16))
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    
    const key = await this.deriveKeyFromPassword(password, salt)
    const fileBuffer = await file.arrayBuffer()
    
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      fileBuffer
    )

    const metadata = JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      algorithm: 'AES-GCM',
      keyDerivation: 'PBKDF2',
      iterations: 100000,
      timestamp: Date.now()
    })

    return {
      encryptedData,
      metadata,
      salt,
      iv
    }
  }

  /**
   * Déchiffre un fichier côté client
   */
  static async decryptFile(
    encryptedData: ArrayBuffer,
    metadata: string,
    salt: Uint8Array,
    iv: Uint8Array,
    password: string
  ): Promise<{ data: ArrayBuffer; fileName: string; fileType: string }> {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API non disponible')
    }
    
    const key = await this.deriveKeyFromPassword(password, salt)
    const parsedMetadata = JSON.parse(metadata)
    
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    )

    return {
      data: decryptedData,
      fileName: parsedMetadata.fileName,
      fileType: parsedMetadata.fileType
    }
  }

  /**
   * Génère un mot de passe sécurisé pour le chiffrement
   */
  static generateSecurePassword(): string {
    if (typeof window === 'undefined' || !window.crypto) {
      throw new Error('Web Crypto API non disponible')
    }
    
    const array = new Uint8Array(32)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
} 