import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json(
      { message: 'Usuário não autenticado' },
      { status: 401 },
    )

  const { rating, comment, ticketCode } = await request.json()

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: 'Avaliação inválida. Deve ser entre 1 e 5.' },
      { status: 400 },
    )
  }

  const ticket = await prisma.ticket.findUnique({
    where: { code: ticketCode },
    select: {
      id: true,
      authorId: true,
      status: true,
      ticketRatings: { select: { id: true } },
    },
  })

  if (!ticket)
    return NextResponse.json(
      { message: 'Chamado não encontrado' },
      { status: 404 },
    )

  if (ticket.authorId !== session.user.id) {
    return NextResponse.json(
      { message: 'Somente o autor pode avaliar este chamado.' },
      { status: 403 },
    )
  }

  if (ticket.status !== 'CLOSED') {
    return NextResponse.json(
      { message: 'Somente chamados finalizados podem ser avaliados.' },
      { status: 400 },
    )
  }

  if (ticket.ticketRatings && ticket.ticketRatings.length > 0) {
    return NextResponse.json(
      { message: 'Este chamado já foi avaliado.' },
      { status: 400 },
    )
  }

  try {
    await prisma.ticketRating.upsert({
      where: {
        ticketId_userId: { ticketId: ticket.id, userId: session.user.id },
      },
      create: { ticketId: ticket.id, userId: session.user.id, rating, comment },
      update: { rating, comment },
    })

    return NextResponse.json(
      { message: 'Avaliação registrada com sucesso.' },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao registrar avaliação.' },
      { status: 500 },
    )
  }
}
