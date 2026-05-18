'use client'

import { useState, useRef } from 'react'
import { Upload, FolderPlus, Download, Trash2, MoreVertical, Folder, File, LogOut } from 'lucide-react'
import CreateFolderModal from './create-folder-modal'

interface FileItem {
  pathname: string
  filename: string
  isFolder: boolean
  size: number
  uploadedAt: string
}

interface FileExplorerProps {
  files: FileItem[]
  onRefresh: () => void
  isLoading: boolean
  currentFolder: string
  onFolderChange: (folder: string) => void
  onLogout: () => void
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (!ext) return <File className="w-5 h-5" />

  switch (ext) {
    case 'pdf':
      return <span className="text-red-400 font-bold">📄</span>
    case 'doc':
    case 'docx':
      return <span className="text-blue-400 font-bold">📘</span>
    case 'xls':
    case 'xlsx':
      return <span className="text-green-400 font-bold">📗</span>
    case 'ppt':
    case 'pptx':
      return <span className="text-orange-400 font-bold">📙</span>
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <span className="text-purple-400 font-bold">🖼️</span>
    case 'zip':
    case 'rar':
    case '7z':
      return <span className="text-yellow-400 font-bold">📦</span>
    case 'txt':
    case 'md':
      return <span className="text-slate-400 font-bold">📝</span>
    default:
      return <File className="w-5 h-5 text-slate-400" />
  }
}

export default function FileExplorer({
  files,
  onRefresh,
  isLoading,
  currentFolder,
  onFolderChange,
  onLogout,
}: FileExplorerProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredFiles = files.filter((f) => {
    if (!currentFolder) return !f.pathname.includes('/')
    const folderPrefix = currentFolder.endsWith('/') ? currentFolder : currentFolder + '/'
    const relativePath = f.pathname.slice(folderPrefix.length)
    return relativePath && !relativePath.split('/').slice(0, -1).join('/')
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', currentFolder)

    const auth = sessionStorage.getItem('blob_auth')
    if (!auth) return

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}` },
        body: formData,
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleCreateFolder = async (folderName: string) => {
    setIsCreatingFolder(true)
    const auth = sessionStorage.getItem('blob_auth')
    if (!auth) {
      setIsCreatingFolder(false)
      return
    }

    try {
      const response = await fetch('/api/create-folder', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName,
          parentPath: currentFolder ? (currentFolder.endsWith('/') ? currentFolder : currentFolder + '/') : '',
        }),
      })

      if (response.ok) {
        setShowFolderModal(false)
        onRefresh()
      }
    } catch (error) {
      console.error('Create folder error:', error)
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleDelete = async (pathname: string) => {
    if (!confirm('Are you sure you want to delete this?')) return

    const auth = sessionStorage.getItem('blob_auth')
    if (!auth) return

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pathname }),
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleDownload = (pathname: string, filename: string) => {
    const auth = sessionStorage.getItem('blob_auth')
    if (!auth) return

    const url = `/api/file?pathname=${encodeURIComponent(pathname)}`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-100 truncate">
                {currentFolder ? currentFolder : 'Cloud Storage'}
              </h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button
                onClick={() => setShowFolderModal(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-100 font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors border border-slate-700"
              >
                <FolderPlus className="w-5 h-5" />
                <span className="hidden sm:inline">New Folder</span>
              </button>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-800 text-slate-100 font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors border border-slate-700"
              >
                {isLoading ? '⟳' : '⟲'}
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-slate-800 text-slate-100 font-semibold rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {currentFolder && (
            <button
              onClick={() => {
                const parent = currentFolder.split('/').slice(0, -2).join('/')
                onFolderChange(parent)
              }}
              className="mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        className="hidden"
      />

      {/* File List */}
      <div className="max-w-6xl mx-auto p-4">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400 text-lg">No files or folders yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.pathname}
                className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {file.isFolder ? (
                    <Folder className="w-5 h-5 text-amber-500" />
                  ) : (
                    getFileIcon(file.filename)
                  )}
                </div>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                  if (file.isFolder) {
                    onFolderChange(file.pathname)
                  }
                }}>
                  <p className="text-slate-100 font-medium truncate">{file.filename}</p>
                  <p className="text-slate-500 text-xs">
                    {file.isFolder ? 'Folder' : `${(file.size / 1024).toFixed(2)} KB`}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!file.isFolder && (
                    <button
                      onClick={() => handleDownload(file.pathname, file.filename)}
                      className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === file.pathname ? null : file.pathname)}
                      className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === file.pathname && (
                      <div className="absolute right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20">
                        <button
                          onClick={() => {
                            handleDelete(file.pathname)
                            setOpenMenuId(null)
                          }}
                          className="block w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateFolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSubmit={handleCreateFolder}
        isLoading={isCreatingFolder}
      />
    </div>
  )
}
