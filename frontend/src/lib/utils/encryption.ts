// MVP: Simplified encryption - disable client-side encryption for now
// Documents will be stored as-is in Supabase storage

interface EncryptionResult {
  encryptedData: string
  metadata: string
  salt: string
  iv: string
}

interface DecryptionResult {
  data: ArrayBuffer
  fileName: string
  fileType: string
}

/**
 * MVP: Simplified document encryption class (no actual encryption)
 */
export class DocumentEncryption {
  /**
   * MVP: "Encrypt" file (actually just base64 encode for compatibility)
   */
  async encryptFile(
    file: File,
    password: string
  ): Promise<EncryptionResult> {
    try {
      // For MVP: Just convert file to base64 without actual encryption
      const fileBuffer = await file.arrayBuffer()
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))
      
      const metadata = {
        fileName: file.name,
        fileType: file.type,
        originalSize: file.size,
        encryptedAt: new Date().toISOString()
      }
      
      return {
        encryptedData: base64Data,
        metadata: JSON.stringify(metadata),
        salt: 'mvp-no-salt',
        iv: 'mvp-no-iv'
      }
    } catch (error) {
      console.error('Error processing file:', error)
      throw new Error('Failed to process file')
    }
  }

  /**
   * MVP: "Decrypt" file (actually just base64 decode)
   */
  async decryptFile(
    encryptedData: string,
    metadata: string,
    salt: string,
    iv: string,
    password: string
  ): Promise<DecryptionResult> {
    try {
      // For MVP: Just decode base64 data
      const parsedMetadata = JSON.parse(metadata)
      const binaryString = atob(encryptedData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      return {
        data: bytes.buffer,
        fileName: parsedMetadata.fileName,
        fileType: parsedMetadata.fileType
      }
    } catch (error) {
      console.error('Error processing file:', error)
      throw new Error('Failed to process file')
    }
  }

  /**
   * MVP: Always return true for password verification
   */
  async verifyPassword(
    encryptedData: string,
    metadata: string,
    salt: string,
    iv: string,
    password: string
  ): Promise<boolean> {
    return true // MVP: No actual password verification
  }
}

export const documentEncryption = new DocumentEncryption()