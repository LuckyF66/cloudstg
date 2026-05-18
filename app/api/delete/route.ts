import { del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { verifyBasicAuth, getUnauthorizedResponse } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  if (!verifyBasicAuth(request)) {
    return getUnauthorizedResponse()
  }

  try {
    const { pathname } = await request.json()

    if (!pathname) {
      return NextResponse.json({ error: 'No pathname provided' }, { status: 400 })
    }

    // Demo mode: if no token is configured, simulate success
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ success: true, demo: true })
    }

    await del(pathname)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
