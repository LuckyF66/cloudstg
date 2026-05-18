'use client'

import { useState } from 'react'

export default function AuthPrompt({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const credentials = Buffer.from(`AltairC:${password}`).toString('base64')
      const response = await fetch('/api/list', {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      })

      if (response.ok) {
        // Store auth in sessionStorage for this session
        sessionStorage.setItem('blob_auth', credentials)
        onAuth()
      } else {
        setError('Invalid password')
        setPassword('')
      }
    } catch (err) {
      setError('Authentication failed')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="text-4xl font-bold text-amber-500 mb-2">⚙️</div>
            <h1 className="text-2xl font-bold text-slate-100">Cloud Storage</h1>
            <p className="text-slate-400 text-sm mt-2">Enter your password to access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-950 border border-red-800 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-2 px-4 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Authenticating...' : 'Access Storage'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Secure cloud storage powered by Vercel Blob
        </p>
      </div>
    </div>
  )
}
