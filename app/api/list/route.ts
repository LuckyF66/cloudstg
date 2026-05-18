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
    const filesMap = new Map<string, any>()
    const folderMarkers = new Set<string>()
    
    // First pass: identify folder markers
    blobs.forEach((blob) => {
      if (blob.pathname.endsWith('.folder')) {
        const folderPath = blob.pathname.slice(0, -7) // Remove '.folder'
        folderMarkers.add(folderPath)
      }
    })
    
    // Second pass: add all items
    blobs.forEach((blob) => {
      const pathname = blob.pathname
      
      // Skip .folder marker files
      if (pathname.endsWith('.folder')) {
        const folderPath = pathname.slice(0, -7) // Remove '.folder'
        filesMap.set(folderPath, {
          pathname: folderPath,
          filename: folderPath.split('/').filter(Boolean).pop() || 'folder',
          isFolder: true,
          size: 0,
          uploadedAt: blob.uploadedAt,
          url: blob.url, // Store the marker file URL for deletion
        })
      } else {
        // Regular file - always add it
        const filename = pathname.split('/').pop() || 'unknown'
        filesMap.set(pathname, {
          pathname,
          filename,
          isFolder: false,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
          url: blob.url,
        })
      }
    })

    const files = Array.from(filesMap.values())

    return NextResponse.json({ files })
  } catch (error) {
    // Return empty list if token is missing (demo mode)
    if (error instanceof Error && error.message.includes('No token found')) {
      return NextResponse.json({ files: [], demo: true })
    }
    
    return NextResponse.json({ error: 'Failed to list files', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
