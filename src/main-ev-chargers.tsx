import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import EVChargersApp from './EVChargersApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/ev-chargers">
      <EVChargersApp />
    </BrowserRouter>
  </StrictMode>,
)
