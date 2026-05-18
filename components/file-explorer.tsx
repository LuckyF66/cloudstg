'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, FolderPlus, Download, Trash2, LogOut, ArrowLeft, RefreshCw, Lock, FileText, Image, FileSpreadsheet, Presentation, File, Folder, Music, Archive } from 'lucide-react';

interface FileItem {
  pathname: string;
  filename: string;
  isFolder: boolean;
  size: number;
  uploadedAt: string;
  url: string;
}

// Komponen Ikon Custom: Mendeteksi Word, Excel, Canva, dan FLAC/Audio
function FileIcon({ filename, isFolder }: { filename: string; isFolder: boolean }) {
  if (isFolder) return <Folder className="w-6 h-6 text-amber-500 fill-amber-500" />;
  
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'doc':
    case 'docx':
      return <FileText className="w-6 h-6 text-blue-500" />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
    case 'ppt':
    case 'pptx':
      return <Presentation className="w-6 h-6 text-orange-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'webp':
      return <Image className="w-6 h-6 text-purple-500" />;
    case 'flac':
    case 'mp3':
    case 'wav':
    case 'm4a':
      return <Music className="w-6 h-6 text-cyan-500" />;
    case 'zip':
    case 'rar':
      return <Archive className="w-6 h-6 text-yellow-600" />;
    default:
      return <File className="w-6 h-6 text-slate-400" />;
  }
}

export default function FileExplorer() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedPassword = localStorage.getItem('storage_pwd');
    if (savedPassword) {
      checkAndFetchFiles(savedPassword);
    }
  }, []);

  async function checkAndFetchFiles(pwdToTest: string) {
    setIsLoading(true);
    try {
      // Mengubah target ke API storage baru kita
      const res = await fetch('/api/storage', {
        headers: { 'Authorization': `Basic ${pwdToTest}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        setIsAuth(true);
        localStorage.setItem('storage_pwd', pwdToTest);
        setPassword(pwdToTest);
      } else {
        alert('Password salah atau sesi berakhir!');
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredItems = files.filter(item => {
    if (!currentFolder) {
      return !item.pathname.includes('/');
    }
    if (!item.pathname.startsWith(currentFolder)) return false;
    const relativePath = item.pathname.slice(currentFolder.length);
    const parts = relativePath.split('/').filter(Boolean);
    return parts.length === 1;
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', currentFolder);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${password}` },
        body: formData
      });
      if (res.ok) checkAndFetchFiles(password);
    } catch (err) {
      console.error(err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('isFolder', 'true');
    formData.append('folderName', newFolderName.trim());
    formData.append('folder', currentFolder);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${password}` },
        body: formData
      });
      if (res.ok) {
        setNewFolderName('');
        setShowFolderInput(false);
        checkAndFetchFiles(password);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(item: FileItem) {
    if (!confirm(`Hapus ${item.filename}?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/storage', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Basic ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: item.url || item.pathname })
      });
      if (res.ok) checkAndFetchFiles(password);
    } catch (err) {
      console.error(err);
    }
  }

  // Trik Unduh Langsung via Blob URL agar teman kelompok tinggal klik unduh instan
  async function handleDownload(item: FileItem) {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert('Gagal mengunduh instan. Membuka tab baru...');
      window.open(item.url, '_blank');
    }
  }

  function handleLogout() {
    localStorage.removeItem('storage_pwd');
    setIsAuth(false);
    setPassword('');
    setFiles([]);
    setCurrentFolder('');
  }

  if (!isAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950 text-slate-50">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-center mb-4 text-amber-500">
            <Lock className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-center mb-6">School Storage Access</h2>
          <form onSubmit={(e) => { e.preventDefault(); checkAndFetchFiles(password); }} className="space-y-4">
            <input
              type="password"
              placeholder="Masukkan Password (Clue: admin#...)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500 text-slate-100"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Masuk Ke Penyimpanan'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen bg-slate-950 text-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6">
        <div>
          <h1 className="text-lg font-bold truncate max-w-xs sm:max-w-md">
            📁 {currentFolder ? `root / ${currentFolder.replace(/\/$/, '').replace(/\//g, ' / ')}` : 'Root Storage'}
          </h1>
          <p className="text-xs text-slate-400">Total item di folder ini: {filteredItems.length}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => checkAndFetchFiles(password)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 bg-red-950/40 text-red-400 hover:bg-red-950 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-600 transition-colors"
        >
          <Upload className="w-5 h-5" /> Upload File
        </button>
        <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" />

        <button
          onClick={() => setShowFolderInput(!showFolderInput)}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-800 font-bold rounded-xl hover:bg-slate-800 transition-colors"
        >
          <FolderPlus className="w-5 h-5 text-amber-500" /> New Folder
        </button>
      </div>

      {showFolderInput && (
        <form onSubmit={handleCreateFolder} className="flex gap-2 mb-6 bg-slate-900 p-3 border border-slate-800 rounded-xl">
          <input
            type="text"
            placeholder="Nama folder sekolah baru..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500 text-sm text-slate-100"
            required
          />
          <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 text-sm font-bold rounded-lg hover:bg-amber-600">
            Buat
          </button>
        </form>
      )}

      {currentFolder && (
        <button
          onClick={() => {
            const parts = currentFolder.split('/').filter(Boolean);
            parts.pop();
            setCurrentFolder(parts.length ? parts.join('/') + '/' : '');
          }}
          className="flex items-center gap-2 text-sm text-amber-500 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">Folder kosong. Silakan unggah dokumen!</div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredItems.map((item) => (
              <div key={item.pathname} className="flex items-center justify-between p-4 hover:bg-slate-800/40">
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => { if (item.isFolder) setCurrentFolder(item.pathname); }}
                >
                  <FileIcon filename={item.filename} isFolder={item.isFolder} />
                  <div className="truncate">
                    <p className="font-medium text-sm text-slate-200 truncate">{item.filename}</p>
                    <p className="text-xs text-slate-500">
                      {item.isFolder ? 'Folder Dokumen' : `${(item.size / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 ml-2">
                  {!item.isFolder && (
                    <button 
                      onClick={() => handleDownload(item)}
                      className="p-2 text-slate-400 hover:text-slate-100"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(item)}
                    className="p-2 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
                                       }
