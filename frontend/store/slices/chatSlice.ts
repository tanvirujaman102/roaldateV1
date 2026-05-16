import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Message {
  _id: string
  content: string
  sender: string
  chatRoom: string
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file'
  timestamp: string
  read: boolean
}

interface ChatRoom {
  _id: string
  name: string
  type: 'private' | 'group' | 'broadcast'
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  isOnline: boolean
  isTyping: boolean
}

interface ChatState {
  chatRooms: ChatRoom[]
  currentChatRoom: ChatRoom | null
  messages: Message[]
  onlineUsers: string[]
  typingUsers: string[]
  isLoading: boolean
  error: string | null
}

const initialState: ChatState = {
  chatRooms: [],
  currentChatRoom: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  isLoading: false,
  error: null,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatRooms: (state, action: PayloadAction<ChatRoom[]>) => {
      state.chatRooms = action.payload
    },
    setCurrentChatRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.currentChatRoom = action.payload
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<Message> }>) => {
      const index = state.messages.findIndex(msg => msg._id === action.payload.id)
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...action.payload.updates }
      }
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload
    },
    setTypingUsers: (state, action: PayloadAction<string[]>) => {
      state.typingUsers = action.payload
    },
    updateChatRoom: (state, action: PayloadAction<{ id: string; updates: Partial<ChatRoom> }>) => {
      const index = state.chatRooms.findIndex(room => room._id === action.payload.id)
      if (index !== -1) {
        state.chatRooms[index] = { ...state.chatRooms[index], ...action.payload.updates }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setChatRooms,
  setCurrentChatRoom,
  setMessages,
  addMessage,
  updateMessage,
  setOnlineUsers,
  setTypingUsers,
  updateChatRoom,
  setLoading,
  setError,
} = chatSlice.actions

export default chatSlice.reducer
