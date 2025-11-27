import Link from 'next/link'

export default function Success() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center bg-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-4 text-green-400">
          Payment Successful!
        </h1>
        <p className="text-gray-300 mb-6">
          Thank you for subscribing! You will receive access to the Discord server shortly.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Check your email for confirmation and Discord invite details.
        </p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
