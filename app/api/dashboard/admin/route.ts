import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Helper para calcular a porcentagem de mudança
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

// Helper para obter o primeiro e último dia do mês
function getMonthDates(monthsAgo: number = 0) {
  const date = new Date()
  date.setMonth(date.getMonth() - monthsAgo)
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
  )
  return { firstDay, lastDay }
}

// Helper para calcular tempo médio de primeira resposta
async function calculateAverageResponseTime(
  startDate: Date,
  endDate: Date,
  previousStartDate: Date,
  previousEndDate: Date,
) {
  // Tickets que tiveram primeira resposta no período atual
  const currentTicketsWithResponse = await prisma.ticket.findMany({
    where: {
      firstResponseAt: {
        gte: startDate,
        lte: endDate,
        not: null,
      },
    },
    select: {
      createdAt: true,
      firstResponseAt: true,
    },
  })

  // Tickets que tiveram primeira resposta no período anterior
  const previousTicketsWithResponse = await prisma.ticket.findMany({
    where: {
      firstResponseAt: {
        gte: previousStartDate,
        lte: previousEndDate,
        not: null,
      },
    },
    select: {
      createdAt: true,
      firstResponseAt: true,
    },
  })

  // Calcular média atual em horas
  const currentAvg =
    currentTicketsWithResponse.length > 0
      ? currentTicketsWithResponse.reduce((sum, ticket) => {
          const responseTime =
            ticket.firstResponseAt!.getTime() - ticket.createdAt.getTime()
          return sum + responseTime / (1000 * 60 * 60)
        }, 0) / currentTicketsWithResponse.length
      : 0

  // Calcular média anterior em horas
  const previousAvg =
    previousTicketsWithResponse.length > 0
      ? previousTicketsWithResponse.reduce((sum, ticket) => {
          const responseTime =
            ticket.firstResponseAt!.getTime() - ticket.createdAt.getTime()
          return sum + responseTime / (1000 * 60 * 60)
        }, 0) / previousTicketsWithResponse.length
      : 0

  return {
    current: Math.round(currentAvg * 10) / 10, // Arredondar para 1 casa decimal
    previousPeriod: Math.round(previousAvg * 10) / 10,
    percentageChange: calculatePercentageChange(currentAvg, previousAvg),
  }
}

// Helper para calcular tempo médio de resolução
async function calculateAverageResolutionTime(
  startDate: Date,
  endDate: Date,
  previousStartDate: Date,
  previousEndDate: Date,
) {
  // Tickets fechados no período atual
  const currentClosedTickets = await prisma.ticket.findMany({
    where: {
      status: 'CLOSED',
      closedAt: {
        gte: startDate,
        lte: endDate,
        not: null,
      },
    },
    select: {
      createdAt: true,
      closedAt: true,
    },
  })

  // Tickets fechados no período anterior
  const previousClosedTickets = await prisma.ticket.findMany({
    where: {
      status: 'CLOSED',
      closedAt: {
        gte: previousStartDate,
        lte: previousEndDate,
        not: null,
      },
    },
    select: {
      createdAt: true,
      closedAt: true,
    },
  })

  // Calcular média atual em horas
  const currentAvg =
    currentClosedTickets.length > 0
      ? currentClosedTickets.reduce((sum, ticket) => {
          const resolutionTime =
            ticket.closedAt!.getTime() - ticket.createdAt.getTime()
          return sum + resolutionTime / (1000 * 60 * 60)
        }, 0) / currentClosedTickets.length
      : 0

  // Calcular média anterior em horas
  const previousAvg =
    previousClosedTickets.length > 0
      ? previousClosedTickets.reduce((sum, ticket) => {
          const resolutionTime =
            ticket.closedAt!.getTime() - ticket.createdAt.getTime()
          return sum + resolutionTime / (1000 * 60 * 60)
        }, 0) / previousClosedTickets.length
      : 0

  return {
    current: Math.round(currentAvg * 10) / 10, // Arredondar para 1 casa decimal
    previousPeriod: Math.round(previousAvg * 10) / 10,
    percentageChange: calculatePercentageChange(currentAvg, previousAvg),
  }
}

// Helper para calcular dados do gráfico SLA dos últimos 7 dias
async function calculateSlaChart(endDate: Date) {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const data: number[] = []

  // Calcular conformidade SLA para cada um dos últimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(endDate)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    // Contar tickets criados neste dia
    const totalTicketsDay = await prisma.ticket.count({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    })

    // Contar tickets em conformidade com SLA neste dia
    const compliantTicketsDay = await prisma.ticket.count({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        slaStatus: {
          in: ['WITHIN_DEADLINE', 'NEARING_DEADLINE'],
        },
      },
    })

    // Calcular percentual de conformidade
    const compliancePercentage =
      totalTicketsDay > 0
        ? Math.round((compliantTicketsDay / totalTicketsDay) * 100)
        : 0

    data.push(compliancePercentage)
  }

  return {
    labels,
    data,
  }
}

export async function GET(request: Request) {
  try {
    // Get date filter from query params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : getMonthDates().firstDay
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : getMonthDates().lastDay

    // For percentage change, get previous period of same length
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const previousStartDate = new Date(startDate.getTime())
    previousStartDate.setDate(previousStartDate.getDate() - diffDays)
    const previousEndDate = new Date(endDate.getTime())
    previousEndDate.setDate(previousEndDate.getDate() - diffDays)

    const [
      totalTickets,
      inProgressTickets,
      resolvedTickets,
      urgentTickets,
      openTickets,
      canceledTickets,
      lowPriorityTickets,
      mediumPriorityTickets,
      highPriorityTickets,
      criticalPriorityTickets,
      recentTickets,
      slaCompliantTickets,
      slaBreachedTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          status: {
            in: ['IN_PROGRESS', 'PENDING_CLIENT'],
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          status: 'CLOSED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          priority: 'URGENT',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          status: 'OPEN',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          status: 'CANCELED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          priority: 'LOW',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          priority: 'MEDIUM',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          priority: 'HIGH',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          priority: 'URGENT',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.ticket.findMany({
        take: 5,
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          code: true,
          status: true,
          title: true,
          slaStatus: true,
          slaResponseDeadline: true,
          slaSolutionDeadline: true,
          firstResponseAt: true,
          ticketType: {
            select: {
              name: true,
            },
          },
          company: {
            select: {
              name: true,
            },
          },
          author: {
            select: {
              name: true,
            },
          },
          assignee: {
            select: {
              name: true,
            },
          },
          updatedAt: true,
          priority: true,
        },
      }),
      // SLA Compliant Tickets - tickets dentro do prazo
      prisma.ticket.count({
        where: {
          slaStatus: 'WITHIN_DEADLINE',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      // SLA Breached Tickets - tickets que violaram o SLA
      prisma.ticket.count({
        where: {
          slaStatus: 'BREACHED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ])

    const [
      previousTotalTickets,
      previousInProgressTickets,
      previousResolvedTickets,
      previousUrgentTickets,
      previousSlaCompliantTickets,
      previousSlaBreachedTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
      }),

      prisma.ticket.count({
        where: {
          status: 'IN_PROGRESS',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
      }),

      prisma.ticket.count({
        where: {
          status: 'CLOSED',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
      }),

      prisma.ticket.count({
        where: {
          priority: 'HIGH',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
      }),
      // Previous SLA Compliant Tickets
      prisma.ticket.count({
        where: {
          slaStatus: 'WITHIN_DEADLINE',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
      }),
      // Previous SLA Breached Tickets
      prisma.ticket.count({
        where: {
          slaStatus: 'BREACHED',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
      }),
    ])

    return NextResponse.json({
      overview: {
        totalTickets: {
          current: totalTickets,
          previousPeriod: previousTotalTickets,
          percentageChange: calculatePercentageChange(
            totalTickets,
            previousTotalTickets,
          ),
        },
        inProgressTickets: {
          current: inProgressTickets,
          previousPeriod: previousInProgressTickets,
          percentageChange: calculatePercentageChange(
            inProgressTickets,
            previousInProgressTickets,
          ),
        },
        resolvedTickets: {
          current: resolvedTickets,
          previousPeriod: previousResolvedTickets,
          percentageChange: calculatePercentageChange(
            resolvedTickets,
            previousResolvedTickets,
          ),
        },
        urgentTickets: {
          current: urgentTickets,
          previousPeriod: previousUrgentTickets,
          percentageChange: calculatePercentageChange(
            urgentTickets,
            previousUrgentTickets,
          ),
        },
        slaCompliance: {
          current:
            totalTickets > 0
              ? Math.round((slaCompliantTickets / totalTickets) * 100)
              : 0,
          previousPeriod:
            previousTotalTickets > 0
              ? Math.round(
                  (previousSlaCompliantTickets / previousTotalTickets) * 100,
                )
              : 0,
          percentageChange: calculatePercentageChange(
            totalTickets > 0
              ? Math.round((slaCompliantTickets / totalTickets) * 100)
              : 0,
            previousTotalTickets > 0
              ? Math.round(
                  (previousSlaCompliantTickets / previousTotalTickets) * 100,
                )
              : 0,
          ),
        },
        slaBreached: {
          current: slaBreachedTickets,
          previousPeriod: previousSlaBreachedTickets,
          percentageChange: calculatePercentageChange(
            slaBreachedTickets,
            previousSlaBreachedTickets,
          ),
        },
        avgResponseTime: await calculateAverageResponseTime(
          startDate,
          endDate,
          previousStartDate,
          previousEndDate,
        ),
        avgResolutionTime: await calculateAverageResolutionTime(
          startDate,
          endDate,
          previousStartDate,
          previousEndDate,
        ),
      },
      statusChart: {
        labels: ['Abertos', 'Em Andamento', 'Resolvidos', 'Cancelados'],
        data: [
          openTickets,
          inProgressTickets,
          resolvedTickets,
          canceledTickets,
        ],
      },
      priorityChart: {
        labels: ['Baixa', 'Média', 'Alta', 'Urgente'],
        data: [
          lowPriorityTickets,
          mediumPriorityTickets,
          highPriorityTickets,
          criticalPriorityTickets,
        ],
      },
      slaChart: await calculateSlaChart(endDate),
      recentTickets: recentTickets.map((ticket) => {
        // Mapear status do schema para valores esperados no frontend
        let slaStatus: 'WITHIN_SLA' | 'AT_RISK' | 'BREACHED' = 'WITHIN_SLA'
        if (ticket.slaStatus === 'WITHIN_DEADLINE') {
          slaStatus = 'WITHIN_SLA'
        } else if (ticket.slaStatus === 'NEARING_DEADLINE') {
          slaStatus = 'AT_RISK'
        } else if (ticket.slaStatus === 'BREACHED') {
          slaStatus = 'BREACHED'
        }

        // Calcular tempo restante baseado no deadline mais próximo
        let timeRemaining = 0
        const now = new Date()

        if (ticket.slaResponseDeadline && ticket.firstResponseAt === null) {
          // Se não teve primeira resposta, usar deadline de resposta
          const deadline = new Date(ticket.slaResponseDeadline)
          timeRemaining = Math.max(
            0,
            Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)),
          )
        } else if (ticket.slaSolutionDeadline && ticket.status !== 'CLOSED') {
          // Se não foi resolvido, usar deadline de solução
          const deadline = new Date(ticket.slaSolutionDeadline)
          timeRemaining = Math.max(
            0,
            Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)),
          )
        }

        return {
          ...ticket,
          slaStatus,
          slaDeadline:
            ticket.slaSolutionDeadline?.toISOString() ||
            ticket.slaResponseDeadline?.toISOString(),
          timeRemaining,
        }
      }),
    })
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 },
    )
  }
}
