'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (folderName: string) => void
  isLoading: boolean
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onSubmit(folderName.trim())
      setFolderName('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100">Create New Folder</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              disabled={isLoading}
              autoFocus
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 text-slate-100 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !folderName.trim()}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
