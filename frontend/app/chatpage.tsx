'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { motion } from 'framer-motion'
import Navigation from '@/services/Navigation'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

export default function ChatPage() {
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
            <ChatBubbleLeftIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Messages</h2>
              <p className="text-gray-400">Connect with your friends</p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 mt-12 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center"
          >
            <ChatBubbleLeftIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Messages Yet</h3>
            <p className="text-gray-400 mb-6">Start a conversation with your friends to begin chatting</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Start New Chat
            </button>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
