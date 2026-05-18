import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { verifyBasicAuth, getUnauthorizedResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  if (!verifyBasicAuth(request)) {
    return getUnauthorizedResponse()
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const filename = file.name
    // Ensure folder doesn't have trailing slash, then construct pathname
    const cleanFolder = folder ? folder.endsWith('/') ? folder.slice(0, -1) : folder : ''
    const pathname = cleanFolder ? `${cleanFolder}/${filename}` : filename

    // Demo mode: if no token is configured, simulate success
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        pathname,
        filename,
        demo: true,
      })
    }

    const blob = await put(pathname, file, {
      access: 'private',
    })

    return NextResponse.json({
      pathname: blob.pathname,
      filename,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Upload error:', errorMessage)
    return NextResponse.json({ error: 'Upload failed', details: errorMessage }, { status: 500 })
  }
}
