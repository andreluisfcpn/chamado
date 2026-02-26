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

  const code = request.nextUrl.searchParams.get('code')!

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { code },
      select: {
        id: true,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { message: 'Chamado não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ ticket }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar chamado' },
      { status: 500 },
    )
  }
}
