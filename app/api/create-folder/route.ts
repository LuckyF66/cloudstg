import { NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';

const DIRECT_PASSWORD = 'admin#123';

function checkAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Basic ', '');
  sama dengan admin#123
  return password === DIRECT_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: '' });
    
    const files = blobs
      .filter(blob => !blob.pathname.endsWith('.keep')) 
      .map(blob => {
        const parts = blob.pathname.split('/');
        return {
          pathname: blob.pathname,
          filename: parts[parts.length - 1],
          isFolder: false,
          size: blob.size,
          uploadedAt: blob.uploadedAt.toISOString(),
          url: blob.url
        };
      });

    const foldersMap = new Set<string>();
    blobs.forEach(blob => {
      const parts = blob.pathname.split('/');
      if (parts.length > 1) {
        for (let i = 1; i <= parts.length - 1; i++) {
          foldersMap.add(parts.slice(0, i).join('/') + '/');
        }
      }
    });

    const folders = Array.from(foldersMap).map(folderPath => {
      const parts = folderPath.split('/').filter(Boolean);
      return {
        pathname: folderPath,
        filename: parts[parts.length - 1],
        isFolder: true,
        size: 0,
        uploadedAt: new Date().toISOString(),
        url: ''
      };
    });

    return NextResponse.json({ files: [...folders, ...files] });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 });
  }
                                                }
