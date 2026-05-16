import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface DatingProfile {
  _id: string
  user: {
    _id: string
    username: string
    avatar?: string
    age: number
    location: string
  }
  bio: string
  interests: string[]
  lookingFor: string[]
  ageRange: {
    min: number
    max: number
  }
  maxDistance: number
  photos: string[]
  verificationStatus: 'pending' | 'verified' | 'rejected'
  isPremium: boolean
  lastActive: string
}

interface Match {
  _id: string
  users: string[]
  matchedAt: string
  conversationId?: string
  isSuperMatch: boolean
}

interface DatingState {
  profiles: DatingProfile[]
  currentProfile: DatingProfile | null
  matches: Match[]
  likes: string[]
  passes: string[]
  superLikes: string[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  filters: {
    ageRange: { min: number; max: number }
    maxDistance: number
    interests: string[]
  }
}

const initialState: DatingState = {
  profiles: [],
  currentProfile: null,
  matches: [],
  likes: [],
  passes: [],
  superLikes: [],
  isLoading: false,
  error: null,
  hasMore: true,
  filters: {
    ageRange: { min: 18, max: 100 },
    maxDistance: 50,
    interests: [],
  },
}

const datingSlice = createSlice({
  name: 'dating',
  initialState,
  reducers: {
    setProfiles: (state, action: PayloadAction<DatingProfile[]>) => {
      state.profiles = action.payload
    },
    addProfiles: (state, action: PayloadAction<DatingProfile[]>) => {
      state.profiles.push(...action.payload)
    },
    setCurrentProfile: (state, action: PayloadAction<DatingProfile | null>) => {
      state.currentProfile = action.payload
    },
    setMatches: (state, action: PayloadAction<Match[]>) => {
      state.matches = action.payload
    },
    addMatch: (state, action: PayloadAction<Match>) => {
      state.matches.unshift(action.payload)
    },
    setLikes: (state, action: PayloadAction<string[]>) => {
      state.likes = action.payload
    },
    addLike: (state, action: PayloadAction<string>) => {
      state.likes.push(action.payload)
    },
    setPasses: (state, action: PayloadAction<string[]>) => {
      state.passes = action.payload
    },
    addPass: (state, action: PayloadAction<string>) => {
      state.passes.push(action.payload)
    },
    setSuperLikes: (state, action: PayloadAction<string[]>) => {
      state.superLikes = action.payload
    },
    addSuperLike: (state, action: PayloadAction<string>) => {
      state.superLikes.push(action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<DatingState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    removeProfile: (state, action: PayloadAction<string>) => {
      state.profiles = state.profiles.filter(profile => profile._id !== action.payload)
    },
  },
})

export const {
  setProfiles,
  addProfiles,
  setCurrentProfile,
  setMatches,
  addMatch,
  setLikes,
  addLike,
  setPasses,
  addPass,
  setSuperLikes,
  addSuperLike,
  setLoading,
  setError,
  setHasMore,
  setFilters,
  removeProfile,
} = datingSlice.actions

export default datingSlice.reducer
