import { updateAllTicketsSlaStatus } from '@/utils/sla-helpers'
import { NextRequest, NextResponse } from 'next/server'

// Esta API pode ser chamada por um cron job externo (ex: GitHub Actions, Vercel Cron, etc.)
// Ou por um sistema de agendamento interno

export async function POST(request: NextRequest) {
  // Verificar se a chamada vem de uma fonte autorizada
  const authHeader = request.headers.get('authorization')
  const cronToken = process.env.CRON_SLA_TOKEN

  // Se não houver token configurado, permitir chamada (para desenvolvimento)
  // Em produção, configure CRON_SLA_TOKEN no .env
  if (cronToken && authHeader !== `Bearer ${cronToken}`) {
    return NextResponse.json(
      { message: 'Token de autorização inválido' },
      { status: 401 },
    )
  }

  try {
    console.log('🤖 [CRON SLA] Iniciando verificação automática de SLA...')

    const startTime = Date.now()
    const result = await updateAllTicketsSlaStatus()
    const executionTime = Date.now() - startTime

    const logMessage = result.success
      ? `✅ [CRON SLA] Verificação concluída em ${executionTime}ms - ${result.processedTickets} tickets processados, ${result.updatedTickets} atualizados`
      : `❌ [CRON SLA] Falha na verificação: ${result.error}`

    console.log(logMessage)

    return NextResponse.json(
      {
        success: result.success,
        executionTime,
        processedTickets: result.processedTickets || 0,
        updatedTickets: result.updatedTickets || 0,
        timestamp: result.timestamp,
        error: result.error,
      },
      { status: result.success ? 200 : 500 },
    )
  } catch (error) {
    console.error('❌ [CRON SLA] Erro crítico:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Endpoint GET para verificar status do cron
export async function GET() {
  return NextResponse.json(
    {
      message: 'SLA Cron Job Endpoint',
      description: 'Endpoint para verificação automática de SLA via cron job',
      usage: {
        method: 'POST',
        endpoint: '/api/sla/cron',
        headers: {
          authorization: 'Bearer CRON_SLA_TOKEN (opcional)',
        },
      },
      setup: {
        internal:
          'Configure um cron job para chamar este endpoint periodicamente',
        external:
          'Use GitHub Actions, Vercel Cron, ou outro sistema de agendamento',
        frequency: 'Recomendado: a cada 30-60 minutos',
      },
    },
    { status: 200 },
  )
}
