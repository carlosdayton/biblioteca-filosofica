import { Upload } from 'lucide-react'
import { useRef } from 'react'
import { localStorageService } from '../services/LocalStorageService'
import { useToastContext } from '../context/ToastContext'

interface ImportButtonProps {
  onImportSuccess?: () => void
}

export function ImportButton({ onImportSuccess }: ImportButtonProps) {
  const addToast = useToastContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Ler arquivo
      const text = await file.text()
      
      // Confirmar antes de importar
      const confirmed = window.confirm(
        'Importar dados irá substituir todos os dados atuais. Deseja continuar?\n\n' +
        'Recomendamos exportar seus dados atuais antes de importar.'
      )
      
      if (!confirmed) {
        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
      
      // Importar dados
      localStorageService.importData(text)
      
      addToast('Dados importados com sucesso!', 'success')
      
      // Callback de sucesso
      onImportSuccess?.()
      
      // Recarregar página para atualizar todos os componentes
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      const message = error instanceof Error ? error.message : 'Erro ao importar dados'
      addToast(message, 'error')
    } finally {
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg"
        title="Importar dados de arquivo JSON"
      >
        <Upload size={18} />
        <span className="hidden sm:inline">Importar Dados</span>
      </button>
    </>
  )
}
