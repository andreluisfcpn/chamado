import { prisma } from '@/lib/prisma'

// Função para calcular o status SLA baseado nos deadlines
export async function updateTicketSlaStatus(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      firstResponseAt: true,
      slaResponseDeadline: true,
      slaSolutionDeadline: true,
      status: true,
      slaStatus: true,
    },
  })

  if (!ticket) return

  const now = new Date()
  let newSlaStatus: 'WITHIN_DEADLINE' | 'NEARING_DEADLINE' | 'BREACHED' =
    'WITHIN_DEADLINE'

  // Se ainda não teve primeira resposta e existe deadline de resposta
  if (!ticket.firstResponseAt && ticket.slaResponseDeadline) {
    const responseDeadline = new Date(ticket.slaResponseDeadline)
    const timeUntilDeadline = responseDeadline.getTime() - now.getTime()
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60)

    if (timeUntilDeadline <= 0) {
      newSlaStatus = 'BREACHED'
    } else if (hoursUntilDeadline <= 2) {
      // 2 horas antes do deadline
      newSlaStatus = 'NEARING_DEADLINE'
    }
  }
  // Se já teve primeira resposta mas ainda não foi resolvido
  else if (ticket.status !== 'CLOSED' && ticket.slaSolutionDeadline) {
    const solutionDeadline = new Date(ticket.slaSolutionDeadline)
    const timeUntilDeadline = solutionDeadline.getTime() - now.getTime()
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60)

    if (timeUntilDeadline <= 0) {
      newSlaStatus = 'BREACHED'
    } else if (hoursUntilDeadline <= 4) {
      // 4 horas antes do deadline de solução
      newSlaStatus = 'NEARING_DEADLINE'
    }
  }

  // Atualizar o status SLA apenas se mudou
  if (ticket.slaStatus !== newSlaStatus) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { slaStatus: newSlaStatus },
    })
  }

  return newSlaStatus
}

// Função para calcular deadlines SLA baseado no tipo de ticket
export async function calculateSlaDeadlines(ticketTypeId: string) {
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    select: {
      slaResponseTime: true,
      slaSolutionTime: true,
    },
  })

  if (!ticketType)
    return { slaResponseDeadline: null, slaSolutionDeadline: null }

  const now = new Date()
  let slaResponseDeadline: Date | null = null
  let slaSolutionDeadline: Date | null = null

  if (ticketType.slaResponseTime) {
    slaResponseDeadline = new Date(
      now.getTime() + ticketType.slaResponseTime * 60 * 60 * 1000,
    )
  }

  if (ticketType.slaSolutionTime) {
    slaSolutionDeadline = new Date(
      now.getTime() + ticketType.slaSolutionTime * 60 * 60 * 1000,
    )
  }

  return { slaResponseDeadline, slaSolutionDeadline }
}

// Função para processar todos os tickets ativos e atualizar seus status SLA
export async function updateAllTicketsSlaStatus() {
  try {
    // Buscar todos os tickets que não estão fechados ou cancelados
    const activeTickets = await prisma.ticket.findMany({
      where: {
        status: {
          notIn: ['CLOSED', 'CANCELED'],
        },
        OR: [
          {
            slaResponseDeadline: {
              not: null,
            },
          },
          {
            slaSolutionDeadline: {
              not: null,
            },
          },
        ],
      },
      select: {
        id: true,
        slaStatus: true,
        slaResponseDeadline: true,
        slaSolutionDeadline: true,
        firstResponseAt: true,
        status: true,
      },
    })

    console.log(
      `🔄 Processando ${activeTickets.length} tickets ativos para verificação SLA...`,
    )

    let updatedCount = 0
    const now = new Date()

    // Processar tickets em lotes para melhor performance
    const batchSize = 50
    for (let i = 0; i < activeTickets.length; i += batchSize) {
      const batch = activeTickets.slice(i, i + batchSize)

      const updatePromises = batch.map(async (ticket) => {
        let newSlaStatus: 'WITHIN_DEADLINE' | 'NEARING_DEADLINE' | 'BREACHED' =
          'WITHIN_DEADLINE'

        // Se ainda não teve primeira resposta e existe deadline de resposta
        if (!ticket.firstResponseAt && ticket.slaResponseDeadline) {
          const responseDeadline = new Date(ticket.slaResponseDeadline)
          const timeUntilDeadline = responseDeadline.getTime() - now.getTime()
          const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60)

          if (timeUntilDeadline <= 0) {
            newSlaStatus = 'BREACHED'
          } else if (hoursUntilDeadline <= 2) {
            newSlaStatus = 'NEARING_DEADLINE'
          }
        }
        // Se já teve primeira resposta mas ainda não foi resolvido
        else if (ticket.status !== 'CLOSED' && ticket.slaSolutionDeadline) {
          const solutionDeadline = new Date(ticket.slaSolutionDeadline)
          const timeUntilDeadline = solutionDeadline.getTime() - now.getTime()
          const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60)

          if (timeUntilDeadline <= 0) {
            newSlaStatus = 'BREACHED'
          } else if (hoursUntilDeadline <= 4) {
            newSlaStatus = 'NEARING_DEADLINE'
          }
        }

        // Atualizar apenas se o status mudou
        if (ticket.slaStatus !== newSlaStatus) {
          await prisma.ticket.update({
            where: { id: ticket.id },
            data: { slaStatus: newSlaStatus },
          })
          updatedCount++
          return {
            id: ticket.id,
            oldStatus: ticket.slaStatus,
            newStatus: newSlaStatus,
          }
        }
        return null
      })

      await Promise.all(updatePromises)
    }

    console.log(
      `✅ Verificação SLA concluída. ${updatedCount} tickets tiveram status atualizados.`,
    )
    return {
      success: true,
      processedTickets: activeTickets.length,
      updatedTickets: updatedCount,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ Erro ao processar verificação SLA:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    }
  }
}

// Função para buscar tickets com SLA crítico que precisam de notificação
export async function getTicketsWithCriticalSla() {
  try {
    const now = new Date()

    // Buscar tickets que estão próximos do vencimento ou já vencidos
    const criticalTickets = await prisma.ticket.findMany({
      where: {
        status: {
          notIn: ['CLOSED', 'CANCELED'],
        },
        slaStatus: {
          in: ['NEARING_DEADLINE', 'BREACHED'],
        },
      },
      select: {
        id: true,
        code: true,
        title: true,
        slaStatus: true,
        slaResponseDeadline: true,
        slaSolutionDeadline: true,
        firstResponseAt: true,
        status: true,
        priority: true,
        createdAt: true,
        ticketType: {
          select: {
            name: true,
          },
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            name: true,
          },
        },
      },
    })

    // Processar informações detalhadas dos tickets críticos
    const processedTickets = criticalTickets.map((ticket) => {
      let deadline: Date | null = null
      let deadlineType = ''
      let timeRemaining = 0

      // Determinar qual deadline usar
      if (!ticket.firstResponseAt && ticket.slaResponseDeadline) {
        deadline = new Date(ticket.slaResponseDeadline)
        deadlineType = 'Primeira Resposta'
      } else if (ticket.status !== 'CLOSED' && ticket.slaSolutionDeadline) {
        deadline = new Date(ticket.slaSolutionDeadline)
        deadlineType = 'Solução'
      }

      if (deadline) {
        timeRemaining = deadline.getTime() - now.getTime()
      }

      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
      const isOverdue = timeRemaining <= 0

      return {
        ...ticket,
        deadlineType,
        deadline: deadline?.toISOString(),
        hoursRemaining,
        isOverdue,
        urgencyLevel: isOverdue
          ? 'CRÍTICO'
          : hoursRemaining <= 2
            ? 'ALTO'
            : 'MÉDIO',
      }
    })

    return {
      success: true,
      tickets: processedTickets,
      summary: {
        total: processedTickets.length,
        overdue: processedTickets.filter((t) => t.isOverdue).length,
        nearDeadline: processedTickets.filter(
          (t) => !t.isOverdue && t.hoursRemaining <= 4,
        ).length,
      },
    }
  } catch (error) {
    console.error('❌ Erro ao buscar tickets com SLA crítico:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      tickets: [],
      summary: { total: 0, overdue: 0, nearDeadline: 0 },
    }
  }
}
