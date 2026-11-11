import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('[engram] #root not found in index.html')
}

ReactDOM.createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
