import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

  try {
    const atendentes = await prisma.user.findMany({
      where: {
        email: {
          not: session.user.email as string,
        },
        role: 'ATENDENTE',
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    })

    return NextResponse.json({ atendentes }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar usuários' },
      { status: 500 },
    )
  }
}
