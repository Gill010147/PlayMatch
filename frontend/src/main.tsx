import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Root from './components/Root'
import { MatchesProvider } from './contexts/MatchesContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MatchesProvider>
      <Root />
    </MatchesProvider>
  </React.StrictMode>,
)



