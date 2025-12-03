import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { RecipeProvider } from './context/RecipeContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import { Toaster } from './components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <RecipeProvider>
        <CartProvider>
          <App />
          <Toaster />
        </CartProvider>
      </RecipeProvider>
    </SettingsProvider>
  </React.StrictMode>,
)
