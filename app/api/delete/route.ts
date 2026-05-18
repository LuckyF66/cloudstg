import { del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { verifyBasicAuth, getUnauthorizedResponse } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  if (!verifyBasicAuth(request)) {
    return getUnauthorizedResponse()
  }

  try {
    const { url, pathname } = await request.json()

    if (!url && !pathname) {
      return NextResponse.json({ error: 'No URL or pathname provided' }, { status: 400 })
    }

    // Demo mode: if no token is configured, simulate success
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ success: true, demo: true })
    }

    // Use URL if provided (preferred), otherwise fall back to pathname
    const deleteTarget = url || pathname
    
    await del(deleteTarget)

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Delete error:', errorMsg)
    return NextResponse.json({ error: 'Delete failed', details: errorMsg }, { status: 500 })
  }
}
