'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, XCircle } from 'lucide-react'
import axios from 'axios'

interface SlaAlert {
  id: string
  code: string
  title: string
  slaStatus: 'NEARING_DEADLINE' | 'BREACHED'
  deadlineType: string
  hoursRemaining: number
  isOverdue: boolean
  urgencyLevel: 'CRÍTICO' | 'ALTO' | 'MÉDIO'
  ticketType: { name: string }
  author: { name: string }
  assignee?: { name: string }
  company: { name: string }
}

interface SlaSummary {
  total: number
  overdue: number
  nearDeadline: number
}

export function SlaAlertsWidget() {
  const [alerts, setAlerts] = useState<SlaAlert[]>([])
  const [summary, setSummary] = useState<SlaSummary>({
    total: 0,
    overdue: 0,
    nearDeadline: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/sla/alerts')

      if (response.data.success) {
        setAlerts(response.data.alerts)
        setSummary(response.data.summary)
        setError(null)
      } else {
        setError(response.data.error || 'Erro ao carregar alertas SLA')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      console.error('Erro ao buscar alertas SLA:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()

    // Atualizar alertas a cada 5 minutos
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="w-32 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <XCircle className="w-5 h-5" />
          <h3 className="font-semibold">Erro nos Alertas SLA</h3>
        </div>
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={fetchAlerts}
          className="mt-3 text-sm text-orange-500 hover:text-orange-600"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'CRÍTICO':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'ALTO':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'MÉDIO':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (isOverdue: boolean) => {
    return isOverdue ? (
      <AlertTriangle className="w-4 h-4 text-red-600" />
    ) : (
      <Clock className="w-4 h-4 text-yellow-600" />
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Alertas SLA</h3>
        </div>
        <button
          onClick={fetchAlerts}
          className="text-xs text-orange-500 hover:text-orange-600 cursor-pointer"
        >
          Atualizar
        </button>
      </div>

      {summary.total === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">
            🎉 Todos os chamados estão dentro do prazo SLA!
          </p>
        </div>
      ) : (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-900">
                {summary.total}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">
                {summary.overdue}
              </div>
              <div className="text-xs text-red-600">Vencidos</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-lg font-bold text-yellow-600">
                {summary.nearDeadline}
              </div>
              <div className="text-xs text-yellow-600">Próximos</div>
            </div>
          </div>

          {/* Lista de Alertas */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getUrgencyColor(alert.urgencyLevel)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(alert.isOverdue)}
                    <div>
                      <div className="font-medium text-sm">
                        #{alert.code} - {alert.title.substring(0, 40)}
                        {alert.title.length > 40 && '...'}
                      </div>
                      <div className="text-xs opacity-75">
                        SLA {alert.deadlineType} •{' '}
                        {alert.isOverdue
                          ? `Vencido há ${Math.abs(alert.hoursRemaining)}h`
                          : `${alert.hoursRemaining}h restantes`}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 text-xs font-medium rounded ${getUrgencyColor(alert.urgencyLevel)}`}
                  >
                    {alert.urgencyLevel}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {alerts.length > 5 && (
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-600">
                E mais {alerts.length - 5} chamados com alertas SLA...
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
