import { useEffect, useRef } from 'react'
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
  // Drag: rastreia se houve movimento real para distinguir de clique
  const dragRef = useRef<{
    node: Node
    startX: number
    startY: number
    moved: boolean
  } | null>(null)
  const hoveredRef = useRef<Node | null>(null)
  // Ref para selectedId para evitar recriar o loop de animação
  const selectedIdRef = useRef<string | null>(selectedId)

  // Sincronizar ref com prop sem recriar o loop
  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  // Inicializar nós e arestas quando quotes/connections/similarity mudam
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Garantir que o canvas tem dimensões reais antes de posicionar nós
    const W = canvas.offsetWidth || 800
    const H = canvas.offsetHeight || 600
    canvas.width = W
    canvas.height = H

    // Preservar posições de nós existentes
    const existingPositions = new Map(nodesRef.current.map(n => [n.id, { x: n.x, y: n.y }]))

    const nodes: Node[] = quotes.map((q) => {
      const existing = existingPositions.get(q.id)
      return {
        id: q.id,
        quote: q,
        x: existing?.x ?? (80 + Math.random() * (W - 160)),
        y: existing?.y ?? (80 + Math.random() * (H - 160)),
        vx: 0,
        vy: 0,
        radius: q.isFavorite ? 22 : 16,
      }
    })

    // Arestas automáticas por similaridade de tags
    const autoEdges: Edge[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sim = connectionService.tagSimilarity(nodes[i].quote, nodes[j].quote)
        if (sim >= minSimilarity) {
          autoEdges.push({ source: nodes[i], target: nodes[j], strength: sim, isManual: false })
        }
      }
    }

    // Arestas manuais
    const manualEdges: Edge[] = manualConnections
      .map(conn => {
        const src = nodes.find(n => n.id === conn.sourceQuoteId)
        const tgt = nodes.find(n => n.id === conn.targetQuoteId)
        if (!src || !tgt) return null
        return { source: src, target: tgt, strength: 1, label: conn.label, isManual: true } as Edge
      })
      .filter((e): e is Edge => e !== null)

    nodesRef.current = nodes
    edgesRef.current = [...autoEdges, ...manualEdges]
  }, [quotes, manualConnections, minSimilarity])

  // Loop de física + renderização — criado uma única vez
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function draw() {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const W = canvas.width
      const H = canvas.height
      const nodes = nodesRef.current
      const edges = edgesRef.current
      const selId = selectedIdRef.current

      if (W === 0 || H === 0) {
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // ── Física ──────────────────────────────────────────────────────────
      const REPULSION = 4000
      const ATTRACTION = 0.01
      const DAMPING = 0.80
      const CENTER_PULL = 0.002
      const MIN_DIST = 40

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST)
          const force = REPULSION / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          nodes[i].vx -= fx; nodes[i].vy -= fy
          nodes[j].vx += fx; nodes[j].vy += fy
        }
      }

      for (const edge of edges) {
        const dx = edge.target.x - edge.source.x
        const dy = edge.target.y - edge.source.y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const idealDist = edge.isManual ? 150 : 220 - edge.strength * 100
        const force = (dist - idealDist) * ATTRACTION * edge.strength
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        edge.source.vx += fx; edge.source.vy += fy
        edge.target.vx -= fx; edge.target.vy -= fy
      }

      for (const node of nodes) {
        node.vx += (W / 2 - node.x) * CENTER_PULL
        node.vy += (H / 2 - node.y) * CENTER_PULL
      }

      for (const node of nodes) {
        if (dragRef.current?.node === node) continue
        node.vx *= DAMPING; node.vy *= DAMPING
        node.x += node.vx; node.y += node.vy
        node.x = Math.max(node.radius + 4, Math.min(W - node.radius - 4, node.x))
        node.y = Math.max(node.radius + 4, Math.min(H - node.radius - 4, node.y))
      }

      // ── Render ──────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0D0705'
      ctx.fillRect(0, 0, W, H)

      // Estrelas de fundo (estáticas, baseadas em índice)
      for (let s = 0; s < 100; s++) {
        const sx = (s * 137.508) % W
        const sy = (s * 97.314 + s * 0.5) % H
        const sr = s % 5 === 0 ? 1.8 : s % 3 === 0 ? 1.2 : 0.7
        const alpha = 0.08 + (s % 7) * 0.02
        ctx.beginPath()
        ctx.arc(sx, sy, sr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${alpha})`
        ctx.fill()
      }

      // Arestas
      for (const edge of edges) {
        const isHighlighted = selId === edge.source.id || selId === edge.target.id
        ctx.beginPath()
        ctx.moveTo(edge.source.x, edge.source.y)
        ctx.lineTo(edge.target.x, edge.target.y)

        if (edge.isManual) {
          ctx.strokeStyle = isHighlighted ? 'rgba(245,217,122,0.95)' : 'rgba(201,168,76,0.6)'
          ctx.lineWidth = isHighlighted ? 2.5 : 1.8
          ctx.setLineDash([])
        } else {
          const alpha = 0.06 + edge.strength * 0.3
          ctx.strokeStyle = isHighlighted
            ? `rgba(201,168,76,${Math.min(alpha + 0.35, 0.9)})`
            : `rgba(201,168,76,${alpha})`
          ctx.lineWidth = isHighlighted ? 1.5 : 0.6 + edge.strength
          ctx.setLineDash(edge.strength < 0.4 ? [4, 6] : [])
        }
        ctx.stroke()
        ctx.setLineDash([])

        // Label de conexão manual quando destacada
        if (edge.isManual && edge.label && isHighlighted) {
          const mx = (edge.source.x + edge.target.x) / 2
          const my = (edge.source.y + edge.target.y) / 2
          const tw = ctx.measureText(edge.label).width
          ctx.fillStyle = 'rgba(13,7,5,0.8)'
          ctx.beginPath()
          ctx.roundRect(mx - tw / 2 - 5, my - 16, tw + 10, 18, 4)
          ctx.fill()
          ctx.font = `11px ${fonts.sans}`
          ctx.fillStyle = 'rgba(245,217,122,0.95)'
          ctx.textAlign = 'center'
          ctx.fillText(edge.label, mx, my - 3)
        }
      }

      // Nós
      for (const node of nodes) {
        const isSelected = node.id === selId
        const isHovered = hoveredRef.current?.id === node.id
        const nodeColor = getNodeColor(node.quote)

        // Glow externo para selecionado
        if (isSelected) {
          const grd = ctx.createRadialGradient(node.x, node.y, node.radius * 0.8, node.x, node.y, node.radius * 3.5)
          grd.addColorStop(0, 'rgba(201,168,76,0.35)')
          grd.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius * 3.5, 0, Math.PI * 2)
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
        if (isSelected) {
          grd.addColorStop(0, '#F5D97A')
          grd.addColorStop(1, '#C9A84C')
        } else if (isHovered) {
          grd.addColorStop(0, '#E8C96A')
          grd.addColorStop(1, '#A07830')
        } else {
          grd.addColorStop(0, nodeColor + 'EE')
          grd.addColorStop(1, nodeColor + '77')
        }
        ctx.fillStyle = grd
        ctx.fill()

        ctx.strokeStyle = isSelected ? '#F5D97A' : isHovered ? 'rgba(201,168,76,0.9)' : 'rgba(201,168,76,0.35)'
        ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1
        ctx.stroke()

        // Ícone favorito
        if (node.quote.isFavorite) {
          ctx.font = `${node.radius * 0.7}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = isSelected ? '#1A0F0A' : 'rgba(255,255,255,0.85)'
          ctx.fillText('★', node.x, node.y)
          ctx.textBaseline = 'alphabetic'
        }

        // Label ao hover/selecionar
        if (isSelected || isHovered) {
          const label = node.quote.author
          ctx.font = `bold 12px ${fonts.sans}`
          ctx.textAlign = 'center'
          const tw = ctx.measureText(label).width
          const lx = node.x
          const ly = node.y + node.radius + 6

          ctx.fillStyle = 'rgba(13,7,5,0.88)'
          ctx.beginPath()
          ctx.roundRect(lx - tw / 2 - 7, ly, tw + 14, 20, 4)
          ctx.fill()

          ctx.fillStyle = isSelected ? '#F5D97A' : '#E8C96A'
          ctx.fillText(label, lx, ly + 14)
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, []) // sem dependências — usa refs para tudo

  // Redimensionar canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      if (W > 0 && H > 0) {
        canvas.width = W
        canvas.height = H
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // ── Interações ──────────────────────────────────────────────────────────────

  function nodeAt(clientX: number, clientY: number): Node | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const cx = clientX - rect.left
    const cy = clientY - rect.top
    // Iterar de trás para frente para pegar o nó mais à frente
    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const node = nodesRef.current[i]
      const dx = node.x - cx
      const dy = node.y - cy
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 6) return node
    }
    return null
  }

  function handleMouseMove(e: React.MouseEvent) {
    const node = nodeAt(e.clientX, e.clientY)
    hoveredRef.current = node
    const canvas = canvasRef.current
    if (canvas) canvas.style.cursor = node ? 'pointer' : dragRef.current ? 'grabbing' : 'grab'

    if (dragRef.current) {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const newX = e.clientX - rect.left
      const newY = e.clientY - rect.top
      // Marcar como movimento real se deslocou mais de 4px
      const dx = newX - dragRef.current.startX
      const dy = newY - dragRef.current.startY
      if (Math.sqrt(dx * dx + dy * dy) > 4) {
        dragRef.current.moved = true
      }
      dragRef.current.node.x = newX
      dragRef.current.node.y = newY
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
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      moved: false,
    }
    e.preventDefault()
  }

  function handleMouseUp(_e: React.MouseEvent) {
    if (!dragRef.current) return
    const wasDrag = dragRef.current.moved
    const node = dragRef.current.node
    dragRef.current = null
    // Só dispara seleção se foi clique (sem movimento)
    if (!wasDrag) {
      onSelectQuote(node.id)
    }
  }

  function handleMouseLeave() {
    hoveredRef.current = null
    if (dragRef.current) {
      dragRef.current = null
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  )
}
