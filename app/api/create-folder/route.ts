import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { verifyBasicAuth, getUnauthorizedResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  if (!verifyBasicAuth(request)) {
    return getUnauthorizedResponse()
  }

  try {
    const { folderName, parentPath } = await request.json()

    if (!folderName) {
      return NextResponse.json({ error: 'No folder name provided' }, { status: 400 })
    }

    const pathname = parentPath ? `${parentPath}${folderName}/` : `${folderName}/`

    // Create a marker file to represent the folder
    const blob = await put(pathname + '.folder', new Blob([''], { type: 'text/plain' }), {
      access: 'private',
    })

    return NextResponse.json({
      pathname: pathname,
      folderName,
    })
  } catch (error) {
    console.error('Create folder error:', error)
    return NextResponse.json({ error: 'Create folder failed' }, { status: 500 })
  }
}
