'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!session) {
      signIn('discord')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Premium Discord Access
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Join our exclusive Discord community with premium features and content
        </p>

        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
          <div className="text-3xl font-bold mb-2">$9.99<span className="text-lg text-gray-400">/month</span></div>
          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Exclusive Discord channels
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Premium member role
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Direct support access
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Monthly exclusive content
            </li>
          </ul>

          {session && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
              <p className="text-sm text-green-400">
                Connected as {session.user?.name}
              </p>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-400 hover:text-white mt-1"
              >
                Disconnect
              </button>
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading || status === 'loading'}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
          >
            {status === 'loading'
              ? 'Loading...'
              : loading
              ? 'Redirecting...'
              : session
              ? 'Subscribe Now'
              : 'Connect Discord & Subscribe'}
          </button>
          <p className="text-sm text-gray-400 mt-4">
            Cancel anytime. Secure payment via Stripe.
          </p>
        </div>
      </div>
    </main>
  )
}
