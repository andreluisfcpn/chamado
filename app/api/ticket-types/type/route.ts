import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  const id = request.nextUrl.searchParams.get('id')!

  try {
    const ticketType = await prisma.ticketType.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        slaResponseTime: true,
        slaSolutionTime: true,
      },
    })

    if (!ticketType) {
      return NextResponse.json(
        { message: 'Tipo de chamado não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ ticketType }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar tipo de chamado' },
      { status: 500 },
    )
  }
}
