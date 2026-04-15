import { Download } from 'lucide-react'
import { localStorageService } from '../services/LocalStorageService'
import { useToastContext } from '../context/ToastContext'
import { colors, fonts, gradients, shadows, transitions } from '../styles/theme'

export function ExportButton() {
  const addToast = useToastContext()

  const handleExport = () => {
    try {
      const jsonData = localStorageService.exportData()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const date = new Date().toISOString().split('T')[0]
      const filename = `diario-filosofico-backup-${date}.json`
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      addToast('Dados exportados com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      addToast('Erro ao exportar dados', 'error')
    }
  }

  return (
    <button
      onClick={handleExport}
      title="Exportar todos os dados para arquivo JSON"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: gradients.goldRich,
        border: 'none',
        borderRadius: 8,
        fontFamily: fonts.sans,
        fontSize: 13,
        fontWeight: 700,
        color: colors.brown,
        cursor: 'pointer',
        boxShadow: shadows.cardGold,
        letterSpacing: '0.03em',
        transition: `all ${transitions.normal}`,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = shadows.cardGoldHover
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = shadows.cardGold
      }}
    >
      <Download size={15} />
      <span>Exportar Dados</span>
    </button>
  )
}
