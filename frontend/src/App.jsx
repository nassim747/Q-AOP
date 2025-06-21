import React, { useState, useEffect } from 'react'
import { Zap, Navigation, Clock, Fuel, Cpu, Snowflake, Settings } from 'lucide-react'
import ArcticMap from './components/ArcticMap'
import KPIPanel from './components/KPIPanel'
import QuantumToggle from './components/QuantumToggle'
import LoadingSpinner from './components/LoadingSpinner'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  console.log('[Q-AOP] App component rendering.');
  const [networkData, setNetworkData] = useState(null)
  const [optimizationResult, setOptimizationResult] = useState(null)
  const [isQuantumMode, setIsQuantumMode] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState(null)

  // Load network data on mount
  useEffect(() => {
    console.log('[Q-AOP] useEffect for loadNetworkData triggered.');
    loadNetworkData()
  }, [])

  const loadNetworkData = async () => {
    console.debug('[Q-AOP] Fetching network JSON …')
    try {
      const response = await fetch('/data/arctic_net_50.json')
      console.log('[Q-AOP] Fetched public data response:', response);
      if (!response.ok) throw new Error('Failed to load network data')
      const data = await response.json()
      console.log('[Q-AOP] Parsed network data:', data);
      console.debug('[Q-AOP] Network loaded', { nodes: data?.nodes?.length, edges: data?.edges?.length })
      setNetworkData(data)
    } catch (err) {
      setError('Failed to load Arctic network data')
      console.error('Network loading error:', err)
    }
  }

  const runOptimization = async (quantumMode = false) => {
    if (!networkData) {
      console.error('[Q-AOP] runOptimization called but networkData is null.');
      return;
    }

    console.log(`[Q-AOP] Running optimization with mode: ${quantumMode ? 'quantum' : 'classical'}`);
    console.log(`[Q-AOP] API Endpoint: ${API_BASE_URL}/optimize`);
    const payload = {
      network: networkData,
      mode: quantumMode ? 'quantum' : 'classical'
    };
    console.log('[Q-AOP] Sending payload:', payload);

    setIsOptimizing(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      console.log('[Q-AOP] Received response from /optimize:', response);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Q-AOP] Optimization failed! Status:', response.status, 'Body:', errorBody);
        throw new Error(`Optimization failed: ${response.status} ${response.statusText} - ${errorBody}`)
      }

      const result = await response.json()
      console.log('[Q-AOP] Parsed optimization result:', result);
      console.debug('[Q-AOP] Optimization result received', result)
      setOptimizationResult(result)
    } catch (err) {
      setError(`Optimization error: ${err.message}`)
      console.error('Optimization error:', err)
    } finally {
      console.debug('[Q-AOP] Optimization finished')
      setIsOptimizing(false)
    }
  }

  const handleQuantumToggle = async (enabled) => {
    console.log(`[Q-AOP] Quantum toggle changed to: ${enabled}`);
    setIsQuantumMode(enabled)
    await runOptimization(enabled)
  }

  // Auto-run classical optimization when data loads
  useEffect(() => {
    if (networkData && !optimizationResult) {
      console.log('[Q-AOP] useEffect for initial optimization run triggered.');
      runOptimization(false)
    }
  }, [networkData])

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-arctic-blue/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-quantum-purple/10 via-transparent to-transparent" />
      
      {/* Header */}
      <header className="relative z-20 p-6 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg quantum-gradient">
                <Snowflake className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-arctic-blue to-quantum-purple bg-clip-text text-transparent">
                  Q-AOP
                </h1>
                <p className="text-sm text-slate-400">Quantum-Assisted Arctic Operations</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <QuantumToggle 
              enabled={isQuantumMode}
              onChange={handleQuantumToggle}
              disabled={isOptimizing}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Map Area */}
        <div className="flex-1 relative">
          {networkData ? (
            <ArcticMap 
              networkData={networkData}
              optimizationResult={optimizationResult}
              isQuantumMode={isQuantumMode}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner text="Loading Arctic Network..." />
            </div>
          )}
          
          {/* Loading Overlay */}
          {isOptimizing && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
              <LoadingSpinner 
                text={isQuantumMode ? "Quantum optimization in progress..." : "Optimizing routes..."}
                quantum={isQuantumMode}
              />
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-96 p-6 glass-panel m-4 mr-6 overflow-y-auto">
          <KPIPanel 
            result={optimizationResult}
            isQuantumMode={isQuantumMode}
            isOptimizing={isOptimizing}
            networkSize={networkData?.nodes?.length || 0}
          />
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4" />
              <span>Arctic Logistics Network</span>
            </div>
            {networkData && (
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>{networkData.nodes.length} nodes, {networkData.edges.length} edges</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOptimizing ? 'bg-yellow-400 animate-pulse' : optimizationResult ? 'bg-green-400' : 'bg-slate-400'}`} />
            <span>
              {isOptimizing ? 'Optimizing...' : optimizationResult ? 'Ready' : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 