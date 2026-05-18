import { list } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { verifyBasicAuth, getUnauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!verifyBasicAuth(request)) {
    return getUnauthorizedResponse()
  }

  try {
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
    console.error('Error listing files:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
