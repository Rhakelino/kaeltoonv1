import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ScrollToTop from './components/ScrollToTop'
import BackHandler from './components/BackHandler'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ScrollToTop />
      <BackHandler />
      <App />
    </HashRouter>
  </StrictMode>,
)
