import { useRef, useEffect, useCallback, useState } from 'react'
import type { GraphNode, GraphEdge } from '../types'

const REPULSION = 3500        // maior = nós mais espalhados
const SPRING_K = 0.008
const REST_LENGTH = 180
const DAMPING = 0.82
const MIN_DIST = 1.0
const KE_THRESHOLD = 0.05
const PARTICLE_COUNT = 60
const PARTICLE_COLOR = '#C9A84C'

interface Particle { x: number; y: number; radius: number; age: number; lifetime: number }

interface GraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeClick: (quoteId: string) => void
  onEdgeClick?: (edgeId: string) => void
  onEdgeCreate: (sourceId: string, targetId: string) => void
  onNodeDrag: (nodeId: string, x: number, y: number) => void
  onNodeHover?: (quoteId: string | null, x: number, y: number) => void
}

export function forceDirectedStep(
  nodes: GraphNode[], edges: GraphEdge[], dt: number, width: number, height: number
): GraphNode[] {
  if (nodes.length === 0) return nodes
  const next: GraphNode[] = nodes.map(n => ({ ...n, velocity: { x: n.velocity.x, y: n.velocity.y } }))

  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      const a = next[i], b = next[j]
      const dx = a.x - b.x, dy = a.y - b.y
      let dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MIN_DIST) dist = MIN_DIST
      const force = REPULSION / (dist * dist)
      const fx = (dx / dist) * force * dt, fy = (dy / dist) * force * dt
      a.velocity.x += fx; a.velocity.y += fy
      b.velocity.x -= fx; b.velocity.y -= fy
    }
  }

  for (const edge of edges) {
    const a = next.find(n => n.id === edge.sourceId)
    const b = next.find(n => n.id === edge.targetId)
    if (!a || !b) continue
    const dx = b.x - a.x, dy = b.y - a.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < MIN_DIST) dist = MIN_DIST
    const attraction = SPRING_K * (dist - REST_LENGTH)
    const fx = (dx / dist) * attraction * dt, fy = (dy / dist) * attraction * dt
    a.velocity.x += fx; a.velocity.y += fy
    b.velocity.x -= fx; b.velocity.y -= fy
  }

  // Weak center gravity to prevent nodes drifting off screen
  const cx = width / 2, cy = height / 2
  for (const node of next) {
    node.velocity.x += (cx - node.x) * 0.0003
    node.velocity.y += (cy - node.y) * 0.0003
    node.velocity.x *= DAMPING; node.velocity.y *= DAMPING
    node.x += node.velocity.x; node.y += node.velocity.y
    const r = node.radius
    node.x = Math.max(r, Math.min(width - r, node.x))
    node.y = Math.max(r, Math.min(height - r, node.y))
  }
  return next
}

function kineticEnergy(nodes: GraphNode[]) {
  return nodes.reduce((s, n) => s + n.velocity.x ** 2 + n.velocity.y ** 2, 0)
}

function truncate(text: string, max = 10) {
  return text.length <= max ? text : text.slice(0, max) + '…'
}

function lightenColor(hex: string, amount = 0.35) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount))
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount))
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount))
  return `rgb(${r},${g},${b})`
}

function hexToRgba(hex: string, alpha: number) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff
  return `rgba(${r},${g},${b},${alpha})`
}

function initParticles(w: number, h: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    radius: Math.random() * 1.2 + 0.3,
    age: Math.floor(Math.random() * 80),
    lifetime: 100 + Math.floor(Math.random() * 80),
  }))
}

export default function GraphCanvas({ nodes: propNodes, edges, onNodeClick, onEdgeClick, onEdgeCreate, onNodeDrag, onNodeHover }: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<GraphNode[]>([])
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const simulatingRef = useRef(true)
  const hoveredIdRef = useRef<string | null>(null)
  const dragNodeRef = useRef<GraphNode | null>(null)
  const dragStartedRef = useRef(false)
  const edgeSrcRef = useRef<GraphNode | null>(null)
  const mouseCanvasRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const [size, setSize] = useState({ w: 800, h: 600 })
  
  // Zoom & Pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const panningRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  useEffect(() => {
    const prev = nodesRef.current
    nodesRef.current = propNodes.map(pn => {
      const existing = prev.find(n => n.id === pn.id)
      if (existing) return { ...pn, x: existing.x, y: existing.y, velocity: existing.velocity }
      const w = canvasRef.current?.width ?? 800
      const h = canvasRef.current?.height ?? 600
      // Spread nodes in a circle initially for better layout
      const angle = Math.random() * Math.PI * 2
      const radius = 80 + Math.random() * Math.min(w, h) * 0.35
      return { ...pn, x: w / 2 + Math.cos(angle) * radius, y: h / 2 + Math.sin(angle) * radius, velocity: { x: 0, y: 0 } }
    })
    simulatingRef.current = true
  }, [propNodes])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => { particlesRef.current = initParticles(size.w, size.h) }, [size])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width: W, height: H } = canvas

    if (simulatingRef.current) {
      nodesRef.current = forceDirectedStep(nodesRef.current, edges, 0.06, W, H)
      if (kineticEnergy(nodesRef.current) < KE_THRESHOLD) simulatingRef.current = false
    }

    // Background
    ctx.clearRect(0, 0, W, H)
    const bg = ctx.createRadialGradient(W * 0.4, H * 0.35, 0, W / 2, H / 2, Math.max(W, H) * 0.8)
    bg.addColorStop(0, '#1E1008')
    bg.addColorStop(0.5, '#130A05')
    bg.addColorStop(1, '#080402')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Apply zoom & pan transformation
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    // Subtle grid lines
    ctx.save()
    ctx.strokeStyle = 'rgba(201,168,76,0.03)'
    ctx.lineWidth = 1 / zoom
    const gridSize = 80
    const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize
    const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize
    const endX = startX + (W / zoom) + gridSize * 2
    const endY = startY + (H / zoom) + gridSize * 2
    for (let x = startX; x < endX; x += gridSize) { 
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke() 
    }
    for (let y = startY; y < endY; y += gridSize) { 
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke() 
    }
    ctx.restore()

    // Particles
    const particles = particlesRef.current
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.age++
      if (p.age >= p.lifetime) {
        particles[i] = { x: Math.random() * W, y: Math.random() * H, radius: Math.random() * 1.2 + 0.3, age: 0, lifetime: 100 + Math.floor(Math.random() * 80) }
        continue
      }
      const alpha = Math.sin((p.age * Math.PI) / p.lifetime) * 0.25
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = PARTICLE_COLOR
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    // Edges
    const nodes = nodesRef.current
    for (const edge of edges) {
      const a = nodes.find(n => n.id === edge.sourceId)
      const b = nodes.find(n => n.id === edge.targetId)
      if (!a || !b) continue
      const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2 - 40

      // Gradient edge
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
      grad.addColorStop(0, hexToRgba(a.color || '#C9A84C', 0.5))
      grad.addColorStop(1, hexToRgba(b.color || '#C9A84C', 0.5))

      ctx.save()
      ctx.beginPath(); ctx.moveTo(a.x, a.y)
      ctx.quadraticCurveTo(midX, midY, b.x, b.y)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1 + edge.strength * 1.5
      ctx.stroke()
      ctx.restore()

      if (edge.label) {
        ctx.save()
        ctx.font = '9px "Palatino Linotype", Georgia, serif'
        ctx.fillStyle = 'rgba(201,168,76,0.6)'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(edge.label, midX, midY)
        ctx.restore()
      }
    }

    // Edge-creation preview
    if (edgeSrcRef.current) {
      const src = edgeSrcRef.current
      const { x: mx, y: my } = mouseCanvasRef.current
      ctx.save(); ctx.setLineDash([5, 5])
      ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(mx, my)
      ctx.strokeStyle = 'rgba(201,168,76,0.7)'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.restore()
    }

    // Nodes
    for (const node of nodes) {
      const isHovered = hoveredIdRef.current === node.id
      const color = node.color || '#C9A84C'
      const r = node.radius

      // Outer glow ring on hover
      if (isHovered) {
        ctx.save()
        ctx.beginPath(); ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2)
        ctx.strokeStyle = hexToRgba(color, 0.25); ctx.lineWidth = 6; ctx.stroke()
        ctx.restore()
      }

      // Shadow/glow
      ctx.save()
      ctx.shadowColor = color
      ctx.shadowBlur = isHovered ? 24 : 10

      // Node fill with radial gradient
      const nodeGrad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r)
      nodeGrad.addColorStop(0, lightenColor(color, 0.4))
      nodeGrad.addColorStop(1, color)

      ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
      ctx.fillStyle = nodeGrad; ctx.fill()
      ctx.shadowBlur = 0

      // Border
      ctx.strokeStyle = lightenColor(color, 0.5); ctx.lineWidth = isHovered ? 2.5 : 1.5; ctx.stroke()
      ctx.restore()

      // Label
      ctx.save()
      ctx.font = `${isHovered ? 'bold ' : ''}9px "Palatino Linotype", Georgia, serif`
      ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(250,247,240,0.9)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 3
      ctx.fillText(truncate(node.label), node.x, node.y)
      ctx.restore()
    }

    // Restore transformation
    ctx.restore()

    rafRef.current = requestAnimationFrame(render)
  }, [edges, zoom, pan])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [render])

  // Transform screen coords to world coords (considering zoom/pan)
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    }
  }, [zoom, pan])

  const getCanvasPos = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = canvasRef.current!.width / rect.width
    const scaleY = canvasRef.current!.height / rect.height
    const screenX = (e.clientX - rect.left) * scaleX
    const screenY = (e.clientY - rect.top) * scaleY
    return screenToWorld(screenX, screenY)
  }, [screenToWorld])

  const hitNode = useCallback((x: number, y: number): GraphNode | null => {
    for (const node of nodesRef.current) {
      const dx = node.x - x, dy = node.y - y
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 4) return node
    }
    return null
  }, [])

  const hitEdge = useCallback((x: number, y: number): GraphEdge | null => {
    const nodes = nodesRef.current
    for (const edge of edges) {
      const a = nodes.find(n => n.id === edge.sourceId)
      const b = nodes.find(n => n.id === edge.targetId)
      if (!a || !b) continue
      
      // Check distance to quadratic curve
      const midX = (a.x + b.x) / 2
      const midY = (a.y + b.y) / 2 - 40
      
      // Simple approximation: check distance to 3 points on curve
      for (let t = 0; t <= 1; t += 0.25) {
        const cx = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * midX + t * t * b.x
        const cy = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * midY + t * t * b.y
        const dist = Math.sqrt((cx - x) ** 2 + (cy - y) ** 2)
        if (dist < 8) return edge
      }
    }
    return null
  }, [edges])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMouseMove = (e: MouseEvent) => {
      // Handle panning
      if (panningRef.current) {
        const dx = e.clientX - panStartRef.current.x
        const dy = e.clientY - panStartRef.current.y
        setPan({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        })
        canvas.style.cursor = 'grabbing'
        return
      }

      const { x, y } = getCanvasPos(e)
      mouseCanvasRef.current = { x, y }
      const hit = hitNode(x, y)
      const prevHovered = hoveredIdRef.current
      hoveredIdRef.current = hit ? hit.id : null
      canvas.style.cursor = hit ? 'pointer' : 'default'

      if (hit?.id !== prevHovered) {
        onNodeHover?.(hit ? hit.quoteId : null, e.clientX, e.clientY)
      }

      if (dragNodeRef.current) {
        dragStartedRef.current = true
        const node = nodesRef.current.find(n => n.id === dragNodeRef.current!.id)
        if (node) { node.x = x; node.y = y; node.velocity = { x: 0, y: 0 }; onNodeDrag(node.id, x, y) }
        simulatingRef.current = false
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      // Right click or space+click = pan
      if (e.button === 2) {
        e.preventDefault()
        panningRef.current = true
        panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
        canvas.style.cursor = 'grabbing'
        return
      }

      const { x, y } = getCanvasPos(e)
      const hit = hitNode(x, y)
      if (!hit) return
      if (e.shiftKey) { edgeSrcRef.current = hit; dragNodeRef.current = null }
      else { dragNodeRef.current = hit; dragStartedRef.current = false; edgeSrcRef.current = null }
    }

    const onMouseUp = (e: MouseEvent) => {
      if (panningRef.current) {
        panningRef.current = false
        canvas.style.cursor = 'default'
        return
      }

      const { x, y } = getCanvasPos(e)
      const hit = hitNode(x, y)
      const hitEdgeResult = hitEdge(x, y)
      
      if (edgeSrcRef.current) {
        if (hit && hit.id !== edgeSrcRef.current.id) onEdgeCreate(edgeSrcRef.current.quoteId, hit.quoteId)
        edgeSrcRef.current = null
      } else if (dragNodeRef.current) {
        if (!dragStartedRef.current) onNodeClick(dragNodeRef.current.quoteId)
        dragNodeRef.current = null; dragStartedRef.current = false; simulatingRef.current = true
      } else if (hitEdgeResult && onEdgeClick) {
        // Clicked on edge
        onEdgeClick(hitEdgeResult.id)
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = -e.deltaY * 0.001
      const newZoom = Math.max(0.3, Math.min(3, zoom + delta))
      
      // Zoom towards mouse position
      const rect = canvas.getBoundingClientRect()
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width)
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height)
      
      const worldX = (mouseX - pan.x) / zoom
      const worldY = (mouseY - pan.y) / zoom
      
      setPan({
        x: mouseX - worldX * newZoom,
        y: mouseY - worldY * newZoom,
      })
      setZoom(newZoom)
    }

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault() // Prevent context menu on right click
    }

    const onMouseLeave = () => {
      hoveredIdRef.current = null
      onNodeHover?.(null, 0, 0)
      panningRef.current = false
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('contextmenu', onContextMenu)
    canvas.addEventListener('mouseleave', onMouseLeave)
    return () => {
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('contextmenu', onContextMenu)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [getCanvasPos, hitNode, hitEdge, onNodeClick, onEdgeClick, onEdgeCreate, onNodeDrag, onNodeHover, zoom, pan])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 400, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      
      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        display: 'flex', flexDirection: 'column', gap: 6,
        background: 'rgba(26,15,10,0.9)', backdropFilter: 'blur(4px)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 8, padding: '8px 6px',
      }}>
        <button
          onClick={() => setZoom(z => Math.min(3, z + 0.2))}
          style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
            color: '#C9A84C', fontSize: 18, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          title="Zoom in"
        >+</button>
        <div style={{
          fontSize: 11, color: 'rgba(201,168,76,0.7)',
          textAlign: 'center', fontFamily: 'monospace',
          padding: '2px 0',
        }}>
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
          style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
            color: '#C9A84C', fontSize: 18, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          title="Zoom out"
        >−</button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
          style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
            color: '#C9A84C', fontSize: 16,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          title="Reset view"
        >⊙</button>
      </div>
    </div>
  )
}
