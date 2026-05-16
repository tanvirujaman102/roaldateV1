'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  RadioIcon,
  HeartIcon,
  BellIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { logout } from '@/store/slices/authSlice'
import { motion } from 'framer-motion'

interface NavItem {
  name: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  href: string
  badge?: number
}

export default function Navigation() {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems: NavItem[] = [
    { name: 'Home', icon: HomeIcon, href: '/', badge: undefined },
    { name: 'Chat', icon: ChatBubbleLeftRightIcon, href: '/login/messages', badge: 0 },
    { name: 'Party', icon: UserGroupIcon, href: '/login/party', badge: 0 },
    { name: 'Random Call', icon: RadioIcon, href: '/login/random-call', badge: undefined },
    { name: 'Date', icon: HeartIcon, href: '/login/dating', badge: undefined },
    { name: 'Notification', icon: BellIcon, href: '/login/notifications', badge: 0 },
    { name: 'Profile', icon: UserCircleIcon, href: '/login/profile', badge: undefined },
  ]

  const handleLogout = () => {
    dispatch(logout())
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 md:hidden bg-gray-800 text-white rounded-lg border border-gray-700"
      >
        {sidebarOpen ? (
          <XMarkIcon className="h-5 w-5" />
        ) : (
          <Bars3Icon className="h-5 w-5" />
        )}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-700 md:static md:translate-x-0 overflow-y-auto"
      >
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-700 sticky top-0 bg-gray-900">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              RoalDate
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/50'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-700 space-y-4 bg-gray-900 sticky bottom-0">
            <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="mr-2 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
