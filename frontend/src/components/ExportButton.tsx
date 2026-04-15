import React, { useState } from 'react'
import client from '../api/client'
import { colors, fonts, shadows } from '../styles/theme'

export default function ExportButton() {
  const [loadingJson, setLoadingJson] = useState(false)
  const [loadingMd, setLoadingMd] = useState(false)

  async function handleExport(format: 'json' | 'markdown') {
    const setLoading = format === 'json' ? setLoadingJson : setLoadingMd
    setLoading(true)
    try {
      const response = await client.get('/quotes/export', {
        params: { format },
        responseType: 'blob',
      })
      const mimeType = format === 'json' ? 'application/json' : 'text/markdown'
      const blob = new Blob([response.data], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = format === 'json' ? 'diario-filosofico.json' : 'diario-filosofico.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao exportar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const btnStyle = (loading: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: loading
      ? colors.brownLight
      : `linear-gradient(135deg, ${colors.gold}22, ${colors.gold}44)`,
    border: `1px solid ${loading ? colors.brownLight : colors.gold}`,
    borderRadius: 6,
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: 600,
    color: loading ? colors.cream : colors.goldDark,
    cursor: loading ? 'not-allowed' : 'pointer',
    letterSpacing: '0.04em',
    transition: 'all 0.15s',
    boxShadow: loading ? 'none' : shadows.card,
    whiteSpace: 'nowrap',
  })

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => handleExport('json')} disabled={loadingJson} style={btnStyle(loadingJson)} title="Exportar como JSON">
        <span style={{ fontSize: 14 }}>⬇</span>
        {loadingJson ? 'Exportando...' : 'JSON'}
      </button>
      <button onClick={() => handleExport('markdown')} disabled={loadingMd} style={btnStyle(loadingMd)} title="Exportar como Markdown">
        <span style={{ fontSize: 14 }}>⬇</span>
        {loadingMd ? 'Exportando...' : 'Markdown'}
      </button>
    </div>
  )
}
