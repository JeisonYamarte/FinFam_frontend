
import { useEffect, useState } from 'react'

import { initializeAuth } from './lib/api/auth.service'

import './App.css'

function App() {
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true

    const bootstrapAuth = async (): Promise<void> => {
      await initializeAuth()

      if (isMounted) {
        setIsInitializing(false)
      }
    }

    void bootstrapAuth()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <div className="text-3xl font-bold underline">
        {isInitializing ? 'inicializando sesión...' : 'holaa mundo'}
      </div>
    </>
  )
}

export default App
