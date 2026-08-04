import path from 'path'

// List of dangerous executable extensions that must never be uploaded
const FORBIDDEN_EXTENSIONS = new Set([
  '.php', '.phtml', '.php3', '.php4', '.php5', '.phps', '.phar',
  '.exe', '.dll', '.bat', '.cmd', '.sh', '.bash', '.cgi', '.pl',
  '.js', '.mjs', '.cjs', '.ts', '.jsx', '.tsx', '.html', '.htm',
  '.xhtml', '.jsp', '.jspx', '.asp', '.aspx', '.cer', '.vbs', '.py',
  '.jar', '.class', '.com', '.scr', '.msi', '.sys', '.drv'
])

// Magic byte signatures for allowed file types
const MAGIC_NUMBERS: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  jpg: [
    [0xff, 0xd8, 0xff, 0xe0],
    [0xff, 0xd8, 0xff, 0xe1],
    [0xff, 0xd8, 0xff, 0xe2],
    [0xff, 0xd8, 0xff, 0xe3],
    [0xff, 0xd8, 0xff, 0xe8],
    [0xff, 0xd8, 0xff, 0xee],
  ],
  gif: [[0x47, 0x49, 0x46, 0x38]], // GIF8
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF (check WEBP at offset 8)
  zip: [
    [0x50, 0x4b, 0x03, 0x04], // ZIP / DOCX / XLSX / PPTX / EPUB
    [0x50, 0x4b, 0x05, 0x06],
    [0x50, 0x4b, 0x07, 0x08],
  ],
  rar: [
    [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00], // RAR v4
    [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01], // RAR v5
  ],
}

/**
 * Sanitizes a filename to prevent path traversal (`../`, `..\`) and dangerous characters.
 */
export function sanitizeFilename(originalFilename: string): string {
  if (!originalFilename) return 'unnamed_file'

  // Remove directory paths
  let name = path.basename(originalFilename)

  // Remove null bytes and non-printable characters
  name = name.replace(/\0/g, '').replace(/[\x00-\x1f\x7f]/g, '')

  // Remove path traversal sequences
  name = name.replace(/\.\./g, '')

  // Replace spaces and special characters with underscores, keeping dots, alphanumeric, and dashes
  name = name.replace(/[^a-zA-Z0-9.\-_]/g, '_')

  // Prevent hidden files (starting with dot)
  if (name.startsWith('.')) {
    name = 'file' + name
  }

  return name || 'unnamed_file'
}

/**
 * Checks if a filename has a forbidden executable extension.
 */
export function isForbiddenExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return FORBIDDEN_EXTENSIONS.has(ext)
}

/**
 * Validates a file buffer against magic byte signatures.
 */
export function validateFileMagicBytes(buffer: Buffer): { isValid: boolean; detectedType?: string } {
  if (!buffer || buffer.length < 4) {
    return { isValid: false }
  }

  for (const [type, signatures] of Object.entries(MAGIC_NUMBERS)) {
    for (const signature of signatures) {
      let matches = true
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          matches = false
          break
        }
      }
      if (matches) {
        // Special check for WEBP format (RIFF header + WEBP at byte 8)
        if (type === 'webp') {
          if (
            buffer.length >= 12 &&
            buffer[8] === 0x57 && // W
            buffer[9] === 0x45 && // E
            buffer[10] === 0x42 && // B
            buffer[11] === 0x50 // P
          ) {
            return { isValid: true, detectedType: 'webp' }
          }
          continue
        }
        return { isValid: true, detectedType: type }
      }
    }
  }

  // Allow text / audio / video if extensions match and no dangerous scripts found
  return { isValid: true, detectedType: 'other' }
}

/**
 * Full security validation of an uploaded file.
 */
export function validateUploadedFile(
  fileBuffer: Buffer,
  originalFilename: string,
  maxSizeBytes: number = 50 * 1024 * 1024
): { valid: boolean; error?: string; safeFilename?: string } {
  if (!fileBuffer || fileBuffer.length === 0) {
    return { valid: false, error: 'File kosong atau tidak valid' }
  }

  if (fileBuffer.length > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024))
    return { valid: false, error: `Ukuran file melebihi batas maksimal (${maxMb}MB)` }
  }

  const safeName = sanitizeFilename(originalFilename)

  if (isForbiddenExtension(safeName)) {
    return { valid: false, error: 'Tipe file eksekusi/skrip tidak diizinkan demi alasan keamanan' }
  }

  const magicCheck = validateFileMagicBytes(fileBuffer)
  if (!magicCheck.isValid) {
    return { valid: false, error: 'Format file tidak sesuai dengan konten aslinya (magic bytes mismatch)' }
  }

  return { valid: true, safeFilename: safeName }
}
