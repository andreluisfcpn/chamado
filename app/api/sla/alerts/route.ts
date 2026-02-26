import { authOptions } from '@/lib/auth'
import { getTicketsWithCriticalSla } from '@/utils/sla-helpers'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  // Apenas usuários administrativos podem ver alertas SLA gerais
  const isAdmin = ['ADMINISTRADOR', 'ATENDENTE'].includes(
    session.user.role ?? '',
  )

  if (!isAdmin) {
    return NextResponse.json(
      {
        message:
          'Acesso negado. Apenas usuários administrativos podem visualizar alertas SLA.',
      },
      { status: 403 },
    )
  }

  try {
    const result = await getTicketsWithCriticalSla()

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          alerts: result.tickets,
          summary: result.summary,
          timestamp: new Date().toISOString(),
        },
        { status: 200 },
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          alerts: [],
          summary: { total: 0, overdue: 0, nearDeadline: 0 },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('❌ Erro na API de alertas SLA:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
