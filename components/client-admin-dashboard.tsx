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
}

interface DashboardData {
  overview: {
    totalTickets: MetricData
    inProgressTickets: MetricData
    resolvedTickets: MetricData
    urgentTickets: MetricData
  }
  statusChart: ChartData
  priorityChart: ChartData
  recentTickets: RecentTicket[]
}

interface MetricData {
  current: number
  previousMonth: number
  percentageChange: number
}

export function ClientAdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [url, setUrl] = useState('/api/dashboard/empresa')

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setUrl(
        `/api/dashboard/empresa?startDate=${range.from.toISOString()}&endDate=${range.to.toISOString()}`,
      )
    } else {
      setUrl('/api/dashboard/empresa')
    }
  }

  const { data, error, isLoading } = useSWR<DashboardData>(url, fetcher)

  if (error) return <div>Erro ao carregar dados</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
