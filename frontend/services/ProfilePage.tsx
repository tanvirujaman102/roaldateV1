'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { motion } from 'framer-motion'
import Navigation from '@/services/Navigation'
import { UserCircleIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function ProfilePageComponent() {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

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
            <UserCircleIcon className="h-8 w-8 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Profile</h2>
              <p className="text-gray-400">Manage your profile settings</p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 mt-12 md:mt-0">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-8 border border-gray-700 mb-8 text-white"
          >
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2">{user?.firstName} {user?.lastName}</h3>
                <p className="text-green-100">@{user?.username}</p>
                <p className="text-green-100">{user?.email}</p>
              </div>
            </div>
          </motion.div>

          {/* Profile Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h4 className="text-xl font-semibold text-white mb-6 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-green-500" />
                Account Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">First Name</label>
                  <input
                    type="text"
                    defaultValue={user?.firstName || ''}
                    disabled
                    className="w-full mt-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Last Name</label>
                  <input
                    type="text"
                    defaultValue={user?.lastName || ''}
                    disabled
                    className="w-full mt-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    disabled
                    className="w-full mt-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors mt-4">
                  Edit Profile
                </button>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button className="w-full flex items-center px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <LockClosedIcon className="h-5 w-5 mr-3 text-blue-500" />
                  <span className="text-white font-medium">Change Password</span>
                </button>
                <button className="w-full flex items-center px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-purple-500" />
                  <span className="text-white font-medium">Privacy Settings</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center"
            >
              <h4 className="text-2xl font-bold text-green-500 mb-2">0</h4>
              <p className="text-gray-400">Profile Views</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center"
            >
              <h4 className="text-2xl font-bold text-blue-500 mb-2">0</h4>
              <p className="text-gray-400">Messages</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center"
            >
              <h4 className="text-2xl font-bold text-pink-500 mb-2">0</h4>
              <p className="text-gray-400">Matches</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center"
            >
              <h4 className="text-2xl font-bold text-yellow-500 mb-2">0</h4>
              <p className="text-gray-400">Notifications</p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
