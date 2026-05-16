import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  _id: string
  type: 'like' | 'comment' | 'share' | 'follow' | 'message' | 'match' | 'mention' | 'system'
  title: string
  message: string
  from: {
    _id: string
    username: string
    avatar?: string
  }
  relatedObject?: {
    type: 'post' | 'comment' | 'user' | 'message'
    id: string
  }
  isRead: boolean
  timestamp: string
  actionUrl?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  settings: {
    push: boolean
    email: boolean
    inApp: boolean
    types: {
      likes: boolean
      comments: boolean
      shares: boolean
      follows: boolean
      messages: boolean
      matches: boolean
      mentions: boolean
      system: boolean
    }
  }
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  settings: {
    push: true,
    email: true,
    inApp: true,
    types: {
      likes: true,
      comments: true,
      shares: true,
      follows: true,
      messages: true,
      matches: true,
      mentions: true,
      system: true,
    },
  },
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.isRead).length
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload)
      if (notification && !notification.isRead) {
        notification.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n._id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications.splice(index, 1)
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updateSettings: (state, action: PayloadAction<Partial<NotificationState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    updateNotificationTypes: (state, action: PayloadAction<Partial<NotificationState['settings']['types']>>) => {
      state.settings.types = { ...state.settings.types, ...action.payload }
    },
  },
})

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setUnreadCount,
  setLoading,
  setError,
  updateSettings,
  updateNotificationTypes,
} = notificationSlice.actions

export default notificationSlice.reducer
