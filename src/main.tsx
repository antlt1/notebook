import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyStoredTheme } from '@/utils/theme'

// Áp theme trước lần render đầu để không nháy trắng với người dùng chọn dark.
applyStoredTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
