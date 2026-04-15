import { Download } from 'lucide-react'
import { localStorageService } from '../services/LocalStorageService'
import { useToast } from '../hooks/useToast'

export function ExportButton() {
  const { showToast } = useToast()

  const handleExport = () => {
    try {
      // Gerar JSON
      const jsonData = localStorageService.exportData()
      
      // Criar blob
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Gerar nome do arquivo com data
      const date = new Date().toISOString().split('T')[0]
      const filename = `diario-filosofico-backup-${date}.json`
      
      // Criar link temporário e clicar
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Limpar
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      showToast('Dados exportados com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      showToast('Erro ao exportar dados', 'error')
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
