import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authAPI } from '@/services/api'

interface User {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isTwoFactorEnabled: boolean
  role: string
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; twoFactorCode?: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    phone?: string
  }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed')
    }
  }
)

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.googleLogin(token)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Google login failed')
    }
  }
)

export const facebookLogin = createAsyncThunk(
  'auth/facebookLogin',
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.facebookLogin(accessToken)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Facebook login failed')
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState }
      const response = await authAPI.refreshToken(state.auth.refreshToken)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Token refresh failed')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout()
      return {}
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Logout failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.tokens?.accessToken || action.payload.token || null
      state.refreshToken = action.payload.tokens?.refreshToken || action.payload.refreshToken || null
      state.isAuthenticated = true
      state.error = null
    },
    clearCredentials: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.tokens?.accessToken || action.payload.token || null
        state.refreshToken = action.payload.tokens?.refreshToken || action.payload.refreshToken || null
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.tokens?.accessToken || action.payload.token || null
        state.refreshToken = action.payload.tokens?.refreshToken || action.payload.refreshToken || null
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.tokens?.accessToken || action.payload.token || null
        state.refreshToken = action.payload.tokens?.refreshToken || action.payload.refreshToken || null
        state.isAuthenticated = true
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Facebook Login
      .addCase(facebookLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(facebookLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.tokens?.accessToken || action.payload.token || null
        state.refreshToken = action.payload.tokens?.refreshToken || action.payload.refreshToken || null
        state.isAuthenticated = true
      })
      .addCase(facebookLogin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.tokens?.accessToken || action.payload.token || null
        state.refreshToken = action.payload.tokens?.refreshToken || action.payload.refreshToken || null
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError, setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
