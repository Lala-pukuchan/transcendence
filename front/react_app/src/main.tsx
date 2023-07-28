import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	//TODO: 開発時は付けておき，本番環境では外す
	// <React.StrictMode>
		<App />
	// </React.StrictMode>,
)
