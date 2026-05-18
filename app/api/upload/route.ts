import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  // Disamakan menggunakan Bearer
  const password = authHeader?.replace('Bearer ', '');
  if (password !== process.env.STORAGE_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || '';
    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    const cleanFolder = folder ? (folder.endsWith('/') ? folder : folder + '/') : '';
    const fullPath = `${cleanFolder}${file.name}`;
    const blob = await put(fullPath, file, { access: 'public', addRandomSuffix: false });
    return NextResponse.json({ success: true, blob });
  } catch (error) { return NextResponse.json({ error: 'Gagal upload file' }, { status: 500 }); }
}
