import { NextRequest, NextResponse } from 'next/server'

const BASIC_USERNAME = 'AltairC'
const BASIC_PASSWORD = 'gakbolehtau@666'

export function parseBasicAuth(request: NextRequest): { username: string; password: string } | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null
  }

  try {
    const base64 = authHeader.substring(6)
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    const [username, password] = decoded.split(':')
    
    return { username, password }
  } catch {
    return null
  }
}

export function verifyBasicAuth(request: NextRequest): boolean {
  const auth = parseBasicAuth(request)
  
  if (!auth) {
    return false
  }

  return auth.username === BASIC_USERNAME && auth.password === BASIC_PASSWORD
}

export function getUnauthorizedResponse(): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: 'Unauthorized' }),
    {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Cloud Storage"',
        'Content-Type': 'application/json',
      },
    }
  )
}
