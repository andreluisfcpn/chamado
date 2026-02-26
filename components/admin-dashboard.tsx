'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useSWR from 'swr'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from './date-range-picker'
import { useState } from 'react'
import { StatusPieChart } from './status-pie-chart'
import { PriorityBarChart } from './priority-bar-chart'
import { RecentTicketsTable } from './recent-tickets-table'
import { DashboardWidgetCard } from './dashboard-widget-card'
import { SlaAlertsWidget } from './sla-alerts-widget'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ChartData {
  labels: string[]
  data: number[]
}

interface RecentTicket {
  id: string
  code: string
  status: string
  title: string
  ticketType: {
    name: string
  }
  company: {
    name: string
  }
  author: {
    name: string
  }
  assignee: {
    name: string
  } | null
  updatedAt: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  slaStatus: 'WITHIN_SLA' | 'AT_RISK' | 'BREACHED'
  slaDeadline?: string
  timeRemaining?: number
}

interface DashboardData {
  overview: {
    totalTickets: MetricData
    inProgressTickets: MetricData
    resolvedTickets: MetricData
    urgentTickets: MetricData
    slaCompliance: MetricData
    slaBreached: MetricData
    avgResponseTime: MetricData
    avgResolutionTime: MetricData
  }
  statusChart: ChartData
  priorityChart: ChartData
  slaChart: ChartData
  recentTickets: RecentTicket[]
}

interface MetricData {
  current: number
  previousMonth: number
  percentageChange: number
}

export function AdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [url, setUrl] = useState('/api/dashboard/admin')

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setUrl(
        `/api/dashboard/admin?startDate=${range.from.toISOString()}&endDate=${range.to.toISOString()}`,
      )
    } else {
      setUrl('/api/dashboard/admin')
    }
  }

  const { data, error, isLoading } = useSWR<DashboardData>(url, fetcher)

  if (error) return <div>Erro ao carregar dados</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-start md:justify-end">
        <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
      </div>

      <div className="*:data-[slot=card]:from-zinc-900/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 sm:grid-cols-4 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-none @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <DashboardWidgetCard
          message={`${
            ((data?.overview?.totalTickets.percentageChange as number) || 0) >=
            0
              ? 'Aumento'
              : 'Redução'
          } em relação ao período anterior`}
          porcentagem={data?.overview?.totalTickets.percentageChange || 0}
          title="Total de Chamados"
          total={data?.overview?.totalTickets.current || 0}
          isLoading={isLoading}
        />

        <DashboardWidgetCard
          message="Chamados sendo atendidos"
          porcentagem={data?.overview?.inProgressTickets.percentageChange || 0}
          title="Em Andamento"
          total={data?.overview?.inProgressTickets.current || 0}
          isLoading={isLoading}
        />

        <DashboardWidgetCard
          message="Chamados finalizados"
          porcentagem={data?.overview?.resolvedTickets.percentageChange || 0}
          title="Resolvidos"
          total={data?.overview?.resolvedTickets.current || 0}
          isLoading={isLoading}
        />

        <DashboardWidgetCard
          message="Chamados com prioridade urgente"
          porcentagem={data?.overview?.urgentTickets.percentageChange || 0}
          title="Urgentes"
          total={data?.overview?.urgentTickets.current || 0}
          isLoading={isLoading}
        />

        <DashboardWidgetCard
          message="Tickets atendendo ao SLA"
          porcentagem={data?.overview?.slaCompliance.percentageChange || 0}
          title="Conformidade SLA"
          total={data?.overview?.slaCompliance.current || 0}
          totalType="percentage"
          isLoading={isLoading}
        />

        <DashboardWidgetCard
          message="Tickets que violaram SLA"
          porcentagem={data?.overview?.slaBreached.percentageChange || 0}
          title="SLA Violado"
          total={data?.overview?.slaBreached.current || 0}
          isLoading={isLoading}
        />

        <DashboardWidgetCard
          message="Tempo médio de primeira resposta"
          porcentagem={data?.overview?.avgResponseTime.percentageChange || 0}
          title="Tempo Resposta"
          total={data?.overview?.avgResponseTime.current || 0}
          totalType="time"
          isLoading={isLoading}
        />

        <DashboardWidgetCard
          message="Tempo médio de resolução"
          porcentagem={data?.overview?.avgResolutionTime.percentageChange || 0}
          title="Tempo Resolução"
          total={data?.overview?.avgResolutionTime.current || 0}
          totalType="time"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Chamados</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart isLoading={isLoading} data={data?.statusChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chamados por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <PriorityBarChart
              isLoading={isLoading}
              data={data?.priorityChart}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance SLA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conformidade Geral</span>
                <span className="text-2xl font-bold text-zinc-800">
                  {isLoading
                    ? '...'
                    : `${data?.overview.slaCompliance.current}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: isLoading
                      ? '0%'
                      : `${data?.overview.slaCompliance.current}%`,
                  }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold text-green-700">
                    {isLoading
                      ? '...'
                      : (data?.overview.totalTickets.current as number) -
                        (data?.overview.slaBreached.current as number)}
                  </div>
                  <div className="text-green-600">Em conformidade</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-semibold text-red-700">
                    {isLoading ? '...' : data?.overview.slaBreached.current}
                  </div>
                  <div className="text-red-600">Fora do prazo</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget de Alertas SLA */}
        <div className="lg:col-span-1">
          <SlaAlertsWidget />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chamados Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTicketsTable
            isLoading={isLoading}
            tickets={data?.recentTickets || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
