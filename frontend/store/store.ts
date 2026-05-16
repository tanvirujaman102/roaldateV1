import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import { combineReducers } from '@reduxjs/toolkit'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import chatReducer from './slices/chatSlice'
import socialReducer from './slices/socialSlice'
import datingReducer from './slices/datingSlice'
import notificationReducer from './slices/notificationSlice'

const createNoopStorage = () => ({
  getItem() { return Promise.resolve(null) },
  setItem(_key: string, value: string) { return Promise.resolve(value) },
  removeItem() { return Promise.resolve() },
})

const storage = typeof window !== 'undefined'
  ? createWebStorage('local')
  : createNoopStorage()

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'auth',
    'user',
    'settings',
    'theme'
  ],
  blacklist: [
    'posts',
    'chat',
    'notifications',
    'ui'
  ],
  debug: process.env.NODE_ENV === 'development'
}

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  chat: chatReducer,
  social: socialReducer,
  dating: datingReducer,
  notification: notificationReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const persistor = persistStore(store)
