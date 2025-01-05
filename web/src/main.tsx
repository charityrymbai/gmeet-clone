import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './utils/WebsocketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebSocketProvider>
    <Suspense fallback={<>Loading..........</>}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
    </WebSocketProvider>
  </StrictMode>,
)
