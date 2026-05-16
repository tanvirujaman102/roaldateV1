'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import FacebookLogin from '@greatsumini/react-facebook-login'
import toast from 'react-hot-toast'
import { loginUser, googleLogin, facebookLogin, clearError } from '@/store/slices/authSlice'
import { AppDispatch, RootState } from '@/store/store'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  twoFactorCode: yup.string().optional(),
})

interface LoginFormData {
  email: string
  password: string
  twoFactorCode?: string
}

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [isSocialLoading, setIsSocialLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser(data)).unwrap()
      toast.success('Login successful!')
    } catch (error: any) {
      if (typeof error === 'string' && error.includes('2FA')) {
        setShowTwoFactor(true)
      }
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsSocialLoading(true)
    try {
      await dispatch(googleLogin(credentialResponse.credential)).unwrap()
      toast.success('Google login successful!')
    } catch (error: any) {
      toast.error(error || 'Google login failed')
    } finally {
      setIsSocialLoading(false)
    }
  }

  const handleFacebookSuccess = async (response: any) => {
    setIsSocialLoading(true)
    try {
      await dispatch(facebookLogin(response.accessToken)).unwrap()
      toast.success('Facebook login successful!')
    } catch (error: any) {
      toast.error(error || 'Facebook login failed')
    } finally {
      setIsSocialLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-white mb-2"
            >
              RoalDate
            </motion.h1>
            <p className="text-gray-300">Welcome back! Please login to your account.</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed')}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
                width="100%"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
              <FacebookLogin
                appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id'}
                onSuccess={handleFacebookSuccess}
                onFail={(error) => toast.error('Facebook login failed')}
                render={({ onClick }) => (
                  <button
                    onClick={onClick}
                    disabled={isSocialLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Continue with Facebook</span>
                  </button>
                )}
              />
            </motion.div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-300">Or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            {/* 2FA Code Field */}
            <AnimatePresence>
              {showTwoFactor && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Two-Factor Authentication Code
                  </label>
                  <input
                    {...register('twoFactorCode')}
                    type="text"
                    maxLength={6}
                    className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter 6-digit code"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition duration-200">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || isSocialLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition duration-200">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
