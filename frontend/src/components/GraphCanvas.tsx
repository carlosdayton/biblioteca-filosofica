import { useEffect, useRef, useCallback } from 'react'
import { Quote } from '../types'
import { ManualConnection, connectionService } from '../services/ConnectionService'
import { colors, fonts } from '../styles/theme'

interface Node {
  id: string
  quote: Quote
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface Edge {
  source: Node
  target: Node
  strength: number
  label?: string
  isManual: boolean
}

interface GraphCanvasProps {
  quotes: Quote[]
  manualConnections: ManualConnection[]
  selectedId: string | null
  onSelectQuote: (id: string) => void
  minSimilarity?: number
}

const TAG_COLORS = [
  '#C9A84C', '#8B7355', '#6B8E6B', '#7B6B8E',
  '#8E6B6B', '#4A7B8E', '#6B8E7B', '#8E6B7B',
  '#7B8E4A', '#8E8A4A', '#6B6B8E', '#4A8E6B',
]

function getNodeColor(quote: Quote): string {
  if (quote.tags.length === 0) return colors.brownLight
  // Cor baseada na primeira tag
  const tagIndex = parseInt(quote.tags[0].id.replace('tag-', '')) - 1
  return TAG_COLORS[tagIndex % TAG_COLORS.length] ?? colors.gold
}

export default function GraphCanvas({
  quotes,
  manualConnections,
  selectedId,
  onSelectQuote,
  minSimilarity = 0.2,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const animRef = useRef<number>(0)
  const dragRef = useRef<{ node: Node; offsetX: number; offsetY: number } | null>(null)
  const hoveredRef = useRef<Node | null>(null)

  // Inicializar nós e arestas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width
    const H = canvas.height

    // Criar nós em posições aleatórias
    const nodes: Node[] = quotes.map((q) => ({
      id: q.id,
      quote: q,
      x: 80 + Math.random() * (W - 160),
      y: 80 + Math.random() * (H - 160),
      vx: 0,
      vy: 0,
      radius: q.isFavorite ? 22 : 16,
    }))

    // Criar arestas automáticas por similaridade de tags
    const autoEdges: Edge[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sim = connectionService.tagSimilarity(nodes[i].quote, nodes[j].quote)
        if (sim >= minSimilarity) {
          autoEdges.push({
            source: nodes[i],
            target: nodes[j],
            strength: sim,
            isManual: false,
          })
        }
      }
    }

    // Criar arestas manuais
    const manualEdges: Edge[] = manualConnections
      .map(conn => {
        const src = nodes.find(n => n.id === conn.sourceQuoteId)
        const tgt = nodes.find(n => n.id === conn.targetQuoteId)
        if (!src || !tgt) return null
        return {
          source: src,
          target: tgt,
          strength: 1,
          label: conn.label,
          isManual: true,
        } as Edge
      })
      .filter((e): e is Edge => e !== null)

    nodesRef.current = nodes
    edgesRef.current = [...autoEdges, ...manualEdges]
  }, [quotes, manualConnections, minSimilarity])

  // Loop de física + renderização
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const nodes = nodesRef.current
    const edges = edgesRef.current

    // ── Física ──────────────────────────────────────────────────────────────
    const REPULSION = 3500
    const ATTRACTION = 0.012
    const DAMPING = 0.82
    const CENTER_PULL = 0.003

    // Repulsão entre nós
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = REPULSION / (dist * dist)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        nodes[i].vx -= fx
        nodes[i].vy -= fy
        nodes[j].vx += fx
        nodes[j].vy += fy
      }
    }

    // Atração pelas arestas
    for (const edge of edges) {
      const dx = edge.target.x - edge.source.x
      const dy = edge.target.y - edge.source.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const idealDist = edge.isManual ? 160 : 200 - edge.strength * 80
      const force = (dist - idealDist) * ATTRACTION * edge.strength
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      edge.source.vx += fx
      edge.source.vy += fy
      edge.target.vx -= fx
      edge.target.vy -= fy
    }

    // Atração ao centro
    for (const node of nodes) {
      node.vx += (W / 2 - node.x) * CENTER_PULL
      node.vy += (H / 2 - node.y) * CENTER_PULL
    }

    // Integrar posições
    for (const node of nodes) {
      if (dragRef.current?.node === node) continue
      node.vx *= DAMPING
      node.vy *= DAMPING
      node.x += node.vx
      node.y += node.vy
      // Limites
      node.x = Math.max(node.radius + 4, Math.min(W - node.radius - 4, node.x))
      node.y = Math.max(node.radius + 4, Math.min(H - node.radius - 4, node.y))
    }

    // ── Renderização ─────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H)

    // Fundo
    ctx.fillStyle = '#0D0705'
    ctx.fillRect(0, 0, W, H)

    // Estrelas de fundo
    ctx.fillStyle = 'rgba(201,168,76,0.15)'
    for (let s = 0; s < 80; s++) {
      const sx = ((s * 137.5) % W)
      const sy = ((s * 97.3) % H)
      const sr = s % 3 === 0 ? 1.5 : 0.8
      ctx.beginPath()
      ctx.arc(sx, sy, sr, 0, Math.PI * 2)
      ctx.fill()
    }

    // Arestas
    for (const edge of edges) {
      const isHighlighted =
        selectedId === edge.source.id || selectedId === edge.target.id

      ctx.beginPath()
      ctx.moveTo(edge.source.x, edge.source.y)
      ctx.lineTo(edge.target.x, edge.target.y)

      if (edge.isManual) {
        ctx.strokeStyle = isHighlighted
          ? 'rgba(245,217,122,0.9)'
          : 'rgba(201,168,76,0.55)'
        ctx.lineWidth = isHighlighted ? 2.5 : 1.5
        ctx.setLineDash([])
      } else {
        const alpha = 0.08 + edge.strength * 0.35
        ctx.strokeStyle = isHighlighted
          ? `rgba(201,168,76,${alpha + 0.3})`
          : `rgba(201,168,76,${alpha})`
        ctx.lineWidth = isHighlighted ? 1.5 : 0.8 + edge.strength * 0.8
        ctx.setLineDash(edge.strength < 0.4 ? [4, 6] : [])
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Label de conexão manual
      if (edge.isManual && edge.label && isHighlighted) {
        const mx = (edge.source.x + edge.target.x) / 2
        const my = (edge.source.y + edge.target.y) / 2
        ctx.font = `11px ${fonts.sans}`
        ctx.fillStyle = 'rgba(245,217,122,0.9)'
        ctx.textAlign = 'center'
        ctx.fillText(edge.label, mx, my - 6)
      }
    }

    // Nós
    for (const node of nodes) {
      const isSelected = node.id === selectedId
      const isHovered = hoveredRef.current?.id === node.id
      const nodeColor = getNodeColor(node.quote)

      // Glow para selecionado
      if (isSelected) {
        const grd = ctx.createRadialGradient(node.x, node.y, node.radius, node.x, node.y, node.radius * 3)
        grd.addColorStop(0, 'rgba(201,168,76,0.4)')
        grd.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Círculo principal
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
      const grd = ctx.createRadialGradient(
        node.x - node.radius * 0.3, node.y - node.radius * 0.3, 0,
        node.x, node.y, node.radius
      )
      grd.addColorStop(0, isSelected ? '#F5D97A' : isHovered ? '#E8C96A' : nodeColor + 'EE')
      grd.addColorStop(1, isSelected ? '#C9A84C' : isHovered ? '#C9A84C' : nodeColor + '88')
      ctx.fillStyle = grd
      ctx.fill()

      // Borda
      ctx.strokeStyle = isSelected
        ? '#F5D97A'
        : isHovered
        ? 'rgba(201,168,76,0.9)'
        : 'rgba(201,168,76,0.4)'
      ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1
      ctx.stroke()

      // Estrela para favoritos
      if (node.quote.isFavorite) {
        ctx.font = '10px serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = isSelected ? '#1A0F0A' : 'rgba(255,255,255,0.9)'
        ctx.fillText('★', node.x, node.y + 4)
      }

      // Label (autor)
      if (isSelected || isHovered) {
        const label = node.quote.author
        ctx.font = `bold 12px ${fonts.sans}`
        ctx.textAlign = 'center'
        const tw = ctx.measureText(label).width
        // Fundo do label
        ctx.fillStyle = 'rgba(13,7,5,0.85)'
        ctx.beginPath()
        ctx.roundRect(node.x - tw / 2 - 6, node.y + node.radius + 4, tw + 12, 20, 4)
        ctx.fill()
        ctx.fillStyle = isSelected ? '#F5D97A' : '#E8C96A'
        ctx.fillText(label, node.x, node.y + node.radius + 18)
      }
    }

    animRef.current = requestAnimationFrame(draw)
  }, [selectedId])

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  // Redimensionar canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // Encontrar nó sob o cursor
  function nodeAt(x: number, y: number): Node | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const cx = x - rect.left
    const cy = y - rect.top
    for (const node of nodesRef.current) {
      const dx = node.x - cx
      const dy = node.y - cy
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 4) return node
    }
    return null
  }

  function handleMouseMove(e: React.MouseEvent) {
    const node = nodeAt(e.clientX, e.clientY)
    hoveredRef.current = node
    const canvas = canvasRef.current
    if (canvas) canvas.style.cursor = node ? 'pointer' : 'grab'

    if (dragRef.current) {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      dragRef.current.node.x = e.clientX - rect.left - dragRef.current.offsetX
      dragRef.current.node.y = e.clientY - rect.top - dragRef.current.offsetY
      dragRef.current.node.vx = 0
      dragRef.current.node.vy = 0
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    const node = nodeAt(e.clientX, e.clientY)
    if (!node) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    dragRef.current = {
      node,
      offsetX: e.clientX - rect.left - node.x,
      offsetY: e.clientY - rect.top - node.y,
    }
  }

  function handleMouseUp(_e: React.MouseEvent) {
    if (dragRef.current) {
      const dx = Math.abs(dragRef.current.node.vx)
      const dy = Math.abs(dragRef.current.node.vy)
      if (dx < 2 && dy < 2) {
        onSelectQuote(dragRef.current.node.id)
      }
      dragRef.current = null
    }
  }

  function handleClick(e: React.MouseEvent) {
    if (dragRef.current) return
    const node = nodeAt(e.clientX, e.clientY)
    if (node) onSelectQuote(node.id)
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    />
  )
}
