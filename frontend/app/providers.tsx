'use client'

import { Provider } from 'react-redux'
import { store, persistor } from '@/store/store'
import { PersistGate } from 'redux-persist/integration/react'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  )
}