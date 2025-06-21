import React, { useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { ScatterplotLayer, PathLayer, TextLayer } from '@deck.gl/layers'
import { Map } from 'react-map-gl'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' // Public demo token

const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 70,
  zoom: 3.5,
  pitch: 45,
  bearing: 0
}

function ArcticMap({ networkData, optimizationResult, isQuantumMode }) {
  const layers = useMemo(() => {
    if (!networkData) return []

    const nodeLayers = []
    const pathLayers = []

    // Node visualization
    const nodeLayer = new ScatterplotLayer({
      id: 'arctic-nodes',
      data: networkData.nodes,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 1000,
      radiusMinPixels: 8,
      radiusMaxPixels: 20,
      lineWidthMinPixels: 2,
      getPosition: d => [d.lon, d.lat],
      getRadius: 12,
      getFillColor: isQuantumMode ? [139, 92, 246, 200] : [14, 165, 233, 200], // quantum purple or arctic blue
      getLineColor: [255, 255, 255, 255],
      getLineWidth: 2,
      updateTriggers: {
        getFillColor: [isQuantumMode]
      },
      transitions: {
        getFillColor: 500
      }
    })

    nodeLayers.push(nodeLayer)

    // Route visualization if optimization result exists
    if (optimizationResult && optimizationResult.route) {
      const routeCoordinates = optimizationResult.route.map(nodeId => {
        const node = networkData.nodes.find(n => n.id === nodeId)
        return node ? [node.lon, node.lat] : null
      }).filter(Boolean)

      if (routeCoordinates.length > 1) {
        const routeLayer = new PathLayer({
          id: 'optimized-route',
          data: [{ path: routeCoordinates }],
          pickable: true,
          widthScale: 1,
          widthMinPixels: 4,
          widthMaxPixels: 8,
          getPath: d => d.path,
          getColor: isQuantumMode ? [236, 72, 153, 255] : [34, 197, 94, 255], // quantum pink or green
          getWidth: 6,
          updateTriggers: {
            getColor: [isQuantumMode]
          },
          transitions: {
            getColor: 500
          }
        })

        pathLayers.push(routeLayer)

        // Add animated flow effect
        const flowLayer = new PathLayer({
          id: 'route-flow',
          data: [{ path: routeCoordinates }],
          pickable: false,
          widthScale: 1,
          widthMinPixels: 2,
          widthMaxPixels: 4,
          getPath: d => d.path,
          getColor: isQuantumMode ? [236, 72, 153, 100] : [34, 197, 94, 100],
          getWidth: 3,
          dashJustified: true,
          getDashArray: [10, 5],
          updateTriggers: {
            getColor: [isQuantumMode]
          }
        })

        pathLayers.push(flowLayer)
      }
    }

    // Network edges (faded background)
    if (networkData.edges) {
      const edgeLayer = new PathLayer({
        id: 'network-edges',
        data: networkData.edges.map(edge => {
          const sourceNode = networkData.nodes.find(n => n.id === edge.source)
          const targetNode = networkData.nodes.find(n => n.id === edge.target)
          if (sourceNode && targetNode) {
            return {
              path: [[sourceNode.lon, sourceNode.lat], [targetNode.lon, targetNode.lat]],
              distance: edge.distance_nm
            }
          }
          return null
        }).filter(Boolean),
        pickable: false,
        widthScale: 1,
        widthMinPixels: 1,
        widthMaxPixels: 2,
        getPath: d => d.path,
        getColor: [100, 116, 139, 50], // very faded
        getWidth: 1
      })

      pathLayers.unshift(edgeLayer) // Add at beginning so it renders behind
    }

    // Add labels for major nodes
    const labelLayer = new TextLayer({
      id: 'node-labels',
      data: networkData.nodes.filter((_, i) => i % 8 === 0), // Show every 8th node label
      pickable: false,
      getPosition: d => [d.lon, d.lat],
      getText: d => `N${d.id}`,
      getSize: 12,
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      getColor: [255, 255, 255, 180],
      getPixelOffset: [0, -25]
    })

    return [...pathLayers, ...nodeLayers, labelLayer]
  }, [networkData, optimizationResult, isQuantumMode])

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      getTooltip={({ object }) => {
        if (object) {
          if (object.id !== undefined) {
            return `Node ${object.id}\nLat: ${object.lat.toFixed(3)}°\nLon: ${object.lon.toFixed(3)}°`
          }
          if (object.distance) {
            return `Edge\nDistance: ${object.distance.toFixed(1)} nm`
          }
        }
        return null
      }}
    >
      <Map 
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v10"
        preventStyleDiffing={true}
      />
      
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 glass-panel p-4 space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isQuantumMode ? 'quantum-gradient' : 'arctic-gradient'}`} />
          <span className="text-sm font-medium">
            {isQuantumMode ? 'Quantum Mode' : 'Classical Mode'}
          </span>
        </div>
        
        {optimizationResult && (
          <div className="text-xs text-slate-300 space-y-1">
            <div>Route: {optimizationResult.route.length} nodes</div>
            <div>Distance: {optimizationResult.fuel_nm} nm</div>
            <div>Time: {optimizationResult.block_time_h.toFixed(1)}h</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-panel p-4 space-y-2">
        <div className="text-sm font-medium mb-2">Legend</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-slate-400/50" />
            <span>Network Edges</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isQuantumMode ? 'bg-quantum-purple' : 'bg-arctic-blue'}`} />
            <span>Arctic Stations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-1 ${isQuantumMode ? 'bg-quantum-pink' : 'bg-green-400'}`} />
            <span>Optimized Route</span>
          </div>
        </div>
      </div>
    </DeckGL>
  )
}

export default ArcticMap 