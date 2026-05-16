'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { motion } from 'framer-motion'
import Navigation from '@/services/Navigation'
import { RadioIcon } from '@heroicons/react/24/outline'

export default function RandomCallPageComponent() {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Navigation />

      <div className="flex-1 md:ml-0">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <RadioIcon className="h-8 w-8 text-red-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Random Call</h2>
              <p className="text-gray-400">Connect with strangers via WebRTC</p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 mt-12 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-8 border border-gray-700 text-center text-white"
          >
            <RadioIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-2xl font-bold mb-2">📞 Random Call Coming Soon!</h3>
            <p className="mb-6 opacity-90">WebRTC-based random video calling feature. Connect with strangers anonymously!</p>
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100">
              Notify Me
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h4 className="text-lg font-semibold text-white mb-2">🎲 Random Matching</h4>
              <p className="text-gray-400">Get matched with random users instantly</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h4 className="text-lg font-semibold text-white mb-2">📹 HD Video Call</h4>
              <p className="text-gray-400">High-quality video calls over WebRTC</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h4 className="text-lg font-semibold text-white mb-2">🔒 Safe & Secure</h4>
              <p className="text-gray-400">Anonymous and secure random connections</p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
