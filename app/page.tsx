'use client'

import { useState, useEffect } from 'react'
import AuthPrompt from '@/components/auth-prompt'
import FileExplorer from '@/components/file-explorer'

interface FileItem {
  pathname: string
  filename: string
  isFolder: boolean
  size: number
  uploadedAt: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentFolder, setCurrentFolder] = useState('')

  useEffect(() => {
    // Check if already authenticated from previous session
    const auth = sessionStorage.getItem('blob_auth')
    if (auth) {
      setIsAuthenticated(true)
      fetchFiles()
    }
  }, [])

  const fetchFiles = async () => {
    setIsLoading(true)
    try {
      const auth = sessionStorage.getItem('blob_auth')
      if (!auth) return

      const response = await fetch('/api/list', {
        headers: { 'Authorization': `Basic ${auth}` },
      })

      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      } else {
        // Auth failed, log out
        sessionStorage.removeItem('blob_auth')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth = () => {
    setIsAuthenticated(true)
    fetchFiles()
  }

  const handleRefresh = () => {
    fetchFiles()
  }

  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('blob_auth')
    setIsAuthenticated(false)
    setFiles([])
    setCurrentFolder('')
  }

  if (!isAuthenticated) {
    return <AuthPrompt onAuth={handleAuth} />
  }

  return (
    <FileExplorer
      files={files}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      currentFolder={currentFolder}
      onFolderChange={handleFolderChange}
      onLogout={handleLogout}
    />
  )
}
