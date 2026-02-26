'use client'

import { getInitials } from '@/utils/helpers'
import { HeaderTicketDetailLoading } from '../header-ticket-detail-loading'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { AlarmClockCheck, OctagonAlert, OctagonX } from 'lucide-react'

interface HeaderTicketDetailProps {
  code: string
  title: string
  ticketType: {
    name: string
    slaResponseTime?: number | null
    slaSolutionTime?: number | null
  }
  author: {
    id: string
    name: string
    image: string
  }
  assignee: {
    name: string
    image: string
  }
  status: string
  priority: string
  createdAt: string
  slaStatus?: 'WITHIN_DEADLINE' | 'NEARING_DEADLINE' | 'BREACHED' | null
  slaResponseDeadline?: string | null
  slaSolutionDeadline?: string | null
  firstResponseAt?: string | null
  isLoading?: boolean
}

type MapsType = { label: string; class: string }

const statusMap: Record<string, MapsType> = {
  OPEN: {
    label: 'Em Aberto',
    class: 'border-zinc-300 text-zinc-400',
  },
  IN_PROGRESS: {
    label: 'Aguardando Responsável',
    class: 'border-yellow-400 text-yellow-400',
  },
  PENDING_CLIENT: {
    label: 'Aguardando Cliente',
    class: 'border-yellow-400 text-yellow-400',
  },
  CLOSED: {
    label: 'Resolvido',
    class: 'border-emerald-400 text-emerald-400',
  },
  CANCELED: {
    label: 'Cancelado',
    class: 'border-red-400 text-red-400',
  },
}

const priorityMap: Record<string, MapsType> = {
  LOW: {
    label: 'Baixa',
    class: 'border-zinc-300 text-zinc-400',
  },
  MEDIUM: {
    label: 'Média',
    class: 'border-yellow-400 text-yellow-400',
  },
  HIGH: {
    label: 'Alta',
    class: 'border-orange-400 text-orange-400',
  },
  URGENT: {
    label: 'Urgente',
    class: 'border-red-400 text-red-400',
  },
}

// Função auxiliar para calcular tempo restante e status SLA
function calculateSlaDisplay(
  slaStatus?: 'WITHIN_DEADLINE' | 'NEARING_DEADLINE' | 'BREACHED' | null,
  slaResponseDeadline?: string | null,
  slaSolutionDeadline?: string | null,
  firstResponseAt?: string | null,
  status?: string,
) {
  if (!slaStatus) return null

  const now = new Date()
  let deadline: Date | null = null
  let slaType = ''

  // Determinar qual deadline usar
  if (!firstResponseAt && slaResponseDeadline) {
    deadline = new Date(slaResponseDeadline)
    slaType = 'Resposta'
  } else if (status !== 'CLOSED' && slaSolutionDeadline) {
    deadline = new Date(slaSolutionDeadline)
    slaType = 'Solução'
  }

  if (!deadline) return null

  const timeRemainingMs = deadline.getTime() - now.getTime()
  const absRemainingMs = Math.abs(timeRemainingMs)

  const hoursRemaining = Math.floor(timeRemainingMs / (1000 * 60 * 60))
  const minutesRemaining = Math.floor(
    (timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60),
  )

  // Novo comportamento: "Prazo Próximo" apenas quando faltar <= 10 minutos
  const TEN_MINUTES_MS = 10 * 60 * 1000

  let effectiveStatus: 'WITHIN_DEADLINE' | 'NEARING_DEADLINE' | 'BREACHED'
  if (timeRemainingMs <= 0) {
    effectiveStatus = 'BREACHED'
  } else if (timeRemainingMs <= TEN_MINUTES_MS) {
    effectiveStatus = 'NEARING_DEADLINE'
  } else {
    effectiveStatus = 'WITHIN_DEADLINE'
  }

  const statusConfig = {
    WITHIN_DEADLINE: {
      label: 'Dentro do Prazo',
      color: 'text-green-600',
      dotColor: 'bg-green-600',
      bgColor: 'bg-green-50 border-green-200',
      icon: <AlarmClockCheck className="size-5" />,
    },
    NEARING_DEADLINE: {
      label: 'Prazo Próximo',
      color: 'text-yellow-600',
      dotColor: 'bg-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200',
      icon: <OctagonAlert className="size-5" />,
    },
    BREACHED: {
      label: 'Prazo Vencido',
      color: 'text-red-600',
      dotColor: 'bg-red-600',
      bgColor: 'bg-red-50 border-red-200',
      icon: <OctagonX className="size-5" />,
    },
  }

  const config = statusConfig[effectiveStatus]
  let timeText = ''

  if (timeRemainingMs > 0) {
    if (hoursRemaining > 0) {
      timeText = `${hoursRemaining}h ${minutesRemaining}min restantes`
    } else {
      timeText = `${minutesRemaining}min restantes`
    }
  } else {
    const overdueHours = Math.floor(absRemainingMs / (1000 * 60 * 60))
    const overdueMinutes = Math.floor(
      (absRemainingMs % (1000 * 60 * 60)) / (1000 * 60),
    )
    if (overdueHours > 0) {
      timeText = `Vencido há ${overdueHours}h ${overdueMinutes}min`
    } else {
      timeText = `Vencido há ${overdueMinutes}min`
    }
  }

  return {
    ...config,
    slaType,
    timeText,
    timeRemaining: timeRemainingMs,
  }
}

export function HeaderTicketDetail({
  assignee,
  author,
  createdAt,
  ticketType,
  title,
  code,
  status,
  priority,
  slaStatus,
  slaResponseDeadline,
  slaSolutionDeadline,
  firstResponseAt,
  isLoading,
}: HeaderTicketDetailProps) {
  return isLoading ? (
    <HeaderTicketDetailLoading />
  ) : (
    <div>
      <div className="mb-4">
        <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-0 2xl:gap-4">
          <p className="text-lg font-bold text-zinc-600">
            #{code} - {title}
          </p>
          <small className="text-zinc-400">
            Criado em:{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(new Date(createdAt || ''))}
          </small>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mt-4 md:mt-1">
          <div className="w-full">
            <small>Tipo de Chamado:</small>
            <small className="text-zinc-400 border border-zinc-300 px-4 h-8 flex items-center justify-center rounded">
              {ticketType.name}
            </small>
          </div>

          <div className="w-full">
            <small>Status:</small>
            <small>
              <span
                className={`border px-4 h-8 flex items-center justify-center rounded ${statusMap[status].class}`}
              >
                {statusMap[status].label}
              </span>
            </small>
          </div>

          <div className="w-full">
            <small>Prioridade:</small>
            <small>
              <span
                className={`border px-4 h-8 flex items-center justify-center rounded ${priorityMap[priority].class}`}
              >
                {priorityMap[priority].label}
              </span>
            </small>
          </div>
        </div>

        {/* SLA Status */}
        {(() => {
          const slaDisplay = calculateSlaDisplay(
            slaStatus,
            slaResponseDeadline,
            slaSolutionDeadline,
            firstResponseAt,
            status,
          )

          if (!slaDisplay) return null

          return (
            <div className="w-full mt-2">
              <div
                className={`border px-4 py-2 flex items-center justify-center rounded ${slaDisplay.bgColor} ${slaDisplay.color}`}
              >
                <div className="flex items-center gap-2">
                  <span>{slaDisplay.icon}</span>
                  <div className="text-xs flex items-center gap-2">
                    <div className="font-semibold">{slaDisplay.label}</div>
                    <div
                      className={`w-1 h-1 rounded-full ${slaDisplay.dotColor}`}
                    ></div>
                    <div className="opacity-75">{slaDisplay.timeText}</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      <div className="flex flex-col md:flex-row items-start justify-start md:justify-center gap-8 md:gap-16 bg-zinc-50 p-8 mt-4 rounded-md">
        <div className="flex flex-row md:flex-col items-center justify-center text-center gap-3 md:gap-1">
          <Avatar className="w-12 h-12 bg-zinc-200 rounded-full flex justify-center items-center">
            <AvatarImage
              src={author.image}
              alt={author.name}
              className="object-cover"
            />
            <AvatarFallback className="w-12 h-12 bg-zinc-200 rounded-full flex justify-center items-center">
              {getInitials(author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left md:text-center">
            <small className="text-zinc-500">Solicitante:</small>
            <p className="font-semibold leading-none">{author.name}</p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center justify-center text-center gap-3 md:gap-1">
          {assignee && assignee.name && (
            <Avatar className="w-12 h-12 bg-zinc-200 rounded-full flex justify-center items-center">
              <AvatarImage
                src={assignee.image}
                alt={assignee.name}
                className="object-cover"
              />
              <AvatarFallback className="w-12 h-12 bg-zinc-200 rounded-full flex justify-center items-center">
                {getInitials(assignee.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="text-left md:text-center">
            <small className="text-zinc-500">Responsável:</small>
            <p className="font-semibold leading-none">
              {assignee?.name || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
