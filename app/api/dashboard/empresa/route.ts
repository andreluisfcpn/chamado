import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

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
    ] = await Promise.all([
      // Total tickets
      prisma.ticket.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // In Progress tickets
      prisma.ticket.count({
        where: {
          status: {
            in: ['IN_PROGRESS', 'PENDING_CLIENT'],
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // Resolved tickets
      prisma.ticket.count({
        where: {
          status: 'CLOSED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // Urgent tickets
      prisma.ticket.count({
        where: {
          priority: 'URGENT',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // Open tickets for pie chart
      prisma.ticket.count({
        where: {
          status: 'OPEN',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // Canceled tickets for pie chart
      prisma.ticket.count({
        where: {
          status: 'CANCELED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // Low priority tickets for bar chart
      prisma.ticket.count({
        where: {
          priority: 'LOW',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // Medium priority tickets for bar chart
      prisma.ticket.count({
        where: {
          priority: 'MEDIUM',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // High priority tickets for bar chart
      prisma.ticket.count({
        where: {
          priority: 'HIGH',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // Critical priority tickets for bar chart
      prisma.ticket.count({
        where: {
          priority: 'URGENT',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      // Recent tickets
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
        where: {
          companyId: session?.user.companyId,
        },
      }),
    ])

    // Get previous period stats
    const [
      previousTotalTickets,
      previousInProgressTickets,
      previousResolvedTickets,
      previousUrgentTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      prisma.ticket.count({
        where: {
          status: 'IN_PROGRESS',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      prisma.ticket.count({
        where: {
          status: 'CLOSED',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
          companyId: session?.user.companyId,
        },
      }),

      prisma.ticket.count({
        where: {
          priority: 'HIGH',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
          companyId: session?.user.companyId,
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
      recentTickets,
    })
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 },
    )
  }
}
