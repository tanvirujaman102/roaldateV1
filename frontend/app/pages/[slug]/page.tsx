'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { motion } from 'framer-motion'
import Navigation from '@/services/Navigation'
import {
  ChatBubbleLeftIcon,
  UserGroupIcon,
  RadioIcon,
  HeartIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

const pageConfigs: Record<string, { title: string; subtitle: string; icon: React.ComponentType<any>; color: string; description: string; features: { title: string; desc: string }[] }> = {
  'chat-page': {
    title: 'Messages',
    subtitle: 'Connect with your friends',
    icon: ChatBubbleLeftIcon,
    color: 'blue',
    description: 'Real-time messaging feature is being developed',
    features: [
      { title: '💬 Direct Messaging', desc: 'Send private messages to your contacts' },
      { title: '👥 Group Chats', desc: 'Create and manage group conversations' },
      { title: '⏰ Real-time Chat', desc: 'Instant message delivery with typing indicators' },
    ],
  },
  'party-page': {
    title: 'Party Rooms',
    subtitle: 'Join group voice and video chat',
    icon: UserGroupIcon,
    color: 'purple',
    description: 'Group voice and video chat rooms coming soon',
    features: [
      { title: '🎤 Voice Rooms', desc: 'Create and join voice chat rooms' },
      { title: '📹 Video Rooms', desc: 'Host group video calls with multiple people' },
      { title: '🎉 Party Features', desc: 'Invite friends and host awesome parties' },
    ],
  },
  'random-call-page': {
    title: 'Random Call',
    subtitle: 'Connect with strangers via WebRTC',
    icon: RadioIcon,
    color: 'red',
    description: 'WebRTC-based random video calling feature',
    features: [
      { title: '🎲 Random Matching', desc: 'Get matched with random users' },
      { title: '📹 HD Video Call', desc: 'High-quality video calls over WebRTC' },
      { title: '🔒 Safe & Secure', desc: 'Anonymous and secure random connections' },
    ],
  },
  'date-page': {
    title: 'Dating',
    subtitle: 'Find your perfect match',
    icon: HeartIcon,
    color: 'pink',
    description: 'Swipe-based dating system coming soon',
    features: [
      { title: '👉 Swipe Interface', desc: 'Swipe left or right to find matches' },
      { title: '💕 Super Likes', desc: 'Show extra interest to people you like' },
      { title: '🎯 Smart Matching', desc: 'AI-powered matching algorithm' },
    ],
  },
  'notification-page': {
    title: 'Notifications',
    subtitle: 'Stay updated with the latest',
    icon: BellIcon,
    color: 'yellow',
    description: 'Real-time notifications feature',
    features: [
      { title: '🔔 Push Notifications', desc: 'Get notified for important updates' },
      { title: '📧 Email Alerts', desc: 'Receive email notifications' },
      { title: '⚙️ Custom Settings', desc: 'Customize your notification preferences' },
    ],
  },
  'profile-page': {
    title: 'Profile',
    subtitle: 'Manage your profile settings',
    icon: UserCircleIcon,
    color: 'green',
    description: 'Create and customize your user profile',
    features: [
      { title: '📸 Profile Photo', desc: 'Upload and manage your photos' },
      { title: '✍️ Bio & Info', desc: 'Add interests and personal information' },
      { title: '⚙️ Settings', desc: 'Manage account and privacy settings' },
    ],
  },
}

export default function DynamicPageComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const pageKey = pathname?.replace('/pages/', '').replace('/', '') || ''
  const config = pageConfigs[pageKey]

  if (!config) {
    return null
  }

  const Icon = config.icon

  const colorClasses: Record<string, { text: string; bg: string; button: string; buttonHover: string }> = {
    blue: { text: 'text-blue-500', bg: 'from-blue-600 to-blue-800', button: 'bg-white text-blue-600', buttonHover: 'hover:bg-gray-100' },
    purple: { text: 'text-purple-500', bg: 'from-purple-600 to-purple-800', button: 'bg-white text-purple-600', buttonHover: 'hover:bg-gray-100' },
    red: { text: 'text-red-500', bg: 'from-red-600 to-red-800', button: 'bg-white text-red-600', buttonHover: 'hover:bg-gray-100' },
    pink: { text: 'text-pink-500', bg: 'from-pink-600 to-pink-800', button: 'bg-white text-pink-600', buttonHover: 'hover:bg-gray-100' },
    yellow: { text: 'text-yellow-500', bg: 'from-yellow-600 to-yellow-800', button: 'bg-white text-yellow-600', buttonHover: 'hover:bg-gray-100' },
    green: { text: 'text-green-500', bg: 'from-green-600 to-green-800', button: 'bg-white text-green-600', buttonHover: 'hover:bg-gray-100' },
  }

  const colors = colorClasses[config.color]

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
            <Icon className={`h-8 w-8 ${colors.text}`} />
            <div>
              <h2 className="text-2xl font-bold text-white">{config.title}</h2>
              <p className="text-gray-400">{config.subtitle}</p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 mt-12 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`bg-gradient-to-br ${colors.bg} rounded-xl p-8 border border-gray-700 text-center text-white`}
          >
            <Icon className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-2xl font-bold mb-2">🚀 {config.title} Coming Soon!</h3>
            <p className="mb-6 opacity-90">{config.description}</p>
            <button className={`${colors.button} ${colors.buttonHover} px-6 py-3 rounded-lg font-medium transition-colors`}>
              Notify Me
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {config.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
