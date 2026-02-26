import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  const { id } = await request.json()

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json(
        { message: 'Chamado não encontrado.' },
        { status: 404 },
      )
    }

    await prisma.ticket.update({
      where: { id },
      data: { assigneeId: session.user.id },
    })

    return NextResponse.json(
      { message: 'Chamado atribuído a você.' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao direcionar chamado.' },
      { status: 500 },
    )
  }
}
