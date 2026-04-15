import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState<'fade-in' | 'fade-out'>('fade-in')

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fade-out')
    }
  }, [location, displayLocation])

  return (
    <div
      style={{
        animation: transitionStage === 'fade-in' ? 'fadeIn 0.3s ease' : 'fadeOut 0.2s ease',
      }}
      onAnimationEnd={() => {
        if (transitionStage === 'fade-out') {
          setTransitionStage('fade-in')
          setDisplayLocation(location)
        }
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      {children}
    </div>
  )
}
