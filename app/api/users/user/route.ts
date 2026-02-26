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
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
      },
    })
    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 },
      )
    }
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar usuário' },
      { status: 500 },
    )
  }
}
