import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import './index.css'
import App from './App.jsx'
import { ModuleProvider } from './contexts/ModuleContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModuleProvider>
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
    </ModuleProvider>
  </StrictMode>,
)
