import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Post {
  _id: string
  content: string
  author: {
    _id: string
    username: string
    avatar?: string
  }
  media?: Array<{
    type: 'image' | 'video' | 'audio'
    url: string
    thumbnail?: string
  }>
  likes: Array<{
    user: string
    timestamp: string
  }>
  comments: Array<{
    _id: string
    content: string
    author: {
      _id: string
      username: string
      avatar?: string
    }
    timestamp: string
  }>
  shares: number
  tags: string[]
  location?: string
  feeling?: string
  isLiked: boolean
  isSaved: boolean
  timestamp: string
  updatedAt: string
}

interface Story {
  _id: string
  author: {
    _id: string
    username: string
    avatar?: string
  }
  media: {
    type: 'image' | 'video'
    url: string
    thumbnail?: string
  }
  viewers: string[]
  timestamp: string
  expiresAt: string
  isViewed: boolean
}

interface SocialState {
  posts: Post[]
  stories: Story[]
  currentPost: Post | null
  loading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
}

const initialState: SocialState = {
  posts: [],
  stories: [],
  currentPost: null,
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
}

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload
    },
    addPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts.push(...action.payload)
    },
    updatePost: (state, action: PayloadAction<{ id: string; updates: Partial<Post> }>) => {
      const index = state.posts.findIndex(post => post._id === action.payload.id)
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload.updates }
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(post => post._id !== action.payload)
    },
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload
    },
    setStories: (state, action: PayloadAction<Story[]>) => {
      state.stories = action.payload
    },
    addStory: (state, action: PayloadAction<Story>) => {
      state.stories.unshift(action.payload)
    },
    updateStory: (state, action: PayloadAction<{ id: string; updates: Partial<Story> }>) => {
      const index = state.stories.findIndex(story => story._id === action.payload.id)
      if (index !== -1) {
        state.stories[index] = { ...state.stories[index], ...action.payload.updates }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    incrementPage: (state) => {
      state.currentPage += 1
    },
  },
})

export const {
  setPosts,
  addPosts,
  updatePost,
  deletePost,
  setCurrentPost,
  setStories,
  addStory,
  updateStory,
  setLoading,
  setError,
  setHasMore,
  setCurrentPage,
  incrementPage,
} = socialSlice.actions

export default socialSlice.reducer
