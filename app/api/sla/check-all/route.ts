import { authOptions } from '@/lib/auth'
import { updateAllTicketsSlaStatus } from '@/utils/sla-helpers'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await getServerSession(authOptions)

  // Apenas administradores podem executar verificação SLA
  if (!session || session.user.role !== 'ADMINISTRADOR') {
    return NextResponse.json(
      {
        message:
          'Acesso negado. Apenas administradores podem executar esta ação.',
      },
      { status: 403 },
    )
  }

  try {
    console.log('🔄 Iniciando verificação SLA manual...')

    const result = await updateAllTicketsSlaStatus()

    if (result.success) {
      return NextResponse.json(
        {
          message: 'Verificação SLA executada com sucesso!',
          data: {
            processedTickets: result.processedTickets,
            updatedTickets: result.updatedTickets,
            timestamp: result.timestamp,
          },
        },
        { status: 200 },
      )
    } else {
      return NextResponse.json(
        {
          message: 'Erro durante a verificação SLA',
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('❌ Erro na API de verificação SLA:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMINISTRADOR') {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 })
  }

  return NextResponse.json(
    {
      message: 'API de verificação SLA ativa',
      endpoint: 'POST /api/sla/check-all',
      description:
        'Executa verificação manual de SLA para todos os tickets ativos',
    },
    { status: 200 },
  )
}
