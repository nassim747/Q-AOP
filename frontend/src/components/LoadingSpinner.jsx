import React from 'react'
import { Loader2, Zap } from 'lucide-react'

function LoadingSpinner({ text = "Loading...", quantum = false }) {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Spinner */}
      <div className="relative">
        {quantum ? (
          <div className="relative">
            {/* Outer quantum ring */}
            <div className="w-16 h-16 border-4 border-quantum-purple/30 border-t-quantum-purple rounded-full animate-spin" />
            {/* Inner quantum ring */}
            <div className="absolute inset-2 w-12 h-12 border-4 border-quantum-pink/30 border-b-quantum-pink rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
            {/* Center quantum symbol */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-6 h-6 text-quantum-purple animate-pulse" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 w-16 h-16 rounded-full animate-glow quantum-glow" />
          </div>
        ) : (
          <Loader2 className="w-12 h-12 text-arctic-blue animate-spin" />
        )}
      </div>
      
      {/* Text */}
      <div className="text-center">
        <p className={`text-lg font-medium ${quantum ? 'text-quantum-purple' : 'text-arctic-blue'}`}>
          {text}
        </p>
        {quantum && (
          <p className="text-sm text-slate-400 mt-1">
            Harnessing quantum superposition...
          </p>
        )}
      </div>
      
      {/* Progress dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full animate-pulse ${quantum ? 'bg-quantum-purple' : 'bg-arctic-blue'}`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default LoadingSpinner 