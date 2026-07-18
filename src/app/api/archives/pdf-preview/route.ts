/**
 * Generate thumbnail dari halaman pertama PDF
 * GET /api/archives/pdf-preview?url=/uploads/archives/xxx.pdf
 * Returns: PNG image (thumbnail of first page)
 */
import { NextRequest, NextResponse } from 'next/server'
import { existsSync, readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const fileUrl = url.searchParams.get('url')

  if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
    return NextResponse.json({ error: 'URL file tidak valid' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'public', fileUrl)

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 })
  }

  try {
    const pdfBuffer = await readFile(filePath)

    // Dynamically import pdfjs-dist (server-side only)
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

    // Configure worker (disable worker, run in main thread)
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerSrc = ''

    // Load PDF document
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBuffer) })
    const pdfDocument = await loadingTask.promise

    // Get first page
    const page = await pdfDocument.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 })

    // Create canvas-like object for rendering
    // pdfjs needs a canvas-like API; we'll use a custom NodeCanvas
    const Canvas = await import('canvas').catch(() => null)

    if (!Canvas) {
      // Fallback: return a simple placeholder image
      const placeholder = await sharp({
        create: {
          width: 400,
          height: 520,
          channels: 4,
          background: { r: 10, g: 30, b: 63, alpha: 1 },
        },
      })
        .composite([{
          input: Buffer.from(`
            <svg xmlns="http://www.w3.org/2000/svg" width="400" height="520">
              <rect x="20" y="20" width="360" height="480" fill="white" rx="8"/>
              <text x="200" y="240" font-family="Arial" font-size="48" fill="#0a1e3f" text-anchor="middle" font-weight="bold">PDF</text>
              <text x="200" y="290" font-family="Arial" font-size="16" fill="#64748b" text-anchor="middle">Preview not available</text>
              <text x="200" y="315" font-family="Arial" font-size="12" fill="#94a3b8" text-anchor="middle">Install canvas package</text>
            </svg>
          `),
          top: 0,
          left: 0,
        }])
        .png()
        .toBuffer()

      return new NextResponse(placeholder, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    const canvas = Canvas.createCanvas(viewport.width, viewport.height)
    const context = canvas.getContext('2d')

    // Render PDF page to canvas
    await page.render({ canvasContext: context, viewport }).promise

    // Convert canvas to PNG buffer
    const pngBuffer = canvas.toBuffer('image/png')

    // Resize with sharp to thumbnail size (max 400px wide)
    const thumbnail = await sharp(pngBuffer)
      .resize(400, null, { withoutEnlargement: true })
      .png({ quality: 80 })
      .toBuffer()

    return new NextResponse(thumbnail, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // 24h cache
      },
    })
  } catch (e: any) {
    console.error('PDF preview error:', e)

    // Return placeholder on error
    const placeholder = await sharp({
      create: {
        width: 400,
        height: 520,
        channels: 4,
        background: { r: 10, g: 30, b: 63, alpha: 1 },
      },
    })
      .composite([{
        input: Buffer.from(`
          <svg xmlns="http://www.w3.org/2000/svg" width="400" height="520">
            <rect x="20" y="20" width="360" height="480" fill="white" rx="8"/>
            <text x="200" y="240" font-family="Arial" font-size="48" fill="#dc2626" text-anchor="middle" font-weight="bold">PDF</text>
            <text x="200" y="290" font-family="Arial" font-size="14" fill="#64748b" text-anchor="middle">Preview gagal dimuat</text>
          </svg>
        `),
        top: 0,
        left: 0,
      }])
      .png()
      .toBuffer()

    return new NextResponse(placeholder, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }
}
