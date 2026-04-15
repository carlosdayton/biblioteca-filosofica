import { Download } from 'lucide-react'
import { localStorageService } from '../services/LocalStorageService'
import { useToastContext } from '../context/ToastContext'

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
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-md hover:shadow-lg"
      title="Exportar todos os dados para arquivo JSON"
    >
      <Download size={18} />
      <span className="hidden sm:inline">Exportar Dados</span>
    </button>
  )
}
