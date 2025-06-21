import React from 'react'
import { Zap, Cpu } from 'lucide-react'

function QuantumToggle({ enabled, onChange, disabled = false }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Cpu className={`w-5 h-5 transition-colors ${enabled ? 'text-slate-400' : 'text-arctic-blue'}`} />
        <span className={`text-sm font-medium transition-colors ${enabled ? 'text-slate-400' : 'text-white'}`}>
          Classical
        </span>
      </div>
      
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-500 
          ${enabled ? 'quantum-gradient shadow-lg shadow-quantum-purple/50' : 'arctic-gradient shadow-lg shadow-arctic-blue/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
          ${enabled ? 'focus:ring-quantum-purple' : 'focus:ring-arctic-blue'}
        `}
        aria-label={`Switch to ${enabled ? 'classical' : 'quantum'} mode`}
      >
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-500
            ${enabled ? 'translate-x-9' : 'translate-x-1'}
            ${!disabled && 'hover:scale-110'}
          `}
        >
          <div className="flex items-center justify-center h-full">
            {enabled ? (
              <Zap className="w-3 h-3 text-quantum-purple" />
            ) : (
              <Cpu className="w-3 h-3 text-arctic-blue" />
            )}
          </div>
        </span>
        
        {/* Glow effect */}
        {enabled && (
          <div className="absolute inset-0 rounded-full animate-glow" />
        )}
      </button>
      
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium transition-colors ${enabled ? 'text-white' : 'text-slate-400'}`}>
          Quantum
        </span>
        <Zap className={`w-5 h-5 transition-colors ${enabled ? 'text-quantum-purple animate-pulse' : 'text-slate-400'}`} />
      </div>
    </div>
  )
}

export default QuantumToggle 