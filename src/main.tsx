import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { hydrateAuthFromIDB } from './api/authStorage.ts'

// Restaurar tokens desde IndexedDB a localStorage ANTES de que Supabase lea la sesión.
// Sin esto, si el navegador limpió localStorage (común en iOS tras días sin abrir la app),
// el usuario aparece como deslogueado aunque los datos estén en IndexedDB.
hydrateAuthFromIDB().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
