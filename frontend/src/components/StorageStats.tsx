import { Database, Tag as TagIcon, FileText, HardDrive } from 'lucide-react'
import { useEffect, useState } from 'react'
import { localStorageService, StorageStats as Stats } from '../services/LocalStorageService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function StorageStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const loadStats = () => {
      const data = localStorageService.getStorageStats()
      setStats(data)
    }

    loadStats()
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(loadStats, 5000)
    
    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  const usagePercent = (stats.storageUsed / stats.storageLimit) * 100
  const usedMB = (stats.storageUsed / (1024 * 1024)).toFixed(2)
  const limitMB = (stats.storageLimit / (1024 * 1024)).toFixed(0)

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 shadow-md border border-amber-200">
      <h3 className="text-xl font-semibold text-amber-900 mb-4 flex items-center gap-2">
        <Database size={24} />
        Estatísticas de Armazenamento
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
          <FileText className="text-amber-600" size={24} />
          <div>
            <p className="text-sm text-gray-600">Citações</p>
            <p className="text-2xl font-bold text-amber-900">{stats.quotesCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
          <TagIcon className="text-amber-600" size={24} />
          <div>
            <p className="text-sm text-gray-600">Tags</p>
            <p className="text-2xl font-bold text-amber-900">{stats.tagsCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="text-amber-600" size={20} />
            <span className="text-sm font-medium text-gray-700">Espaço Usado</span>
          </div>
          <span className="text-sm font-semibold text-amber-900">
            {usedMB} MB / {limitMB} MB
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              usagePercent > 80
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : usagePercent > 50
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          {usagePercent.toFixed(1)}% utilizado
        </p>
      </div>

      {stats.lastBackup && (
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Último backup:{' '}
            <span className="font-medium text-amber-900">
              {format(new Date(stats.lastBackup), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR
              })}
            </span>
          </p>
        </div>
      )}

      {usagePercent > 80 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠️ Armazenamento quase cheio! Exporte seus dados e considere limpar citações antigas.
          </p>
        </div>
      )}
    </div>
  )
}
