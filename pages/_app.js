import { useEffect } from 'react'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  // Enregistrer le service worker (PWA) en production uniquement,
  // pour ne pas mettre en cache les ressources du serveur de dev.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Enregistrement impossible (contexte non sécurisé…) : ignorer
    })
  }, [])

  return <Component {...pageProps} />
}
