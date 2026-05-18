import { list } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { verifyBasicAuth, getUnauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!verifyBasicAuth(request)) {
    return getUnauthorizedResponse()
  }

  try {
    // If no token is available, return empty list (for demo/local dev)
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ files: [], demo: true })
    }

    const { blobs } = await list()

    // Parse blobs and organize by path hierarchy
    const files = blobs.map((blob) => {
      const pathname = blob.pathname
      const parts = pathname.split('/')
      const filename = parts.pop() || 'unknown'
      const isFolder = pathname.endsWith('/')

      return {
        pathname,
        filename,
        isFolder,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      }
    })

    return NextResponse.json({ files })
  } catch (error) {
    // Return empty list if token is missing (demo mode)
    if (error instanceof Error && error.message.includes('No token found')) {
      return NextResponse.json({ files: [], demo: true })
    }
    
    return NextResponse.json({ error: 'Failed to list files', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
