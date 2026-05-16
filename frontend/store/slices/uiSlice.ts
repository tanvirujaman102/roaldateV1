import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  notificationsOpen: boolean
  currentModal: string | null
  loading: boolean
  pageLoading: boolean
}

const initialState: UIState = {
  theme: 'dark',
  sidebarOpen: false,
  mobileMenuOpen: false,
  notificationsOpen: false,
  currentModal: null,
  loading: false,
  pageLoading: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen
    },
    setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationsOpen = action.payload
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.currentModal = action.payload
    },
    closeModal: (state) => {
      state.currentModal = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload
    },
  },
})

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleNotifications,
  setNotificationsOpen,
  openModal,
  closeModal,
  setLoading,
  setPageLoading,
} = uiSlice.actions

export default uiSlice.reducer
