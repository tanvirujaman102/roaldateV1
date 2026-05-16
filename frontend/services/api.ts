import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken })
          const tokens = response.data?.tokens
          const newToken = tokens?.accessToken
          const newRefreshToken = tokens?.refreshToken

          localStorage.setItem('token', newToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials: { email: string; password: string; twoFactorCode?: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    phone?: string
  }) => api.post('/auth/register', userData),

  googleLogin: (token: string) =>
    api.post('/auth/oauth/google', { token }),

  facebookLogin: (accessToken: string) =>
    api.post('/auth/oauth/facebook', { accessToken }),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  verifyEmail: (token: string) =>
    api.get('/auth/verify-email', { params: { token } }),

  resendEmailVerification: (email: string) =>
    api.post('/auth/resend-email-verification', { email }),

  sendPhoneVerification: (phone: string) =>
    api.post('/auth/send-phone-verification', { phone }),

  verifyPhone: (phone: string, code: string) =>
    api.post('/auth/verify-phone', { phone, code }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  setup2FA: () => api.post('/auth/setup-2fa'),

  verifyAndEnable2FA: (token: string) =>
    api.post('/auth/verify-2fa', { token }),

  disable2FA: (password: string, token?: string) =>
    api.post('/auth/disable-2fa', { password, token }),

  checkToken: () => api.get('/auth/check-token'),

  getMe: () => api.get('/auth/me'),
}

export const postAPI = {
  getPosts: (page = 1, limit = 10) =>
    api.get('/posts', { params: { page, limit } }),

  createPost: (postData: FormData) =>
    api.post('/posts', postData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getPostById: (postId: string) =>
    api.get(`/posts/${postId}`),

  updatePost: (postId: string, data: any) =>
    api.put(`/posts/${postId}`, data),

  deletePost: (postId: string) =>
    api.delete(`/posts/${postId}`),

  likePost: (postId: string) =>
    api.post(`/posts/${postId}/like`),

  unlikePost: (postId: string) =>
    api.delete(`/posts/${postId}/like`),

  commentOnPost: (postId: string, content: string) =>
    api.post(`/posts/${postId}/comments`, { content }),

  sharePost: (postId: string) =>
    api.post(`/posts/${postId}/share`),

  savePost: (postId: string) =>
    api.post(`/posts/${postId}/save`),

  unsavePost: (postId: string) =>
    api.delete(`/posts/${postId}/save`),

  getSavedPosts: () =>
    api.get('/posts/saved'),

  getTrendingPosts: () =>
    api.get('/posts/trending'),

  getUserPosts: (userId: string, page = 1, limit = 10) =>
    api.get(`/posts/user/${userId}`, { params: { page, limit } }),
}

export const chatAPI = {
  getChatRooms: () =>
    api.get('/chat/rooms'),

  getChatRoom: (roomId: string) =>
    api.get(`/chat/rooms/${roomId}`),

  createChatRoom: (participants: string[], name?: string, type = 'private') =>
    api.post('/chat/rooms', { participants, name, type }),

  getMessages: (roomId: string, page = 1, limit = 50) =>
    api.get(`/chat/rooms/${roomId}/messages`, { params: { page, limit } }),

  sendMessage: (roomId: string, content: string, messageType = 'text') =>
    api.post(`/chat/rooms/${roomId}/messages`, { content, messageType }),

  markMessageAsRead: (roomId: string, messageId: string) =>
    api.put(`/chat/rooms/${roomId}/messages/${messageId}/read`),

  markAllAsRead: (roomId: string) =>
    api.put(`/chat/rooms/${roomId}/read-all`),

  deleteMessage: (roomId: string, messageId: string) =>
    api.delete(`/chat/rooms/${roomId}/messages/${messageId}`),

  typingStart: (roomId: string) =>
    api.post(`/chat/rooms/${roomId}/typing`),

  typingStop: (roomId: string) =>
    api.delete(`/chat/rooms/${roomId}/typing`),

  getUnreadCount: () =>
    api.get('/chat/unread-count'),

  searchMessages: (q: string) =>
    api.get('/chat/search', { params: { q } }),
}

export const userAPI = {
  getMe: () =>
    api.get('/users/me'),

  updateProfile: (data: any) =>
    api.put('/users/me', data),

  uploadAvatar: (formData: FormData) =>
    api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getUserById: (userId: string) =>
    api.get(`/users/${userId}`),

  searchUsers: (q: string) =>
    api.get('/users/search', { params: { q } }),

  followUser: (userId: string) =>
    api.post(`/users/${userId}/follow`),

  unfollowUser: (userId: string) =>
    api.delete(`/users/${userId}/follow`),

  getFollowers: (userId: string) =>
    api.get(`/users/${userId}/followers`),

  getFollowing: (userId: string) =>
    api.get(`/users/${userId}/following`),

  blockUser: (userId: string) =>
    api.post(`/users/${userId}/block`),

  unblockUser: (userId: string) =>
    api.delete(`/users/${userId}/block`),

  getBlockedUsers: () =>
    api.get('/users/blocked'),

  deleteAccount: (password: string) =>
    api.delete('/users/me', { data: { password } }),
}

export const datingAPI = {
  getDatingProfile: () =>
    api.get('/dating/profile'),

  updateDatingProfile: (profileData: any) =>
    api.put('/dating/profile', profileData),

  uploadPhotos: (photos: FormData) =>
    api.post('/dating/profile/photos', photos, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getPotentialMatches: () =>
    api.get('/dating/matches'),

  swipeProfile: (profileId: string, action: 'like' | 'pass' | 'super_like') =>
    api.post(`/dating/swipe/${profileId}`, { action }),

  getMatches: () =>
    api.get('/dating/my-matches'),

  getMatchDetails: (matchId: string) =>
    api.get(`/dating/my-matches/${matchId}`),

  unmatch: (matchId: string) =>
    api.delete(`/dating/my-matches/${matchId}`),

  getPreferences: () =>
    api.get('/dating/preferences'),

  updatePreferences: (preferences: any) =>
    api.put('/dating/preferences', preferences),

  getStats: () =>
    api.get('/dating/stats'),
}

export const notificationAPI = {
  getNotifications: (page = 1, limit = 20) =>
    api.get('/notifications', { params: { page, limit } }),

  getUnreadCount: () =>
    api.get('/notifications/unread-count'),

  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    api.put('/notifications/read-all'),

  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),

  updateSettings: (settings: any) =>
    api.put('/notifications/settings', settings),
}

export const walletAPI = {
  getBalance: () =>
    api.get('/wallet/balance'),

  getTransactions: (page = 1, limit = 20) =>
    api.get('/wallet/transactions', { params: { page, limit } }),

  addFunds: (amount: number, paymentMethod: string) =>
    api.post('/wallet/add-funds', { amount, paymentMethod }),

  sendMoney: (recipientId: string, amount: number, message?: string) =>
    api.post('/wallet/send', { recipientId, amount, message }),

  getSubscriptionPlans: () =>
    api.get('/wallet/subscriptions/plans'),

  getSubscriptionStatus: () =>
    api.get('/wallet/subscriptions/status'),
}

export const partyAPI = {
  getPartyRooms: () =>
    api.get('/party'),

  createPartyRoom: (data: any) =>
    api.post('/party', data),

  getPartyRoom: (partyId: string) =>
    api.get(`/party/${partyId}`),

  joinPartyRoom: (partyId: string, password?: string) =>
    api.post(`/party/${partyId}/join`, { password }),

  leavePartyRoom: (partyId: string) =>
    api.post(`/party/${partyId}/leave`),

  getMyRooms: () =>
    api.get('/party/my-rooms'),
}

export default api
